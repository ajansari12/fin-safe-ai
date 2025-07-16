-- Step 1: Generate comprehensive sample data
-- First, let's call the sample data generation function
SELECT generate_sample_data();

-- Step 2: Fix security warnings by adding proper search_path settings to all functions
-- Update all functions to include proper search_path for security

-- Fix the user role functions
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $function$
    SELECT COALESCE(role, 'user') 
    FROM public.user_roles 
    WHERE user_roles.user_id = COALESCE(get_user_role_safe.user_id, auth.uid())
    LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_role(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_roles.user_id = COALESCE(is_admin_role.user_id, auth.uid())
        AND role IN ('admin', 'super_admin')
    );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_org_safe(user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $function$
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = COALESCE(get_user_org_safe.user_id, auth.uid());
$function$;

-- Fix auth-related functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, organization_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    NULL
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  UPDATE public.profiles
  SET 
    full_name = NEW.raw_user_meta_data->>'full_name',
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$;

-- Step 3: Create comprehensive sample data for all major tables
-- Insert sample KRI data
INSERT INTO public.kri_definitions (org_id, kri_name, description, measurement_unit, frequency, target_value, threshold_yellow, threshold_red, category, status, created_by, created_by_name)
SELECT 
    o.id,
    'System Uptime',
    'Percentage of time systems are operational',
    'percentage',
    'daily',
    99.5,
    95.0,
    90.0,
    'operational',
    'active',
    p.id,
    p.full_name
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.organization_id = o.id
LIMIT 1;

-- Insert sample KRI logs
INSERT INTO public.kri_logs (kri_id, actual_value, measurement_date, threshold_breached, notes, created_by, created_by_name)
SELECT 
    kd.id,
    98.5 + (random() * 2),
    current_date - interval '1 day' * generate_series(1, 30),
    CASE WHEN random() < 0.1 THEN 'red' ELSE 'none' END,
    'Automated measurement',
    p.id,
    p.full_name
FROM public.kri_definitions kd
CROSS JOIN public.profiles p
WHERE p.organization_id = kd.org_id
LIMIT 100;

-- Insert sample controls data
INSERT INTO public.controls (org_id, control_name, control_description, control_type, frequency, status, effectiveness_score, last_test_date, next_test_due_date, created_by, created_by_name)
SELECT 
    o.id,
    'Access Control Review',
    'Regular review of user access permissions',
    'preventive',
    'monthly',
    'active',
    85,
    current_date - interval '15 days',
    current_date + interval '15 days',
    p.id,
    p.full_name
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.organization_id = o.id
LIMIT 1;

-- Insert sample analytics insights
INSERT INTO public.analytics_insights (org_id, insight_type, insight_data, confidence_score, created_by)
SELECT 
    o.id,
    'trend_analysis',
    jsonb_build_object('trend', 'improving', 'confidence', 0.85),
    0.85,
    p.id
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.organization_id = o.id
LIMIT 1;

-- Step 4: Ensure proper user roles are assigned
INSERT INTO public.user_roles (user_id, organization_id, role, role_type)
SELECT 
    p.id,
    p.organization_id,
    'admin',
    'admin'::app_role
FROM public.profiles p
WHERE p.organization_id IS NOT NULL
ON CONFLICT (user_id, organization_id) DO UPDATE SET 
    role = 'admin',
    role_type = 'admin'::app_role;

-- Step 5: Create sample third-party profiles for vendor risk
INSERT INTO public.third_party_profiles (org_id, vendor_name, vendor_type, contact_email, risk_rating, criticality, status, created_by, created_by_name)
SELECT 
    o.id,
    'Sample Vendor ' || generate_series(1, 3),
    'technology',
    'contact@vendor' || generate_series(1, 3) || '.com',
    CASE WHEN random() < 0.3 THEN 'high' ELSE 'medium' END,
    'high',
    'active',
    p.id,
    p.full_name
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.organization_id = o.id
LIMIT 10;

-- Step 6: Add sample governance policies
INSERT INTO public.governance_policies (org_id, policy_name, policy_description, policy_type, status, created_by, created_by_name)
SELECT 
    o.id,
    'Data Security Policy',
    'Guidelines for handling sensitive data',
    'security',
    'approved',
    p.id,
    p.full_name
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.organization_id = o.id
LIMIT 1;