import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { enhancedNotificationService, type EnhancedNotification } from "./enhanced-notification-service";

export interface EscalationPolicy {
  id: string;
  org_id: string;
  policy_name: string;
  description: string;
  escalation_levels: EscalationLevel[];
  conditions: EscalationCondition[];
  is_active: boolean;
  applicable_alert_types: string[];
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface EscalationLevel {
  level: number;
  delay_minutes: number;
  recipients: EscalationRecipient[];
  channels: string[];
  escalation_actions: EscalationAction[];
  stop_on_acknowledgement: boolean;
}

export interface EscalationRecipient {
  type: 'user' | 'role' | 'group';
  identifier: string; // user_id, role_name, or group_id
  name: string;
  contact_info: Record<string, string>; // email, phone, etc.
}

export interface EscalationCondition {
  field: string;
  operator: 'eq' | 'gte' | 'lte' | 'contains' | 'in';
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface EscalationAction {
  action_type: 'send_notification' | 'create_incident' | 'assign_to' | 'webhook' | 'run_automation';
  action_data: Record<string, any>;
  delay_minutes?: number;
}

export interface EscalationExecution {
  id: string;
  org_id: string;
  notification_id: string;
  policy_id: string;
  current_level: number;
  status: 'active' | 'acknowledged' | 'resolved' | 'cancelled';
  started_at: string;
  last_escalated_at?: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  execution_log: EscalationLogEntry[];
  next_escalation_at?: string;
}

export interface EscalationLogEntry {
  timestamp: string;
  level: number;
  action: string;
  status: 'success' | 'failed' | 'pending';
  details: Record<string, any>;
  error_message?: string;
}

class EscalationService {
  private activeEscalations = new Map<string, EscalationExecution>();
  private escalationTimers = new Map<string, NodeJS.Timeout>();

  // =======================
  // ESCALATION POLICY MANAGEMENT
  // =======================

