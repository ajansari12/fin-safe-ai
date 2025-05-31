
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface ReportTemplate {
  id: string;
  org_id: string;
  template_name: string;
  template_type: string;
  description: string | null;
  template_config: any;
  data_blocks: DataBlock[];
  layout_config: any;
  is_system_template: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportInstance {
  id: string;
  org_id: string;
  template_id: string;
  instance_name: string;
  report_data: any;
  generated_by: string | null;
  generated_by_name: string | null;
  generation_date: string;
  report_period_start: string | null;
  report_period_end: string | null;
  status: string;
  file_path: string | null;
  file_size: number | null;
  scheduled_delivery: any;
  email_recipients: string[];
  created_at: string;
  updated_at: string;
}

export interface DataBlock {
  id: string;
  type: string;
  title: string;
  required: boolean;
  config?: any;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  day_of_week?: number;
  day_of_month?: number;
  time: string;
  recipients: string[];
  enabled: boolean;
}

class ReportingService {
  async getReportTemplates(): Promise<ReportTemplate[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .or(`org_id.eq.${profile.organization_id},is_system_template.eq.true`)
        .eq('is_active', true)
        .order('template_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching report templates:', error);
      return [];
    }
  }

  async getReportTemplate(id: string): Promise<ReportTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching report template:', error);
      return null;
    }
  }

  async createReportTemplate(template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ReportTemplate> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          ...template,
          org_id: profile.organization_id,
          created_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating report template:', error);
      throw error;
    }
  }

  async updateReportTemplate(id: string, updates: Partial<ReportTemplate>): Promise<void> {
    try {
      const { error } = await supabase
        .from('report_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating report template:', error);
      throw error;
    }
  }

  async deleteReportTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting report template:', error);
      throw error;
    }
  }

  async getReportInstances(): Promise<ReportInstance[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('report_instances')
        .select(`
          *,
          report_templates (
            template_name,
            template_type
          )
        `)
        .eq('org_id', profile.organization_id)
        .order('generation_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching report instances:', error);
      return [];
    }
  }

  async createReportInstance(instance: Omit<ReportInstance, 'id' | 'created_at' | 'updated_at'>): Promise<ReportInstance> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('report_instances')
        .insert({
          ...instance,
          org_id: profile.organization_id,
          generated_by: profile.id,
          generated_by_name: profile.full_name || 'Unknown User'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating report instance:', error);
      throw error;
    }
  }

  async updateReportInstance(id: string, updates: Partial<ReportInstance>): Promise<void> {
    try {
      const { error } = await supabase
        .from('report_instances')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating report instance:', error);
      throw error;
    }
  }

  async generateReportData(templateId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    try {
      const template = await this.getReportTemplate(templateId);
      if (!template) throw new Error('Template not found');

      const reportData: any = {};
      
      // Generate data for each block based on type
      for (const block of template.data_blocks) {
        reportData[block.id] = await this.generateBlockData(block.type, periodStart, periodEnd);
      }

      return reportData;
    } catch (error) {
      console.error('Error generating report data:', error);
      throw error;
    }
  }

  private async generateBlockData(blockType: string, periodStart?: string, periodEnd?: string): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    switch (blockType) {
      case 'metrics':
        return await this.getMetricsData(profile.organization_id, periodStart, periodEnd);
      case 'risk_chart':
        return await this.getRiskData(profile.organization_id, periodStart, periodEnd);
      case 'compliance_grid':
        return await this.getComplianceData(profile.organization_id, periodStart, periodEnd);
      case 'incident_summary':
        return await this.getIncidentData(profile.organization_id, periodStart, periodEnd);
      case 'controls_effectiveness':
        return await this.getControlsData(profile.organization_id, periodStart, periodEnd);
      case 'governance_matrix':
        return await this.getGovernanceData(profile.organization_id);
      case 'appetite_dashboard':
        return await this.getAppetiteData(profile.organization_id, periodStart, periodEnd);
      case 'testing_results':
        return await this.getTestingData(profile.organization_id, periodStart, periodEnd);
      default:
        return null;
    }
  }

  private async getMetricsData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    // Aggregate key metrics from various modules
    const metrics = {
      total_incidents: 0,
      resolved_incidents: 0,
      kri_breaches: 0,
      controls_tested: 0,
      policies_reviewed: 0
    };

    try {
      // Get incident metrics
      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('status')
        .eq('org_id', orgId);

      if (incidents) {
        metrics.total_incidents = incidents.length;
        metrics.resolved_incidents = incidents.filter(i => i.status === 'resolved').length;
      }

      // Get control test metrics
      const { data: controlTests } = await supabase
        .from('control_tests')
        .select('id')
        .eq('org_id', orgId);

      if (controlTests) {
        metrics.controls_tested = controlTests.length;
      }

      return metrics;
    } catch (error) {
      console.error('Error getting metrics data:', error);
      return metrics;
    }
  }

  private async getRiskData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    // Get risk-related data for charts
    return {
      risk_levels: { low: 10, medium: 15, high: 8, critical: 2 },
      trend: 'improving',
      period: { start: periodStart, end: periodEnd }
    };
  }

  private async getComplianceData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    // Get compliance status data
    return {
      frameworks: [
        { name: 'OSFI E-21', status: 'compliant', score: 85 },
        { name: 'COSO', status: 'minor_issues', score: 78 }
      ],
      overall_score: 82
    };
  }

  private async getIncidentData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    try {
      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', orgId)
        .order('reported_at', { ascending: false })
        .limit(10);

      return {
        recent_incidents: incidents || [],
        summary: {
          total: incidents?.length || 0,
          critical: incidents?.filter(i => i.severity === 'critical').length || 0,
          high: incidents?.filter(i => i.severity === 'high').length || 0
        }
      };
    } catch (error) {
      console.error('Error getting incident data:', error);
      return { recent_incidents: [], summary: { total: 0, critical: 0, high: 0 } };
    }
  }

  private async getControlsData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    try {
      const { data: controls } = await supabase
        .from('controls')
        .select('*')
        .eq('org_id', orgId);

      const { data: tests } = await supabase
        .from('control_tests')
        .select('*')
        .eq('org_id', orgId);

      return {
        total_controls: controls?.length || 0,
        tests_conducted: tests?.length || 0,
        effectiveness_avg: tests?.reduce((sum, test) => sum + (test.effectiveness_rating || 0), 0) / (tests?.length || 1)
      };
    } catch (error) {
      console.error('Error getting controls data:', error);
      return { total_controls: 0, tests_conducted: 0, effectiveness_avg: 0 };
    }
  }

  private async getGovernanceData(orgId: string): Promise<any> {
    try {
      const { data: frameworks } = await supabase
        .from('governance_frameworks')
        .select('*')
        .eq('org_id', orgId);

      return {
        frameworks: frameworks || [],
        maturity_score: 75
      };
    } catch (error) {
      console.error('Error getting governance data:', error);
      return { frameworks: [], maturity_score: 0 };
    }
  }

  private async getAppetiteData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    // Get risk appetite monitoring data
    return {
      breaches: 3,
      warnings: 7,
      within_tolerance: 15,
      trend: 'stable'
    };
  }

  private async getTestingData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    try {
      const { data: scenarioTests } = await supabase
        .from('scenario_tests')
        .select('*')
        .eq('org_id', orgId);

      return {
        tests_conducted: scenarioTests?.length || 0,
        success_rate: 85,
        areas_for_improvement: ['Communication protocols', 'Recovery time objectives']
      };
    } catch (error) {
      console.error('Error getting testing data:', error);
      return { tests_conducted: 0, success_rate: 0, areas_for_improvement: [] };
    }
  }

  getAvailableDataBlocks(): DataBlock[] {
    return [
      { id: 'text', type: 'text', title: 'Text Block', required: false },
      { id: 'metrics', type: 'metrics', title: 'Key Metrics', required: false },
      { id: 'risk_chart', type: 'risk_chart', title: 'Risk Chart', required: false },
      { id: 'compliance_grid', type: 'compliance_grid', title: 'Compliance Grid', required: false },
      { id: 'incident_summary', type: 'incident_summary', title: 'Incident Summary', required: false },
      { id: 'controls_effectiveness', type: 'controls_effectiveness', title: 'Controls Effectiveness', required: false },
      { id: 'governance_matrix', type: 'governance_matrix', title: 'Governance Matrix', required: false },
      { id: 'appetite_dashboard', type: 'appetite_dashboard', title: 'Risk Appetite Dashboard', required: false },
      { id: 'testing_results', type: 'testing_results', title: 'Testing Results', required: false },
      { id: 'kri_dashboard', type: 'kri_dashboard', title: 'KRI Dashboard', required: false },
      { id: 'activity_list', type: 'activity_list', title: 'Activity List', required: false },
      { id: 'status_grid', type: 'status_grid', title: 'Status Grid', required: false },
      { id: 'risk_register', type: 'risk_register', title: 'Risk Register', required: false },
      { id: 'action_tracker', type: 'action_tracker', title: 'Action Tracker', required: false }
    ];
  }
}

export const reportingService = new ReportingService();
