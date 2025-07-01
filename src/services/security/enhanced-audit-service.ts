
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface SecurityAuditLog {
  id: string;
  org_id: string;
  user_id?: string;
  session_id?: string;
  event_type: string;
  event_category: string;
  resource_type?: string;
  resource_id?: string;
  action_performed: string;
  event_details: any;
  risk_score: number;
  ip_address?: string;
  user_agent?: string;
  location_data?: any;
  timestamp: string;
  correlation_id?: string;
}

export interface AuditQuery {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: string[];
  eventCategories?: string[];
  userIds?: string[];
  riskScoreMin?: number;
  riskScoreMax?: number;
  limit?: number;
  offset?: number;
}

class EnhancedAuditService {
  // Log security event
  async logSecurityEvent(
    eventType: string,
    eventCategory: string,
    actionPerformed: string,
    options: {
      resourceType?: string;
      resourceId?: string;
      eventDetails?: any;
      riskScore?: number;
      correlationId?: string;
      sessionId?: string;
    } = {}
  ): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const logEntry = {
      org_id: profile.organization_id,
      user_id: profile.id,
      session_id: options.sessionId,
      event_type: eventType,
      event_category: eventCategory,
      resource_type: options.resourceType,
      resource_id: options.resourceId,
      action_performed: actionPerformed,
      event_details: options.eventDetails || {},
      risk_score: options.riskScore || 0,
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent,
      location_data: await this.getLocationData(),
      correlation_id: options.correlationId || this.generateCorrelationId()
    };

    const { error } = await supabase
      .from('security_audit_logs')
      .insert([logEntry]);

    if (error) {
      console.error('Failed to log security event:', error);
    }

