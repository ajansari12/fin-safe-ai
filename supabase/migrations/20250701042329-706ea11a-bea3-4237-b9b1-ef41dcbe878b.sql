
-- Create microservices table for service management
CREATE TABLE public.microservices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  service_version TEXT NOT NULL DEFAULT '1.0.0',
  endpoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  health_check_url TEXT NOT NULL,
  instances JSONB NOT NULL DEFAULT '[]'::jsonb,
  scaling_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  circuit_breaker_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  environment TEXT NOT NULL DEFAULT 'production',
  region TEXT NOT NULL DEFAULT 'us-east-1',
  status TEXT NOT NULL DEFAULT 'active',
  last_health_check TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, service_name, environment)
);

-- Create performance_metrics table for monitoring
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'us-east-1',
  metric_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time_ms NUMERIC NOT NULL DEFAULT 0,
  throughput_rps NUMERIC NOT NULL DEFAULT 0,
  error_rate NUMERIC NOT NULL DEFAULT 0,
  cpu_usage NUMERIC NOT NULL DEFAULT 0,
  memory_usage NUMERIC NOT NULL DEFAULT 0,
  disk_usage NUMERIC NOT NULL DEFAULT 0,
  network_latency_ms NUMERIC NOT NULL DEFAULT 0,
  database_connections INTEGER NOT NULL DEFAULT 0,
  queue_depth INTEGER NOT NULL DEFAULT 0,
  cache_hit_rate NUMERIC NOT NULL DEFAULT 0,
  user_experience_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  system_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deployment_history table for deployment tracking
CREATE TABLE public.deployment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  deployment_version TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  deployment_strategy TEXT NOT NULL DEFAULT 'rolling',
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  deployed_by UUID,
  deployed_by_name TEXT,
  rollback_target_version TEXT,
  rollback_reason TEXT,
  health_check_status TEXT DEFAULT 'pending',
  deployment_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  deployment_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance optimization
CREATE INDEX idx_microservices_org_service ON public.microservices(org_id, service_name);
CREATE INDEX idx_microservices_status ON public.microservices(status, environment);
CREATE INDEX idx_microservices_health_check ON public.microservices(last_health_check);

CREATE INDEX idx_performance_metrics_org_service ON public.performance_metrics(org_id, service_name);
CREATE INDEX idx_performance_metrics_timestamp ON public.performance_metrics(metric_timestamp DESC);
CREATE INDEX idx_performance_metrics_service_time ON public.performance_metrics(service_name, metric_timestamp DESC);

CREATE INDEX idx_deployment_history_org_service ON public.deployment_history(org_id, service_name);
CREATE INDEX idx_deployment_history_status ON public.deployment_history(status, environment);
CREATE INDEX idx_deployment_history_timestamp ON public.deployment_history(started_at DESC);

-- Enable RLS on all new tables
ALTER TABLE public.microservices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_history ENABLE ROW LEVEL SECURITY;

-- Create security definer function for organization access
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Create security definer function for admin check
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role IN ('admin', 'super_admin') FROM public.profiles WHERE id = auth.uid();
$$;

-- RLS Policies for microservices table
CREATE POLICY "Users can view organization microservices"
  ON public.microservices
  FOR SELECT
  USING (org_id = public.get_user_org_id());

CREATE POLICY "Admins can manage microservices"
  ON public.microservices
  FOR ALL
  USING (org_id = public.get_user_org_id() AND public.is_admin_user());

-- RLS Policies for performance_metrics table
CREATE POLICY "Users can view organization performance metrics"
  ON public.performance_metrics
  FOR SELECT
  USING (org_id = public.get_user_org_id());

CREATE POLICY "System can insert performance metrics"
  ON public.performance_metrics
  FOR INSERT
  WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Admins can manage performance metrics"
  ON public.performance_metrics
  FOR ALL
  USING (org_id = public.get_user_org_id() AND public.is_admin_user());

-- RLS Policies for deployment_history table
CREATE POLICY "Users can view organization deployment history"
  ON public.deployment_history
  FOR SELECT
  USING (org_id = public.get_user_org_id());

CREATE POLICY "Admins can manage deployment history"
  ON public.deployment_history
  FOR ALL
  USING (org_id = public.get_user_org_id() AND public.is_admin_user());

-- Create triggers for timestamp updates
CREATE OR REPLACE FUNCTION public.update_microservices_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_microservices_timestamp
  BEFORE UPDATE ON public.microservices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_microservices_timestamp();

CREATE TRIGGER update_deployment_history_timestamp
  BEFORE UPDATE ON public.deployment_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add constraints for data integrity
ALTER TABLE public.microservices
  ADD CONSTRAINT chk_microservices_status
  CHECK (status IN ('active', 'inactive', 'degraded', 'failed'));

ALTER TABLE public.microservices
  ADD CONSTRAINT chk_microservices_environment
  CHECK (environment IN ('development', 'staging', 'production'));

ALTER TABLE public.performance_metrics
  ADD CONSTRAINT chk_performance_metrics_rates
  CHECK (error_rate >= 0 AND error_rate <= 1 AND cache_hit_rate >= 0 AND cache_hit_rate <= 1);

ALTER TABLE public.deployment_history
  ADD CONSTRAINT chk_deployment_status
  CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'rolled_back'));

ALTER TABLE public.deployment_history
  ADD CONSTRAINT chk_deployment_strategy
  CHECK (deployment_strategy IN ('rolling', 'blue_green', 'canary', 'recreate'));

-- Create materialized view for performance dashboard
CREATE MATERIALIZED VIEW public.performance_dashboard_metrics AS
SELECT 
  org_id,
  service_name,
  DATE_TRUNC('hour', metric_timestamp) as metric_hour,
  AVG(response_time_ms) as avg_response_time,
  AVG(throughput_rps) as avg_throughput,
  AVG(error_rate) as avg_error_rate,
  AVG(cpu_usage) as avg_cpu_usage,
  AVG(memory_usage) as avg_memory_usage,
  COUNT(*) as metric_count
FROM public.performance_metrics
WHERE metric_timestamp >= NOW() - INTERVAL '7 days'
GROUP BY org_id, service_name, DATE_TRUNC('hour', metric_timestamp);

-- Create unique index on materialized view
CREATE UNIQUE INDEX idx_performance_dashboard_unique 
  ON public.performance_dashboard_metrics(org_id, service_name, metric_hour);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_performance_dashboard()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.performance_dashboard_metrics;
END;
$$;
