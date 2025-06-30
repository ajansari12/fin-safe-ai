
-- Fix the missing database tables for regulatory reporting

-- Report templates table (if not exists)
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('osfi_e21', 'operational_risk', 'compliance_summary', 'custom')),
  description TEXT,
  template_config JSONB DEFAULT '{}',
  data_blocks JSONB DEFAULT '[]',
  layout_config JSONB DEFAULT '{}',
  is_system_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Report schedules table (if not exists)
CREATE TABLE IF NOT EXISTS public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  template_id UUID REFERENCES public.report_templates(id),
  schedule_name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
  time_of_day TIME NOT NULL,
  recipients TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run_date TIMESTAMP WITH TIME ZONE,
  next_run_date TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Regulatory calendar table (if not exists)
CREATE TABLE IF NOT EXISTS public.regulatory_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  regulation_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  due_date DATE NOT NULL,
  filing_frequency TEXT NOT NULL CHECK (filing_frequency IN ('monthly', 'quarterly', 'annually', 'ad_hoc')),
  regulatory_body TEXT NOT NULL,
  description TEXT,
  reminder_days_before INTEGER DEFAULT 14,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'submitted', 'overdue')),
  submitted_date TIMESTAMP WITH TIME ZONE,
  submitted_by UUID,
  submitted_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Data quality checks table (if not exists)
CREATE TABLE IF NOT EXISTS public.data_quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  report_instance_id UUID,
  check_name TEXT NOT NULL,
  check_type TEXT NOT NULL CHECK (check_type IN ('completeness', 'accuracy', 'consistency', 'validity')),
  data_source TEXT NOT NULL,
  check_status TEXT NOT NULL DEFAULT 'pending' CHECK (check_status IN ('pending', 'passed', 'failed', 'warning')),
  check_result JSONB DEFAULT '{}',
  error_details TEXT,
  checked_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their org's report templates" ON public.report_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = report_templates.org_id
    )
  );

CREATE POLICY "Users can create report templates for their org" ON public.report_templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = report_templates.org_id
    )
  );

CREATE POLICY "Users can update their org's report templates" ON public.report_templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = report_templates.org_id
    )
  );

CREATE POLICY "Users can view their org's report schedules" ON public.report_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = report_schedules.org_id
    )
  );

CREATE POLICY "Users can create report schedules for their org" ON public.report_schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = report_schedules.org_id
    )
  );

CREATE POLICY "Users can view their org's regulatory calendar" ON public.regulatory_calendar
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = regulatory_calendar.org_id
    )
  );

CREATE POLICY "Users can create regulatory calendar entries for their org" ON public.regulatory_calendar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = regulatory_calendar.org_id
    )
  );

CREATE POLICY "Users can view their org's data quality checks" ON public.data_quality_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = data_quality_checks.org_id
    )
  );

CREATE POLICY "Users can create data quality checks for their org" ON public.data_quality_checks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = data_quality_checks.org_id
    )
  );

-- Add some system templates
INSERT INTO public.report_templates (org_id, template_name, template_type, description, is_system_template, data_blocks, template_config)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'OSFI E-21 Compliance Report', 'osfi_e21', 'Standard OSFI E-21 operational risk and resilience report template', true, 
   '[
     {"id": "governance_matrix", "type": "governance_matrix", "title": "Governance Framework", "required": true},
     {"id": "risk_register", "type": "risk_register", "title": "Risk Register", "required": true},
     {"id": "controls_effectiveness", "type": "controls_effectiveness", "title": "Controls Effectiveness", "required": true},
     {"id": "incident_summary", "type": "incident_summary", "title": "Incident Summary", "required": true},
     {"id": "testing_results", "type": "testing_results", "title": "Testing Results", "required": true}
   ]'::jsonb,
   '{"format": "pdf", "layout": "standard", "include_signatures": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'Operational Risk Dashboard', 'operational_risk', 'Comprehensive operational risk monitoring and reporting template', true,
   '[
     {"id": "kri_dashboard", "type": "kri_dashboard", "title": "Key Risk Indicators", "required": true},
     {"id": "appetite_dashboard", "type": "appetite_dashboard", "title": "Risk Appetite Monitoring", "required": true},
     {"id": "metrics", "type": "metrics", "title": "Risk Metrics", "required": true},
     {"id": "incident_summary", "type": "incident_summary", "title": "Incident Analysis", "required": false}
   ]'::jsonb,
   '{"format": "excel", "layout": "dashboard", "auto_refresh": true}'::jsonb);
