-- Step 1: Create sample data for existing organizations
UPDATE public.organizations 
SET 
  regulatory_guidelines = CASE 
    WHEN sector = 'banking' THEN ARRAY['OSFI E-21', 'PIPEDA', 'BCBS 239']
    WHEN sector = 'fintech' THEN ARRAY['FINTRAC', 'PIPEDA', 'PCI DSS']
    ELSE ARRAY['General Regulations']
  END,
  updated_at = now()
WHERE regulatory_guidelines IS NULL OR array_length(regulatory_guidelines, 1) IS NULL;

-- Step 2: Create KRI definitions using correct column names
INSERT INTO public.kri_definitions (org_id, kri_name, name, description, measurement_frequency, target_value, warning_threshold, critical_threshold, status, created_at, updated_at, threshold_id)
SELECT 
  o.id,
  'System Uptime',
  'System Uptime',
  'Percentage of time systems are operational',
  'daily',
  '99.5',
  '95.0',
  '90.0',
  'active',
  now(),
  now(),
  gen_random_uuid()
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.kri_definitions kd 
  WHERE kd.org_id = o.id AND kd.kri_name = 'System Uptime'
);

-- Step 3: Add more KRI definitions for variety
INSERT INTO public.kri_definitions (org_id, kri_name, name, description, measurement_frequency, target_value, warning_threshold, critical_threshold, status, created_at, updated_at, threshold_id)
SELECT 
  o.id,
  'Transaction Processing Time',
  'Transaction Processing Time',
  'Average time to process customer transactions',
  'daily',
  '500',
  '1000',
  '2000',
  'active',
  now(),
  now(),
  gen_random_uuid()
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.kri_definitions kd 
  WHERE kd.org_id = o.id AND kd.kri_name = 'Transaction Processing Time'
);

-- Step 4: Create KRI logs for the past 30 days
INSERT INTO public.kri_logs (kri_id, actual_value, measurement_date, threshold_breached, notes, created_by, created_by_name)
SELECT 
  kd.id,
  CASE 
    WHEN kd.kri_name = 'System Uptime' THEN 98.5 + (random() * 2)
    WHEN kd.kri_name = 'Transaction Processing Time' THEN 400 + (random() * 200)
    ELSE 50 + (random() * 100)
  END,
  current_date - interval '1 day' * generate_series(1, 30),
  CASE WHEN random() < 0.1 THEN 'red' ELSE 'none' END,
  'Automated measurement',
  kd.org_id,
  'System Monitor'
FROM public.kri_definitions kd
WHERE kd.status = 'active'
LIMIT 300;

-- Step 5: Create controls for organizations
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
  o.id,
  'System Admin'
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.controls c 
  WHERE c.org_id = o.id AND c.control_name = 'Access Control Review'
);

-- Step 6: Create incident logs with different severities
INSERT INTO public.incident_logs (org_id, title, description, severity, status, category, reported_at, created_by, created_by_name)
SELECT 
  o.id,
  'System Monitoring Alert',
  'Automated system monitoring detected performance degradation',
  CASE 
    WHEN random() < 0.1 THEN 'critical'
    WHEN random() < 0.3 THEN 'high'
    WHEN random() < 0.7 THEN 'medium'
    ELSE 'low'
  END,
  CASE 
    WHEN random() < 0.6 THEN 'resolved'
    WHEN random() < 0.8 THEN 'in_progress'
    ELSE 'open'
  END,
  'operational',
  current_date - interval '1 day' * (random() * 30)::integer,
  o.id,
  'System Monitor'
FROM public.organizations o
CROSS JOIN generate_series(1, 3)
WHERE NOT EXISTS (
  SELECT 1 FROM public.incident_logs il 
  WHERE il.org_id = o.id AND il.title = 'System Monitoring Alert'
);

-- Step 7: Create analytics insights
INSERT INTO public.analytics_insights (org_id, insight_type, insight_data, confidence_score, created_by, valid_until)
SELECT 
  o.id,
  'trend_analysis',
  '{"trend": "improving", "metric": "system_uptime", "change": "+2.5%", "period": "last_30_days"}'::jsonb,
  0.85,
  o.id,
  current_date + interval '30 days'
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.analytics_insights ai 
  WHERE ai.org_id = o.id AND ai.insight_type = 'trend_analysis'
);

-- Step 8: Create governance policies
INSERT INTO public.governance_policies (org_id, policy_name, policy_description, policy_type, status, created_by, created_by_name)
SELECT 
  o.id,
  'Data Security Policy',
  'Guidelines for handling sensitive data and security measures',
  'security',
  'approved',
  o.id,
  'Policy Manager'
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.governance_policies gp 
  WHERE gp.org_id = o.id AND gp.policy_name = 'Data Security Policy'
);

-- Step 9: Add business functions for better dashboard display
INSERT INTO public.business_functions (org_id, name, criticality, description, created_at, updated_at)
SELECT 
  o.id,
  'Core Operations',
  'critical',
  'Primary business operations and core functions',
  now(),
  now()
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.business_functions bf 
  WHERE bf.org_id = o.id AND bf.name = 'Core Operations'
);

-- Step 10: Fix security warnings by updating critical functions
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