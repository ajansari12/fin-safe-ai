-- Phase C: Database Schema & Security Optimization
-- Create proper role management system

-- 1. Create app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'analyst', 'user', 'auditor', 'executive');
    END IF;
END $$;

-- 2. Add proper role column to user_roles table if needed
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

-- 3. Create security definer function to check user roles (avoiding RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT role 
    FROM public.user_roles 
    WHERE user_roles.user_id = get_user_role.user_id 
    LIMIT 1;
$$;

-- 4. Create helper function to check if user has specific role
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

-- 5. Create function to check if user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_roles.user_id = COALESCE(is_admin.user_id, auth.uid())
        AND role IN ('super_admin', 'admin')
    );
$$;

-- 6. Create function to get user's organization safely
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

-- 7. Add unique constraint for user_id to prevent duplicate role assignments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_user_id_unique'
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- 8. Update RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can create roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles from their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;

-- Create better RLS policies
CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL USING (is_admin());

CREATE POLICY "Users can view their own role" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view roles in their organization" ON public.user_roles
FOR SELECT USING (
    organization_id = get_user_organization_id() 
    OR is_admin()
);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON public.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 10. Create trigger to automatically assign default role to new users
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Assign default 'user' role when profile is created
    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (NEW.id, NEW.organization_id, 'user'::app_role)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS trigger_assign_default_role ON public.profiles;
CREATE TRIGGER trigger_assign_default_role
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION assign_default_user_role();