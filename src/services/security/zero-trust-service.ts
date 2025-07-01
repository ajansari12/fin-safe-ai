
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface ZeroTrustContext {
  userId: string;
  orgId: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  geolocation?: any;
  sessionId?: string;
  riskScore: number;
  trustScore: number;
}

export interface SecurityEvent {
  eventType: string;
  eventCategory: string;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  actionPerformed: string;
  actionDetails?: any;
  riskScore?: number;
  outcome: 'success' | 'failure' | 'blocked' | 'warning';
  errorDetails?: string;
  metadata?: any;
}

export interface ThreatIndicator {
  indicatorType: 'ip' | 'domain' | 'hash' | 'email' | 'url';
  indicatorValue: string;
  threatType: 'malware' | 'phishing' | 'botnet' | 'apt' | 'suspicious';
  confidenceScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceFeed: string;
  metadata?: any;
}

export interface ComplianceFramework {
  frameworkName: string;
  frameworkVersion: string;
  requirements: any[];
  controls: any[];
  assessmentFrequency: 'monthly' | 'quarterly' | 'annually';
}

export interface SecurityPlaybook {
  playbookName: string;
  triggerConditions: any;
  responseSteps: any[];
  escalationRules: any;
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
  priority: number;
}

class ZeroTrustService {
  // Context Management
  async createSecurityContext(userId: string, deviceInfo?: any, locationData?: any): Promise<ZeroTrustContext> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Calculate initial risk score based on context
    const riskScore = await this.calculateRiskScore(userId, deviceInfo, locationData);
    const trustScore = await this.calculateTrustScore(userId, deviceInfo);

    const context: ZeroTrustContext = {
      userId,
      orgId: profile.organization_id,
      deviceFingerprint: deviceInfo?.fingerprint,
      ipAddress: deviceInfo?.ipAddress,
      userAgent: deviceInfo?.userAgent,
      geolocation: locationData,
      riskScore,
      trustScore
    };

    // Log the security context creation
    await this.logSecurityEvent({
      eventType: 'context_created',
      eventCategory: 'authentication',
      actionPerformed: 'create_security_context',
      actionDetails: { riskScore, trustScore },
      outcome: 'success'
    }, context);

