-- Phase 2: Database Schema Optimization
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

-- Create materialized view access control
CREATE OR REPLACE FUNCTION public.get_secure_analytics_summary(org_id uuid)
RETURNS TABLE(
    total_risks bigint,
    high_risks bigint,
    critical_findings bigint,
    compliance_score numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT 
        COUNT(DISTINCT r.id) as total_risks,
        COUNT(DISTINCT CASE WHEN r.risk_level IN ('high', 'critical') THEN r.id END) as high_risks,
        COUNT(DISTINCT CASE WHEN cf.severity = 'critical' THEN cf.id END) as critical_findings,
        AVG(CASE WHEN cc.compliance_score IS NOT NULL THEN cc.compliance_score ELSE 0 END) as compliance_score
    FROM public.profiles p
    LEFT JOIN public.risk_registers r ON r.org_id = p.organization_id
    LEFT JOIN public.compliance_findings cf ON cf.org_id = p.organization_id
    LEFT JOIN public.compliance_checks cc ON cc.org_id = p.organization_id
    WHERE p.id = auth.uid() AND p.organization_id = get_secure_analytics_summary.org_id
    GROUP BY p.organization_id;
$$;

-- Add RLS policy for secure analytics access
CREATE POLICY "Users can access secure analytics for their org" ON public.profiles
    FOR SELECT USING (id = auth.uid());