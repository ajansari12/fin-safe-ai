-- Phase 1: Critical Database Security Fixes
-- Fix Function Search Path Vulnerabilities - Add SET search_path = '' to all functions

-- 1. Fix security functions first
CREATE OR REPLACE FUNCTION public.get_user_role_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT COALESCE(ur.role, 'user')::text
    FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(target_user_id, auth.uid())
    AND ur.organization_id IN (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = COALESCE(target_user_id, auth.uid())
    )
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = COALESCE(target_user_id, auth.uid())
        AND ur.role IN ('admin', 'super_admin')
        AND p.organization_id = ur.organization_id
    );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_user_roles(target_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'super_admin')
        AND ur.organization_id = target_org_id
        AND p.organization_id = target_org_id
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_safe(user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = COALESCE(get_user_org_safe.user_id, auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.check_user_org_access(target_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND organization_id = target_org_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_org_access(target_org_id uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = COALESCE(user_has_org_access.user_id, auth.uid()) 
        AND organization_id = target_org_id
    ) OR EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_roles.user_id = COALESCE(user_has_org_access.user_id, auth.uid())
        AND role IN ('admin', 'super_admin')
    );
$$;

-- 2. Fix core utility functions
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.validate_org_access(table_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT table_org_id = (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    ) OR EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    );
$$;

-- 3. Fix dashboard and metrics functions  
CREATE OR REPLACE FUNCTION public.get_org_dashboard_metrics(target_org_id uuid DEFAULT get_user_org_safe())
RETURNS TABLE(total_incidents bigint, high_severity_incidents bigint, total_controls bigint, active_controls bigint, total_kris bigint, total_vendors bigint, high_risk_vendors bigint, last_incident_date timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
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

-- 4. Fix session and authentication functions
CREATE OR REPLACE FUNCTION public.check_session_timeout(session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  session_record RECORD;
  policy_record RECORD;
  idle_timeout_exceeded boolean := false;
  absolute_timeout_exceeded boolean := false;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.user_sessions
  WHERE user_sessions.session_token = check_session_timeout.session_token
  AND is_active = true;

  IF session_record IS NULL THEN
    RETURN false;
  END IF;

  -- Get session policy
  SELECT * INTO policy_record
  FROM public.session_policies
  WHERE org_id = session_record.org_id
  AND is_active = true
  LIMIT 1;

  IF policy_record IS NULL THEN
    RETURN true; -- No policy, session is valid
  END IF;

  -- Check idle timeout
  IF session_record.last_activity_at < (now() - interval '1 minute' * policy_record.idle_timeout_minutes) THEN
    idle_timeout_exceeded := true;
  END IF;

  -- Check absolute timeout
  IF session_record.created_at < (now() - interval '1 minute' * policy_record.absolute_timeout_minutes) THEN
    absolute_timeout_exceeded := true;
  END IF;

  -- Deactivate session if timeout exceeded
  IF idle_timeout_exceeded OR absolute_timeout_exceeded THEN
    UPDATE public.user_sessions
    SET is_active = false
    WHERE id = session_record.id;
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_session_risk_score(user_id uuid, device_fingerprint_id uuid, location_data jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  risk_score INTEGER := 0;
  device_trusted BOOLEAN;
  unusual_location BOOLEAN;
BEGIN
  -- Check if device is trusted
  SELECT is_trusted INTO device_trusted
  FROM public.device_fingerprints
  WHERE id = device_fingerprint_id;
  
  IF NOT COALESCE(device_trusted, false) THEN
    risk_score := risk_score + 30;
  END IF;
  
  -- Add more risk calculation logic here
  -- This is a simplified version
  
  RETURN LEAST(risk_score, 100);
END;
$$;

-- 5. Fix framework and policy functions
CREATE OR REPLACE FUNCTION public.check_user_framework_for_changelog(framework_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.governance_frameworks f 
    JOIN public.profiles p ON p.organization_id = f.org_id 
    WHERE f.id = framework_id AND p.id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_user_org_for_framework(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND organization_id = org_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_user_policy_access(policy_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.governance_policies pol
    JOIN public.governance_frameworks f ON f.id = pol.framework_id
    JOIN public.profiles p ON p.organization_id = f.org_id 
    WHERE pol.id = policy_id AND p.id = auth.uid()
  );
END;
$$;

-- 6. Fix onboarding function
CREATE OR REPLACE FUNCTION public.update_onboarding_step(p_user_id uuid, p_step_id text, p_step_name text, p_completed boolean DEFAULT true, p_data jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_onboarding_progress (user_id, step_id, step_name, completed, completed_at, data)
  VALUES (p_user_id, p_step_id, p_step_name, p_completed, 
          CASE WHEN p_completed THEN now() ELSE NULL END, p_data)
  ON CONFLICT (user_id, step_id) 
  DO UPDATE SET 
    completed = p_completed,
    completed_at = CASE WHEN p_completed THEN now() ELSE NULL END,
    data = p_data,
    updated_at = now();
END;
$$;

-- 7. Fix framework activity logging function
CREATE OR REPLACE FUNCTION public.log_framework_activity(p_framework_id uuid, p_user_id uuid, p_user_name text, p_activity_type text, p_description text DEFAULT NULL::text, p_data jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.framework_activities (
    framework_id, user_id, user_name, activity_type, activity_description, activity_data
  )
  VALUES (
    p_framework_id, p_user_id, p_user_name, p_activity_type, p_description, p_data
  )
  RETURNING id INTO activity_id;
  
  -- Update framework last activity
  UPDATE public.generated_frameworks
  SET last_activity_at = now()
  WHERE id = p_framework_id;
  
  RETURN activity_id;
END;
$$;

-- Enable leaked password protection (Fix warning #51)
-- This needs to be done in the Supabase dashboard under Authentication > Settings
-- But we can create a reminder for the user
INSERT INTO public.security_events (
    org_id,
    event_type,
    event_category,
    severity,
    event_description,
    event_data,
    user_id
) VALUES (
    (SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    'security_configuration',
    'authentication',
    'warning',
    'Leaked password protection needs to be enabled in Supabase dashboard',
    jsonb_build_object(
        'action_required', 'Enable leaked password protection',
        'location', 'Supabase Dashboard > Authentication > Settings',
        'priority', 'high'
    ),
    auth.uid()
) ON CONFLICT DO NOTHING;