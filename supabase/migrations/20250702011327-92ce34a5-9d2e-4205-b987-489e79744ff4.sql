
-- Phase 6: Compliance Monitoring Framework Database Extensions
CREATE TABLE public.regulatory_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  regulation_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  applicable_sectors TEXT[] NOT NULL DEFAULT '{}',
  regulation_type TEXT NOT NULL DEFAULT 'mandatory',
  effective_date DATE,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  auto_identified BOOLEAN NOT NULL DEFAULT true,
  confidence_score NUMERIC(3,2) DEFAULT 0.85,
  regulatory_body TEXT,
  description TEXT,
  key_requirements JSONB DEFAULT '[]'::JSONB,
  monitoring_rules JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.compliance_monitoring_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  regulatory_intelligence_id UUID REFERENCES public.regulatory_intelligence(id),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL DEFAULT 'automated',
  monitoring_frequency TEXT NOT NULL DEFAULT 'daily',
  rule_logic JSONB NOT NULL DEFAULT '{}'::JSONB,
  validation_criteria JSONB NOT NULL DEFAULT '{}'::JSONB,
  breach_thresholds JSONB DEFAULT '{}'::JSONB,
  notification_settings JSONB DEFAULT '{}'::JSONB,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  execution_status TEXT DEFAULT 'pending',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.regulatory_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  regulatory_intelligence_id UUID REFERENCES public.regulatory_intelligence(id),
  change_type TEXT NOT NULL,
  change_description TEXT NOT NULL,
  impact_assessment TEXT,
  effective_date DATE,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  review_status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID,
  assigned_to_name TEXT,
  action_required BOOLEAN NOT NULL DEFAULT false,
  implementation_deadline DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.compliance_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  regulatory_intelligence_id UUID REFERENCES public.regulatory_intelligence(id),
  monitoring_rule_id UUID REFERENCES public.compliance_monitoring_rules(id),
  violation_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  violation_description TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  affected_systems JSONB DEFAULT '[]'::JSONB,
  business_impact TEXT,
  remediation_plan TEXT,
  remediation_status TEXT NOT NULL DEFAULT 'open',
  remediation_deadline DATE,
  assigned_to UUID,
  assigned_to_name TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 7: Scenario Testing Framework Database Extensions
CREATE TABLE public.industry_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  scenario_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  scenario_type TEXT NOT NULL DEFAULT 'operational',
  severity_level TEXT NOT NULL DEFAULT 'medium',
  scenario_description TEXT NOT NULL,
  scenario_parameters JSONB NOT NULL DEFAULT '{}'::JSONB,
  expected_outcomes JSONB DEFAULT '[]'::JSONB,
  testing_procedures JSONB DEFAULT '[]'::JSONB,
  success_criteria JSONB DEFAULT '[]'::JSONB,
  regulatory_basis TEXT,
  frequency TEXT NOT NULL DEFAULT 'annual',
  last_executed_at TIMESTAMP WITH TIME ZONE,
  next_execution_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.emerging_risk_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  scenario_name TEXT NOT NULL,
  risk_category TEXT NOT NULL,
  emergence_indicators JSONB NOT NULL DEFAULT '[]'::JSONB,
  scenario_description TEXT NOT NULL,
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  confidence_score NUMERIC(3,2) DEFAULT 0.75,
  scenario_parameters JSONB NOT NULL DEFAULT '{}'::JSONB,
  potential_impact_assessment JSONB DEFAULT '{}'::JSONB,
  recommended_responses JSONB DEFAULT '[]'::JSONB,
  monitoring_metrics JSONB DEFAULT '[]'::JSONB,
  trigger_conditions JSONB DEFAULT '[]'::JSONB,
  review_frequency TEXT NOT NULL DEFAULT 'quarterly',
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.scenario_execution_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  scenario_id UUID,
  scenario_type TEXT NOT NULL,
  schedule_name TEXT NOT NULL,
  execution_frequency TEXT NOT NULL DEFAULT 'annual',
  next_execution_date DATE NOT NULL,
  execution_time TIME DEFAULT '09:00:00',
  auto_execute BOOLEAN NOT NULL DEFAULT false,
  notification_settings JSONB DEFAULT '{}'::JSONB,
  execution_parameters JSONB DEFAULT '{}'::JSONB,
  assigned_team JSONB DEFAULT '[]'::JSONB,
  preparation_checklist JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.osfi_e21_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  scenario_code TEXT NOT NULL,
  scenario_name TEXT NOT NULL,
  osfi_category TEXT NOT NULL,
  compliance_level TEXT NOT NULL DEFAULT 'required',
  scenario_description TEXT NOT NULL,
  testing_requirements JSONB NOT NULL DEFAULT '{}'::JSONB,
  reporting_requirements JSONB DEFAULT '{}'::JSONB,
  execution_frequency TEXT NOT NULL DEFAULT 'annual',
  last_execution_date DATE,
  next_due_date DATE,
  compliance_status TEXT NOT NULL DEFAULT 'pending',
  execution_results JSONB DEFAULT '{}'::JSONB,
  regulatory_feedback TEXT,
  action_items JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 8: Integration & Orchestration Database Extensions
