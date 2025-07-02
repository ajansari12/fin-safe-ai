-- Phase C: Database Schema & Security Optimization (Continue)
-- Add constraints, indexes, and security functions (without altering existing role column)

-- 1. Create app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'analyst', 'user', 'auditor', 'executive');
    END IF;
END $$;

-- 2. Add new role_type column to user_roles for future migration
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND column_name = 'role_type'
    ) THEN
        ALTER TABLE public.user_roles ADD COLUMN role_type app_role;
        
        -- Populate the new column with mapped values
        UPDATE public.user_roles SET role_type = 'admin'::app_role WHERE role IN ('admin', 'super_admin');
        UPDATE public.user_roles SET role_type = 'manager'::app_role WHERE role = 'manager';
        UPDATE public.user_roles SET role_type = 'analyst'::app_role WHERE role IN ('analyst', 'user');
        UPDATE public.user_roles SET role_type = 'user'::app_role WHERE role_type IS NULL;
    END IF;
END $$;

-- 3. Create security definer functions for role checking (avoiding RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(role, 'user') 
    FROM public.user_roles 
    WHERE user_roles.user_id = COALESCE(get_user_role_safe.user_id, auth.uid())
    LIMIT 1;
$$;

-- 4. Create function to check if user has admin privileges safely
CREATE OR REPLACE FUNCTION public.is_admin_role(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_roles.user_id = COALESCE(is_admin_role.user_id, auth.uid())
        AND role IN ('admin', 'super_admin')
    );
$$;

-- 5. Create function to get user's organization safely
CREATE OR REPLACE FUNCTION public.get_user_org_safe(user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = COALESCE(get_user_org_safe.user_id, auth.uid());
$$;

-- 6. Create critical indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_org ON public.user_roles(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id_org ON public.profiles(id, organization_id);

-- 7. Add missing indexes on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_documents_org_created ON public.documents(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_logs_org_created ON public.incident_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_controls_org_status ON public.controls(org_id, status);
CREATE INDEX IF NOT EXISTS idx_kri_definitions_org ON public.kri_definitions(org_id);
CREATE INDEX IF NOT EXISTS idx_third_party_profiles_org ON public.third_party_profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_governance_frameworks_org ON public.governance_frameworks(org_id);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_org_generated ON public.analytics_insights(org_id, generated_at DESC);

-- 8. Add constraints for data integrity
ALTER TABLE public.profiles ADD CONSTRAINT IF NOT EXISTS chk_profiles_role_valid 
CHECK (role IN ('super_admin', 'admin', 'manager', 'analyst', 'user', 'auditor', 'executive'));

-- 9. Create function for efficient organization access checking
CREATE OR REPLACE FUNCTION public.user_has_org_access(target_org_id uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = COALESCE(user_has_org_access.user_id, auth.uid()) 
        AND organization_id = target_org_id
    ) OR is_admin_role(user_id);
$$;