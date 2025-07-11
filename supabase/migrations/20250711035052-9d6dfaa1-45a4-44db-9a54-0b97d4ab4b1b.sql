-- Phase 1: Fix Critical Privilege Escalation Vulnerability

-- Remove role column from profiles table to prevent direct role manipulation
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Create enhanced security definer functions for role checking
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

-- Update user_roles RLS policies to use secure functions
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles in their org" ON public.user_roles;

-- Secure RLS policies for user_roles table
CREATE POLICY "Users can view roles in their organization"
ON public.user_roles FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    )
);

CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (
    can_manage_user_roles(organization_id)
);

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
USING (
    can_manage_user_roles(organization_id)
);

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
USING (
    can_manage_user_roles(organization_id)
);

-- Update profiles RLS policies to remove role-based access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile (non-role fields only)"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Enhanced admin logs for role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log role changes to admin_logs
    INSERT INTO public.admin_logs (
        org_id,
        admin_user_id,
        admin_user_name,
        action_type,
        resource_type,
        resource_id,
        resource_name,
        action_details
    )
    SELECT 
        COALESCE(NEW.organization_id, OLD.organization_id),
        auth.uid(),
        COALESCE(p.full_name, 'System'),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'CREATE_ROLE'
            WHEN TG_OP = 'UPDATE' THEN 'UPDATE_ROLE'
            WHEN TG_OP = 'DELETE' THEN 'DELETE_ROLE'
        END,
        'user_role',
        COALESCE(NEW.user_id::text, OLD.user_id::text),
        COALESCE(target_p.full_name, 'Unknown User'),
        jsonb_build_object(
            'old_role', OLD.role,
            'new_role', NEW.role,
            'organization_id', COALESCE(NEW.organization_id, OLD.organization_id),
            'timestamp', now()
        )
    FROM public.profiles p
    LEFT JOIN public.profiles target_p ON target_p.id = COALESCE(NEW.user_id, OLD.user_id)
    WHERE p.id = auth.uid();
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for role change logging
DROP TRIGGER IF EXISTS log_user_role_changes ON public.user_roles;
CREATE TRIGGER log_user_role_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_role_change();

-- Add input validation for role assignments
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate role is in allowed values
    IF NEW.role NOT IN ('admin', 'analyst', 'reviewer', 'auditor', 'executive', 'super_admin') THEN
        RAISE EXCEPTION 'Invalid role: %', NEW.role;
    END IF;
    
    -- Validate organization exists
    IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = NEW.organization_id) THEN
        RAISE EXCEPTION 'Invalid organization ID: %', NEW.organization_id;
    END IF;
    
    -- Validate user exists and belongs to organization
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = NEW.user_id AND organization_id = NEW.organization_id
    ) THEN
        RAISE EXCEPTION 'User does not belong to organization';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create validation trigger
DROP TRIGGER IF EXISTS validate_role_assignment_trigger ON public.user_roles;
CREATE TRIGGER validate_role_assignment_trigger
    BEFORE INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_role_assignment();

-- Session security: Reduce session timeout and add invalidation
CREATE OR REPLACE FUNCTION public.invalidate_user_sessions_on_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Invalidate all sessions for the user when their role changes
    IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
        UPDATE public.authentication_sessions
        SET is_active = false
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invalidate_sessions_on_role_change ON public.user_roles;
CREATE TRIGGER invalidate_sessions_on_role_change
    AFTER UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.invalidate_user_sessions_on_role_change();