CREATE TABLE public.framework_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  source_framework_id UUID NOT NULL,
  source_framework_type TEXT NOT NULL,
  dependent_framework_id UUID NOT NULL,
  dependent_framework_type TEXT NOT NULL,
  dependency_type TEXT NOT NULL DEFAULT 'requires',
  dependency_strength TEXT NOT NULL DEFAULT 'medium',
  dependency_description TEXT,
  impact_analysis JSONB DEFAULT '{}'::JSONB,
  validation_rules JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.framework_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  framework_id UUID NOT NULL,
  framework_type TEXT NOT NULL,
  version_number TEXT NOT NULL,
  version_description TEXT,
  change_summary JSONB DEFAULT '[]'::JSONB,
  framework_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_by UUID,
  created_by_name TEXT,
  approval_status TEXT NOT NULL DEFAULT 'draft',
  approved_by UUID,
  approved_by_name TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  deployment_status TEXT NOT NULL DEFAULT 'pending',
  deployed_at TIMESTAMP WITH TIME ZONE,
  rollback_data JSONB DEFAULT '{}'::JSONB,
  is_current_version BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.framework_effectiveness_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  framework_id UUID NOT NULL,
  framework_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_value NUMERIC NOT NULL,
  target_value NUMERIC,
  variance_percentage NUMERIC,
  trend_direction TEXT,
  measurement_method TEXT,
  data_sources JSONB DEFAULT '[]'::JSONB,
  quality_score NUMERIC(3,2) DEFAULT 1.0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.implementation_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  framework_id UUID NOT NULL,
  framework_type TEXT NOT NULL,
  feedback_type TEXT NOT NULL,
  feedback_category TEXT NOT NULL DEFAULT 'general',
  feedback_content TEXT NOT NULL,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  implementation_phase TEXT,
  user_role TEXT,
  submitted_by UUID,
  submitted_by_name TEXT,
  implementation_date DATE,
  lessons_learned JSONB DEFAULT '[]'::JSONB,
  improvement_suggestions JSONB DEFAULT '[]'::JSONB,
  would_recommend BOOLEAN,
  follow_up_required BOOLEAN NOT NULL DEFAULT false,
  follow_up_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for all new tables
ALTER TABLE public.regulatory_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_monitoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emerging_risk_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_execution_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.osfi_e21_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_effectiveness_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementation_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizational access
CREATE POLICY "Users can manage their org's regulatory intelligence" ON public.regulatory_intelligence
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = regulatory_intelligence.org_id));

CREATE POLICY "Users can manage their org's compliance monitoring rules" ON public.compliance_monitoring_rules
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = compliance_monitoring_rules.org_id));

CREATE POLICY "Users can manage their org's regulatory changes" ON public.regulatory_changes
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = regulatory_changes.org_id));

CREATE POLICY "Users can manage their org's compliance violations" ON public.compliance_violations
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = compliance_violations.org_id));

CREATE POLICY "Users can manage their org's industry scenarios" ON public.industry_scenarios
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = industry_scenarios.org_id));

CREATE POLICY "Users can manage their org's emerging risk scenarios" ON public.emerging_risk_scenarios
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = emerging_risk_scenarios.org_id));

CREATE POLICY "Users can manage their org's scenario execution schedules" ON public.scenario_execution_schedules
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = scenario_execution_schedules.org_id));

CREATE POLICY "Users can manage their org's OSFI E-21 scenarios" ON public.osfi_e21_scenarios
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = osfi_e21_scenarios.org_id));

CREATE POLICY "Users can manage their org's framework dependencies" ON public.framework_dependencies
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = framework_dependencies.org_id));

CREATE POLICY "Users can manage their org's framework versions" ON public.framework_versions
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = framework_versions.org_id));

CREATE POLICY "Users can manage their org's framework effectiveness metrics" ON public.framework_effectiveness_metrics
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = framework_effectiveness_metrics.org_id));

CREATE POLICY "Users can manage their org's implementation feedback" ON public.implementation_feedback
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = implementation_feedback.org_id));

-- Add update triggers for timestamps
CREATE TRIGGER update_regulatory_intelligence_timestamp 
  BEFORE UPDATE ON public.regulatory_intelligence 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_monitoring_rules_timestamp 
  BEFORE UPDATE ON public.compliance_monitoring_rules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regulatory_changes_timestamp 
  BEFORE UPDATE ON public.regulatory_changes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_violations_timestamp 
  BEFORE UPDATE ON public.compliance_violations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_industry_scenarios_timestamp 
  BEFORE UPDATE ON public.industry_scenarios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emerging_risk_scenarios_timestamp 
  BEFORE UPDATE ON public.emerging_risk_scenarios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenario_execution_schedules_timestamp 
  BEFORE UPDATE ON public.scenario_execution_schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_osfi_e21_scenarios_timestamp 
  BEFORE UPDATE ON public.osfi_e21_scenarios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_framework_dependencies_timestamp 
  BEFORE UPDATE ON public.framework_dependencies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_framework_versions_timestamp 
  BEFORE UPDATE ON public.framework_versions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_implementation_feedback_timestamp 
  BEFORE UPDATE ON public.implementation_feedback 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