    // Check for security alerts
    await this.checkSecurityAlerts(logEntry);
  }

  // Query audit logs
  async queryAuditLogs(query: AuditQuery = {}): Promise<SecurityAuditLog[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    let supabaseQuery = supabase
      .from('security_audit_logs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('timestamp', { ascending: false });

    if (query.startDate) {
      supabaseQuery = supabaseQuery.gte('timestamp', query.startDate.toISOString());
    }

    if (query.endDate) {
      supabaseQuery = supabaseQuery.lte('timestamp', query.endDate.toISOString());
    }

    if (query.eventTypes && query.eventTypes.length > 0) {
      supabaseQuery = supabaseQuery.in('event_type', query.eventTypes);
    }

    if (query.eventCategories && query.eventCategories.length > 0) {
      supabaseQuery = supabaseQuery.in('event_category', query.eventCategories);
    }

    if (query.userIds && query.userIds.length > 0) {
      supabaseQuery = supabaseQuery.in('user_id', query.userIds);
    }

    if (query.riskScoreMin !== undefined) {
      supabaseQuery = supabaseQuery.gte('risk_score', query.riskScoreMin);
    }

    if (query.riskScoreMax !== undefined) {
      supabaseQuery = supabaseQuery.lte('risk_score', query.riskScoreMax);
    }

    if (query.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit);
    }

    if (query.offset) {
      supabaseQuery = supabaseQuery.range(query.offset, query.offset + (query.limit || 50) - 1);
    }

    const { data, error } = await supabaseQuery;

    if (error) throw error;
    return data || [];
  }

  // Get audit statistics
  async getAuditStatistics(days: number = 30): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data: totalEvents } = await supabase
      .from('security_audit_logs')
      .select('id', { count: 'exact' })
      .eq('org_id', profile.organization_id)
      .gte('timestamp', startDate.toISOString());

    const { data: highRiskEvents } = await supabase
      .from('security_audit_logs')
      .select('id', { count: 'exact' })
      .eq('org_id', profile.organization_id)
      .gte('timestamp', startDate.toISOString())
      .gte('risk_score', 7);

    const { data: eventsByCategory } = await supabase
      .from('security_audit_logs')
      .select('event_category')
      .eq('org_id', profile.organization_id)
      .gte('timestamp', startDate.toISOString());

    const categoryStats = eventsByCategory?.reduce((acc: any, event) => {
      acc[event.event_category] = (acc[event.event_category] || 0) + 1;
      return acc;
    }, {});

    const { data: userActivity } = await supabase
      .from('security_audit_logs')
      .select('user_id')
      .eq('org_id', profile.organization_id)
      .gte('timestamp', startDate.toISOString())
      .not('user_id', 'is', null);

    const userStats = userActivity?.reduce((acc: any, event) => {
      acc[event.user_id] = (acc[event.user_id] || 0) + 1;
      return acc;
    }, {});

    return {
      totalEvents: totalEvents?.length || 0,
      highRiskEvents: highRiskEvents?.length || 0,
      eventsByCategory: categoryStats || {},
      userActivity: userStats || {}
    };
  }

  // Export audit logs
  async exportAuditLogs(query: AuditQuery = {}, format: 'csv' | 'json' = 'csv'): Promise<string> {
    const logs = await this.queryAuditLogs({ ...query, limit: 10000 });

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = [
      'Timestamp', 'Event Type', 'Event Category', 'Action', 'User ID',
      'Resource Type', 'Resource ID', 'Risk Score', 'IP Address'
    ];

    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        log.event_type,
        log.event_category,
        log.action_performed,
        log.user_id || '',
        log.resource_type || '',
        log.resource_id || '',
        log.risk_score,
        log.ip_address || ''
      ].map(field => `"${field}"`).join(','))
    ];

    return csvRows.join('\n');
  }

  // Check for security alerts based on log patterns
  private async checkSecurityAlerts(logEntry: any): Promise<void> {
    // Multiple failed login attempts
    if (logEntry.event_type === 'authentication_failed') {
      const recentFailures = await this.queryAuditLogs({
        startDate: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        eventTypes: ['authentication_failed'],
        userIds: logEntry.user_id ? [logEntry.user_id] : undefined
      });

      if (recentFailures.length >= 5) {
        await this.triggerSecurityAlert('Multiple failed login attempts', {
          userId: logEntry.user_id,
          attemptCount: recentFailures.length,
          ipAddress: logEntry.ip_address
        });
      }
    }

    // Unusual access patterns
    if (logEntry.risk_score >= 8) {
      await this.triggerSecurityAlert('High risk activity detected', {
        eventType: logEntry.event_type,
        riskScore: logEntry.risk_score,
        details: logEntry.event_details
      });
    }

    // Data access from new location
    if (logEntry.event_category === 'data_access' && logEntry.location_data) {
      // Implementation would check against user's typical locations
      // For now, we'll skip this complex logic
    }
  }

  // Trigger security alert
  private async triggerSecurityAlert(alertType: string, details: any): Promise<void> {
    // In a real implementation, this would:
    // 1. Send notifications to security team
    // 2. Create incident tickets
    // 3. Trigger automated responses
    console.warn('Security Alert:', alertType, details);
    
    await this.logSecurityEvent(
      'security_alert',
      'security',
      `Triggered alert: ${alertType}`,
      {
        eventDetails: details,
        riskScore: 9
      }
    );
  }

  // Generate correlation ID
  private generateCorrelationId(): string {
    return crypto.randomUUID();
  }

  // Get client IP
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  // Get location data (simplified)
  private async getLocationData(): Promise<any> {
    // In a real implementation, you might use a geolocation service
    return {
      country: 'Unknown',
      city: 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  // Specific audit methods for common events
  async auditLogin(success: boolean, method: string): Promise<void> {
    await this.logSecurityEvent(
      success ? 'authentication_success' : 'authentication_failed',
      'authentication',
      `User login ${success ? 'succeeded' : 'failed'}`,
      {
        eventDetails: { method },
        riskScore: success ? 1 : 5
      }
    );
  }

  async auditDataAccess(resourceType: string, resourceId: string, action: string): Promise<void> {
    await this.logSecurityEvent(
      'data_access',
      'data',
      `${action} ${resourceType}`,
      {
        resourceType,
        resourceId,
        riskScore: 3
      }
    );
  }

  async auditConfigurationChange(configType: string, changes: any): Promise<void> {
    await this.logSecurityEvent(
      'configuration_change',
      'administration',
      `Modified ${configType}`,
      {
        resourceType: configType,
        eventDetails: changes,
        riskScore: 6
      }
    );
  }

  async auditPermissionChange(targetUserId: string, changes: any): Promise<void> {
    await this.logSecurityEvent(
      'permission_change',
      'authorization',
      'User permissions modified',
      {
        resourceType: 'user_permissions',
        resourceId: targetUserId,
        eventDetails: changes,
        riskScore: 7
      }
    );
  }
}

export const enhancedAuditService = new EnhancedAuditService();
