-- Simple test data for role-based access control validation

-- Insert test organization for role testing (using a simple insert)
INSERT INTO public.organizations (name, sector, size, regulatory_guidelines)
SELECT 
  'Test Organization for RBAC',
  'Financial Services',
  'medium',
  ARRAY['OSFI', 'SOX', 'BASEL_III']
WHERE NOT EXISTS (
  SELECT 1 FROM public.organizations WHERE name = 'Test Organization for RBAC'
);

-- Get the organization ID for the test org
-- Insert sample test profiles if they don't exist
INSERT INTO public.profiles (full_name, role, email, onboarding_status, onboarding_completed_at)
SELECT 'Test Analyst User', 'analyst', 'test.analyst@example.com', 'completed', now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'test.analyst@example.com');

INSERT INTO public.profiles (full_name, role, email, onboarding_status, onboarding_completed_at)
SELECT 'Test Manager User', 'manager', 'test.manager@example.com', 'completed', now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'test.manager@example.com');

INSERT INTO public.profiles (full_name, role, email, onboarding_status, onboarding_completed_at)
SELECT 'Test Reviewer User', 'reviewer', 'test.reviewer@example.com', 'completed', now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'test.reviewer@example.com');

INSERT INTO public.profiles (full_name, role, email, onboarding_status, onboarding_completed_at)
SELECT 'Test Admin User', 'admin', 'test.admin@example.com', 'completed', now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'test.admin@example.com');