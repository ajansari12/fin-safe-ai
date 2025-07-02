-- Phase 4: Enterprise & Regulatory Excellence Database Schema

-- Advanced Security Audit Logs
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'data_access', 'permission_change', 'configuration_change', 'failed_login', 'suspicious_activity')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  resource_accessed TEXT,
  action_performed TEXT,
  event_details JSONB NOT NULL DEFAULT '{}',
  geo_location JSONB DEFAULT '{}',
  risk_score INTEGER DEFAULT 0,
  investigation_status TEXT DEFAULT 'open' CHECK (investigation_status IN ('open', 'investigating', 'resolved', 'false_positive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Regulatory Reports Management
CREATE TABLE IF NOT EXISTS public.regulatory_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('osfi_e21', 'basel_iii', 'ccar', 'dfast', 'icaap', 'recovery_plan')),
  reporting_period TEXT NOT NULL,
  due_date DATE NOT NULL,
  submission_date DATE,
  report_status TEXT NOT NULL DEFAULT 'draft' CHECK (report_status IN ('draft', 'in_review', 'approved', 'submitted', 'rejected')),
  report_data JSONB NOT NULL DEFAULT '{}',
  validation_results JSONB DEFAULT '{}',
  reviewer_notes TEXT,
  submission_reference TEXT,
  created_by UUID,
  reviewed_by UUID,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Business Continuity Scenarios
CREATE TABLE IF NOT EXISTS public.business_continuity_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  scenario_name TEXT NOT NULL,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('cyber_attack', 'natural_disaster', 'pandemic', 'technology_failure', 'key_personnel_loss', 'third_party_failure')),
  severity_level TEXT NOT NULL CHECK (severity_level IN ('minor', 'moderate', 'major', 'severe', 'catastrophic')),
  scenario_description TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '[]',
  impact_assessment JSONB NOT NULL DEFAULT '{}',
  response_procedures JSONB NOT NULL DEFAULT '[]',
  recovery_objectives JSONB NOT NULL DEFAULT '{}',
  testing_frequency_days INTEGER DEFAULT 90,
  last_tested_date DATE,
  next_test_date DATE,
  test_results JSONB DEFAULT '{}',
  lessons_learned TEXT,
  scenario_status TEXT DEFAULT 'active' CHECK (scenario_status IN ('active', 'inactive', 'archived')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API Integration Registry
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('risk_data', 'regulatory_feeds', 'market_data', 'credit_bureau', 'payment_processor', 'identity_verification')),
  provider_name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  authentication_method TEXT NOT NULL CHECK (authentication_method IN ('api_key', 'oauth2', 'jwt', 'basic_auth', 'certificate')),
  authentication_config JSONB NOT NULL DEFAULT '{}',
  rate_limits JSONB DEFAULT '{}',
  data_mapping JSONB DEFAULT '{}',
  sync_frequency_hours INTEGER DEFAULT 24,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error', 'disabled')),
  error_details JSONB DEFAULT '{}',
  data_quality_score NUMERIC DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance Monitoring Automation
CREATE TABLE IF NOT EXISTS public.compliance_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  regulation_reference TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('threshold_monitoring', 'data_validation', 'workflow_enforcement', 'reporting_automation', 'exception_handling')),
  rule_conditions JSONB NOT NULL DEFAULT '{}',
  automation_actions JSONB NOT NULL DEFAULT '[]',
  alert_configuration JSONB DEFAULT '{}',
  execution_frequency TEXT NOT NULL CHECK (execution_frequency IN ('real_time', 'hourly', 'daily', 'weekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  execution_results JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_continuity_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_automation_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their org's security audit logs" 
ON public.security_audit_logs FOR SELECT 
USING (check_user_org_access(org_id));

CREATE POLICY "System can insert security audit logs" 
ON public.security_audit_logs FOR INSERT 
WITH CHECK (check_user_org_access(org_id));

CREATE POLICY "Users can manage their org's regulatory reports" 
ON public.regulatory_reports FOR ALL 
USING (check_user_org_access(org_id));

CREATE POLICY "Users can manage their org's continuity scenarios" 
ON public.business_continuity_scenarios FOR ALL 
USING (check_user_org_access(org_id));

CREATE POLICY "Users can manage their org's API integrations" 
ON public.api_integrations FOR ALL 
USING (check_user_org_access(org_id));

CREATE POLICY "Users can manage their org's compliance automation" 
ON public.compliance_automation_rules FOR ALL 
USING (check_user_org_access(org_id));

-- Create indexes for performance
CREATE INDEX idx_security_audit_logs_org_id ON public.security_audit_logs(org_id);
CREATE INDEX idx_security_audit_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);
CREATE INDEX idx_security_audit_logs_risk_score ON public.security_audit_logs(risk_score);

CREATE INDEX idx_regulatory_reports_org_id ON public.regulatory_reports(org_id);
CREATE INDEX idx_regulatory_reports_type_period ON public.regulatory_reports(report_type, reporting_period);
CREATE INDEX idx_regulatory_reports_due_date ON public.regulatory_reports(due_date);
CREATE INDEX idx_regulatory_reports_status ON public.regulatory_reports(report_status);

CREATE INDEX idx_continuity_scenarios_org_id ON public.business_continuity_scenarios(org_id);
CREATE INDEX idx_continuity_scenarios_type ON public.business_continuity_scenarios(scenario_type);
CREATE INDEX idx_continuity_scenarios_test_date ON public.business_continuity_scenarios(next_test_date);

CREATE INDEX idx_api_integrations_org_id ON public.api_integrations(org_id);
CREATE INDEX idx_api_integrations_type ON public.api_integrations(integration_type);
CREATE INDEX idx_api_integrations_sync_status ON public.api_integrations(sync_status);

CREATE INDEX idx_compliance_automation_org_id ON public.compliance_automation_rules(org_id);
CREATE INDEX idx_compliance_automation_active ON public.compliance_automation_rules(is_active);
CREATE INDEX idx_compliance_automation_frequency ON public.compliance_automation_rules(execution_frequency);