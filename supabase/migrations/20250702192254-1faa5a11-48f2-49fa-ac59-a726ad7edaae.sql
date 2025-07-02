-- Phase C: Additional Security & Data Validation Optimizations

-- 1. Add audit triggers for sensitive tables
CREATE OR REPLACE FUNCTION public.audit_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log sensitive changes to admin_logs
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.admin_logs (
            org_id,
            admin_user_id,
            admin_user_name,
            action_type,
            resource_type,
            resource_id,
            action_details
        ) 
        SELECT 
            OLD.org_id,
            auth.uid()::text,
            COALESCE(p.full_name, 'Unknown'),
            'DELETE',
            TG_TABLE_NAME,
            OLD.id::text,
            row_to_json(OLD)
        FROM public.profiles p 
        WHERE p.id = auth.uid();
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.admin_logs (
            org_id,
            admin_user_id,
            admin_user_name,
            action_type,
            resource_type,
            resource_id,
            action_details
        )
        SELECT 
            NEW.org_id,
            auth.uid()::text,
            COALESCE(p.full_name, 'Unknown'),
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id::text,
            json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
        FROM public.profiles p 
        WHERE p.id = auth.uid();
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.admin_logs (
            org_id,
            admin_user_id,
            admin_user_name,
            action_type,
            resource_type,
            resource_id,
            action_details
        )
        SELECT 
            NEW.org_id,
            auth.uid()::text,
            COALESCE(p.full_name, 'Unknown'),
            'INSERT',
            TG_TABLE_NAME,
            NEW.id::text,
            row_to_json(NEW)
        FROM public.profiles p 
        WHERE p.id = auth.uid();
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- 2. Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_governance_frameworks ON public.governance_frameworks;
CREATE TRIGGER audit_governance_frameworks
    AFTER INSERT OR UPDATE OR DELETE ON public.governance_frameworks
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- 3. Add data validation constraints
DO $$
BEGIN
    -- Email validation for profiles (if email column exists)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'chk_profiles_email_valid'
        ) THEN
            ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_email_valid 
            CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
        END IF;
    END IF;

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

-- 4. Optimize commonly used RLS functions
CREATE OR REPLACE FUNCTION public.check_user_org_access_optimized(target_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND organization_id = target_org_id
    );
$$;

-- 5. Create materialized view for dashboard performance
CREATE MATERIALIZED VIEW IF NOT EXISTS public.dashboard_metrics AS
SELECT 
    p.organization_id,
    COUNT(DISTINCT il.id) as total_incidents,
    COUNT(DISTINCT CASE WHEN il.severity IN ('critical', 'high') THEN il.id END) as high_severity_incidents,
    COUNT(DISTINCT c.id) as total_controls,
    COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_controls,
    COUNT(DISTINCT k.id) as total_kris,
    COUNT(DISTINCT tp.id) as total_vendors,
    COUNT(DISTINCT CASE WHEN tp.risk_rating IN ('high', 'critical') THEN tp.id END) as high_risk_vendors,
    MAX(il.created_at) as last_incident_date,
    CURRENT_TIMESTAMP as last_updated
FROM public.profiles p
LEFT JOIN public.incident_logs il ON il.org_id = p.organization_id
LEFT JOIN public.controls c ON c.org_id = p.organization_id
LEFT JOIN public.kri_definitions k ON k.org_id = p.organization_id
LEFT JOIN public.third_party_profiles tp ON tp.org_id = p.organization_id
WHERE p.organization_id IS NOT NULL
GROUP BY p.organization_id;

-- 6. Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_metrics_org 
ON public.dashboard_metrics(organization_id);

-- 7. Create function to refresh dashboard metrics
CREATE OR REPLACE FUNCTION public.refresh_dashboard_metrics()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.dashboard_metrics;
$$;

-- 8. Add RLS to dashboard metrics
ALTER MATERIALIZED VIEW public.dashboard_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org dashboard metrics" 
ON public.dashboard_metrics FOR SELECT 
USING (organization_id = get_user_org_safe());