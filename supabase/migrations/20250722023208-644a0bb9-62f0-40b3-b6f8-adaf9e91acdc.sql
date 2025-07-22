
-- Create automated_reporting_rules table
CREATE TABLE public.automated_reporting_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
  schedule_config JSONB NOT NULL DEFAULT '{}',
  data_sources JSONB NOT NULL DEFAULT '[]',
  template_config JSONB NOT NULL DEFAULT '{}',
  output_format TEXT NOT NULL DEFAULT 'pdf' CHECK (output_format IN ('pdf', 'excel', 'json', 'xml')),
  recipients JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_execution_at TIMESTAMP WITH TIME ZONE,
  next_execution_at TIMESTAMP WITH TIME ZONE,
  execution_status TEXT DEFAULT 'pending' CHECK (execution_status IN ('pending', 'running', 'completed', 'failed')),
  error_details TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integration_connectors table
CREATE TABLE public.integration_connectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  connector_name TEXT NOT NULL,
  connector_type TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  authentication_config JSONB NOT NULL DEFAULT '{}',
  sync_frequency TEXT NOT NULL DEFAULT 'hourly' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly')),
  data_mapping JSONB NOT NULL DEFAULT '{}',
  retry_config JSONB NOT NULL DEFAULT '{"max_retries": 3, "backoff_strategy": "exponential"}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed')),
  error_details TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integration_health_metrics table
CREATE TABLE public.integration_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connector_id UUID NOT NULL REFERENCES public.integration_connectors(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  metric_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  success_rate NUMERIC(5,2),
  error_count INTEGER DEFAULT 0,
  throughput_per_minute INTEGER DEFAULT 0,
  availability_percentage NUMERIC(5,2),
  data_quality_score NUMERIC(3,2),
  custom_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance_optimizations table (extending existing performance_metrics)
CREATE TABLE public.performance_optimizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  optimization_type TEXT NOT NULL,
  target_metric TEXT NOT NULL,
  current_value NUMERIC,
  target_value NUMERIC,
  optimization_strategy JSONB NOT NULL DEFAULT '{}',
  implementation_status TEXT DEFAULT 'planned' CHECK (implementation_status IN ('planned', 'in_progress', 'completed', 'failed')),
  estimated_impact JSONB DEFAULT '{}',
  actual_impact JSONB DEFAULT '{}',
  implementation_date DATE,
  completion_date DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.automated_reporting_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_optimizations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for automated_reporting_rules
CREATE POLICY "Users can manage their org's reporting rules"
  ON public.automated_reporting_rules
  FOR ALL
  USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Create RLS policies for integration_connectors
CREATE POLICY "Users can manage their org's integration connectors"
  ON public.integration_connectors
  FOR ALL
  USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Create RLS policies for integration_health_metrics
CREATE POLICY "Users can view their org's integration health metrics"
  ON public.integration_health_metrics
  FOR SELECT
  USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can insert integration health metrics"
  ON public.integration_health_metrics
  FOR INSERT
  WITH CHECK (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Create RLS policies for performance_optimizations
CREATE POLICY "Users can manage their org's performance optimizations"
  ON public.performance_optimizations
  FOR ALL
  USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_automated_reporting_rules_org_id ON public.automated_reporting_rules(org_id);
CREATE INDEX idx_automated_reporting_rules_next_execution ON public.automated_reporting_rules(next_execution_at) WHERE is_active = true;

CREATE INDEX idx_integration_connectors_org_id ON public.integration_connectors(org_id);
CREATE INDEX idx_integration_connectors_next_sync ON public.integration_connectors(next_sync_at) WHERE is_active = true;

CREATE INDEX idx_integration_health_metrics_connector_id ON public.integration_health_metrics(connector_id);
CREATE INDEX idx_integration_health_metrics_timestamp ON public.integration_health_metrics(metric_timestamp DESC);

CREATE INDEX idx_performance_optimizations_org_id ON public.performance_optimizations(org_id);
CREATE INDEX idx_performance_optimizations_status ON public.performance_optimizations(implementation_status);

-- Create triggers for updated_at columns
CREATE TRIGGER update_automated_reporting_rules_timestamp
  BEFORE UPDATE ON public.automated_reporting_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_connectors_timestamp
  BEFORE UPDATE ON public.integration_connectors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_optimizations_timestamp
  BEFORE UPDATE ON public.performance_optimizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
