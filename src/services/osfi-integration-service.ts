import { supabase } from "@/integrations/supabase/client";

export interface OSFIIntegrationData {
  riskAppetiteAlignment: {
    principleMapping: string;
    appetiteStatements: any[];
    breachLogs: any[];
    boardReporting: boolean;
  };
  incidentOperationalRisk: {
    riskTaxonomyMapping: string;
    operationalRiskMetrics: any[];
    slaBreachEscalation: boolean;
    realTimeMonitoring: boolean;
  };
  controlsOSFIMapping: {
    operationalRiskCategories: string[];
    effectivenessReporting: boolean;
    kriOSFIIntegration: boolean;
    complianceReporting: boolean;
  };
}

export interface RiskAppetiteOSFIMapping {
  id: string;
  statement_id: string;
  osfi_principle: number;
  business_strategy_alignment: boolean;
  forward_looking_assessment: boolean;
  board_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncidentOSFIMapping {
  id: string;
  incident_id: string;
  operational_risk_category: string;
  osfi_principle_breach: number[];
  resilience_impact: 'low' | 'medium' | 'high' | 'critical';
  disruption_tolerance_exceeded: boolean;
  created_at: string;
}

export interface ControlOSFIMapping {
  id: string;
  control_id: string;
  operational_risk_categories: string[];
  osfi_principle_coverage: number[];
  effectiveness_osfi_compliant: boolean;
  last_osfi_assessment: string;
  created_at: string;
  updated_at: string;
}

class OSFIIntegrationService {
  // Risk Appetite Integration (Principle 3)
  async integrateRiskAppetiteWithOSFI(orgId: string) {
    try {
      // Get existing risk appetite data
      const { data: appetiteData, error: appetiteError } = await supabase
        .from('risk_appetite_statements')
        .select('*')
        .eq('org_id', orgId);

      if (appetiteError) throw appetiteError;

      // Get breach logs
      const { data: breachData, error: breachError } = await supabase
        .from('appetite_breach_logs')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (breachError) throw breachError;

      // Map to OSFI Principle 3 requirements
      const osfiMapping = {
        principleMapping: 'OSFI E-21 Principle 3: Risk Appetite',
        appetiteStatements: appetiteData || [],
        breachLogs: breachData || [],
        boardReporting: true,
        forwardLookingAssessment: true,
        businessStrategyIntegration: true
      };

      return osfiMapping;
    } catch (error) {
      console.error('Error integrating risk appetite with OSFI:', error);
      throw error;
    }
  }

