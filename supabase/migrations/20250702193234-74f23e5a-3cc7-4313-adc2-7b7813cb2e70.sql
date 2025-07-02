-- Phase C: Final Security & Performance Optimizations

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

-- 3. Add data validation constraints
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

-- 4. Create function to get organization dashboard metrics
CREATE OR REPLACE FUNCTION public.get_org_dashboard_metrics(org_id uuid DEFAULT get_user_org_safe())
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
    SELECT 
        COUNT(DISTINCT il.id) as total_incidents,
        COUNT(DISTINCT CASE WHEN il.severity IN ('critical', 'high') THEN il.id END) as high_severity_incidents,
        COUNT(DISTINCT c.id) as total_controls,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_controls,
        COUNT(DISTINCT k.id) as total_kris,
        COUNT(DISTINCT tp.id) as total_vendors,
        COUNT(DISTINCT CASE WHEN tp.risk_rating IN ('high', 'critical') THEN tp.id END) as high_risk_vendors,
        MAX(il.created_at) as last_incident_date
    FROM public.incident_logs il
    FULL OUTER JOIN public.controls c ON c.org_id = COALESCE(org_id, get_user_org_safe())
    FULL OUTER JOIN public.kri_definitions k ON k.org_id = COALESCE(org_id, get_user_org_safe())
    FULL OUTER JOIN public.third_party_profiles tp ON tp.org_id = COALESCE(org_id, get_user_org_safe())
    WHERE il.org_id = COALESCE(org_id, get_user_org_safe())
       OR c.org_id = COALESCE(org_id, get_user_org_safe())
       OR k.org_id = COALESCE(org_id, get_user_org_safe())
       OR tp.org_id = COALESCE(org_id, get_user_org_safe());
$$;

-- 5. Create automated cleanup function for old logs
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Clean up logs older than 2 years
    DELETE FROM public.admin_logs WHERE created_at < NOW() - INTERVAL '2 years';
    DELETE FROM public.ai_chat_logs WHERE created_at < NOW() - INTERVAL '1 year';
    DELETE FROM public.integration_logs WHERE created_at < NOW() - INTERVAL '6 months';
    
    -- Clean up old performance metrics
    DELETE FROM public.performance_analytics WHERE created_at < NOW() - INTERVAL '3 months';
END;
$$;