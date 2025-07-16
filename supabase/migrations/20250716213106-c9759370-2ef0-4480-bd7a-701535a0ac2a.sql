-- Phase 1: Critical Database Security Fixes - Part 1
-- Create base functions first to resolve dependencies

-- 1. Create base utility functions first
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

CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
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

-- 2. Create security functions
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