  async createRiskAppetiteOSFIMapping(data: Omit<RiskAppetiteOSFIMapping, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: mapping, error } = await supabase
        .from('risk_appetite_osfi_mapping')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return mapping;
    } catch (error) {
      console.error('Error creating risk appetite OSFI mapping:', error);
      throw error;
    }
  }

  // Incident Integration (Principle 5 - Monitoring & Reporting)
  async integrateIncidentsWithOSFI(orgId: string) {
    try {
      // Get incident data with operational risk categorization
      const { data: incidents, error: incidentError } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (incidentError) throw incidentError;

      // Map incidents to operational risk taxonomy
      const operationalRiskMapping = incidents?.map(incident => ({
        incident_id: incident.id,
        operational_risk_category: this.mapIncidentToOperationalRisk(incident.category, incident.severity),
        osfi_principle_breach: this.getOSFIPrincipleBreaches(incident),
        resilience_impact: this.assessResilienceImpact(incident.severity, incident.business_function_id),
        disruption_tolerance_exceeded: incident.severity === 'critical'
      })) || [];

      return {
        riskTaxonomyMapping: 'OSFI E-21 Operational Risk Categories',
        operationalRiskMetrics: operationalRiskMapping,
        slaBreachEscalation: true,
        realTimeMonitoring: true,
        totalIncidents: incidents?.length || 0,
        criticalIncidents: incidents?.filter(i => i.severity === 'critical').length || 0
      };
    } catch (error) {
      console.error('Error integrating incidents with OSFI:', error);
      throw error;
    }
  }

  async createIncidentOSFIMapping(data: Omit<IncidentOSFIMapping, 'id' | 'created_at'>) {
    try {
      const { data: mapping, error } = await supabase
        .from('incident_osfi_mapping')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return mapping;
    } catch (error) {
      console.error('Error creating incident OSFI mapping:', error);
      throw error;
    }
  }

  // Controls Integration (Principle 4 - Identification & Assessment)
  async integrateControlsWithOSFI(orgId: string) {
    try {
      // Get controls data
      const { data: controls, error: controlsError } = await supabase
        .from('controls')
        .select('*')
        .eq('org_id', orgId);

      if (controlsError) throw controlsError;

      // Get KRI data for OSFI integration
      const { data: kris, error: kriError } = await supabase
        .from('kri_definitions')
        .select('*')
        .eq('org_id', orgId);

      if (kriError) throw kriError;

      // Map controls to OSFI operational risk categories
      const controlsOSFIMapping = controls?.map(control => ({
        control_id: control.id,
        operational_risk_categories: this.mapControlToOperationalRisk(control.control_type, control.risk_category),
        osfi_principle_coverage: this.getOSFIPrincipleCoverage(control),
        effectiveness_osfi_compliant: control.effectiveness_score >= 75,
        last_osfi_assessment: control.last_test_date || new Date().toISOString()
      })) || [];

      return {
        operationalRiskCategories: [
          'Technology Risk',
          'Cyber Security Risk',
          'Third-Party Risk',
          'Business Continuity Risk',
          'Operational Process Risk',
          'People Risk',
          'Model Risk',
          'Legal & Compliance Risk'
        ],
        effectivenessReporting: true,
        kriOSFIIntegration: true,
        complianceReporting: true,
        controlsMapping: controlsOSFIMapping,
        kriMapping: kris || []
      };
    } catch (error) {
      console.error('Error integrating controls with OSFI:', error);
      throw error;
    }
  }

  async createControlOSFIMapping(data: Omit<ControlOSFIMapping, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: mapping, error } = await supabase
        .from('control_osfi_mapping')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return mapping;
    } catch (error) {
      console.error('Error creating control OSFI mapping:', error);
      throw error;
    }
  }

  // Comprehensive OSFI Integration Data
  async getOSFIIntegrationData(orgId: string): Promise<OSFIIntegrationData> {
    try {
      const [riskAppetiteData, incidentData, controlsData] = await Promise.all([
        this.integrateRiskAppetiteWithOSFI(orgId),
        this.integrateIncidentsWithOSFI(orgId),
        this.integrateControlsWithOSFI(orgId)
      ]);

      return {
        riskAppetiteAlignment: riskAppetiteData,
        incidentOperationalRisk: incidentData,
        controlsOSFIMapping: controlsData
      };
    } catch (error) {
      console.error('Error getting OSFI integration data:', error);
      throw error;
    }
  }

  // Helper methods for mapping
  private mapIncidentToOperationalRisk(category?: string, severity?: string): string {
    const categoryMap: Record<string, string> = {
      'system_outage': 'Technology Risk',
      'data_breach': 'Cyber Security Risk',
      'vendor_failure': 'Third-Party Risk',
      'process_failure': 'Operational Process Risk',
      'compliance_violation': 'Legal & Compliance Risk',
      'security_incident': 'Cyber Security Risk'
    };

    return categoryMap[category || ''] || 'Operational Process Risk';
  }

  private getOSFIPrincipleBreaches(incident: any): number[] {
    const breaches: number[] = [];
    
    if (incident.severity === 'critical') {
      breaches.push(5); // Monitoring & Reporting
      breaches.push(6); // Critical Operations
    }
    
    if (incident.category === 'vendor_failure') {
      breaches.push(4); // Identification & Assessment (Third-party risk)
    }
    
    if (incident.category === 'system_outage') {
      breaches.push(7); // Tolerances for Disruption
    }

    return breaches;
  }

  private assessResilienceImpact(severity?: string, businessFunctionId?: string): 'low' | 'medium' | 'high' | 'critical' {
    if (severity === 'critical') return 'critical';
    if (severity === 'high') return 'high';
    if (severity === 'medium') return 'medium';
    return 'low';
  }

  private mapControlToOperationalRisk(controlType?: string, riskCategory?: string): string[] {
    const categories: string[] = [];
    
    if (controlType?.includes('technology') || controlType?.includes('IT')) {
      categories.push('Technology Risk');
    }
    
    if (controlType?.includes('security') || controlType?.includes('cyber')) {
      categories.push('Cyber Security Risk');
    }
    
    if (controlType?.includes('vendor') || controlType?.includes('third-party')) {
      categories.push('Third-Party Risk');
    }
    
    if (controlType?.includes('process') || controlType?.includes('operational')) {
      categories.push('Operational Process Risk');
    }

    return categories.length > 0 ? categories : ['Operational Process Risk'];
  }

  private getOSFIPrincipleCoverage(control: any): number[] {
    const principles: number[] = [4]; // All controls support Principle 4 (Identification & Assessment)
    
    if (control.control_type?.includes('monitoring')) {
      principles.push(5); // Monitoring & Reporting
    }
    
    if (control.control_type?.includes('governance')) {
      principles.push(1); // Governance
    }
    
    if (control.control_type?.includes('continuity')) {
      principles.push(6, 7); // Critical Operations, Tolerances
    }

    return principles;
  }
}

export const osfiIntegrationService = new OSFIIntegrationService();