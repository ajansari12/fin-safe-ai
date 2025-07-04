-- Performance optimization indexes for large tables

-- Incident logs indexes
CREATE INDEX IF NOT EXISTS idx_incident_logs_org_created_at ON public.incident_logs (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_logs_type_severity ON public.incident_logs (incident_type, severity);
CREATE INDEX IF NOT EXISTS idx_incident_logs_status ON public.incident_logs (status);
CREATE INDEX IF NOT EXISTS idx_incident_logs_assigned ON public.incident_logs (assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_incident_logs_escalation ON public.incident_logs (escalation_level, escalated_at);

-- KRI logs indexes  
CREATE INDEX IF NOT EXISTS idx_kri_logs_org_created_at ON public.kri_logs (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kri_logs_kri_measurement ON public.kri_logs (kri_id, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_kri_logs_measurement_date ON public.kri_logs (measurement_date DESC);

-- Analytics insights indexes
CREATE INDEX IF NOT EXISTS idx_analytics_insights_org_generated ON public.analytics_insights (org_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_type_valid ON public.analytics_insights (insight_type, valid_until);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_confidence ON public.analytics_insights (confidence_score DESC) WHERE confidence_score IS NOT NULL;

-- Controls indexes for better performance
CREATE INDEX IF NOT EXISTS idx_controls_org_status ON public.controls (org_id, status);
CREATE INDEX IF NOT EXISTS idx_controls_next_test_due ON public.controls (next_test_due_date) WHERE next_test_due_date IS NOT NULL;

-- Control tests indexes
CREATE INDEX IF NOT EXISTS idx_control_tests_org_date ON public.control_tests (org_id, test_date DESC);
CREATE INDEX IF NOT EXISTS idx_control_tests_control_status ON public.control_tests (control_id, test_status);

-- KRI definitions indexes
CREATE INDEX IF NOT EXISTS idx_kri_definitions_org_frequency ON public.kri_definitions (org_id, frequency);
CREATE INDEX IF NOT EXISTS idx_kri_definitions_status ON public.kri_definitions (status) WHERE status = 'active';

-- Third party profiles indexes
CREATE INDEX IF NOT EXISTS idx_third_party_org_risk ON public.third_party_profiles (org_id, risk_rating);
CREATE INDEX IF NOT EXISTS idx_third_party_criticality ON public.third_party_profiles (criticality);

-- Vendor assessments indexes
CREATE INDEX IF NOT EXISTS idx_vendor_assessments_org_date ON public.vendor_assessments (org_id, assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_assessments_vendor_status ON public.vendor_assessments (vendor_profile_id, status);

-- Document indexes
CREATE INDEX IF NOT EXISTS idx_documents_org_created ON public.documents (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_type_status ON public.documents (document_type, status);
CREATE INDEX IF NOT EXISTS idx_documents_version ON public.documents (is_current_version) WHERE is_current_version = true;

-- Business functions indexes
CREATE INDEX IF NOT EXISTS idx_business_functions_org_criticality ON public.business_functions (org_id, criticality);

-- Dependencies indexes
CREATE INDEX IF NOT EXISTS idx_dependencies_org_status ON public.dependencies (org_id, status);
CREATE INDEX IF NOT EXISTS idx_dependencies_function_criticality ON public.dependencies (business_function_id, criticality);

-- Audit trails indexes for compliance reporting
CREATE INDEX IF NOT EXISTS idx_audit_trails_org_timestamp ON public.audit_trails (org_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trails_entity_action ON public.audit_trails (entity_type, action_type);

-- Error logs indexes (from previous implementation)
-- Already created in previous migration, but adding comment for completeness

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_incident_logs_reporting ON public.incident_logs (org_id, severity, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kri_performance ON public.kri_logs (org_id, kri_id, measurement_date DESC, actual_value);
CREATE INDEX IF NOT EXISTS idx_analytics_active_insights ON public.analytics_insights (org_id, insight_type) WHERE valid_until > now();