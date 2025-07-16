-- Phase 2: Database Schema Optimization (Corrected)
-- Move vector extension to dedicated schema for better security isolation

-- Create dedicated schema for vector operations
CREATE SCHEMA IF NOT EXISTS vectors;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA vectors TO postgres, anon, authenticated, service_role;

-- Create security function for vector operations
CREATE OR REPLACE FUNCTION vectors.check_vector_access(target_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND organization_id = target_org_id
    );
$$;

-- Create secure analytics summary using actual tables
CREATE OR REPLACE FUNCTION public.get_secure_analytics_summary(org_id uuid)
RETURNS TABLE(
    total_incidents bigint,
    critical_findings bigint,
    compliance_score numeric,
    high_risk_vendors bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT 
        COUNT(DISTINCT il.id) as total_incidents,
        COUNT(DISTINCT CASE WHEN cf.severity = 'critical' THEN cf.id END) as critical_findings,
        AVG(CASE WHEN cc.compliance_score IS NOT NULL THEN cc.compliance_score ELSE 0 END) as compliance_score,
        COUNT(DISTINCT CASE WHEN tp.risk_rating IN ('high', 'critical') THEN tp.id END) as high_risk_vendors
    FROM public.profiles p
    LEFT JOIN public.incident_logs il ON il.org_id = p.organization_id
    LEFT JOIN public.compliance_findings cf ON cf.org_id = p.organization_id
    LEFT JOIN public.compliance_checks cc ON cc.org_id = p.organization_id
    LEFT JOIN public.third_party_profiles tp ON tp.org_id = p.organization_id
    WHERE p.id = auth.uid() AND p.organization_id = get_secure_analytics_summary.org_id
    GROUP BY p.organization_id;
$$;

-- Create secure query function to prevent direct table access
CREATE OR REPLACE FUNCTION public.get_secure_audit_summary(org_id uuid)
RETURNS TABLE(
    total_schedules bigint,
    completed_audits bigint,
    pending_findings bigint,
    high_priority_tasks bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT 
        COUNT(DISTINCT aus.id) as total_schedules,
        COUNT(DISTINCT CASE WHEN aus.status = 'completed' THEN aus.id END) as completed_audits,
        COUNT(DISTINCT CASE WHEN cf.status = 'open' THEN cf.id END) as pending_findings,
        COUNT(DISTINCT CASE WHEN at.priority = 'high' THEN at.id END) as high_priority_tasks
    FROM public.profiles p
    LEFT JOIN public.audit_schedules aus ON aus.org_id = p.organization_id
    LEFT JOIN public.compliance_findings cf ON cf.org_id = p.organization_id
    LEFT JOIN public.audit_tasks at ON at.org_id = p.organization_id
    WHERE p.id = auth.uid() AND p.organization_id = get_secure_audit_summary.org_id
    GROUP BY p.organization_id;
$$;