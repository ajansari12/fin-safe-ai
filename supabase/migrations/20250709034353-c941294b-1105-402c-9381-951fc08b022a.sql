-- Seed test users with different roles for comprehensive role-based access control testing

-- First, create some test users in the auth.users table (this would normally be done through auth)
-- Note: In production, users would be created through the authentication flow

-- Insert test organization for role testing
INSERT INTO public.organizations (id, name, sector, size, regulatory_guidelines)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Test Organization for RBAC',
  'Financial Services',
  'medium',
  ARRAY['OSFI', 'SOX', 'BASEL_III']
) ON CONFLICT (id) DO NOTHING;

-- Create organizational profile for the test org
INSERT INTO public.organizational_profiles (
  organization_id,
  preferred_framework_types,
  auto_generate_frameworks,
  framework_preferences,
  employee_count,
  risk_maturity,
  sub_sector
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  ARRAY['risk_management', 'compliance', 'governance'],
  true,
  jsonb_build_object(
    'onboarding_generated', true,
    'selected_types', ARRAY['risk_management', 'compliance', 'governance']
  ),
  150,
  'developing',
  'banking'
) ON CONFLICT (organization_id) DO NOTHING;

-- Insert test profiles for role testing (these would be linked to real auth.users in production)
-- Test Analyst User
INSERT INTO public.profiles (
  id,
  full_name,
  role,
  organization_id,
  email,
  onboarding_status,
  onboarding_completed_at
)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Test Analyst',
  'analyst',
  '11111111-1111-1111-1111-111111111111'::uuid,
  'analyst@testorg.com',
  'completed',
  now()
) ON CONFLICT (id) DO NOTHING;

-- Test Manager User
INSERT INTO public.profiles (
  id,
  full_name,
  role,
  organization_id,
  email,
  onboarding_status,
  onboarding_completed_at
)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Test Manager',
  'manager',
  '11111111-1111-1111-1111-111111111111'::uuid,
  'manager@testorg.com',
  'completed',
  now()
) ON CONFLICT (id) DO NOTHING;

-- Test Reviewer User
INSERT INTO public.profiles (
  id,
  full_name,
  role,
  organization_id,
  email,
  onboarding_status,
  onboarding_completed_at
)
VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  'Test Reviewer',
  'reviewer',
  '11111111-1111-1111-1111-111111111111'::uuid,
  'reviewer@testorg.com',
  'completed',
  now()
) ON CONFLICT (id) DO NOTHING;

-- Test Admin User
INSERT INTO public.profiles (
  id,
  full_name,
  role,
  organization_id,
  email,
  onboarding_status,
  onboarding_completed_at
)
VALUES (
  '55555555-5555-5555-5555-555555555555'::uuid,
  'Test Admin',
  'admin',
  '11111111-1111-1111-1111-111111111111'::uuid,
  'admin@testorg.com',
  'completed',
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert user roles for proper role-based access control
-- Analyst role
INSERT INTO public.user_roles (
  user_id,
  organization_id,
  role,
  role_type
)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'analyst',
  'analyst'::app_role
) ON CONFLICT (user_id, organization_id) DO UPDATE SET
  role = EXCLUDED.role,
  role_type = EXCLUDED.role_type;

-- Manager role
INSERT INTO public.user_roles (
  user_id,
  organization_id,
  role,
  role_type
)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'manager',
  'manager'::app_role
) ON CONFLICT (user_id, organization_id) DO UPDATE SET
  role = EXCLUDED.role,
  role_type = EXCLUDED.role_type;

-- Reviewer role
INSERT INTO public.user_roles (
  user_id,
  organization_id,
  role,
  role_type
)
VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'reviewer',
  'reviewer'::app_role
) ON CONFLICT (user_id, organization_id) DO UPDATE SET
  role = EXCLUDED.role,
  role_type = EXCLUDED.role_type;

-- Admin role
INSERT INTO public.user_roles (
  user_id,
  organization_id,
  role,
  role_type
)
VALUES (
  '55555555-5555-5555-5555-555555555555'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'admin',
  'admin'::app_role
) ON CONFLICT (user_id, organization_id) DO UPDATE SET
  role = EXCLUDED.role,
  role_type = EXCLUDED.role_type;

-- Create sample data for testing role-based access
-- Risk appetite data for testing
INSERT INTO public.risk_appetite_statements (
  org_id,
  statement_text,
  category,
  measurement_criteria,
  tolerance_level,
  created_by,
  created_by_name
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'We maintain a low tolerance for operational risk incidents that could impact customer data',
  'operational',
  'Number of data breach incidents per quarter',
  'low',
  '55555555-5555-5555-5555-555555555555'::uuid,
  'Test Admin'
) ON CONFLICT DO NOTHING;

-- Sample control for testing
INSERT INTO public.controls (
  org_id,
  name,
  description,
  control_type,
  frequency,
  owner,
  status,
  effectiveness_score
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Data Access Control Test',
  'Test control for role-based access validation',
  'preventive',
  'daily',
  'Test Manager',
  'active',
  85
) ON CONFLICT DO NOTHING;

-- Sample incident for testing
INSERT INTO public.incident_logs (
  org_id,
  title,
  description,
  severity,
  status,
  reported_by_name,
  category
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Test Security Incident',
  'Sample incident for role-based access testing',
  'medium',
  'open',
  'Test Analyst',
  'security'
) ON CONFLICT DO NOTHING;

-- Log the seeding activity
INSERT INTO public.admin_logs (
  org_id,
  admin_user_id,
  admin_user_name,
  action_type,
  resource_type,
  action_details
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '55555555-5555-5555-5555-555555555555'::uuid,
  'System',
  'SEED_DATA',
  'test_users',
  jsonb_build_object(
    'action', 'role_based_access_control_test_data_seeded',
    'users_created', 4,
    'roles_assigned', 4,
    'timestamp', now()
  )
);