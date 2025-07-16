-- Step 1: Call the edge function to generate comprehensive sample data
SELECT
  net.http_post(
    url := 'https://ooocjyscnvbahsyryzxp.supabase.co/functions/v1/generate-sample-data',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vb2NqeXNjbnZiYWhzeXJ5enhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcwMzc3MSwiZXhwIjoyMDYzMjc5NzcxfQ.5ZH4tKTzGqnLCQJQKpWAz_Fq4fCfKgfUmkPrJsLsUxs"}'::jsonb,
    body := '{"kriLogsMonths": 6, "vendorCount": 25, "incidentCount": 15, "governanceCount": 50, "includeFailedSLA": true, "mixedSeverity": true}'::jsonb
  );

-- Step 2: Fix remaining security warnings by updating more functions with proper search_path
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

-- Step 3: Update more critical functions with security improvements
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $function$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $function$
  SELECT role IN ('admin', 'super_admin') FROM public.profiles WHERE id = auth.uid();
$function$;

-- Step 4: Create additional sample data for better dashboard visualization
-- Add more KRI definitions for existing organizations
INSERT INTO public.kri_definitions (org_id, kri_name, description, measurement_unit, frequency, target_value, threshold_yellow, threshold_red, category, status, created_by, created_by_name)
SELECT 
    o.id,
    unnest(ARRAY[
        'Transaction Processing Time',
        'Customer Satisfaction Score',
        'System Response Time',
        'Data Quality Score',
        'Security Incident Rate'
    ]),
    unnest(ARRAY[
        'Average time to process customer transactions',
        'Customer satisfaction rating from surveys',
        'Average response time for system queries',
        'Percentage of data meeting quality standards',
        'Number of security incidents per month'
    ]),
    unnest(ARRAY['milliseconds', 'percentage', 'milliseconds', 'percentage', 'count']),
    'daily',
    unnest(ARRAY[500, 90, 100, 95, 0]),
    unnest(ARRAY[1000, 80, 200, 85, 2]),
    unnest(ARRAY[2000, 70, 500, 75, 5]),
    unnest(ARRAY['operational', 'customer', 'technical', 'data', 'security']),
    'active',
    p.id,
    p.full_name
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.organization_id = o.id AND p.role = 'admin'
LIMIT 20;

-- Step 5: Generate recent KRI logs for the dashboard
INSERT INTO public.kri_logs (kri_id, actual_value, measurement_date, threshold_breached, notes, created_by, created_by_name)
SELECT 
    kd.id,
    CASE 
        WHEN kd.measurement_unit = 'percentage' THEN (random() * 20 + 80)
        WHEN kd.measurement_unit = 'milliseconds' THEN (random() * 1000 + 100)
        WHEN kd.measurement_unit = 'count' THEN (random() * 5)::integer
        ELSE (random() * 100)
    END,
    current_date - interval '1 day' * generate_series(1, 30),
    CASE 
        WHEN random() < 0.05 THEN 'red'
        WHEN random() < 0.15 THEN 'yellow'
        ELSE 'none'
    END,
    'Automated data collection',
    p.id,
    p.full_name
FROM public.kri_definitions kd
JOIN public.profiles p ON p.organization_id = kd.org_id
WHERE kd.status = 'active' AND p.role = 'admin'
LIMIT 500;

-- Step 6: Add more control test results
INSERT INTO public.control_test_results (control_id, test_date, test_result, effectiveness_rating, risk_reduction_impact, tested_by, tested_by_name, notes)
SELECT 
    c.id,
    current_date - interval '1 day' * (random() * 30)::integer,
    CASE WHEN random() < 0.9 THEN 'pass' ELSE 'fail' END,
    (random() * 30 + 70)::integer,
    (random() * 30 + 70)::integer,
    p.id,
    p.full_name,
    'Regular control testing'
FROM public.controls c
JOIN public.profiles p ON p.organization_id = c.org_id
WHERE c.status = 'active' AND p.role IN ('admin', 'auditor')
LIMIT 50;