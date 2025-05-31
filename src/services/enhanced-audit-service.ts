
import { supabase } from "@/integrations/supabase/client";

export interface AuditSchedule {
  id: string;
  org_id: string;
  audit_name: string;
  audit_type: string;
  audit_scope?: string;
  scheduled_start_date: string;
  scheduled_end_date: string;
  assigned_auditor_id?: string;
  assigned_auditor_name?: string;
  status: string;
  priority: string;
  regulatory_framework?: string;
  audit_frequency?: string;
  next_audit_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  completion_percentage: number;
  notes?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface RegulatoryMapping {
  id: string;
  org_id: string;
  finding_id?: string;
  audit_upload_id?: string;
  regulatory_framework: string;
  requirement_section: string;
  requirement_title: string;
  requirement_description?: string;
  compliance_status: string;
  gap_severity: string;
  remediation_priority: string;
  target_completion_date?: string;
  responsible_party?: string;
  validation_evidence?: string;
  last_assessment_date?: string;
  next_review_date?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditGapLog {
  id: string;
  org_id: string;
  regulatory_mapping_id?: string;
  gap_type: string;
  gap_title: string;
  gap_description?: string;
  impact_assessment?: string;
  root_cause_analysis?: string;
  current_status: string;
  resolution_plan?: string;
  resolution_date?: string;
  business_impact_score?: number;
  regulatory_risk_score?: number;
  estimated_effort_hours?: number;
  actual_effort_hours?: number;
  cost_to_remediate?: number;
  identified_date: string;
  target_closure_date?: string;
  actual_closure_date?: string;
  identified_by?: string;
  identified_by_name?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  verified_by?: string;
  verified_by_name?: string;
  verification_date?: string;
  created_at: string;
  updated_at: string;
}

export const enhancedAuditService = {
  // Audit Scheduling
  async getAuditSchedules(orgId: string): Promise<AuditSchedule[]> {
    const { data, error } = await supabase
      .from('audit_schedules')
      .select('*')
      .eq('org_id', orgId)
      .order('scheduled_start_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createAuditSchedule(schedule: Omit<AuditSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<AuditSchedule> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    const { data, error } = await supabase
      .from('audit_schedules')
      .insert({
        ...schedule,
        created_by: user?.id,
        created_by_name: profile?.full_name || 'Unknown User'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAuditSchedule(id: string, updates: Partial<AuditSchedule>): Promise<AuditSchedule> {
    const { data, error } = await supabase
      .from('audit_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Regulatory Mapping
  async getRegulatoryMappings(orgId: string, framework?: string): Promise<RegulatoryMapping[]> {
    let query = supabase
      .from('regulatory_mapping')
      .select('*')
      .eq('org_id', orgId);

    if (framework) {
      query = query.eq('regulatory_framework', framework);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createRegulatoryMapping(mapping: Omit<RegulatoryMapping, 'id' | 'created_at' | 'updated_at'>): Promise<RegulatoryMapping> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    const { data, error } = await supabase
      .from('regulatory_mapping')
      .insert({
        ...mapping,
        created_by: user?.id,
        created_by_name: profile?.full_name || 'Unknown User'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateRegulatoryMapping(id: string, updates: Partial<RegulatoryMapping>): Promise<RegulatoryMapping> {
    const { data, error } = await supabase
      .from('regulatory_mapping')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Gap Logs
  async getAuditGapLogs(orgId: string, status?: string): Promise<AuditGapLog[]> {
    let query = supabase
      .from('audit_gap_logs')
      .select('*')
      .eq('org_id', orgId);

    if (status) {
      query = query.eq('current_status', status);
    }

    const { data, error } = await query.order('identified_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createAuditGapLog(gap: Omit<AuditGapLog, 'id' | 'created_at' | 'updated_at'>): Promise<AuditGapLog> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    const { data, error } = await supabase
      .from('audit_gap_logs')
      .insert({
        ...gap,
        identified_by: user?.id,
        identified_by_name: profile?.full_name || 'Unknown User'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAuditGapLog(id: string, updates: Partial<AuditGapLog>): Promise<AuditGapLog> {
    const { data, error } = await supabase
      .from('audit_gap_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Analytics
  async getComplianceGapReport(orgId: string) {
    const [openGaps, closedGaps, mappings] = await Promise.all([
      this.getAuditGapLogs(orgId, 'open'),
      this.getAuditGapLogs(orgId, 'closed'),
      this.getRegulatoryMappings(orgId)
    ]);

    const frameworkBreakdown = mappings.reduce((acc, mapping) => {
      const framework = mapping.regulatory_framework;
      if (!acc[framework]) {
        acc[framework] = {
          total: 0,
          compliant: 0,
          non_compliant: 0,
          partial: 0
        };
      }
      acc[framework].total++;
      acc[framework][mapping.compliance_status as keyof typeof acc[typeof framework]]++;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalGaps: openGaps.length + closedGaps.length,
      openGaps: openGaps.length,
      closedGaps: closedGaps.length,
      gapsByFramework: frameworkBreakdown,
      gapsBySeverity: openGaps.reduce((acc, gap) => {
        const severity = gap.gap_type || 'unknown';
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageResolutionTime: this.calculateAverageResolutionTime(closedGaps)
    };
  },

  calculateAverageResolutionTime(closedGaps: AuditGapLog[]): number {
    if (closedGaps.length === 0) return 0;
    
    const totalDays = closedGaps.reduce((acc, gap) => {
      if (gap.identified_date && gap.actual_closure_date) {
        const start = new Date(gap.identified_date);
        const end = new Date(gap.actual_closure_date);
        return acc + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }
      return acc;
    }, 0);

    return Math.round(totalDays / closedGaps.length);
  }
};
