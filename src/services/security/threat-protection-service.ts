
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface SecurityThreat {
  id: string;
  org_id: string;
  threat_type: string;
  severity: string;
  threat_indicators: any;
  affected_resources: string[];
  detection_method: string;
  status: string;
  mitigation_actions: any[];
  assigned_to?: string;
  detected_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SecurityIncident {
  id: string;
  org_id: string;
  incident_type: string;
  severity: string;
  status: string;
  title: string;
  description?: string;
  affected_systems: string[];
  evidence_data: any;
  response_actions: any[];
  assigned_team?: string;
  escalation_level: number;
  escalated_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SIEMIntegration {
  id: string;
  org_id: string;
  integration_name: string;
  integration_type: string;
  endpoint_url: string;
  authentication_config: any;
  event_filters: any;
  is_active: boolean;
  last_sync_at?: string;
  sync_status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

class ThreatProtectionService {
  private threatPatterns = [
    {
      name: 'brute_force',
      pattern: 'multiple_failed_logins',
      threshold: 5,
      severity: 'high'
    },
    {
      name: 'sql_injection',
      pattern: /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bDROP\b).*(FROM|INTO|WHERE)/gi,
      severity: 'critical'
    },
    {
      name: 'xss_attempt',
      pattern: /<script[^>]*>.*?<\/script>/gi,
      severity: 'high'
    },
    {
      name: 'suspicious_file_access',
      pattern: 'unusual_file_patterns',
      severity: 'medium'
    }
  ];

  private transformSecurityThreat(data: any): SecurityThreat {
    return {
      ...data,
      affected_resources: Array.isArray(data.affected_resources) 
        ? data.affected_resources 
        : JSON.parse(data.affected_resources || '[]'),
      mitigation_actions: Array.isArray(data.mitigation_actions) 
        ? data.mitigation_actions 
        : JSON.parse(data.mitigation_actions || '[]'),
      threat_indicators: typeof data.threat_indicators === 'string' 
        ? JSON.parse(data.threat_indicators) 
        : data.threat_indicators
    };
  }

  private transformSecurityIncident(data: any): SecurityIncident {
    return {
      ...data,
      affected_systems: Array.isArray(data.affected_systems) 
        ? data.affected_systems 
        : JSON.parse(data.affected_systems || '[]'),
      response_actions: Array.isArray(data.response_actions) 
        ? data.response_actions 
        : JSON.parse(data.response_actions || '[]'),
      evidence_data: typeof data.evidence_data === 'string' 
        ? JSON.parse(data.evidence_data) 
        : data.evidence_data
    };
  }

  async detectThreats(eventData: any): Promise<SecurityThreat[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const detectedThreats: SecurityThreat[] = [];

    // Analyze event data for threat patterns
    for (const pattern of this.threatPatterns) {
      const threat = await this.analyzePattern(pattern, eventData, profile.organization_id);
      if (threat) {
        detectedThreats.push(threat);
      }
    }

    // Store detected threats
    for (const threat of detectedThreats) {
      await this.storeThreat(threat);
    }

    return detectedThreats;
  }

  private async analyzePattern(pattern: any, eventData: any, orgId: string): Promise<SecurityThreat | null> {
    let detected = false;
    const indicators: any = {};

    switch (pattern.name) {
      case 'brute_force':
        detected = await this.detectBruteForce(eventData, orgId);
        if (detected) {
          indicators.failed_attempts = eventData.failed_attempts || 0;
          indicators.ip_address = eventData.ip_address;
        }
        break;
      
      case 'sql_injection':
        if (eventData.query && pattern.pattern.test(eventData.query)) {
          detected = true;
          indicators.query = eventData.query;
          indicators.user_input = eventData.user_input;
        }
        break;
      
      case 'xss_attempt':
        if (eventData.user_input && pattern.pattern.test(eventData.user_input)) {
          detected = true;
          indicators.input_data = eventData.user_input;
          indicators.endpoint = eventData.endpoint;
        }
        break;
      
      case 'suspicious_file_access':
        detected = await this.detectSuspiciousFileAccess(eventData);
        if (detected) {
          indicators.file_path = eventData.file_path;
          indicators.access_pattern = eventData.access_pattern;
        }
        break;
    }

    if (!detected) return null;

    return {
      id: crypto.randomUUID(),
      org_id: orgId,
      threat_type: pattern.name,
      severity: pattern.severity,
      threat_indicators: indicators,
      affected_resources: eventData.affected_resources || [],
      detection_method: 'automated_pattern_analysis',
      status: 'active',
      mitigation_actions: [],
      detected_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private async detectBruteForce(eventData: any, orgId: string): Promise<boolean> {
    if (eventData.event_type !== 'failed_login') return false;

    const { data } = await supabase
      .from('security_logs')
      .select('*')
      .eq('org_id', orgId)
      .eq('action_type', 'login_failed')
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes
      .eq('ip_address', eventData.ip_address);

    return (data?.length || 0) >= 5;
  }

  private async detectSuspiciousFileAccess(eventData: any): Promise<boolean> {
    // Check for unusual file access patterns
    const suspiciousPatterns = [
      /\.env$/,
      /config\.json$/,
      /\.key$/,
      /\.pem$/,
      /password/i,
      /secret/i
    ];

    return suspiciousPatterns.some(pattern => 
      pattern.test(eventData.file_path || '')
    );
  }

  private async storeThreat(threat: SecurityThreat): Promise<void> {
    const { error } = await supabase
      .from('security_threats')
      .insert(threat);

    if (error) {
      console.error('Error storing threat:', error);
    }

    // Trigger automated response
    await this.triggerAutomatedResponse(threat);
  }

  private async triggerAutomatedResponse(threat: SecurityThreat): Promise<void> {
    const mitigationActions = [];

    switch (threat.threat_type) {
      case 'brute_force':
        mitigationActions.push({
          action: 'block_ip',
          target: threat.threat_indicators.ip_address,
          duration: '1h'
        });
        break;
      
      case 'sql_injection':
      case 'xss_attempt':
        mitigationActions.push({
          action: 'block_request',
          target: threat.threat_indicators.endpoint,
          duration: '24h'
        });
        break;
      
      case 'suspicious_file_access':
        mitigationActions.push({
          action: 'alert_admin',
          target: 'security_team',
          priority: 'high'
        });
        break;
    }

    // Update threat with mitigation actions
    await supabase
      .from('security_threats')
      .update({ mitigation_actions: mitigationActions })
      .eq('id', threat.id);

    // Create security incident if severity is high or critical
    if (['high', 'critical'].includes(threat.severity)) {
      await this.createSecurityIncident(threat);
    }
  }

  async createSecurityIncident(threat: SecurityThreat): Promise<SecurityIncident> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const incident = {
      org_id: profile.organization_id,
      incident_type: 'security_threat',
      severity: threat.severity,
      status: 'open',
      title: `${threat.threat_type.replace('_', ' ').toUpperCase()} Detected`,
      description: `Automated detection of ${threat.threat_type} threat`,
      affected_systems: threat.affected_resources,
      evidence_data: {
        threat_id: threat.id,
        indicators: threat.threat_indicators,
        detection_method: threat.detection_method
      },
      response_actions: [],
      escalation_level: threat.severity === 'critical' ? 3 : 1
    };

    const { data, error } = await supabase
      .from('security_incidents')
      .insert(incident)
      .select()
      .single();

    if (error) throw error;
    return this.transformSecurityIncident(data);
  }

  async getSecurityThreats(limit: number = 100): Promise<SecurityThreat[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('security_threats')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching security threats:', error);
      return [];
    }

    return data?.map(this.transformSecurityThreat) || [];
  }

  async getSecurityIncidents(limit: number = 100): Promise<SecurityIncident[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('security_incidents')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching security incidents:', error);
      return [];
    }

    return data?.map(this.transformSecurityIncident) || [];
  }

  async resolveIncident(incidentId: string, resolution: string): Promise<void> {
    await supabase
      .from('security_incidents')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', incidentId);
  }

  async escalateIncident(incidentId: string, reason: string): Promise<void> {
    const { data: incident } = await supabase
      .from('security_incidents')
      .select('escalation_level')
      .eq('id', incidentId)
      .single();

    if (incident) {
      const newLevel = Math.min(incident.escalation_level + 1, 5);
      await supabase
        .from('security_incidents')
        .update({
          escalation_level: newLevel,
          escalated_at: new Date().toISOString()
        })
        .eq('id', incidentId);
    }
  }

  async integrateSIEM(config: {
    integration_name: string;
    integration_type: string;
    endpoint_url: string;
    authentication_config?: any;
    event_filters?: any;
    is_active?: boolean;
  }): Promise<SIEMIntegration> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const integration = {
      ...config,
      org_id: profile.organization_id,
      created_by: profile.id,
      sync_status: 'pending'
    };

    const { data, error } = await supabase
      .from('siem_integrations')
      .insert(integration)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async syncWithSIEM(integrationId: string): Promise<void> {
    const { data: integration } = await supabase
      .from('siem_integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (!integration) return;

    try {
      // Simulate SIEM sync - in production this would integrate with actual SIEM systems
      const events = await this.fetchSIEMEvents(integration);
      await this.processSIEMEvents(events, integration.org_id);

      await supabase
        .from('siem_integrations')
        .update({
          last_sync_at: new Date().toISOString(),
          sync_status: 'success'
        })
        .eq('id', integrationId);
    } catch (error) {
      await supabase
        .from('siem_integrations')
        .update({
          sync_status: 'failed'
        })
        .eq('id', integrationId);
    }
  }

  private async fetchSIEMEvents(integration: SIEMIntegration): Promise<any[]> {
    // Simulate fetching events from SIEM
    return [];
  }

  private async processSIEMEvents(events: any[], orgId: string): Promise<void> {
    for (const event of events) {
      await this.detectThreats(event);
    }
  }
}

export const threatProtectionService = new ThreatProtectionService();
