import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface NotificationChannel {
  id: string;
  org_id: string;
  channel_name: string;
  channel_type: 'email' | 'sms' | 'push' | 'in_app' | 'webhook' | 'slack' | 'teams';
  description?: string;
  configuration: Record<string, any>;
  delivery_settings: Record<string, any>;
  is_active: boolean;
  status: 'active' | 'inactive' | 'error' | 'testing';
}

export interface NotificationRule {
  id: string;
  org_id: string;
  rule_name: string;
  description?: string;
  event_type: string;
  conditions: any[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  recipients: any[];
  template_id?: string;
  escalation_policy_id?: string;
  is_active: boolean;
}

export interface Alert {
  id: string;
  org_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  event_data: Record<string, any>;
  triggered_at: string;
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  assigned_to: string[];
  escalation_level: number;
  resolved_at?: string;
  resolved_by?: string;
  resolution?: string;
}

export interface NotificationTemplate {
  id: string;
  org_id: string;
  template_name: string;
  template_type: string;
  channel_type: string;
  subject_template?: string;
  body_template: string;
  variables: string[];
  is_system_template: boolean;
}

class NotificationService {
  async createAlert(alertData: Omit<Alert, 'id' | 'triggered_at'>): Promise<Alert> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        ...alertData,
        org_id: profile.organization_id,
      })
      .select()
      .single();

    if (error) throw error;

    // Process notification rules for this alert
    await this.processNotificationRules(data);

    return data;
  }

  async getAlerts(filters?: {
    status?: string;
    severity?: string;
    limit?: number;
  }): Promise<Alert[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    let query = supabase
      .from('alerts')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('triggered_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .update({
        status: 'acknowledged',
        assigned_to: [userId],
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  async resolveAlert(alertId: string, resolution: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
        resolution,
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  async getNotificationChannels(): Promise<NotificationChannel[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('notification_channels')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async createNotificationChannel(channelData: Omit<NotificationChannel, 'id' | 'org_id'>): Promise<NotificationChannel> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('notification_channels')
      .insert({
        ...channelData,
        org_id: profile.organization_id,
        created_by: profile.id,
        created_by_name: profile.full_name,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getNotificationRules(): Promise<NotificationRule[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('notification_rules')
      .select('*')
      .eq('org_id', profile.organization_id);

    if (error) throw error;
    return data || [];
  }

  async createNotificationRule(ruleData: Omit<NotificationRule, 'id' | 'org_id'>): Promise<NotificationRule> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('notification_rules')
      .insert({
        ...ruleData,
        org_id: profile.organization_id,
        created_by: profile.id,
        created_by_name: profile.full_name,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .or(`org_id.eq.${profile.organization_id},is_system_template.eq.true`)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  private async processNotificationRules(alert: Alert): Promise<void> {
    // Get applicable notification rules
    const { data: rules, error } = await supabase
      .from('notification_rules')
      .select('*')
      .eq('org_id', alert.org_id)
      .eq('event_type', alert.alert_type)
      .eq('is_active', true);

    if (error || !rules) return;

    // Process each rule
    for (const rule of rules) {
      if (this.evaluateRuleConditions(rule, alert)) {
        await this.sendNotifications(rule, alert);
      }
    }
  }

  private evaluateRuleConditions(rule: NotificationRule, alert: Alert): boolean {
    // Simple condition evaluation - can be expanded for complex logic
    if (rule.conditions.length === 0) return true;

    for (const condition of rule.conditions) {
      if (condition.field === 'severity') {
        const severityLevels = ['low', 'medium', 'high', 'critical'];
        const alertLevel = severityLevels.indexOf(alert.severity);
        const conditionLevel = severityLevels.indexOf(condition.value);
        
        if (condition.operator === 'gte' && alertLevel >= conditionLevel) {
          return true;
        }
      }
    }

    return false;
  }

  private async sendNotifications(rule: NotificationRule, alert: Alert): Promise<void> {
    // This would integrate with actual notification channels
    // For now, we'll create delivery log entries
    for (const channelId of rule.channels) {
      for (const recipient of rule.recipients) {
        await supabase
          .from('notification_delivery_logs')
          .insert({
            org_id: alert.org_id,
            alert_id: alert.id,
            rule_id: rule.id,
            channel_id: channelId,
            channel_type: 'in_app', // Default for now
            recipient: recipient.email || recipient.user_id,
            delivery_status: 'pending',
            message_content: this.generateMessageContent(rule, alert),
          });
      }
    }
  }

  private generateMessageContent(rule: NotificationRule, alert: Alert): string {
    return `Alert: ${alert.title}\nSeverity: ${alert.severity}\nDescription: ${alert.description}`;
  }
}

export const notificationService = new NotificationService();