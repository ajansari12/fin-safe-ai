-- Phase 1: Fix Critical Privilege Escalation Vulnerability
-- Step 1: Create security definer functions first

CREATE OR REPLACE FUNCTION public.get_user_role_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
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

-- Step 2: Update all dependent RLS policies to use secure functions instead of profiles.role

-- Update auth_settings policies
DROP POLICY IF EXISTS "Admins can manage auth settings" ON public.auth_settings;
DROP POLICY IF EXISTS "Admins can update auth settings from their organization" ON public.auth_settings;

CREATE POLICY "Admins can manage auth settings"
ON public.auth_settings FOR ALL
USING (is_admin_secure() AND org_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can update auth settings from their organization"
ON public.auth_settings FOR UPDATE
USING (is_admin_secure() AND org_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- Update admin_logs policies
DROP POLICY IF EXISTS "Admins can view admin logs from their organization" ON public.admin_logs;

CREATE POLICY "Admins can view admin logs from their organization"
ON public.admin_logs FOR SELECT
USING (is_admin_secure() AND org_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- Update audit_log policies
DROP POLICY IF EXISTS "Admins can view audit logs for their org" ON public.audit_log;

CREATE POLICY "Admins can view audit logs for their org"
ON public.audit_log FOR SELECT
USING (is_admin_secure() AND org_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- Step 3: Now safely remove the role column from profiles
ALTER TABLE public.profiles DROP COLUMN role;