
-- Enhanced Scenario Testing Tables
CREATE TABLE IF NOT EXISTS public.scenario_monte_carlo_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_test_id UUID NOT NULL REFERENCES scenario_tests(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  simulation_parameters JSONB NOT NULL DEFAULT '{}',
  number_of_iterations INTEGER NOT NULL DEFAULT 1000,
  confidence_interval NUMERIC NOT NULL DEFAULT 0.95,
  simulation_results JSONB NOT NULL DEFAULT '{}',
  statistical_summary JSONB NOT NULL DEFAULT '{}',
  risk_metrics JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scenario_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'custom',
  regulatory_framework TEXT,
  scenario_description TEXT NOT NULL,
  impact_parameters JSONB NOT NULL DEFAULT '{}',
  probability_distributions JSONB NOT NULL DEFAULT '{}',
  recovery_assumptions JSONB NOT NULL DEFAULT '{}',
  stress_factors JSONB NOT NULL DEFAULT '{}',
  is_regulatory_required BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced Third-Party Risk Tables
CREATE TABLE IF NOT EXISTS public.vendor_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_profile_id UUID NOT NULL,
  org_id UUID NOT NULL,
  assessment_type TEXT NOT NULL DEFAULT 'annual',
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  financial_score NUMERIC,
  operational_score NUMERIC,
  security_score NUMERIC,
  compliance_score NUMERIC,
  overall_risk_score NUMERIC NOT NULL,
  assessment_methodology JSONB NOT NULL DEFAULT '{}',
  risk_factors JSONB NOT NULL DEFAULT '{}',
  mitigation_recommendations JSONB NOT NULL DEFAULT '{}',
  assessor_id UUID,
  next_assessment_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendor_monitoring_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_profile_id UUID NOT NULL,
  org_id UUID NOT NULL,
  feed_source TEXT NOT NULL,
  feed_type TEXT NOT NULL,
  monitoring_frequency TEXT NOT NULL DEFAULT 'daily',
  last_check_at TIMESTAMP WITH TIME ZONE,
  current_status TEXT NOT NULL DEFAULT 'active',
  risk_indicators JSONB NOT NULL DEFAULT '{}',
  alert_thresholds JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.supply_chain_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  primary_vendor_id UUID NOT NULL,
  dependent_vendor_id UUID NOT NULL,
  dependency_type TEXT NOT NULL,
  criticality_level TEXT NOT NULL DEFAULT 'medium',
  dependency_description TEXT,
  risk_multiplier NUMERIC DEFAULT 1.0,
  mitigation_strategies JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Advanced Analytics Tables
CREATE TABLE IF NOT EXISTS public.predictive_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  target_variable TEXT NOT NULL,
  feature_variables JSONB NOT NULL DEFAULT '{}',
  model_parameters JSONB NOT NULL DEFAULT '{}',
  training_data_period DATERANGE,
  model_accuracy NUMERIC,
  last_trained_at TIMESTAMP WITH TIME ZONE,
  model_status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.anomaly_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  detection_source TEXT NOT NULL,
  anomaly_type TEXT NOT NULL,
  severity_score NUMERIC NOT NULL,
  confidence_score NUMERIC NOT NULL,
  detected_values JSONB NOT NULL DEFAULT '{}',
  baseline_values JSONB NOT NULL DEFAULT '{}',
  deviation_metrics JSONB NOT NULL DEFAULT '{}',
  investigation_status TEXT NOT NULL DEFAULT 'new',
  investigation_notes TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.risk_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  factor_a_type TEXT NOT NULL,
  factor_a_id UUID,
  factor_b_type TEXT NOT NULL,
  factor_b_id UUID,
  correlation_coefficient NUMERIC NOT NULL,
  correlation_strength TEXT NOT NULL,
  statistical_significance NUMERIC,
  analysis_period DATERANGE NOT NULL,
  correlation_context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mobile and PWA Tables
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  subscription_data JSONB NOT NULL,
  device_info JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action_data JSONB NOT NULL DEFAULT '{}',
  sync_status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Performance Monitoring Tables
CREATE TABLE IF NOT EXISTS public.performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  measurement_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  additional_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_scenario_monte_carlo_org_id ON scenario_monte_carlo_simulations(org_id);
CREATE INDEX IF NOT EXISTS idx_scenario_templates_org_type ON scenario_templates(org_id, template_type);
CREATE INDEX IF NOT EXISTS idx_vendor_assessments_vendor_org ON vendor_assessments(vendor_profile_id, org_id);
CREATE INDEX IF NOT EXISTS idx_vendor_monitoring_org_vendor ON vendor_monitoring_feeds(org_id, vendor_profile_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_deps_org ON supply_chain_dependencies(org_id);
CREATE INDEX IF NOT EXISTS idx_predictive_models_org_status ON predictive_models(org_id, model_status);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_org_status ON anomaly_detections(org_id, investigation_status);
CREATE INDEX IF NOT EXISTS idx_risk_correlations_org_period ON risk_correlations(org_id, analysis_period);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_active ON push_subscriptions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_offline_sync_user_status ON offline_sync_queue(user_id, sync_status);
CREATE INDEX IF NOT EXISTS idx_performance_analytics_org_type_time ON performance_analytics(org_id, metric_type, measurement_timestamp);

-- RLS Policies
ALTER TABLE scenario_monte_carlo_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their org's Monte Carlo simulations" ON scenario_monte_carlo_simulations
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

ALTER TABLE scenario_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their org's scenario templates" ON scenario_templates
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

ALTER TABLE vendor_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their org's vendor assessments" ON vendor_assessments
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

ALTER TABLE vendor_monitoring_feeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their org's vendor monitoring feeds" ON vendor_monitoring_feeds
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

ALTER TABLE supply_chain_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their org's supply chain dependencies" ON supply_chain_dependencies
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

ALTER TABLE predictive_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their org's predictive models" ON predictive_models
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

ALTER TABLE anomaly_detections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their org's anomaly detections" ON anomaly_detections
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

ALTER TABLE risk_correlations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their org's risk correlations" ON risk_correlations
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own offline sync queue" ON offline_sync_queue
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE performance_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their org's performance analytics" ON performance_analytics
  FOR SELECT USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "System can insert performance analytics" ON performance_analytics
  FOR INSERT WITH CHECK (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
