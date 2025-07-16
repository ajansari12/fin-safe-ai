-- Phase 3: Enhanced Security Monitoring and Database Schema Security
-- This migration implements comprehensive security monitoring and database schema protections

-- 1. Enhanced Security Monitoring Tables
CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL,
    user_id uuid,
    event_type text NOT NULL,
    event_category text NOT NULL, -- 'authentication', 'authorization', 'data_access', 'configuration'
    severity text NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
    event_details jsonb NOT NULL DEFAULT '{}',
    source_ip inet,
    user_agent text,
    device_fingerprint text,
    geographic_location jsonb,
    threat_indicators jsonb DEFAULT '{}',
    risk_score integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    processed_at timestamp with time zone,
    status text NOT NULL DEFAULT 'pending' -- 'pending', 'reviewed', 'resolved', 'false_positive'
);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy for security events
CREATE POLICY "Admins can view security events for their org"
ON public.security_events
FOR SELECT
TO authenticated
USING (
    is_admin_secure() AND 
    org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "System can insert security events"
ON public.security_events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Password Security Enhancements
CREATE TABLE IF NOT EXISTS public.password_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL,
    min_length integer NOT NULL DEFAULT 12,
    require_uppercase boolean NOT NULL DEFAULT true,
    require_lowercase boolean NOT NULL DEFAULT true,
    require_numbers boolean NOT NULL DEFAULT true,
    require_symbols boolean NOT NULL DEFAULT true,
    prevent_common_passwords boolean NOT NULL DEFAULT true,
    prevent_compromised_passwords boolean NOT NULL DEFAULT true,
    password_history_count integer NOT NULL DEFAULT 5,
    max_age_days integer DEFAULT 90,
    lockout_threshold integer NOT NULL DEFAULT 5,
    lockout_duration_minutes integer NOT NULL DEFAULT 30,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policy for password policies
CREATE POLICY "Admins can manage password policies for their org"
ON public.password_policies
FOR ALL
TO authenticated
USING (
    is_admin_secure() AND 
    org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

-- 3. Database Schema Security - Function to validate table access
CREATE OR REPLACE FUNCTION public.validate_table_access(table_name text, operation text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_role text;
    org_id uuid;
BEGIN
    -- Get user role and organization
    SELECT ur.role, p.organization_id 
    INTO user_role, org_id
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
    LIMIT 1;
    
    -- Log the access attempt
    INSERT INTO public.security_events (
        org_id, user_id, event_type, event_category, severity, event_details
    ) VALUES (
        org_id, auth.uid(), 'table_access', 'data_access', 'info',
        jsonb_build_object(
            'table_name', table_name,
            'operation', operation,
            'user_role', user_role
        )
    );
    
    -- Allow access for admins and valid users
    RETURN user_role IN ('admin', 'super_admin') OR org_id IS NOT NULL;
END;
$$;

-- 4. Enhanced Session Security
CREATE TABLE IF NOT EXISTS public.session_security_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid NOT NULL,
    event_type text NOT NULL, -- 'login', 'logout', 'timeout', 'concurrent_limit', 'suspicious_activity'
    risk_factors jsonb DEFAULT '{}',
    device_info jsonb DEFAULT '{}',
    location_info jsonb DEFAULT '{}',
    action_taken text, -- 'allowed', 'blocked', 'forced_logout', 'mfa_required'
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_security_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view their own session security logs"
ON public.session_security_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert session security logs"
ON public.session_security_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Comprehensive Audit Trail Function
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type text,
    p_event_category text,
    p_severity text DEFAULT 'info',
    p_event_details jsonb DEFAULT '{}',
    p_source_ip inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL,
    p_risk_score integer DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    event_id uuid;
    user_org_id uuid;
BEGIN
    -- Get user's organization
    SELECT organization_id INTO user_org_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    -- Insert security event
    INSERT INTO public.security_events (
        org_id, user_id, event_type, event_category, severity,
        event_details, source_ip, user_agent, risk_score
    ) VALUES (
        user_org_id, auth.uid(), p_event_type, p_event_category, p_severity,
        p_event_details, p_source_ip, p_user_agent, p_risk_score
    ) RETURNING id INTO event_id;
    
    -- Alert on critical events
    IF p_severity = 'critical' THEN
        -- Could trigger notifications here
        PERFORM pg_notify('security_alert', 
            jsonb_build_object(
                'event_id', event_id,
                'severity', p_severity,
                'event_type', p_event_type,
                'org_id', user_org_id
            )::text
        );
    END IF;
    
    RETURN event_id;
END;
$$;

-- 6. Database Schema Protection Trigger
CREATE OR REPLACE FUNCTION public.protect_schema_changes()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Log schema changes
    PERFORM public.log_security_event(
        'schema_change',
        'configuration',
        'warning',
        jsonb_build_object(
            'command', tg_tag,
            'user', session_user,
            'timestamp', now()
        )
    );
    
    -- Prevent unauthorized schema changes (except for migrations)
    IF session_user != 'postgres' AND current_setting('application_name', true) != 'postgres-meta' THEN
        RAISE EXCEPTION 'Unauthorized schema modification attempt detected';
    END IF;
END;
$$;

-- Create event trigger for schema protection
DROP EVENT TRIGGER IF EXISTS protect_schema_trigger;
CREATE EVENT TRIGGER protect_schema_trigger
ON ddl_command_end
EXECUTE FUNCTION public.protect_schema_changes();

-- 7. Enhanced MFA Security
CREATE TABLE IF NOT EXISTS public.mfa_security_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL,
    user_id uuid NOT NULL,
    mfa_method text NOT NULL, -- 'totp', 'sms', 'email', 'backup_codes'
    action text NOT NULL, -- 'setup', 'verify', 'failure', 'reset'
    success boolean NOT NULL,
    failure_reason text,
    device_info jsonb DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mfa_security_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view their own MFA logs"
ON public.mfa_security_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert MFA logs"
ON public.mfa_security_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 8. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_org_created 
ON public.security_events (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_severity_created 
ON public.security_events (severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_security_logs_user_created 
ON public.session_security_logs (user_id, created_at DESC);

-- 9. Update triggers for existing tables
CREATE OR REPLACE FUNCTION public.update_security_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Add triggers to security tables
CREATE TRIGGER update_password_policies_timestamp
    BEFORE UPDATE ON public.password_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_security_timestamp();

-- 10. Comments for documentation
COMMENT ON TABLE public.security_events IS 'Comprehensive security event logging for monitoring and audit trail';
COMMENT ON TABLE public.password_policies IS 'Enhanced password policy configuration with leaked password protection';
COMMENT ON TABLE public.session_security_logs IS 'Detailed session security monitoring and tracking';
COMMENT ON TABLE public.mfa_security_logs IS 'Multi-factor authentication security audit trail';
COMMENT ON FUNCTION public.log_security_event(text, text, text, jsonb, inet, text, integer) IS 'Central function for logging security events with alerting capabilities';
COMMENT ON FUNCTION public.validate_table_access(text, text) IS 'Validates and logs table access attempts for security monitoring';
COMMENT ON FUNCTION public.protect_schema_changes() IS 'Event trigger function to protect against unauthorized schema modifications';