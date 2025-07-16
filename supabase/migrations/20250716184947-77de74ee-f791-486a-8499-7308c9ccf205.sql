-- Step 1: Create sample data without conflicts
-- Update existing organizations to have better test data
UPDATE public.organizations 
SET 
  regulatory_guidelines = CASE 
    WHEN sector = 'banking' THEN '{"OSFI E-21", "PIPEDA", "BCBS 239"}'
    WHEN sector = 'fintech' THEN '{"FINTRAC", "PIPEDA", "PCI DSS"}'
    ELSE '{"General Regulations"}'
  END,
  updated_at = now()
WHERE regulatory_guidelines IS NULL OR regulatory_guidelines = '{}';

-- Step 2: Create KRI definitions for existing organizations
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
  COALESCE(p.id, o.id),
  COALESCE(p.full_name, 'System Admin')
FROM public.organizations o
LEFT JOIN public.profiles p ON p.organization_id = o.id AND p.role = 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.kri_definitions kd 
  WHERE kd.org_id = o.id AND kd.kri_name = 'System Uptime'
);

-- Step 3: Create KRI logs for the past 30 days
INSERT INTO public.kri_logs (kri_id, actual_value, measurement_date, threshold_breached, notes, created_by, created_by_name)
SELECT 
  kd.id,
  98.5 + (random() * 2),
  current_date - interval '1 day' * generate_series(1, 30),
  CASE WHEN random() < 0.1 THEN 'red' ELSE 'none' END,
  'Automated measurement',
  COALESCE(kd.created_by, kd.org_id),
  COALESCE(kd.created_by_name, 'System')
FROM public.kri_definitions kd
WHERE kd.status = 'active'
LIMIT 300;

-- Step 4: Create controls for organizations
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
  COALESCE(p.id, o.id),
  COALESCE(p.full_name, 'System Admin')
FROM public.organizations o
LEFT JOIN public.profiles p ON p.organization_id = o.id AND p.role = 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.controls c 
  WHERE c.org_id = o.id AND c.control_name = 'Access Control Review'
);

-- Step 5: Create incident logs
INSERT INTO public.incident_logs (org_id, title, description, severity, status, category, reported_at, created_by, created_by_name)
SELECT 
  o.id,
  'System Monitoring Alert',
  'Automated system monitoring detected performance degradation',
  'medium',
  'resolved',
  'operational',
  current_date - interval '1 day' * (random() * 30)::integer,
  COALESCE(p.id, o.id),
  COALESCE(p.full_name, 'System Monitor')
FROM public.organizations o
LEFT JOIN public.profiles p ON p.organization_id = o.id AND p.role = 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.incident_logs il 
  WHERE il.org_id = o.id AND il.title = 'System Monitoring Alert'
);

-- Step 6: Create analytics insights
INSERT INTO public.analytics_insights (org_id, insight_type, insight_data, confidence_score, created_by, valid_until)
SELECT 
  o.id,
  'trend_analysis',
  '{"trend": "improving", "metric": "system_uptime", "change": "+2.5%", "period": "last_30_days"}'::jsonb,
  0.85,
  COALESCE(p.id, o.id),
  current_date + interval '30 days'
FROM public.organizations o
LEFT JOIN public.profiles p ON p.organization_id = o.id AND p.role = 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.analytics_insights ai 
  WHERE ai.org_id = o.id AND ai.insight_type = 'trend_analysis'
);

-- Step 7: Fix security warnings by updating critical functions
CREATE OR REPLACE FUNCTION public.user_has_org_access(target_org_id uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = COALESCE(user_has_org_access.user_id, auth.uid()) 
        AND organization_id = target_org_id
    ) OR is_admin_role(user_id);
$function$;

CREATE OR REPLACE FUNCTION public.check_user_org_access(target_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND organization_id = target_org_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_org_access(table_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $function$
    SELECT table_org_id = get_user_org_safe() OR is_admin_role();
$function$;

-- Step 8: Create test user with proper authentication
-- This will help with login testing
INSERT INTO public.profiles (id, full_name, role, organization_id, phone, department, job_title, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Demo User',
  'admin',
  o.id,
  '+1-555-0100',
  'Risk Management',
  'System Administrator',
  now(),
  now()
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.organization_id = o.id AND p.full_name = 'Demo User'
)
LIMIT 1;

-- Step 9: Create user roles for the demo user
INSERT INTO public.user_roles (user_id, organization_id, role, role_type, created_at)
SELECT 
  p.id,
  p.organization_id,
  'admin',
  'admin'::app_role,
  now()
FROM public.profiles p
WHERE p.full_name = 'Demo User' AND p.organization_id IS NOT NULL
ON CONFLICT (user_id, organization_id) DO UPDATE SET 
  role = 'admin',
  role_type = 'admin'::app_role;

-- Step 10: Create some basic governance policies
INSERT INTO public.governance_policies (org_id, policy_name, policy_description, policy_type, status, created_by, created_by_name)
SELECT 
  o.id,
  'Data Security Policy',
  'Guidelines for handling sensitive data and security measures',
  'security',
  'approved',
  COALESCE(p.id, o.id),
  COALESCE(p.full_name, 'Policy Manager')
FROM public.organizations o
LEFT JOIN public.profiles p ON p.organization_id = o.id AND p.role = 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.governance_policies gp 
  WHERE gp.org_id = o.id AND gp.policy_name = 'Data Security Policy'
);