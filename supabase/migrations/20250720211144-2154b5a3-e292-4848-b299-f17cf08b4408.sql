
-- Create report templates table
CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('osfi_e21', 'basel_iii', 'cdic_dsr', 'osfi_quarterly', 'custom')),
  regulatory_framework TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  description TEXT,
  template_config JSONB NOT NULL DEFAULT '{}',
  data_requirements JSONB NOT NULL DEFAULT '[]',
  validation_rules JSONB NOT NULL DEFAULT '[]',
  format_specifications JSONB NOT NULL DEFAULT '{}',
  submission_requirements JSONB NOT NULL DEFAULT '{}',
  is_system_template BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_date DATE,
  expiry_date DATE,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report instances table
CREATE TABLE public.report_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  template_id UUID NOT NULL REFERENCES public.report_templates(id),
  instance_name TEXT NOT NULL,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'approved', 'submitted', 'accepted', 'rejected')),
  report_data JSONB NOT NULL DEFAULT '{}',
  aggregated_data JSONB NOT NULL DEFAULT '{}',
  validation_results JSONB NOT NULL DEFAULT '{}',
  generation_date TIMESTAMP WITH TIME ZONE,
  submission_date TIMESTAMP WITH TIME ZONE,
  submission_reference TEXT,
  file_path TEXT,
  file_format TEXT,
  created_by UUID,
  reviewed_by UUID,
  approved_by UUID,
  submitted_by UUID,
  created_by_name TEXT,
  reviewed_by_name TEXT,
  approved_by_name TEXT,
  submitted_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report validations table
CREATE TABLE public.report_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_instance_id UUID NOT NULL REFERENCES public.report_instances(id),
  validation_type TEXT NOT NULL CHECK (validation_type IN ('completeness', 'accuracy', 'consistency', 'format', 'business_logic')),
  validation_rule TEXT NOT NULL,
  validation_status TEXT NOT NULL CHECK (validation_status IN ('passed', 'failed', 'warning')),
  error_message TEXT,
  field_path TEXT,
  expected_value TEXT,
  actual_value TEXT,
  remediation_suggestion TEXT,
  validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approval workflows table
CREATE TABLE public.approval_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_instance_id UUID NOT NULL REFERENCES public.report_instances(id),
  workflow_step INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  assigned_to UUID,
  assigned_to_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  comments TEXT,
  decision_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report schedules table
CREATE TABLE public.report_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  template_id UUID NOT NULL REFERENCES public.report_templates(id),
  schedule_name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annually', 'ad_hoc')),
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
  month_of_year INTEGER CHECK (month_of_year >= 1 AND month_of_year <= 12),
  lead_time_days INTEGER NOT NULL DEFAULT 30,
  auto_generate BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  next_generation_date DATE,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

-- Report templates policies
CREATE POLICY "Users can view report templates for their org" 
  ON public.report_templates 
  FOR SELECT 
  USING (check_user_org_access(org_id) OR is_system_template = true);

CREATE POLICY "Users can manage report templates for their org" 
  ON public.report_templates 
  FOR ALL 
  USING (check_user_org_access(org_id));

-- Report instances policies
CREATE POLICY "Users can manage report instances for their org" 
  ON public.report_instances 
  FOR ALL 
  USING (check_user_org_access(org_id));

-- Report validations policies
CREATE POLICY "Users can view report validations for their org" 
  ON public.report_validations 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.report_instances ri 
    WHERE ri.id = report_validations.report_instance_id 
    AND check_user_org_access(ri.org_id)
  ));

CREATE POLICY "System can insert report validations" 
  ON public.report_validations 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.report_instances ri 
    WHERE ri.id = report_validations.report_instance_id 
    AND check_user_org_access(ri.org_id)
  ));

-- Approval workflows policies
CREATE POLICY "Users can manage approval workflows for their org" 
  ON public.approval_workflows 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.report_instances ri 
    WHERE ri.id = approval_workflows.report_instance_id 
    AND check_user_org_access(ri.org_id)
  ));

