import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface SecurityIncident {
  id: string;
  type: 'authentication_failure' | 'authorization_violation' | 'data_breach' | 'suspicious_activity' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: Record<string, any>;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface SecurityMetrics {
  total_incidents: number;
  critical_incidents: number;
  resolved_incidents: number;
  average_resolution_time: number;
  incident_trend: 'increasing' | 'decreasing' | 'stable';
  top_incident_types: { type: string; count: number }[];
}

class SecurityIncidentMonitor {
  private readonly MAX_INCIDENTS_PER_HOUR = 100;
  private readonly CRITICAL_THRESHOLD = 5;

  async logIncident(incident: Omit<SecurityIncident, 'id' | 'timestamp' | 'status'>): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('security_incidents')
        .insert({
          type: incident.type,
          severity: incident.severity,
          source: incident.source,
          details: incident.details,
          user_id: incident.user_id,
          ip_address: incident.ip_address,
          user_agent: incident.user_agent,
          status: 'open'
        });

      if (error) {
        logger.error('Failed to log security incident', {
          module: 'security-monitor',
          metadata: { error: error.message, incident }
        });
        return;
      }

      // Auto-escalate critical incidents
      if (incident.severity === 'critical') {
        await this.escalateCriticalIncident(incident);
      }

      // Check for incident rate limits
      await this.checkIncidentRateLimit(incident.type);

      logger.info('Security incident logged', {
        module: 'security-monitor',
        metadata: { type: incident.type, severity: incident.severity }
      });
    } catch (error) {
      logger.error('Error logging security incident', {
        module: 'security-monitor',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  async getSecurityMetrics(orgId: string, timeRange: '24h' | '7d' | '30d' = '24h'): Promise<SecurityMetrics> {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      const { data: incidents, error } = await supabase
        .from('security_incidents')
        .select('*')
        .gte('created_at', timeFilter);

      if (error) {
        logger.error('Failed to fetch security metrics', {
          module: 'security-monitor',
          metadata: { error: error.message }
        });
        return this.getDefaultMetrics();
      }

      return this.calculateMetrics(incidents || []);
    } catch (error) {
      logger.error('Error fetching security metrics', {
        module: 'security-monitor',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return this.getDefaultMetrics();
    }
  }

  async resolveIncident(incidentId: string, resolution: {
    status: 'resolved' | 'false_positive';
    notes: string;
    resolved_by: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_incidents')
        .update({
          status: resolution.status,
          resolution_notes: resolution.notes,
          resolved_by: resolution.resolved_by,
          resolved_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (error) {
        logger.error('Failed to resolve security incident', {
          module: 'security-monitor',
          metadata: { error: error.message, incidentId }
        });
        return;
      }

      logger.info('Security incident resolved', {
        module: 'security-monitor',
        metadata: { incidentId, status: resolution.status }
      });
    } catch (error) {
      logger.error('Error resolving security incident', {
        module: 'security-monitor',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  async getActiveIncidents(orgId: string): Promise<SecurityIncident[]> {
    try {
      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .in('status', ['open', 'investigating'])
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch active incidents', {
          module: 'security-monitor',
          metadata: { error: error.message }
        });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching active incidents', {
        module: 'security-monitor',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  private async escalateCriticalIncident(incident: Omit<SecurityIncident, 'id' | 'timestamp' | 'status'>): Promise<void> {
    try {
      // Create escalation notification
      const escalationDetails = {
        incident_type: incident.type,
        severity: incident.severity,
        source: incident.source,
        escalated_at: new Date().toISOString(),
        auto_escalated: true
      };

      logger.critical('Critical security incident auto-escalated', {
        module: 'security-monitor',
        metadata: escalationDetails
      });

      // In a real implementation, this would:
      // - Send notifications to security team
      // - Create tickets in incident management system
      // - Trigger automated response procedures
    } catch (error) {
      logger.error('Error escalating critical incident', {
        module: 'security-monitor',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  private async checkIncidentRateLimit(incidentType: string): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_incidents')
        .select('id')
        .eq('type', incidentType)
        .gte('created_at', oneHourAgo);

      if (error) {
        logger.error('Failed to check incident rate limit', {
          module: 'security-monitor',
          metadata: { error: error.message }
        });
        return;
      }

      const incidentCount = data?.length || 0;
      
      if (incidentCount >= this.MAX_INCIDENTS_PER_HOUR) {
        logger.critical('Security incident rate limit exceeded', {
          module: 'security-monitor',
          metadata: { 
            incident_type: incidentType, 
            count: incidentCount,
            limit: this.MAX_INCIDENTS_PER_HOUR
          }
        });

        // Auto-escalate rate limit breach
        await this.logIncident({
          type: 'policy_violation',
          severity: 'critical',
          source: 'security-monitor',
          details: {
            violation_type: 'rate_limit_exceeded',
            incident_type: incidentType,
            incident_count: incidentCount,
            time_window: '1_hour'
          }
        });
      }
    } catch (error) {
      logger.error('Error checking incident rate limit', {
        module: 'security-monitor',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  private getTimeFilter(timeRange: '24h' | '7d' | '30d'): string {
    const now = new Date();
    const timeMap = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    };
    return timeMap[timeRange].toISOString();
  }

  private calculateMetrics(incidents: any[]): SecurityMetrics {
    const totalIncidents = incidents.length;
    const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
    
    // Calculate average resolution time
    const resolvedWithTime = incidents.filter(i => i.resolved_at && i.created_at);
    const avgResolutionTime = resolvedWithTime.length > 0 
      ? resolvedWithTime.reduce((sum, incident) => {
          const created = new Date(incident.created_at).getTime();
          const resolved = new Date(incident.resolved_at).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Calculate incident trend (simplified)
    const now = Date.now();
    const halfwayPoint = now - (7 * 24 * 60 * 60 * 1000) / 2; // 3.5 days ago
    const recentIncidents = incidents.filter(i => new Date(i.created_at).getTime() > halfwayPoint);
    const olderIncidents = incidents.filter(i => new Date(i.created_at).getTime() <= halfwayPoint);
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const recentCount = recentIncidents.length;
    const olderCount = olderIncidents.length;
    
    if (recentCount > olderCount * 1.2) {
      trend = 'increasing';
    } else if (recentCount < olderCount * 0.8) {
      trend = 'decreasing';
    }

    // Get top incident types
    const typeCounts = incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topIncidentTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_incidents: totalIncidents,
      critical_incidents: criticalIncidents,
      resolved_incidents: resolvedIncidents,
      average_resolution_time: avgResolutionTime,
      incident_trend: trend,
      top_incident_types: topIncidentTypes
    };
  }

  private getDefaultMetrics(): SecurityMetrics {
    return {
      total_incidents: 0,
      critical_incidents: 0,
      resolved_incidents: 0,
      average_resolution_time: 0,
      incident_trend: 'stable',
      top_incident_types: []
    };
  }
}

export const securityIncidentMonitor = new SecurityIncidentMonitor();