-- Phase C: Final Security & Performance Optimizations (Fixed)

-- 1. Add data validation constraints
DO $$
BEGIN
    -- Severity validation for incidents
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_incident_logs_severity_valid'
    ) THEN
        ALTER TABLE public.incident_logs ADD CONSTRAINT chk_incident_logs_severity_valid 
        CHECK (severity IN ('critical', 'high', 'medium', 'low'));
    END IF;

    -- Status validation for controls  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_controls_status_valid'
    ) THEN
        ALTER TABLE public.controls ADD CONSTRAINT chk_controls_status_valid 
        CHECK (status IN ('active', 'inactive', 'draft', 'under_review', 'retired'));
    END IF;
END $$;

-- 2. Create function to get organization dashboard metrics (fixed)
CREATE OR REPLACE FUNCTION public.get_org_dashboard_metrics(target_org_id uuid DEFAULT get_user_org_safe())
RETURNS TABLE (
    total_incidents bigint,
    high_severity_incidents bigint,
    total_controls bigint,
    active_controls bigint,
    total_kris bigint,
    total_vendors bigint,
    high_risk_vendors bigint,
    last_incident_date timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    WITH org_data AS (
        SELECT COALESCE(target_org_id, get_user_org_safe()) as org_id
    )
    SELECT 
        COALESCE(COUNT(DISTINCT il.id), 0) as total_incidents,
        COALESCE(COUNT(DISTINCT CASE WHEN il.severity IN ('critical', 'high') THEN il.id END), 0) as high_severity_incidents,
        COALESCE(COUNT(DISTINCT c.id), 0) as total_controls,
        COALESCE(COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END), 0) as active_controls,
        COALESCE(COUNT(DISTINCT k.id), 0) as total_kris,
        COALESCE(COUNT(DISTINCT tp.id), 0) as total_vendors,
        COALESCE(COUNT(DISTINCT CASE WHEN tp.risk_rating IN ('high', 'critical') THEN tp.id END), 0) as high_risk_vendors,
        MAX(il.created_at) as last_incident_date
    FROM org_data od
    LEFT JOIN public.incident_logs il ON il.org_id = od.org_id
    LEFT JOIN public.controls c ON c.org_id = od.org_id
    LEFT JOIN public.kri_definitions k ON k.org_id = od.org_id
    LEFT JOIN public.third_party_profiles tp ON tp.org_id = od.org_id;
$$;

-- 3. Create automated cleanup function for old logs
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Clean up logs older than specified periods
    DELETE FROM public.admin_logs WHERE created_at < NOW() - INTERVAL '2 years';
    DELETE FROM public.ai_chat_logs WHERE created_at < NOW() - INTERVAL '1 year';
    DELETE FROM public.integration_logs WHERE created_at < NOW() - INTERVAL '6 months';
    DELETE FROM public.performance_analytics WHERE created_at < NOW() - INTERVAL '3 months';
    
    -- Log cleanup activity
    INSERT INTO public.admin_logs (
        org_id, admin_user_id, admin_user_name, action_type, resource_type, action_details
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        'system',
        'System Cleanup',
        'CLEANUP',
        'logs',
        json_build_object('action', 'automated_log_cleanup', 'timestamp', NOW())
    );
END;
$$;

-- 4. Add additional performance indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_org_created ON public.admin_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_org_session ON public.ai_chat_logs(org_id, session_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_org_status ON public.integration_logs(org_id, status);

-- 5. Create function to validate organization access
CREATE OR REPLACE FUNCTION public.validate_org_access(table_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT table_org_id = get_user_org_safe() OR is_admin_role();
$$;