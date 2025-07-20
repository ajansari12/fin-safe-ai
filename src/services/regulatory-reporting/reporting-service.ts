import { supabase } from '@/integrations/supabase/client';

export interface ReportTemplate {
  id: string;
  org_id: string;
  template_name: string;
  template_type: 'osfi_e21' | 'basel_iii' | 'cdic_dsr' | 'osfi_quarterly' | 'custom';
  regulatory_framework: string;
  version: string;
  description?: string;
  template_config: any;
  data_requirements: any[];
  validation_rules: any[];
  format_specifications: any;
  submission_requirements: any;
  is_system_template: boolean;
  is_active: boolean;
  effective_date?: string;
  expiry_date?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportInstance {
  id: string;
  org_id: string;
  template_id: string;
  instance_name: string;
  reporting_period_start: string;
  reporting_period_end: string;
  due_date: string;
  status: 'draft' | 'in_progress' | 'review' | 'approved' | 'submitted' | 'accepted' | 'rejected';
  report_data: any;
  aggregated_data: any;
  validation_results: any;
  generation_date?: string;
  submission_date?: string;
  submission_reference?: string;
  file_path?: string;
  file_format?: string;
  created_by?: string;
  reviewed_by?: string;
  approved_by?: string;
  submitted_by?: string;
  created_by_name?: string;
  reviewed_by_name?: string;
  approved_by_name?: string;
  submitted_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportValidation {
  id: string;
  report_instance_id: string;
  validation_type: 'completeness' | 'accuracy' | 'consistency' | 'format' | 'business_logic';
  validation_rule: string;
  validation_status: 'passed' | 'failed' | 'warning';
  error_message?: string;
  field_path?: string;
  expected_value?: string;
  actual_value?: string;
  remediation_suggestion?: string;
  validated_at: string;
}

export interface ApprovalWorkflow {
  id: string;
  report_instance_id: string;
  workflow_step: number;
  step_name: string;
  assigned_to?: string;
  assigned_to_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comments?: string;
  decision_date?: string;
  created_at: string;
}

export interface ReportSchedule {
  id: string;
  org_id: string;
  template_id: string;
  schedule_name: string;
  frequency: 'monthly' | 'quarterly' | 'annually' | 'ad_hoc';
  day_of_month?: number;
  month_of_year?: number;
  lead_time_days: number;
  auto_generate: boolean;
  is_active: boolean;
  next_generation_date?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

class RegulatoryReportingService {
  // Report Templates
  async getReportTemplates(): Promise<ReportTemplate[]> {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('is_active', true)
      .order('template_name');

    if (error) throw error;
    return data || [];
  }

  async getReportTemplate(id: string): Promise<ReportTemplate> {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createReportTemplate(template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const { data, error } = await supabase
      .from('report_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateReportTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const { data, error } = await supabase
      .from('report_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Report Instances
  async getReportInstances(): Promise<ReportInstance[]> {
    const { data, error } = await supabase
      .from('report_instances')
      .select(`
        *,
        report_templates (
          template_name,
          regulatory_framework,
          template_type
        )
      `)
      .order('due_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getReportInstance(id: string): Promise<ReportInstance> {
    const { data, error } = await supabase
      .from('report_instances')
      .select(`
        *,
        report_templates (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createReportInstance(instance: Partial<ReportInstance>): Promise<ReportInstance> {
    const { data, error } = await supabase
      .from('report_instances')
      .insert([instance])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateReportInstance(id: string, updates: Partial<ReportInstance>): Promise<ReportInstance> {
    const { data, error } = await supabase
      .from('report_instances')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteReportInstance(id: string): Promise<void> {
    const { error } = await supabase
      .from('report_instances')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Report Validations
  async getReportValidations(reportInstanceId: string): Promise<ReportValidation[]> {
    const { data, error } = await supabase
      .from('report_validations')
      .select('*')
      .eq('report_instance_id', reportInstanceId)
      .order('validated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createReportValidation(validation: Partial<ReportValidation>): Promise<ReportValidation> {
    const { data, error } = await supabase
      .from('report_validations')
      .insert([validation])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Approval Workflows
  async getApprovalWorkflow(reportInstanceId: string): Promise<ApprovalWorkflow[]> {
    const { data, error } = await supabase
      .from('approval_workflows')
      .select('*')
      .eq('report_instance_id', reportInstanceId)
      .order('workflow_step');

    if (error) throw error;
    return data || [];
  }

  async updateApprovalStep(id: string, updates: Partial<ApprovalWorkflow>): Promise<ApprovalWorkflow> {
    const { data, error } = await supabase
      .from('approval_workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createApprovalWorkflow(workflow: Partial<ApprovalWorkflow>): Promise<ApprovalWorkflow> {
    const { data, error } = await supabase
      .from('approval_workflows')
      .insert([workflow])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Report Schedules
  async getReportSchedules(): Promise<ReportSchedule[]> {
    const { data, error } = await supabase
      .from('report_schedules')
      .select(`
        *,
        report_templates (
          template_name,
          regulatory_framework
        )
      `)
      .eq('is_active', true)
      .order('next_generation_date');

    if (error) throw error;
    return data || [];
  }

  async createReportSchedule(schedule: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const { data, error } = await supabase
      .from('report_schedules')
      .insert([schedule])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateReportSchedule(id: string, updates: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const { data, error } = await supabase
      .from('report_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Dashboard metrics
  async getReportingDashboardData() {
    try {
      const [instances, templates, validations] = await Promise.all([
        this.getReportInstances(),
        this.getReportTemplates(),
        this.getReportValidationSummary(),
      ]);

      return {
        totalReports: instances.length,
        pendingReports: instances.filter(r => ['draft', 'in_progress', 'review'].includes(r.status)).length,
        overdue: instances.filter(r => new Date(r.due_date) < new Date() && !['submitted', 'accepted'].includes(r.status)).length,
        submitted: instances.filter(r => ['submitted', 'accepted'].includes(r.status)).length,
        templates: templates.length,
        validationIssues: validations.failed + validations.warnings,
        recentInstances: instances.slice(0, 5),
      };
    } catch (error) {
      console.error('Error fetching reporting dashboard data:', error);
      throw error;
    }
  }

  private async getReportValidationSummary() {
    const { data, error } = await supabase
      .from('report_validations')
      .select('validation_status');

    if (error) throw error;

    const summary = {
      passed: 0,
      failed: 0,
      warnings: 0,
    };

    data?.forEach(validation => {
      if (validation.validation_status === 'passed') summary.passed++;
      else if (validation.validation_status === 'failed') summary.failed++;
      else if (validation.validation_status === 'warning') summary.warnings++;
    });

    return summary;
  }
}

export const reportingService = new RegulatoryReportingService();