    return context;
  }

  async updateSecurityContext(context: ZeroTrustContext, updates: Partial<ZeroTrustContext>): Promise<ZeroTrustContext> {
    const updatedContext = { ...context, ...updates };
    
    // Recalculate risk and trust scores
    updatedContext.riskScore = await this.calculateRiskScore(
      updatedContext.userId,
      { fingerprint: updatedContext.deviceFingerprint },
      updatedContext.geolocation
    );
    
    updatedContext.trustScore = await this.calculateTrustScore(
      updatedContext.userId,
      { fingerprint: updatedContext.deviceFingerprint }
    );

    return updatedContext;
  }

  // Risk Assessment
  private async calculateRiskScore(userId: string, deviceInfo?: any, locationData?: any): Promise<number> {
    let riskScore = 0;

    // Check device trust
    if (deviceInfo?.fingerprint) {
      const { data: deviceData } = await supabase
        .from('device_fingerprints')
        .select('is_trusted, risk_score')
        .eq('fingerprint_hash', deviceInfo.fingerprint)
        .single();

      if (!deviceData?.is_trusted) {
        riskScore += 30;
      }
      riskScore += deviceData?.risk_score || 0;
    } else {
      riskScore += 20; // Unknown device
    }

    // Check location anomalies
    if (locationData) {
      const locationRisk = await this.assessLocationRisk(userId, locationData);
      riskScore += locationRisk;
    }

    // Check threat indicators
    if (deviceInfo?.ipAddress) {
      const threatRisk = await this.checkThreatIndicators('ip', deviceInfo.ipAddress);
      riskScore += threatRisk;
    }

    // Check user behavior patterns
    const behaviorRisk = await this.assessBehaviorRisk(userId);
    riskScore += behaviorRisk;

    return Math.min(riskScore, 100);
  }

  private async calculateTrustScore(userId: string, deviceInfo?: any): Promise<number> {
    let trustScore = 50; // Base trust score

    // Check device trust history
    if (deviceInfo?.fingerprint) {
      const { data: deviceData } = await supabase
        .from('device_fingerprints')
        .select('is_trusted, last_seen_at')
        .eq('fingerprint_hash', deviceInfo.fingerprint)
        .single();

      if (deviceData?.is_trusted) {
        trustScore += 20;
      }

      // Recent activity increases trust
      if (deviceData?.last_seen_at) {
        const daysSinceLastSeen = Math.floor(
          (Date.now() - new Date(deviceData.last_seen_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastSeen < 7) {
          trustScore += 10;
        }
      }
    }

    // Check user authentication history
    const { data: authHistory } = await supabase
      .from('security_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('event_type', 'authentication')
      .eq('outcome', 'success')
      .order('created_at', { ascending: false })
      .limit(10);

    if (authHistory && authHistory.length > 5) {
      trustScore += 15; // Regular successful authentication
    }

    return Math.min(trustScore, 100);
  }

  private async assessLocationRisk(userId: string, locationData: any): Promise<number> {
    // Check if location is unusual for user
    const { data: recentLocations } = await supabase
      .from('security_logs')
      .select('metadata')
      .eq('user_id', userId)
      .not('metadata->geolocation', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!recentLocations || recentLocations.length === 0) {
      return 15; // New location, moderate risk
    }

    // Simple location risk assessment based on distance from recent locations
    const currentLocation = locationData;
    let isUsualLocation = false;

    for (const log of recentLocations) {
      const logLocation = log.metadata?.geolocation;
      if (logLocation && this.calculateDistance(currentLocation, logLocation) < 100) {
        isUsualLocation = true;
        break;
      }
    }

    return isUsualLocation ? 0 : 25;
  }

  private calculateDistance(loc1: any, loc2: any): number {
    // Simple haversine distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private async checkThreatIndicators(type: string, value: string): Promise<number> {
    const { data: indicators } = await supabase
      .from('threat_indicators')
      .select('severity, confidence_score')
      .eq('indicator_type', type)
      .eq('indicator_value', value)
      .eq('is_active', true);

    if (!indicators || indicators.length === 0) {
      return 0;
    }

    let maxRisk = 0;
    for (const indicator of indicators) {
      let risk = 0;
      switch (indicator.severity) {
        case 'critical': risk = 40; break;
        case 'high': risk = 30; break;
        case 'medium': risk = 20; break;
        case 'low': risk = 10; break;
      }
      risk *= (indicator.confidence_score || 1);
      maxRisk = Math.max(maxRisk, risk);
    }

    return maxRisk;
  }

  private async assessBehaviorRisk(userId: string): Promise<number> {
    const { data: recentBehavior } = await supabase
      .from('behavioral_analytics')
      .select('anomaly_score')
      .eq('user_id', userId)
      .order('detected_at', { ascending: false })
      .limit(5);

    if (!recentBehavior || recentBehavior.length === 0) {
      return 0;
    }

    const avgAnomalyScore = recentBehavior.reduce((sum, b) => sum + b.anomaly_score, 0) / recentBehavior.length;
    return Math.min(avgAnomalyScore, 30);
  }

  // Security Event Logging
  async logSecurityEvent(event: SecurityEvent, context: ZeroTrustContext): Promise<void> {
    try {
      await supabase.from('security_logs').insert({
        org_id: context.orgId,
        user_id: context.userId,
        event_type: event.eventType,
        event_category: event.eventCategory,
        resource_type: event.resourceType,
        resource_id: event.resourceId,
        resource_name: event.resourceName,
        action_performed: event.actionPerformed,
        action_details: event.actionDetails || {},
        risk_score: event.riskScore || context.riskScore,
        ip_address: context.ipAddress,
        user_agent: context.userAgent,
        geolocation: context.geolocation,
        device_fingerprint: context.deviceFingerprint,
        session_id: context.sessionId,
        outcome: event.outcome,
        error_details: event.errorDetails,
        metadata: event.metadata || {}
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Access Control
  async authorizeAccess(context: ZeroTrustContext, resource: string, action: string): Promise<boolean> {
    // Log access attempt
    await this.logSecurityEvent({
      eventType: 'access_attempt',
      eventCategory: 'authorization',
      resourceType: 'resource',
      resourceName: resource,
      actionPerformed: action,
      outcome: 'success' // Will be updated based on result
    }, context);

    // Basic risk-based access control
    if (context.riskScore > 70) {
      await this.logSecurityEvent({
        eventType: 'access_denied',
        eventCategory: 'authorization',
        resourceType: 'resource',
        resourceName: resource,
        actionPerformed: action,
        outcome: 'blocked',
        actionDetails: { reason: 'high_risk_score', riskScore: context.riskScore }
      }, context);
      return false;
    }

    if (context.trustScore < 30) {
      await this.logSecurityEvent({
        eventType: 'access_denied',
        eventCategory: 'authorization',
        resourceType: 'resource',
        resourceName: resource,
        actionPerformed: action,
        outcome: 'blocked',
        actionDetails: { reason: 'low_trust_score', trustScore: context.trustScore }
      }, context);
      return false;
    }

    return true;
  }

  // Threat Intelligence
  async addThreatIndicator(indicator: Omit<ThreatIndicator, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    await supabase.from('threat_indicators').insert({
      org_id: profile.organization_id,
      indicator_type: indicator.indicatorType,
      indicator_value: indicator.indicatorValue,
      threat_type: indicator.threatType,
      confidence_score: indicator.confidenceScore,
      severity: indicator.severity,
      source_feed: indicator.sourceFeed,
      metadata: indicator.metadata || {}
    });
  }

  async getThreatIndicators(type?: string, severity?: string): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    let query = supabase
      .from('threat_indicators')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('is_active', true);

    if (type) {
      query = query.eq('indicator_type', type);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data } = await query.order('created_at', { ascending: false });
    return data || [];
  }

  // Compliance Management
  async addComplianceFramework(framework: Omit<ComplianceFramework, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    await supabase.from('compliance_frameworks').insert({
      org_id: profile.organization_id,
      framework_name: framework.frameworkName,
      framework_version: framework.frameworkVersion,
      requirements: framework.requirements,
      controls: framework.controls,
      assessment_frequency: framework.assessmentFrequency,
      created_by: profile.id
    });
  }

  async getComplianceFrameworks(): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data } = await supabase
      .from('compliance_frameworks')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return data || [];
  }

  // Security Playbooks
  async addSecurityPlaybook(playbook: Omit<SecurityPlaybook, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    await supabase.from('security_playbooks').insert({
      org_id: profile.organization_id,
      playbook_name: playbook.playbookName,
      trigger_conditions: playbook.triggerConditions,
      response_steps: playbook.responseSteps,
      escalation_rules: playbook.escalationRules,
      automation_level: playbook.automationLevel,
      priority: playbook.priority,
      created_by: profile.id
    });
  }

  async getSecurityPlaybooks(): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data } = await supabase
      .from('security_playbooks')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    return data || [];
  }

  // Security Metrics
  async recordSecurityMetric(metricType: string, metricName: string, value: number, unit?: string, metadata?: any): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    await supabase.from('security_metrics').insert({
      org_id: profile.organization_id,
      metric_type: metricType,
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
      metadata: metadata || {}
    });
  }

  async getSecurityMetrics(type?: string, period?: string): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    let query = supabase
      .from('security_metrics')
      .select('*')
      .eq('org_id', profile.organization_id);

    if (type) {
      query = query.eq('metric_type', type);
    }

    if (period) {
      query = query.eq('measurement_period', period);
    }

    const { data } = await query.order('measurement_date', { ascending: false });
    return data || [];
  }

  // Automated Response
  async triggerSecurityResponse(eventType: string, context: ZeroTrustContext, severity: string): Promise<void> {
    // Get applicable playbooks
    const playbooks = await this.getSecurityPlaybooks();
    const applicablePlaybooks = playbooks.filter(p => 
      this.matchesTriggerConditions(p.trigger_conditions, { eventType, context, severity })
    );

    for (const playbook of applicablePlaybooks) {
      await this.executePlaybook(playbook, context);
    }
  }

  private matchesTriggerConditions(conditions: any, event: any): boolean {
    // Simple condition matching - can be enhanced
    return conditions.event_types?.includes(event.eventType) ||
           conditions.severity_levels?.includes(event.severity) ||
           conditions.risk_threshold <= event.context.riskScore;
  }

  private async executePlaybook(playbook: any, context: ZeroTrustContext): Promise<void> {
    await this.logSecurityEvent({
      eventType: 'playbook_executed',
      eventCategory: 'response',
      resourceType: 'playbook',
      resourceName: playbook.playbook_name,
      actionPerformed: 'execute_response',
      outcome: 'success',
      actionDetails: { playbookId: playbook.id, automationLevel: playbook.automation_level }
    }, context);

    // Execute response steps based on automation level
    if (playbook.automation_level === 'fully-automated') {
      // Execute all steps automatically
      for (const step of playbook.response_steps) {
        await this.executeResponseStep(step, context);
      }
    } else if (playbook.automation_level === 'semi-automated') {
      // Execute some steps automatically, queue others for manual review
      for (const step of playbook.response_steps) {
        if (step.automated) {
          await this.executeResponseStep(step, context);
        } else {
          await this.queueManualStep(step, context);
        }
      }
    } else {
      // Queue all steps for manual execution
      for (const step of playbook.response_steps) {
        await this.queueManualStep(step, context);
      }
    }
  }

  private async executeResponseStep(step: any, context: ZeroTrustContext): Promise<void> {
    // Execute automated response step
    switch (step.action_type) {
      case 'block_user':
        await this.blockUser(context.userId, step.duration || 3600);
        break;
      case 'invalidate_sessions':
        await this.invalidateUserSessions(context.userId);
        break;
      case 'require_mfa':
        await this.requireMFA(context.userId);
        break;
      case 'notify_security_team':
        await this.notifySecurityTeam(step.message, context);
        break;
      default:
        console.warn('Unknown response step action:', step.action_type);
    }
  }

  private async queueManualStep(step: any, context: ZeroTrustContext): Promise<void> {
    // Queue step for manual execution - would integrate with ticketing system
    console.log('Queuing manual step:', step, context);
  }

  private async blockUser(userId: string, duration: number): Promise<void> {
    // Implementation would block user access
    console.log(`Blocking user ${userId} for ${duration} seconds`);
  }

  private async invalidateUserSessions(userId: string): Promise<void> {
    await supabase
      .from('enhanced_auth_sessions')
      .update({ is_active: false })
      .eq('user_id', userId);
  }

  private async requireMFA(userId: string): Promise<void> {
    // Implementation would require MFA for next login
    console.log(`Requiring MFA for user ${userId}`);
  }

  private async notifySecurityTeam(message: string, context: ZeroTrustContext): Promise<void> {
    // Implementation would send notifications to security team
    console.log('Security team notification:', message, context);
  }

  // Analytics and Reporting
  async getSecurityDashboardData(): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const [
      recentEvents,
      threatIndicators,
      securityMetrics,
      activePlaybooks
    ] = await Promise.all([
      this.getRecentSecurityEvents(),
      this.getThreatIndicators(),
      this.getSecurityMetrics(),
      this.getSecurityPlaybooks()
    ]);

    return {
      recentEvents,
      threatIndicators: threatIndicators.length,
      securityMetrics,
      activePlaybooks: activePlaybooks.length,
      riskLevel: this.calculateOverallRiskLevel(recentEvents),
      complianceStatus: await this.getComplianceStatus()
    };
  }

  private async getRecentSecurityEvents(limit: number = 50): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data } = await supabase
      .from('security_logs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }

  private calculateOverallRiskLevel(events: any[]): string {
    if (events.length === 0) return 'low';

    const highRiskEvents = events.filter(e => e.risk_score > 70).length;
    const mediumRiskEvents = events.filter(e => e.risk_score > 40 && e.risk_score <= 70).length;

    if (highRiskEvents > 5) return 'critical';
    if (highRiskEvents > 0 || mediumRiskEvents > 10) return 'high';
    if (mediumRiskEvents > 0) return 'medium';
    return 'low';
  }

  private async getComplianceStatus(): Promise<any> {
    const frameworks = await this.getComplianceFrameworks();
    const totalFrameworks = frameworks.length;
    const compliantFrameworks = frameworks.filter(f => f.compliance_status === 'compliant').length;

    return {
      totalFrameworks,
      compliantFrameworks,
      compliancePercentage: totalFrameworks > 0 ? (compliantFrameworks / totalFrameworks) * 100 : 0
    };
  }
}

export const zeroTrustService = new ZeroTrustService();
