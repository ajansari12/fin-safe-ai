-- PHASE 1: CRITICAL SECURITY FIXES (CORRECTED)

-- 1. Add missing RLS policies for template_customization_rules table
-- This table links to templates through template_id, so we need to check org access through that relationship
CREATE POLICY "Users can view template rules for their org"
ON public.template_customization_rules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.industry_template_libraries itl
    JOIN public.profiles p ON p.organization_id = itl.org_id
    WHERE itl.id = template_customization_rules.template_id
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can create template rules for their org"
ON public.template_customization_rules FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.industry_template_libraries itl
    JOIN public.profiles p ON p.organization_id = itl.org_id
    WHERE itl.id = template_customization_rules.template_id
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can update template rules for their org"
ON public.template_customization_rules FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.industry_template_libraries itl
    JOIN public.profiles p ON p.organization_id = itl.org_id
    WHERE itl.id = template_customization_rules.template_id
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can delete template rules for their org"
ON public.template_customization_rules FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.industry_template_libraries itl
    JOIN public.profiles p ON p.organization_id = itl.org_id
    WHERE itl.id = template_customization_rules.template_id
    AND p.id = auth.uid()
  )
);

-- 2. Fix critical database functions by adding search_path security
-- Update the most critical user-facing SECURITY DEFINER functions

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