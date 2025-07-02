-- Phase C: Database Schema & Security Optimization (Fixed)
-- Create proper role management system

-- 1. Create app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'analyst', 'user', 'auditor', 'executive');
    END IF;
END $$;

-- 2. First, drop all policies that depend on role columns to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage their org api keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can create roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles from their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;

-- 3. Convert role column to enum type if needed
DO $$
BEGIN
    -- Check if role column needs to be changed to enum type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND column_name = 'role' 
        AND data_type = 'text'
    ) THEN
        -- Drop existing constraints/indexes on role column
        ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
        
        -- Temporarily allow null values to make the conversion
        ALTER TABLE public.user_roles ALTER COLUMN role DROP NOT NULL;
        
        -- Update existing role values to match enum
        UPDATE public.user_roles SET role = 'admin' WHERE role IN ('admin', 'super_admin');
        UPDATE public.user_roles SET role = 'manager' WHERE role = 'manager';
        UPDATE public.user_roles SET role = 'analyst' WHERE role IN ('analyst', 'user');
        UPDATE public.user_roles SET role = 'user' WHERE role NOT IN ('admin', 'super_admin', 'manager', 'analyst', 'auditor', 'executive');
        
        -- Change column type to enum
        ALTER TABLE public.user_roles ALTER COLUMN role TYPE app_role USING role::app_role;
        ALTER TABLE public.user_roles ALTER COLUMN role SET NOT NULL;
    END IF;
END $$;

-- 4. Create security definer function to check user roles (avoiding RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT role 
    FROM public.user_roles 
    WHERE user_roles.user_id = COALESCE(get_user_role.user_id, auth.uid())
    LIMIT 1;
$$;

-- 5. Create helper function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_roles.user_id = has_role.user_id 
        AND role = required_role
    );
$$;

-- 6. Create function to check if user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_roles.user_id = COALESCE(is_admin_user.user_id, auth.uid())
        AND role IN ('super_admin', 'admin')
    );
$$;

-- 7. Create function to get user's organization safely
CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = COALESCE(get_user_organization_id.user_id, auth.uid());
$$;