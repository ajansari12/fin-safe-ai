
import { supabase } from '@/integrations/supabase/client';

export interface RegulatoryIntelligence {
  id: string;
  org_id: string;
  regulation_name: string;
  jurisdiction: string;
  applicable_sectors: string[];
  regulation_type: 'mandatory' | 'recommended' | 'best_practice';
  effective_date?: string;
  last_updated: string;
  auto_identified: boolean;
  confidence_score: number;
  regulatory_body?: string;
  description?: string;
  key_requirements?: any[];
  monitoring_rules?: any[];
  is_active: boolean;
}

export interface ComplianceMonitoringRule {
  id: string;
  org_id: string;
  regulatory_intelligence_id?: string;
  rule_name: string;
  rule_type: 'automated' | 'manual' | 'hybrid';
  monitoring_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  rule_logic: Record<string, any>;
  validation_criteria: Record<string, any>;
  breach_thresholds?: Record<string, any>;
  notification_settings?: Record<string, any>;
  last_executed_at?: string;
  execution_status: 'pending' | 'running' | 'completed' | 'failed';
  is_active: boolean;
}

export interface ComplianceViolation {
  id: string;
  org_id: string;
  regulatory_intelligence_id?: string;
  monitoring_rule_id?: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  violation_description: string;
  detected_at: string;
  affected_systems?: any[];
  business_impact?: string;
  remediation_plan?: string;
  remediation_status: 'open' | 'in_progress' | 'resolved';
  remediation_deadline?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export class Phase6ComplianceMonitoringService {
  
  // Regulatory Intelligence Management
  async getRegulatoryIntelligence(orgId: string): Promise<RegulatoryIntelligence[]> {
    const { data, error } = await supabase
      .from('regulatory_intelligence')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createRegulatoryIntelligence(intelligence: Omit<RegulatoryIntelligence, 'id'>): Promise<RegulatoryIntelligence> {
    const { data, error } = await supabase
      .from('regulatory_intelligence')
      .insert([intelligence])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRegulatoryIntelligence(id: string, updates: Partial<RegulatoryIntelligence>): Promise<RegulatoryIntelligence> {
    const { data, error } = await supabase
      .from('regulatory_intelligence')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Compliance Monitoring Rules Management
  async getComplianceMonitoringRules(orgId: string): Promise<ComplianceMonitoringRule[]> {
    const { data, error } = await supabase
      .from('compliance_monitoring_rules')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createComplianceMonitoringRule(rule: Omit<ComplianceMonitoringRule, 'id'>): Promise<ComplianceMonitoringRule> {
    const { data, error } = await supabase
      .from('compliance_monitoring_rules')
      .insert([rule])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async executeMonitoringRule(ruleId: string): Promise<void> {
    const { error } = await supabase
      .from('compliance_monitoring_rules')
      .update({ 
        last_executed_at: new Date().toISOString(),
        execution_status: 'completed'
      })
      .eq('id', ruleId);

    if (error) throw error;
  }

  // Compliance Violations Management
  async getComplianceViolations(orgId: string): Promise<ComplianceViolation[]> {
    const { data, error } = await supabase
      .from('compliance_violations')
      .select('*')
      .eq('org_id', orgId)
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createComplianceViolation(violation: Omit<ComplianceViolation, 'id'>): Promise<ComplianceViolation> {
    const { data, error } = await supabase
      .from('compliance_violations')
      .insert([violation])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateViolationStatus(
    id: string, 
    status: 'open' | 'in_progress' | 'resolved',
    notes?: string
  ): Promise<ComplianceViolation> {
    const updates: any = { remediation_status: status };
    
    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }
    
    if (notes) {
      updates.resolution_notes = notes;
    }

    const { data, error } = await supabase
      .from('compliance_violations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Auto-identification of applicable regulations
  async identifyApplicableRegulations(orgProfile: any): Promise<RegulatoryIntelligence[]> {
    // Mock AI-powered regulation identification based on org profile
    const potentialRegulations: Partial<RegulatoryIntelligence>[] = [];

    // Banking regulations
    if (orgProfile.sector === 'banking') {
      potentialRegulations.push({
        regulation_name: 'OSFI E-21 Operational Resilience',
        jurisdiction: 'Canada',
        applicable_sectors: ['banking'],
        regulation_type: 'mandatory',
        auto_identified: true,
        confidence_score: 0.95,
        regulatory_body: 'OSFI',
        description: 'Operational resilience framework for federally regulated financial institutions'
      });
    }

    // Privacy regulations (applicable to most sectors)
    potentialRegulations.push({
      regulation_name: 'PIPEDA Privacy Requirements',
      jurisdiction: 'Canada',
      applicable_sectors: ['banking', 'fintech', 'insurance'],
      regulation_type: 'mandatory',
      auto_identified: true,
      confidence_score: 0.90,
      regulatory_body: 'Privacy Commissioner of Canada',
      description: 'Personal Information Protection and Electronic Documents Act compliance'
    });

    return potentialRegulations as RegulatoryIntelligence[];
  }

  // Generate compliance monitoring rules based on regulations
  async generateMonitoringRules(regulationId: string, orgId: string): Promise<ComplianceMonitoringRule[]> {
    const regulation = await supabase
      .from('regulatory_intelligence')
      .select('*')
      .eq('id', regulationId)
      .single();

    if (!regulation.data) return [];

    const generatedRules: Partial<ComplianceMonitoringRule>[] = [];

    // Generate rules based on regulation type and requirements
    if (regulation.data.regulation_name.includes('OSFI E-21')) {
      generatedRules.push({
        org_id: orgId,
        regulatory_intelligence_id: regulationId,
        rule_name: 'Incident Response Time Monitoring',
        rule_type: 'automated',
        monitoring_frequency: 'daily',
        rule_logic: {
          check_type: 'incident_response_time',
          threshold_hours: 4,
          severity_levels: ['critical', 'high']
        },
        validation_criteria: {
          max_response_time: 4,
          escalation_required: true
        },
        breach_thresholds: {
          warning: 3,
          critical: 4
        }
      });
    }

    return generatedRules as ComplianceMonitoringRule[];
  }
}

export const phase6ComplianceMonitoringService = new Phase6ComplianceMonitoringService();