-- Report schedules policies
CREATE POLICY "Users can manage report schedules for their org" 
  ON public.report_schedules 
  FOR ALL 
  USING (check_user_org_access(org_id));

-- Add indexes for performance
CREATE INDEX idx_report_templates_org_id ON public.report_templates(org_id);
CREATE INDEX idx_report_templates_type ON public.report_templates(template_type);
CREATE INDEX idx_report_instances_org_id ON public.report_instances(org_id);
CREATE INDEX idx_report_instances_template_id ON public.report_instances(template_id);
CREATE INDEX idx_report_instances_status ON public.report_instances(status);
CREATE INDEX idx_report_instances_due_date ON public.report_instances(due_date);
CREATE INDEX idx_report_validations_instance_id ON public.report_validations(report_instance_id);
CREATE INDEX idx_approval_workflows_instance_id ON public.approval_workflows(report_instance_id);
CREATE INDEX idx_report_schedules_org_id ON public.report_schedules(org_id);

-- Add updated_at triggers
CREATE TRIGGER update_report_templates_timestamp
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_instances_timestamp
  BEFORE UPDATE ON public.report_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_schedules_timestamp
  BEFORE UPDATE ON public.report_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert system templates
INSERT INTO public.report_templates (
  org_id, template_name, template_type, regulatory_framework, description, 
  is_system_template, template_config, data_requirements, validation_rules
) VALUES 
(
  '00000000-0000-0000-0000-000000000000', 
  'OSFI E-21 Operational Resilience Report', 
  'osfi_e21', 
  'OSFI E-21', 
  'Comprehensive operational resilience assessment and reporting template for OSFI E-21 compliance',
  true,
  '{"format": "pdf", "sections": ["governance", "risk_management", "testing", "monitoring", "reporting"], "auto_populate": true}'::jsonb,
  '[
    {"source": "business_functions", "fields": ["criticality", "dependencies", "recovery_objectives"]},
    {"source": "continuity_plans", "fields": ["plan_status", "testing_results", "recovery_procedures"]},
    {"source": "scenario_tests", "fields": ["test_results", "identified_gaps", "remediation_actions"]},
    {"source": "incident_logs", "fields": ["operational_incidents", "impact_assessment", "response_times"]},
    {"source": "controls", "fields": ["control_effectiveness", "testing_results", "remediation_status"]}
  ]'::jsonb,
  '[
    {"rule": "all_critical_functions_identified", "type": "completeness", "severity": "error"},
    {"rule": "rto_rpo_defined_for_critical_functions", "type": "completeness", "severity": "error"},
    {"rule": "annual_testing_completed", "type": "business_logic", "severity": "warning"},
    {"rule": "incident_response_documented", "type": "completeness", "severity": "error"}
  ]'::jsonb
),
(
  '00000000-0000-0000-0000-000000000000', 
  'Basel III Operational Risk Report', 
  'basel_iii', 
  'Basel III', 
  'Basel III operational risk capital and reporting template',
  true,
  '{"format": "excel", "sections": ["risk_assessment", "capital_calculation", "loss_data", "controls"], "auto_populate": true}'::jsonb,
  '[
    {"source": "kri_definitions", "fields": ["operational_risk_indicators", "threshold_breaches", "trend_analysis"]},
    {"source": "incident_logs", "fields": ["loss_events", "operational_losses", "business_line_impact"]},
    {"source": "controls", "fields": ["control_framework", "effectiveness_assessment", "testing_results"]},
    {"source": "risk_assessments", "fields": ["operational_risk_profile", "inherent_risk", "residual_risk"]}
  ]'::jsonb,
  '[
    {"rule": "loss_data_complete", "type": "completeness", "severity": "error"},
    {"rule": "capital_calculation_accurate", "type": "accuracy", "severity": "error"},
    {"rule": "control_testing_current", "type": "business_logic", "severity": "warning"}
  ]'::jsonb
);
