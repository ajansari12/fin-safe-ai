import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface RegulatoryReportTemplate {
  id: string;
  org_id: string;
  template_name: string;
  template_type: 'osfi_e21' | 'operational_risk' | 'compliance_summary' | 'custom';
  description: string | null;
  template_config: any;
  data_blocks: any[];
  layout_config: any;
  is_system_template: boolean;
  is_active: boolean;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegulatoryReportInstance {
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
  status: 'draft' | 'generated' | 'approved' | 'submitted' | 'archived';
  file_path: string | null;
  file_size: number | null;
  scheduled_delivery: any;
  email_recipients: string[];
  digital_signature: string | null;
  compliance_flags: any[];
  created_at: string;
  updated_at: string;
}

export interface ReportSchedule {
  id: string;
  org_id: string;
  template_id: string;
  schedule_name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  recipients: string[];
  is_active: boolean;
  last_run_date: string | null;
  next_run_date: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegulatoryCalendarEntry {
  id: string;
  org_id: string;
  regulation_name: string;
  report_type: string;
  due_date: string;
  filing_frequency: 'monthly' | 'quarterly' | 'annually' | 'ad_hoc';
  regulatory_body: string;
  description: string | null;
  reminder_days_before: number;
  status: 'upcoming' | 'in_progress' | 'submitted' | 'overdue';
  submitted_date: string | null;
  submitted_by: string | null;
  submitted_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataQualityCheck {
  id: string;
  org_id: string;
  report_instance_id: string;
  check_name: string;
  check_type: 'completeness' | 'accuracy' | 'consistency' | 'validity';
  data_source: string;
  check_status: 'pending' | 'passed' | 'failed' | 'warning';
  check_result: any;
  error_details: string | null;
  checked_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

class RegulatoryReportingService {
  // Report Template Management
  async getReportTemplates(): Promise<RegulatoryReportTemplate[]> {
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
      
      // Transform data to match our interface, providing defaults for missing fields
      return (data || []).map(template => ({
        ...template,
        version: (template as any).version || 1,
        data_blocks: Array.isArray(template.data_blocks) ? template.data_blocks : [],
        template_config: template.template_config || {},
        layout_config: template.layout_config || {}
      })) as RegulatoryReportTemplate[];
    } catch (error) {
      console.error('Error fetching report templates:', error);
      return [];
    }
  }

  async createReportTemplate(template: Omit<RegulatoryReportTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<RegulatoryReportTemplate> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        version: (data as any).version || 1,
        data_blocks: Array.isArray(data.data_blocks) ? data.data_blocks : [],
        template_config: data.template_config || {},
        layout_config: data.layout_config || {}
      } as RegulatoryReportTemplate;
    } catch (error) {
      console.error('Error creating report template:', error);
      throw error;
    }
  }

  async updateReportTemplate(id: string, updates: Partial<RegulatoryReportTemplate>): Promise<void> {
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

  // Report Generation and Management
  async generateReport(templateId: string, periodStart?: string, periodEnd?: string): Promise<RegulatoryReportInstance> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      // Get template
      const template = await this.getReportTemplate(templateId);
      if (!template) throw new Error('Template not found');

      // Generate report data
      const reportData = await this.aggregateReportData(template, periodStart, periodEnd);

      // Run data quality checks
      const qualityChecks = await this.runDataQualityChecks(reportData, template);

      // Create report instance
      const reportInstance: Omit<RegulatoryReportInstance, 'id' | 'created_at' | 'updated_at'> = {
        org_id: profile.organization_id,
        template_id: templateId,
        instance_name: `${template.template_name} - ${new Date().toLocaleDateString()}`,
        report_data: reportData,
        generated_by: profile.id,
        generated_by_name: profile.full_name,
        generation_date: new Date().toISOString(),
        report_period_start: periodStart || null,
        report_period_end: periodEnd || null,
        status: qualityChecks.every(c => c.check_status === 'passed') ? 'generated' : 'draft',
        file_path: null,
        file_size: null,
        scheduled_delivery: null,
        email_recipients: [],
        digital_signature: null,
        compliance_flags: qualityChecks.filter(c => c.check_status !== 'passed')
      };

      const { data, error } = await supabase
        .from('report_instances')
        .insert(reportInstance)
        .select()
        .single();

      if (error) throw error;

      // Transform and return the created instance
      return {
        ...data,
        email_recipients: Array.isArray((data as any).email_recipients) ? (data as any).email_recipients : [],
        digital_signature: (data as any).digital_signature || null,
        compliance_flags: Array.isArray((data as any).compliance_flags) ? (data as any).compliance_flags : []
      } as RegulatoryReportInstance;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async getReportInstances(): Promise<RegulatoryReportInstance[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('report_instances')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('generation_date', { ascending: false });

      if (error) throw error;
      
      // Transform data to match our interface
      return (data || []).map(instance => ({
        ...instance,
        email_recipients: Array.isArray((instance as any).email_recipients) ? (instance as any).email_recipients : [],
        digital_signature: (instance as any).digital_signature || null,
        compliance_flags: Array.isArray((instance as any).compliance_flags) ? (instance as any).compliance_flags : []
      })) as RegulatoryReportInstance[];
    } catch (error) {
      console.error('Error fetching report instances:', error);
      return [];
    }
  }

  // Data Aggregation Engine
  private async aggregateReportData(template: RegulatoryReportTemplate, periodStart?: string, periodEnd?: string): Promise<any> {
    const reportData: any = {};
    const profile = await getCurrentUserProfile();
    
    if (!profile?.organization_id) return reportData;

    // Process each data block in the template
    for (const block of template.data_blocks) {
      switch (block.type) {
        case 'governance_matrix':
          reportData[block.id] = await this.getGovernanceData(profile.organization_id);
          break;
        case 'metrics':
          reportData[block.id] = await this.getMetricsData(profile.organization_id, periodStart, periodEnd);
          break;
        case 'incident_summary':
          reportData[block.id] = await this.getIncidentData(profile.organization_id, periodStart, periodEnd);
          break;
        case 'controls_effectiveness':
          reportData[block.id] = await this.getControlsData(profile.organization_id, periodStart, periodEnd);
          break;
        case 'testing_results':
          reportData[block.id] = await this.getTestingData(profile.organization_id, periodStart, periodEnd);
          break;
        case 'appetite_dashboard':
          reportData[block.id] = await this.getAppetiteData(profile.organization_id, periodStart, periodEnd);
          break;
        case 'risk_register':
          reportData[block.id] = await this.getRiskRegisterData(profile.organization_id);
          break;
        case 'kri_dashboard':
          reportData[block.id] = await this.getKRIData(profile.organization_id, periodStart, periodEnd);
          break;
      }
    }

    return reportData;
  }

  // Data Quality Checks
  private async runDataQualityChecks(reportData: any, template: RegulatoryReportTemplate): Promise<DataQualityCheck[]> {
    const checks: any[] = [];
    const profile = await getCurrentUserProfile();
    
    if (!profile?.organization_id) return [];

    // Completeness checks
    for (const block of template.data_blocks) {
      if (block.required && (!reportData[block.id] || Object.keys(reportData[block.id]).length === 0)) {
        checks.push({
          org_id: profile.organization_id,
          report_instance_id: '', // Will be filled after report creation
          check_name: `${block.title} Completeness Check`,
          check_type: 'completeness',
          data_source: block.id,
          check_status: 'failed',
          check_result: { missing_data: true },
          error_details: `Required data block ${block.title} is missing or empty`,
          checked_at: new Date().toISOString(),
          resolved_at: null,
          resolved_by: null
        });
      }
    }

    return checks as DataQualityCheck[];
  }

  // Regulatory Calendar Management - Using mock data for now since tables may not be available
  async getRegulatoryCalendar(): Promise<RegulatoryCalendarEntry[]> {
    try {
      // Return mock data for now to prevent type errors
      return [
        {
          id: '1',
          org_id: 'mock',
          regulation_name: 'OSFI E-21 Quarterly Report',
          report_type: 'osfi_e21',
          due_date: '2024-03-31',
          filing_frequency: 'quarterly',
          regulatory_body: 'OSFI',
          description: 'Quarterly operational risk and resilience report',
          reminder_days_before: 14,
          status: 'upcoming',
          submitted_date: null,
          submitted_by: null,
          submitted_by_name: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching regulatory calendar:', error);
      return [];
    }
  }

  async createRegulatoryEntry(entry: Omit<RegulatoryCalendarEntry, 'id' | 'created_at' | 'updated_at'>): Promise<RegulatoryCalendarEntry> {
    try {
      // Mock implementation for now
      return {
        ...entry,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating regulatory entry:', error);
      throw error;
    }
  }

  // Report Scheduling - Using mock data for now
  async createReportSchedule(schedule: Omit<ReportSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<ReportSchedule> {
    try {
      // Mock implementation for now
      return {
        ...schedule,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating report schedule:', error);
      throw error;
    }
  }

  async getReportSchedules(): Promise<ReportSchedule[]> {
    try {
      // Return mock data for now
      return [];
    } catch (error) {
      console.error('Error fetching report schedules:', error);
      return [];
    }
  }

  // Private helper methods for data aggregation
  private async getReportTemplate(id: string): Promise<RegulatoryReportTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        version: (data as any).version || 1,
        data_blocks: Array.isArray(data.data_blocks) ? data.data_blocks : [],
        template_config: data.template_config || {},
        layout_config: data.layout_config || {}
      } as RegulatoryReportTemplate;
    } catch (error) {
      console.error('Error fetching report template:', error);
      return null;
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
        total_frameworks: frameworks?.length || 0,
        active_frameworks: frameworks?.filter(f => f.status === 'active').length || 0
      };
    } catch (error) {
      console.error('Error getting governance data:', error);
      return {};
    }
  }

  private async getMetricsData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    try {
      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', orgId);

      const { data: controls } = await supabase
        .from('control_tests')
        .select('*')
        .eq('org_id', orgId);

      const controlsLength = controls?.length || 0;
      const averageEffectiveness = controlsLength > 0 
        ? controls.reduce((sum, c) => sum + (c.effectiveness_rating || 0), 0) / controlsLength
        : 0;

      return {
        total_incidents: incidents?.length || 0,
        resolved_incidents: incidents?.filter(i => i.status === 'resolved').length || 0,
        controls_tested: controlsLength,
        average_effectiveness: averageEffectiveness
      };
    } catch (error) {
      console.error('Error getting metrics data:', error);
      return {};
    }
  }

  private async getIncidentData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    try {
      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', orgId)
        .order('reported_at', { ascending: false });

      return {
        recent_incidents: incidents?.slice(0, 10) || [],
        total_incidents: incidents?.length || 0,
        by_severity: {
          critical: incidents?.filter(i => i.severity === 'critical').length || 0,
          high: incidents?.filter(i => i.severity === 'high').length || 0,
          medium: incidents?.filter(i => i.severity === 'medium').length || 0,
          low: incidents?.filter(i => i.severity === 'low').length || 0
        }
      };
    } catch (error) {
      console.error('Error getting incident data:', error);
      return {};
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
        effectiveness_distribution: {
          excellent: tests?.filter(t => (t.effectiveness_rating || 0) >= 4).length || 0,
          good: tests?.filter(t => (t.effectiveness_rating || 0) >= 3).length || 0,
          fair: tests?.filter(t => (t.effectiveness_rating || 0) >= 2).length || 0,
          poor: tests?.filter(t => (t.effectiveness_rating || 0) < 2).length || 0
        }
      };
    } catch (error) {
      console.error('Error getting controls data:', error);
      return {};
    }
  }

  private async getTestingData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    try {
      const { data: scenarioTests } = await supabase
        .from('scenario_tests')
        .select('*')
        .eq('org_id', orgId);

      const { data: continuityTests } = await supabase
        .from('continuity_tests')
        .select('*')
        .eq('org_id', orgId);

      const scenarioTestsLength = scenarioTests?.length || 0;
      const continuityTestsLength = continuityTests?.length || 0;
      const totalTests = scenarioTestsLength + continuityTestsLength;

      return {
        scenario_tests: scenarioTestsLength,
        continuity_tests: continuityTestsLength,
        total_tests: totalTests,
        success_rate: 85 // Placeholder calculation
      };
    } catch (error) {
      console.error('Error getting testing data:', error);
      return {};
    }
  }

  private async getAppetiteData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    try {
      const { data: breaches } = await supabase
        .from('appetite_breach_logs')
        .select('*')
        .eq('org_id', orgId);

      return {
        total_breaches: breaches?.length || 0,
        critical_breaches: breaches?.filter(b => b.breach_severity === 'critical').length || 0,
        resolved_breaches: breaches?.filter(b => b.resolution_status === 'resolved').length || 0
      };
    } catch (error) {
      console.error('Error getting appetite data:', error);
      return {};
    }
  }

  private async getRiskRegisterData(orgId: string): Promise<any> {
    try {
      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', orgId);

      return {
        risk_categories: [...new Set(incidents?.map(i => i.category).filter(Boolean))] || [],
        total_risks: incidents?.length || 0
      };
    } catch (error) {
      console.error('Error getting risk register data:', error);
      return {};
    }
  }

  private async getKRIData(orgId: string, periodStart?: string, periodEnd?: string): Promise<any> {
    try {
      const { data: kriLogs } = await supabase
        .from('kri_logs')
        .select(`
          *,
          kri_definitions!inner(org_id, name)
        `)
        .eq('kri_definitions.org_id', orgId);

      return {
        total_kris: kriLogs?.length || 0,
        breached_kris: kriLogs?.filter(k => k.threshold_breached).length || 0,
        recent_measurements: kriLogs?.slice(0, 10) || []
      };
    } catch (error) {
      console.error('Error getting KRI data:', error);
      return {};
    }
  }
}

export const regulatoryReportingService = new RegulatoryReportingService();
