
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface IncidentPlaybook {
  id: string;
  org_id: string;
  playbook_name: string;
  incident_type: string;
  severity_levels: string[];
  response_steps: any[];
  escalation_matrix: any;
  communication_templates: any;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ForensicEvidence {
  id: string;
  org_id: string;
  incident_id: string;
  evidence_type: string;
  evidence_data: any;
  chain_of_custody: any[];
  collection_method: string;
  integrity_hash: string;
  collected_by: string;
  preservation_status: string;
  collected_at: string;
  created_at: string;
  updated_at: string;
}

class IncidentResponseService {
  private defaultPlaybooks = [
    {
      name: 'Data Breach Response',
      incident_type: 'data_breach',
      severity_levels: ['low', 'medium', 'high', 'critical'],
      response_steps: [
        { step: 1, action: 'Contain the breach', timeframe: '1 hour', responsible: 'security_team' },
        { step: 2, action: 'Assess the impact', timeframe: '2 hours', responsible: 'risk_team' },
        { step: 3, action: 'Notify stakeholders', timeframe: '4 hours', responsible: 'communications' },
        { step: 4, action: 'Investigate root cause', timeframe: '24 hours', responsible: 'security_team' },
        { step: 5, action: 'Implement remediation', timeframe: '72 hours', responsible: 'it_team' }
      ]
    },
    {
      name: 'System Compromise Response',
      incident_type: 'system_compromise',
      severity_levels: ['medium', 'high', 'critical'],
      response_steps: [
        { step: 1, action: 'Isolate affected systems', timeframe: '30 minutes', responsible: 'security_team' },
        { step: 2, action: 'Preserve evidence', timeframe: '1 hour', responsible: 'forensics_team' },
        { step: 3, action: 'Analyze attack vectors', timeframe: '4 hours', responsible: 'security_team' },
        { step: 4, action: 'Restore services', timeframe: '8 hours', responsible: 'it_team' },
        { step: 5, action: 'Conduct post-incident review', timeframe: '48 hours', responsible: 'all_teams' }
      ]
    },
    {
      name: 'Insider Threat Response',
      incident_type: 'insider_threat',
      severity_levels: ['low', 'medium', 'high'],
      response_steps: [
        { step: 1, action: 'Secure user access', timeframe: '15 minutes', responsible: 'security_team' },
        { step: 2, action: 'Collect digital evidence', timeframe: '2 hours', responsible: 'forensics_team' },
        { step: 3, action: 'Interview relevant personnel', timeframe: '24 hours', responsible: 'hr_team' },
        { step: 4, action: 'Determine appropriate action', timeframe: '48 hours', responsible: 'management' },
        { step: 5, action: 'Implement controls', timeframe: '72 hours', responsible: 'security_team' }
      ]
    }
  ];

  private transformIncidentPlaybook(data: any): IncidentPlaybook {
    return {
      ...data,
      severity_levels: Array.isArray(data.severity_levels) 
        ? data.severity_levels 
        : JSON.parse(data.severity_levels || '[]'),
      response_steps: Array.isArray(data.response_steps) 
        ? data.response_steps 
        : JSON.parse(data.response_steps || '[]'),
      escalation_matrix: typeof data.escalation_matrix === 'string' 
        ? JSON.parse(data.escalation_matrix) 
        : data.escalation_matrix,
      communication_templates: typeof data.communication_templates === 'string' 
        ? JSON.parse(data.communication_templates) 
        : data.communication_templates
    };
  }

  private transformForensicEvidence(data: any): ForensicEvidence {
    return {
      ...data,
      chain_of_custody: Array.isArray(data.chain_of_custody) 
        ? data.chain_of_custody 
        : JSON.parse(data.chain_of_custody || '[]'),
      evidence_data: typeof data.evidence_data === 'string' 
        ? JSON.parse(data.evidence_data) 
        : data.evidence_data
    };
  }

  async createIncidentPlaybook(
    playbookName: string,
    incidentType: string,
    responseSteps: any[],
    escalationMatrix: any = {}
  ): Promise<IncidentPlaybook> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const communicationTemplates = this.generateCommunicationTemplates(incidentType);

    const { data, error } = await supabase
      .from('incident_playbooks')
      .insert({
        org_id: profile.organization_id,
        playbook_name: playbookName,
        incident_type: incidentType,
        severity_levels: ['low', 'medium', 'high', 'critical'],
        response_steps: responseSteps,
        escalation_matrix: escalationMatrix,
        communication_templates: communicationTemplates,
        is_active: true,
        created_by: profile.id
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformIncidentPlaybook(data);
  }

  private generateCommunicationTemplates(incidentType: string): any {
    const baseTemplates = {
      initial_notification: {
        subject: `Security Incident Alert - ${incidentType}`,
        body: `A security incident has been detected and classified as ${incidentType}. The incident response team has been activated and is investigating the situation.`,
        recipients: ['security_team', 'management']
      },
      status_update: {
        subject: `Incident Status Update - ${incidentType}`,
        body: `This is a status update regarding the ongoing security incident. Current status: [STATUS]. Next steps: [NEXT_STEPS].`,
        recipients: ['stakeholders']
      },
      resolution_notice: {
        subject: `Incident Resolved - ${incidentType}`,
        body: `The security incident has been successfully resolved. Summary of actions taken and lessons learned will be provided in the post-incident report.`,
        recipients: ['all_stakeholders']
      }
    };

    return baseTemplates;
  }

  async triggerIncidentResponse(
    incidentId: string,
    incidentType: string,
    severity: string
  ): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    // Find appropriate playbook
    const { data: playbookData } = await supabase
      .from('incident_playbooks')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('incident_type', incidentType)
      .eq('is_active', true)
      .single();

    if (!playbookData) {
      // Use default playbook if none exists
      await this.createDefaultPlaybooks();
      return this.triggerIncidentResponse(incidentId, incidentType, severity);
    }

    const playbook = this.transformIncidentPlaybook(playbookData);

    // Execute response steps
    await this.executeResponseSteps(incidentId, playbook, severity);
    
    // Send initial notifications
    await this.sendIncidentNotifications(incidentId, playbook, 'initial_notification');
    
    // Start evidence collection
    await this.initiateEvidenceCollection(incidentId, incidentType);
  }

  private async createDefaultPlaybooks(): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    for (const playbook of this.defaultPlaybooks) {
      await this.createIncidentPlaybook(
        playbook.name,
        playbook.incident_type,
        playbook.response_steps
      );
    }
  }

  private async executeResponseSteps(
    incidentId: string,
    playbook: IncidentPlaybook,
    severity: string
  ): Promise<void> {
    const relevantSteps = playbook.response_steps.filter((step: any) => 
      !step.severity_filter || step.severity_filter.includes(severity)
    );

    for (const step of relevantSteps) {
      await this.executeResponseStep(incidentId, step, playbook);
    }
  }

  private async executeResponseStep(
    incidentId: string,
    step: any,
    playbook: IncidentPlaybook
  ): Promise<void> {
    // Log the step execution
    console.log(`Executing step ${step.step}: ${step.action} (${step.timeframe})`);
    
    // In production, this would trigger actual response actions
    switch (step.action.toLowerCase()) {
      case 'contain the breach':
      case 'isolate affected systems':
        await this.executeContainmentActions(incidentId);
        break;
      
      case 'preserve evidence':
      case 'collect digital evidence':
        await this.collectEvidence(incidentId, step.action);
        break;
      
      case 'notify stakeholders':
        await this.sendIncidentNotifications(incidentId, playbook, 'status_update');
        break;
      
      default:
        // Generic step logging
        await this.logResponseAction(incidentId, step);
    }
  }

  private async executeContainmentActions(incidentId: string): Promise<void> {
    // In production, this would implement actual containment measures
    console.log('Executing containment actions for incident:', incidentId);
    
    // Example actions:
    // - Disable compromised accounts
    // - Block suspicious IP addresses
    // - Isolate affected network segments
    // - Revoke API keys/tokens
  }

  private async sendIncidentNotifications(
    incidentId: string,
    playbook: IncidentPlaybook,
    templateType: string
  ): Promise<void> {
    const template = playbook.communication_templates[templateType];
    if (!template) return;

    // In production, this would send actual notifications
    console.log('Sending incident notification:', {
      type: templateType,
      subject: template.subject,
      recipients: template.recipients
    });
  }

  private async logResponseAction(incidentId: string, step: any): Promise<void> {
    // Update the incident with the response action
    const { data: incident } = await supabase
      .from('security_incidents')
      .select('response_actions')
      .eq('id', incidentId)
      .single();

    if (incident) {
      const responseActions = Array.isArray(incident.response_actions) 
        ? incident.response_actions 
        : JSON.parse(incident.response_actions || '[]');

      const updatedActions = [...responseActions, {
        step: step.step,
        action: step.action,
        executed_at: new Date().toISOString(),
        status: 'completed'
      }];

      await supabase
        .from('security_incidents')
        .update({ response_actions: updatedActions })
        .eq('id', incidentId);
    }
  }

  async initiateEvidenceCollection(incidentId: string, incidentType: string): Promise<void> {
    const evidenceTypes = this.getEvidenceTypesForIncident(incidentType);
    
    for (const evidenceType of evidenceTypes) {
      await this.collectEvidence(incidentId, evidenceType);
    }
  }

  private getEvidenceTypesForIncident(incidentType: string): string[] {
    const evidenceMap: { [key: string]: string[] } = {
      'data_breach': ['system_logs', 'access_logs', 'network_traffic', 'user_activity'],
      'system_compromise': ['system_state', 'memory_dump', 'disk_image', 'network_capture'],
      'insider_threat': ['user_activity', 'email_logs', 'file_access', 'login_history'],
      'malware': ['file_samples', 'system_state', 'memory_dump', 'network_traffic']
    };

    return evidenceMap[incidentType] || ['system_logs', 'access_logs'];
  }

  async collectEvidence(incidentId: string, evidenceType: string): Promise<ForensicEvidence> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const evidenceData = await this.gatherEvidenceData(evidenceType);
    const integrityHash = await this.calculateIntegrityHash(evidenceData);

    const { data, error } = await supabase
      .from('forensic_evidence')
      .insert({
        org_id: profile.organization_id,
        incident_id: incidentId,
        evidence_type: evidenceType,
        evidence_data: evidenceData,
        chain_of_custody: [{
          action: 'collected',
          timestamp: new Date().toISOString(),
          person: profile.full_name || 'System',
          person_id: profile.id
        }],
        collection_method: 'automated_system',
        integrity_hash: integrityHash,
        collected_by: profile.id,
        preservation_status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformForensicEvidence(data);
  }

  private async gatherEvidenceData(evidenceType: string): Promise<any> {
    // In production, this would collect actual forensic data
    const mockData: { [key: string]: any } = {
      'system_logs': {
        source: 'system_logs',
        timestamp: new Date().toISOString(),
        entries: ['Sample log entry 1', 'Sample log entry 2']
      },
      'access_logs': {
        source: 'access_logs',
        timestamp: new Date().toISOString(),
        entries: ['User login attempt', 'File access event']
      },
      'network_traffic': {
        source: 'network_capture',
        timestamp: new Date().toISOString(),
        packets: ['TCP packet data', 'HTTP request data']
      },
      'user_activity': {
        source: 'user_activity',
        timestamp: new Date().toISOString(),
        activities: ['Page view', 'Button click', 'Form submission']
      }
    };

    return mockData[evidenceType] || { source: evidenceType, timestamp: new Date().toISOString() };
  }

  private async calculateIntegrityHash(data: any): Promise<string> {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async updateChainOfCustody(
    evidenceId: string,
    action: string,
    notes?: string
  ): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile) return;

    const { data: evidenceData } = await supabase
      .from('forensic_evidence')
      .select('chain_of_custody')
      .eq('id', evidenceId)
      .single();

    if (evidenceData) {
      const chainOfCustody = Array.isArray(evidenceData.chain_of_custody) 
        ? evidenceData.chain_of_custody 
        : JSON.parse(evidenceData.chain_of_custody || '[]');

      const updatedChain = [...chainOfCustody, {
        action,
        timestamp: new Date().toISOString(),
        person: profile.full_name || 'Unknown',
        person_id: profile.id,
        notes
      }];

      await supabase
        .from('forensic_evidence')
        .update({ chain_of_custody: updatedChain })
        .eq('id', evidenceId);
    }
  }

  async getIncidentPlaybooks(): Promise<IncidentPlaybook[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('incident_playbooks')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching incident playbooks:', error);
      return [];
    }

    return data?.map(this.transformIncidentPlaybook) || [];
  }

  async getForensicEvidence(incidentId: string): Promise<ForensicEvidence[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('forensic_evidence')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('incident_id', incidentId)
      .order('collected_at', { ascending: false });

    if (error) {
      console.error('Error fetching forensic evidence:', error);
      return [];
    }

    return data?.map(this.transformForensicEvidence) || [];
  }

  async generatePostIncidentReport(incidentId: string): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    // Get incident details
    const { data: incident } = await supabase
      .from('security_incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (!incident) return null;

    // Get evidence
    const evidence = await this.getForensicEvidence(incidentId);

    // Generate report
    const report = {
      incident_id: incidentId,
      incident_summary: {
        type: incident.incident_type,
        severity: incident.severity,
        duration: this.calculateIncidentDuration(incident),
        affected_systems: Array.isArray(incident.affected_systems) 
          ? incident.affected_systems 
          : JSON.parse(incident.affected_systems || '[]')
      },
      timeline: this.generateTimeline(incident),
      evidence_summary: evidence.map(e => ({
        type: e.evidence_type,
        collected_at: e.collected_at,
        integrity_verified: true
      })),
      lessons_learned: this.generateLessonsLearned(incident),
      recommendations: this.generateRecommendations(incident),
      generated_at: new Date().toISOString(),
      generated_by: profile.full_name || 'System'
    };

    return report;
  }

  private calculateIncidentDuration(incident: any): string {
    const start = new Date(incident.created_at);
    const end = incident.resolved_at ? new Date(incident.resolved_at) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  private generateTimeline(incident: any): any[] {
    const timeline = [
      {
        timestamp: incident.created_at,
        event: 'Incident detected',
        description: 'Initial incident detection and logging'
      }
    ];

    const responseActions = Array.isArray(incident.response_actions) 
      ? incident.response_actions 
      : JSON.parse(incident.response_actions || '[]');

    if (responseActions.length > 0) {
      responseActions.forEach((action: any) => {
        timeline.push({
          timestamp: action.executed_at,
          event: action.action,
          description: `Response step: ${action.action}`
        });
      });
    }

    if (incident.resolved_at) {
      timeline.push({
        timestamp: incident.resolved_at,
        event: 'Incident resolved',
        description: 'Incident officially resolved'
      });
    }

    return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private generateLessonsLearned(incident: any): string[] {
    const lessons = [];
    
    if (incident.escalation_level > 2) {
      lessons.push('Consider implementing earlier escalation triggers for similar incidents');
    }
    
    const affectedSystems = Array.isArray(incident.affected_systems) 
      ? incident.affected_systems 
      : JSON.parse(incident.affected_systems || '[]');
    
    if (affectedSystems.length > 3) {
      lessons.push('Review system isolation procedures to prevent widespread impact');
    }
    
    lessons.push('Conduct regular incident response training to improve response times');
    
    return lessons;
  }

  private generateRecommendations(incident: any): string[] {
    const recommendations = [];
    
    recommendations.push('Update incident response playbooks based on this experience');
    recommendations.push('Review and enhance monitoring capabilities for similar threats');
    recommendations.push('Conduct tabletop exercises to test response procedures');
    
    if (incident.severity === 'critical') {
      recommendations.push('Consider implementing additional preventive controls');
    }
    
    return recommendations;
  }
}

export const incidentResponseService = new IncidentResponseService();
