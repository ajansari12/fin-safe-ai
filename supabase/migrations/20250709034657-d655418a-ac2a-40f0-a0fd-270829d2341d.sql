-- Create test data for role-based access control validation with proper UUIDs

-- Insert test organization for role testing
INSERT INTO public.organizations (name, sector, size, regulatory_guidelines)
SELECT 
  'RBAC Test Organization',
  'Financial Services',
  'medium',
  ARRAY['OSFI', 'SOX', 'BASEL_III']
WHERE NOT EXISTS (
  SELECT 1 FROM public.organizations WHERE name = 'RBAC Test Organization'
);

-- Create test profiles with explicit UUIDs to avoid conflicts
INSERT INTO public.profiles (id, full_name, role, organization_id, onboarding_status, onboarding_completed_at)
SELECT 
  gen_random_uuid(),
  'RBAC Test Analyst', 
  'analyst', 
  (SELECT id FROM public.organizations WHERE name = 'RBAC Test Organization' LIMIT 1),
  'completed', 
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'RBAC Test Analyst')
AND EXISTS (SELECT 1 FROM public.organizations WHERE name = 'RBAC Test Organization');

INSERT INTO public.profiles (id, full_name, role, organization_id, onboarding_status, onboarding_completed_at)
SELECT 
  gen_random_uuid(),
  'RBAC Test Manager', 
  'manager', 
  (SELECT id FROM public.organizations WHERE name = 'RBAC Test Organization' LIMIT 1),
  'completed', 
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'RBAC Test Manager')
AND EXISTS (SELECT 1 FROM public.organizations WHERE name = 'RBAC Test Organization');

INSERT INTO public.profiles (id, full_name, role, organization_id, onboarding_status, onboarding_completed_at)
SELECT 
  gen_random_uuid(),
  'RBAC Test Admin', 
  'admin', 
  (SELECT id FROM public.organizations WHERE name = 'RBAC Test Organization' LIMIT 1),
  'completed', 
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE full_name = 'RBAC Test Admin')
AND EXISTS (SELECT 1 FROM public.organizations WHERE name = 'RBAC Test Organization');