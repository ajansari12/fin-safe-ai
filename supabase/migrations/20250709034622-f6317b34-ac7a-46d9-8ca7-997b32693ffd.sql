-- Create test data for role-based access control validation

-- Insert test organization for role testing
INSERT INTO public.organizations (name, sector, size, regulatory_guidelines)
SELECT 
  'Test Organization for RBAC',
  'Financial Services',
  'medium',
  ARRAY['OSFI', 'SOX', 'BASEL_III']
WHERE NOT EXISTS (
  SELECT 1 FROM public.organizations WHERE name = 'Test Organization for RBAC'
);

-- Get the organization ID
DO $$
DECLARE
    test_org_id uuid;
BEGIN
    SELECT id INTO test_org_id 
    FROM public.organizations 
    WHERE name = 'Test Organization for RBAC' 
    LIMIT 1;

    -- Only proceed if we found the organization
    IF test_org_id IS NOT NULL THEN
        
        -- Insert test profiles if they don't exist
        INSERT INTO public.profiles (full_name, role, organization_id, onboarding_status, onboarding_completed_at)
        SELECT 'Test Analyst User', 'analyst', test_org_id, 'completed', now()
        WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'Test Analyst User');

        INSERT INTO public.profiles (full_name, role, organization_id, onboarding_status, onboarding_completed_at)
        SELECT 'Test Manager User', 'manager', test_org_id, 'completed', now()
        WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'Test Manager User');

        INSERT INTO public.profiles (full_name, role, organization_id, onboarding_status, onboarding_completed_at)
        SELECT 'Test Reviewer User', 'reviewer', test_org_id, 'completed', now()
        WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'Test Reviewer User');

        INSERT INTO public.profiles (full_name, role, organization_id, onboarding_status, onboarding_completed_at)
        SELECT 'Test Admin User', 'admin', test_org_id, 'completed', now()
        WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'Test Admin User');

        -- Create user roles for the test profiles
        INSERT INTO public.user_roles (user_id, organization_id, role, role_type)
        SELECT p.id, test_org_id, 'analyst', 'analyst'::app_role
        FROM public.profiles p 
        WHERE p.full_name = 'Test Analyst User' 
        AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id);

        INSERT INTO public.user_roles (user_id, organization_id, role, role_type)
        SELECT p.id, test_org_id, 'manager', 'manager'::app_role
        FROM public.profiles p 
        WHERE p.full_name = 'Test Manager User'
        AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id);

        INSERT INTO public.user_roles (user_id, organization_id, role, role_type)
        SELECT p.id, test_org_id, 'reviewer', 'reviewer'::app_role
        FROM public.profiles p 
        WHERE p.full_name = 'Test Reviewer User'
        AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id);

        INSERT INTO public.user_roles (user_id, organization_id, role, role_type)
        SELECT p.id, test_org_id, 'admin', 'admin'::app_role
        FROM public.profiles p 
        WHERE p.full_name = 'Test Admin User'
        AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id);
    END IF;
END $$;