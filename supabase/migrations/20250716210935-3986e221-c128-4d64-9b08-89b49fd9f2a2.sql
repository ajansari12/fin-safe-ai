-- Fix SECURITY DEFINER functions by adding SET search_path = ''
-- This prevents potential schema injection attacks

-- Update all SECURITY DEFINER functions to include proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT COALESCE(ur.role, 'user')::text
    FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(target_user_id, auth.uid())
    AND ur.organization_id IN (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = COALESCE(target_user_id, auth.uid())
    )
    LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = COALESCE(target_user_id, auth.uid())
        AND ur.role IN ('admin', 'super_admin')
        AND p.organization_id = ur.organization_id
    );
$function$;

CREATE OR REPLACE FUNCTION public.can_manage_user_roles(target_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'super_admin')
        AND ur.organization_id = target_org_id
        AND p.organization_id = target_org_id
    );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_org_safe(user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = COALESCE(get_user_org_safe.user_id, auth.uid());
$function$;

CREATE OR REPLACE FUNCTION public.check_user_org_access(target_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND organization_id = target_org_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_framework_for_changelog(framework_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.governance_frameworks f 
    JOIN public.profiles p ON p.organization_id = f.org_id 
    WHERE f.id = framework_id AND p.id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_org_for_framework(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND organization_id = org_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_policy_access(policy_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.governance_policies pol
    JOIN public.governance_frameworks f ON f.id = pol.framework_id
    JOIN public.profiles p ON p.organization_id = f.org_id 
    WHERE pol.id = policy_id AND p.id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT role IN ('admin', 'super_admin') FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT COALESCE(role, 'user') 
    FROM public.user_roles 
    WHERE user_roles.user_id = COALESCE(get_user_role_safe.user_id, auth.uid())
    LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_role(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_roles.user_id = COALESCE(is_admin_role.user_id, auth.uid())
        AND role IN ('admin', 'super_admin')
    );
$function$;

CREATE OR REPLACE FUNCTION public.user_has_org_access(target_org_id uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = COALESCE(user_has_org_access.user_id, auth.uid()) 
        AND organization_id = target_org_id
    ) OR is_admin_role(user_id);
$function$;

CREATE OR REPLACE FUNCTION public.validate_org_access(table_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT table_org_id = get_user_org_safe() OR is_admin_role();
$function$;

CREATE OR REPLACE FUNCTION public.calculate_session_risk_score(user_id uuid, device_fingerprint_id uuid, location_data jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.check_session_timeout(session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_org_dashboard_metrics(target_org_id uuid DEFAULT get_user_org_safe())
RETURNS TABLE(total_incidents bigint, high_severity_incidents bigint, total_controls bigint, active_controls bigint, total_kris bigint, total_vendors bigint, high_risk_vendors bigint, last_incident_date timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

-- Add comments to document the security fixes
COMMENT ON FUNCTION public.get_user_role_secure(uuid) IS 'Secure function to get user role with proper search_path protection';
COMMENT ON FUNCTION public.is_admin_secure(uuid) IS 'Secure function to check admin status with proper search_path protection';
COMMENT ON FUNCTION public.can_manage_user_roles(uuid) IS 'Secure function to check role management permissions with proper search_path protection';
COMMENT ON FUNCTION public.get_user_org_safe(uuid) IS 'Secure function to get user organization with proper search_path protection';
COMMENT ON FUNCTION public.check_user_org_access(uuid) IS 'Secure function to check organization access with proper search_path protection';