  async createEscalationPolicy(
    policyData: Omit<EscalationPolicy, 'id' | 'org_id' | 'created_at' | 'updated_at'>
  ): Promise<EscalationPolicy> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('escalation_policies')
      .insert({
        ...policyData,
        org_id: profile.organization_id,
        created_by: profile.id,
        created_by_name: profile.full_name
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEscalationPolicies(): Promise<EscalationPolicy[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('escalation_policies')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('is_active', true)
      .order('policy_name');

    if (error) throw error;
    return data || [];
  }

  async updateEscalationPolicy(
    policyId: string,
    updates: Partial<EscalationPolicy>
  ): Promise<EscalationPolicy> {
    const { data, error } = await supabase
      .from('escalation_policies')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', policyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // =======================
  // ESCALATION EXECUTION
  // =======================

  async startEscalation(notification: EnhancedNotification): Promise<EscalationExecution | null> {
    // Find applicable escalation policy
    const policies = await this.getEscalationPolicies();
    const applicablePolicy = policies.find(policy => 
      this.evaluatePolicyConditions(policy, notification)
    );

    if (!applicablePolicy) {
      console.log('No applicable escalation policy found for notification:', notification.id);
      return null;
    }

    // Create escalation execution
    const execution: EscalationExecution = {
      id: `escalation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      org_id: notification.org_id,
      notification_id: notification.id,
      policy_id: applicablePolicy.id,
      current_level: 0,
      status: 'active',
      started_at: new Date().toISOString(),
      execution_log: [{
        timestamp: new Date().toISOString(),
        level: 0,
        action: 'escalation_started',
        status: 'success',
        details: { policy_name: applicablePolicy.policy_name }
      }],
      next_escalation_at: this.calculateNextEscalationTime(applicablePolicy.escalation_levels[0])
    };

    // Store in database
    await this.saveEscalationExecution(execution);

    // Store in memory
    this.activeEscalations.set(execution.id, execution);

    // Schedule first escalation
    this.scheduleEscalationLevel(execution, applicablePolicy, 0);

    return execution;
  }

  async acknowledgeEscalation(
    escalationId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    const execution = this.activeEscalations.get(escalationId);
    if (!execution) return;

    // Update execution status
    execution.status = 'acknowledged';
    execution.acknowledged_at = new Date().toISOString();
    execution.acknowledged_by = userId;
    execution.execution_log.push({
      timestamp: new Date().toISOString(),
      level: execution.current_level,
      action: 'acknowledged',
      status: 'success',
      details: { acknowledged_by: userName }
    });

    // Clear any pending timers
    const timer = this.escalationTimers.get(escalationId);
    if (timer) {
      clearTimeout(timer);
      this.escalationTimers.delete(escalationId);
    }

    // Update in database
    await this.saveEscalationExecution(execution);

    // Remove from active escalations
    this.activeEscalations.delete(escalationId);
  }

  async cancelEscalation(escalationId: string, reason: string): Promise<void> {
    const execution = this.activeEscalations.get(escalationId);
    if (!execution) return;

    execution.status = 'cancelled';
    execution.execution_log.push({
      timestamp: new Date().toISOString(),
      level: execution.current_level,
      action: 'cancelled',
      status: 'success',
      details: { reason }
    });

    // Clear timer
    const timer = this.escalationTimers.get(escalationId);
    if (timer) {
      clearTimeout(timer);
      this.escalationTimers.delete(escalationId);
    }

    await this.saveEscalationExecution(execution);
    this.activeEscalations.delete(escalationId);
  }

  // =======================
  // ESCALATION PROCESSING
  // =======================

  private async scheduleEscalationLevel(
    execution: EscalationExecution,
    policy: EscalationPolicy,
    levelIndex: number
  ): Promise<void> {
    if (levelIndex >= policy.escalation_levels.length) {
      // All escalation levels exhausted
      execution.status = 'resolved';
      execution.execution_log.push({
        timestamp: new Date().toISOString(),
        level: levelIndex,
        action: 'escalation_completed',
        status: 'success',
        details: { message: 'All escalation levels exhausted' }
      });
      
      await this.saveEscalationExecution(execution);
      this.activeEscalations.delete(execution.id);
      return;
    }

    const level = policy.escalation_levels[levelIndex];
    const delayMs = level.delay_minutes * 60 * 1000;

    const timer = setTimeout(async () => {
      try {
        await this.executeEscalationLevel(execution, policy, level, levelIndex);
      } catch (error) {
        console.error('Error executing escalation level:', error);
        execution.execution_log.push({
          timestamp: new Date().toISOString(),
          level: levelIndex,
          action: 'escalation_failed',
          status: 'failed',
          details: {},
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
        await this.saveEscalationExecution(execution);
      }
    }, delayMs);

    this.escalationTimers.set(execution.id, timer);
  }

  private async executeEscalationLevel(
    execution: EscalationExecution,
    policy: EscalationPolicy,
    level: EscalationLevel,
    levelIndex: number
  ): Promise<void> {
    execution.current_level = levelIndex;
    execution.last_escalated_at = new Date().toISOString();

    // Execute escalation actions
    for (const action of level.escalation_actions) {
      try {
        await this.executeEscalationAction(execution, level, action);
        
        execution.execution_log.push({
          timestamp: new Date().toISOString(),
          level: levelIndex,
          action: action.action_type,
          status: 'success',
          details: action.action_data
        });
      } catch (error) {
        execution.execution_log.push({
          timestamp: new Date().toISOString(),
          level: levelIndex,
          action: action.action_type,
          status: 'failed',
          details: action.action_data,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update next escalation time
    if (levelIndex + 1 < policy.escalation_levels.length) {
      execution.next_escalation_at = this.calculateNextEscalationTime(
        policy.escalation_levels[levelIndex + 1]
      );
    }

    // Save progress
    await this.saveEscalationExecution(execution);

    // Schedule next level
    this.scheduleEscalationLevel(execution, policy, levelIndex + 1);
  }

  private async executeEscalationAction(
    execution: EscalationExecution,
    level: EscalationLevel,
    action: EscalationAction
  ): Promise<void> {
    switch (action.action_type) {
      case 'send_notification':
        await this.sendEscalationNotifications(execution, level);
        break;
        
      case 'create_incident':
        await this.createEscalationIncident(execution, action.action_data);
        break;
        
      case 'assign_to':
        await this.assignToUser(execution, action.action_data.user_id);
        break;
        
      case 'webhook':
        await this.callWebhook(execution, action.action_data);
        break;
        
      default:
        console.warn(`Unknown escalation action type: ${action.action_type}`);
    }
  }

  private async sendEscalationNotifications(
    execution: EscalationExecution,
    level: EscalationLevel
  ): Promise<void> {
    // Get original notification
    const { data: originalNotification } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', execution.notification_id)
      .single();

    if (!originalNotification) return;

    // Send to all recipients at this level
    for (const recipient of level.recipients) {
      try {
        await this.sendToRecipient(execution, originalNotification, recipient, level.channels);
      } catch (error) {
        console.error('Failed to send escalation notification to recipient:', recipient, error);
      }
    }
  }

  private async sendToRecipient(
    execution: EscalationExecution,
    originalNotification: EnhancedNotification,
    recipient: EscalationRecipient,
    channels: string[]
  ): Promise<void> {
    const recipientIds = await this.resolveRecipientIds(recipient);

    for (const recipientId of recipientIds) {
      // Create escalated notification
      await enhancedNotificationService.createNotification({
        recipient_id: recipientId,
        sender_id: originalNotification.sender_id,
        notification_type: `escalated_${originalNotification.notification_type}`,
        title: `🚨 ESCALATED: ${originalNotification.title}`,
        message: `This notification has been escalated (Level ${execution.current_level + 1}): ${originalNotification.message}`,
        urgency: this.escalateUrgency(originalNotification.urgency),
        channels: channels,
        metadata: {
          ...originalNotification.metadata,
          escalation_id: execution.id,
          escalation_level: execution.current_level + 1,
          original_notification_id: originalNotification.id
        },
        escalation_level: execution.current_level + 1,
        correlation_id: originalNotification.correlation_id,
        actions: [{
          id: 'acknowledge-escalation',
          label: 'Acknowledge Escalation',
          action_type: 'custom',
          action_data: { escalation_id: execution.id },
          style: 'primary'
        }]
      });
    }
  }

  // =======================
  // HELPER METHODS
  // =======================

  private evaluatePolicyConditions(policy: EscalationPolicy, notification: EnhancedNotification): boolean {
    // Check if notification type is applicable
    if (policy.applicable_alert_types.length > 0 && 
        !policy.applicable_alert_types.includes(notification.notification_type)) {
      return false;
    }

    // Evaluate conditions
    if (policy.conditions.length === 0) return true;

    return policy.conditions.every(condition => {
      switch (condition.field) {
        case 'urgency':
          return this.evaluateCondition(notification.urgency, condition.operator, condition.value);
        case 'unacknowledged_time':
          const minutesSinceCreated = (Date.now() - new Date(notification.created_at).getTime()) / (1000 * 60);
          return this.evaluateCondition(minutesSinceCreated, condition.operator, condition.value);
        default:
          return this.evaluateCondition(
            notification.metadata?.[condition.field], 
            condition.operator, 
            condition.value
          );
      }
    });
  }

  private evaluateCondition(value: any, operator: string, conditionValue: any): boolean {
    switch (operator) {
      case 'eq': return value === conditionValue;
      case 'gte': return value >= conditionValue;
      case 'lte': return value <= conditionValue;
      case 'contains': return String(value).includes(String(conditionValue));
      case 'in': return Array.isArray(conditionValue) && conditionValue.includes(value);
      default: return false;
    }
  }

  private calculateNextEscalationTime(level: EscalationLevel): string {
    return new Date(Date.now() + level.delay_minutes * 60 * 1000).toISOString();
  }

  private escalateUrgency(currentUrgency: string): 'low' | 'medium' | 'high' | 'critical' {
    const levels = ['low', 'medium', 'high', 'critical'];
    const currentIndex = levels.indexOf(currentUrgency);
    return levels[Math.min(currentIndex + 1, levels.length - 1)] as 'low' | 'medium' | 'high' | 'critical';
  }

  private async resolveRecipientIds(recipient: EscalationRecipient): Promise<string[]> {
    switch (recipient.type) {
      case 'user':
        return [recipient.identifier];
        
      case 'role':
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', recipient.identifier);
        return userRoles?.map(ur => ur.user_id) || [];
        
      case 'group':
        // TODO: Implement group resolution
        return [];
        
      default:
        return [];
    }
  }

  private async saveEscalationExecution(execution: EscalationExecution): Promise<void> {
    const { error } = await supabase
      .from('escalation_executions')
      .upsert(execution);

    if (error) {
      console.error('Failed to save escalation execution:', error);
    }
  }

  private async createEscalationIncident(execution: EscalationExecution, actionData: any): Promise<void> {
    // TODO: Implement incident creation
    console.log('Creating escalation incident:', execution.id, actionData);
  }

  private async assignToUser(execution: EscalationExecution, userId: string): Promise<void> {
    // Update notification assignment
    await supabase
      .from('notifications')
      .update({ 
        assigned_to: userId,
        metadata: { 
          assigned_via_escalation: true, 
          escalation_id: execution.id 
        }
      })
      .eq('id', execution.notification_id);
  }

  private async callWebhook(execution: EscalationExecution, actionData: any): Promise<void> {
    try {
      const response = await fetch(actionData.url, {
        method: actionData.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...actionData.headers
        },
        body: JSON.stringify({
          escalation_id: execution.id,
          notification_id: execution.notification_id,
          level: execution.current_level,
          ...actionData.payload
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook call failed:', error);
      throw error;
    }
  }

  // =======================
  // ANALYTICS & REPORTING
  // =======================

  async getEscalationAnalytics(timeRange?: { start: Date; end: Date }) {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    let query = supabase
      .from('escalation_executions')
      .select('*')
      .eq('org_id', profile.organization_id);

    if (timeRange) {
      query = query
        .gte('started_at', timeRange.start.toISOString())
        .lte('started_at', timeRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const executions = data || [];
    
    return {
      total_escalations: executions.length,
      by_status: this.groupByField(executions, 'status'),
      by_level: this.groupByField(executions, 'current_level'),
      average_resolution_time: this.calculateAverageResolutionTime(executions),
      escalation_effectiveness: this.calculateEscalationEffectiveness(executions)
    };
  }

  private groupByField(items: any[], field: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[field];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateAverageResolutionTime(executions: EscalationExecution[]): number {
    const resolved = executions.filter(e => e.acknowledged_at);
    if (resolved.length === 0) return 0;

    const totalTime = resolved.reduce((sum, execution) => {
      const start = new Date(execution.started_at).getTime();
      const end = new Date(execution.acknowledged_at!).getTime();
      return sum + (end - start);
    }, 0);

    return totalTime / resolved.length / (1000 * 60); // Return in minutes
  }

  private calculateEscalationEffectiveness(executions: EscalationExecution[]): number {
    if (executions.length === 0) return 0;
    
    const acknowledged = executions.filter(e => e.status === 'acknowledged').length;
    return (acknowledged / executions.length) * 100;
  }
}

export const escalationService = new EscalationService();