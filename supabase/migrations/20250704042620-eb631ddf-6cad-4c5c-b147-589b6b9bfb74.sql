-- Performance optimization indexes for large tables

-- Incident logs indexes
CREATE INDEX IF NOT EXISTS idx_incident_logs_org_created_at ON public.incident_logs (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_logs_category_severity ON public.incident_logs (category, severity);
CREATE INDEX IF NOT EXISTS idx_incident_logs_status ON public.incident_logs (status);
CREATE INDEX IF NOT EXISTS idx_incident_logs_assigned ON public.incident_logs (assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_incident_logs_escalation ON public.incident_logs (escalation_level, escalated_at);

-- KRI logs indexes  
CREATE INDEX IF NOT EXISTS idx_kri_logs_kri_measurement ON public.kri_logs (kri_id, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_kri_logs_measurement_date ON public.kri_logs (measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_kri_logs_threshold_breach ON public.kri_logs (threshold_breached, measurement_date DESC);

-- Analytics insights indexes
CREATE INDEX IF NOT EXISTS idx_analytics_insights_org_generated ON public.analytics_insights (org_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_type_valid ON public.analytics_insights (insight_type, valid_until);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_confidence ON public.analytics_insights (confidence_score DESC) WHERE confidence_score IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_incident_logs_reporting ON public.incident_logs (org_id, severity, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kri_performance ON public.kri_logs (kri_id, measurement_date DESC, actual_value);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_active_type ON public.analytics_insights (org_id, insight_type, generated_at DESC);