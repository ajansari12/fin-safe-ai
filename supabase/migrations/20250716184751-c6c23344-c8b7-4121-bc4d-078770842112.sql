-- Step 1: Create comprehensive sample data directly
-- First, create additional organizations
INSERT INTO public.organizations (name, sector, size, regulatory_guidelines, created_at, updated_at)
VALUES 
  ('First National Bank', 'banking', 'large', '{"OSFI E-21", "PIPEDA", "BCBS 239"}', now(), now()),
  ('TechCorp Financial', 'fintech', 'medium', '{"FINTRAC", "PIPEDA", "PCI DSS"}', now(), now()),
  ('Regional Credit Union', 'credit_union', 'small', '{"OSFI E-21", "CUDIC"}', now(), now())
ON CONFLICT (name) DO NOTHING;

-- Step 2: Create test users for authentication
-- Create profiles for existing organizations
INSERT INTO public.profiles (id, full_name, role, organization_id, phone, department, job_title, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Test Admin User',
  'admin',
  o.id,
  '+1-555-0123',
  'Risk Management',
  'Risk Manager',
  now(),
  now()
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.organization_id = o.id AND p.role = 'admin'
)
LIMIT 5;

-- Step 3: Create user roles for proper access control
INSERT INTO public.user_roles (user_id, organization_id, role, role_type, created_at)
SELECT 
  p.id,
  p.organization_id,
  'admin',
  'admin'::app_role,
  now()
FROM public.profiles p
WHERE p.role = 'admin' AND p.organization_id IS NOT NULL
ON CONFLICT (user_id, organization_id) DO UPDATE SET 
  role = 'admin',
  role_type = 'admin'::app_role;

-- Step 4: Create KRI definitions for each organization
INSERT INTO public.kri_definitions (org_id, kri_name, description, measurement_unit, frequency, target_value, threshold_yellow, threshold_red, category, status, created_by, created_by_name)
SELECT 
  o.id,
  unnest(ARRAY[
    'System Uptime',
    'Transaction Processing Time',
    'Customer Satisfaction Score',
    'Security Incident Rate',
    'Data Quality Score',
    'Operational Efficiency',
    'Risk Score',
    'Compliance Score'
  ]),
  unnest(ARRAY[
    'Percentage of time systems are operational',
    'Average time to process transactions',
    'Customer satisfaction rating',
    'Number of security incidents per month',
    'Data quality percentage',
    'Operational efficiency rating',
    'Overall risk assessment score',
    'Compliance adherence percentage'
  ]),
  unnest(ARRAY['percentage', 'milliseconds', 'percentage', 'count', 'percentage', 'percentage', 'score', 'percentage']),
  'daily',
  unnest(ARRAY[99.5, 500, 90, 0, 95, 85, 70, 95]),
  unnest(ARRAY[95.0, 1000, 80, 2, 85, 75, 80, 85]),
  unnest(ARRAY[90.0, 2000, 70, 5, 75, 65, 90, 75]),
  unnest(ARRAY['operational', 'operational', 'customer', 'security', 'data', 'operational', 'risk', 'compliance']),
  'active',
  p.id,
  p.full_name
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.organization_id = o.id AND p.role = 'admin'
LIMIT 32;

-- Step 5: Generate KRI logs for the past 30 days
INSERT INTO public.kri_logs (kri_id, actual_value, measurement_date, threshold_breached, notes, created_by, created_by_name)
SELECT 
  kd.id,
  CASE 
    WHEN kd.measurement_unit = 'percentage' THEN (random() * 20 + 80)
    WHEN kd.measurement_unit = 'milliseconds' THEN (random() * 1000 + 100)
    WHEN kd.measurement_unit = 'count' THEN (random() * 5)::integer
    WHEN kd.measurement_unit = 'score' THEN (random() * 30 + 60)
    ELSE (random() * 100)
  END,
  current_date - interval '1 day' * generate_series(1, 30),
  CASE 
    WHEN random() < 0.05 THEN 'red'
    WHEN random() < 0.15 THEN 'yellow'
    ELSE 'none'
  END,
  'Automated measurement',
  p.id,
  p.full_name
FROM public.kri_definitions kd
JOIN public.profiles p ON p.organization_id = kd.org_id
WHERE kd.status = 'active' AND p.role = 'admin'
LIMIT 1000;

-- Step 6: Create controls for each organization
INSERT INTO public.controls (org_id, control_name, control_description, control_type, frequency, status, effectiveness_score, last_test_date, next_test_due_date, created_by, created_by_name)
SELECT 
  o.id,
  unnest(ARRAY[
    'Access Control Review',
    'Data Backup Verification',
    'Security Patch Management',
    'Vendor Risk Assessment',
    'Incident Response Testing',
    'Compliance Monitoring',
    'Business Continuity Planning',
    'Change Management Process'
  ]),
  unnest(ARRAY[
    'Regular review of user access permissions',
    'Verification of data backup integrity',
    'Management of security patches and updates',
    'Assessment of third-party vendor risks',
    'Testing of incident response procedures',
    'Monitoring of regulatory compliance',
    'Planning for business continuity',
    'Process for managing system changes'
  ]),
  unnest(ARRAY['preventive', 'detective', 'preventive', 'detective', 'corrective', 'detective', 'preventive', 'preventive']),
  unnest(ARRAY['monthly', 'weekly', 'weekly', 'quarterly', 'semi-annually', 'monthly', 'annually', 'ongoing']),
  'active',
  (random() * 20 + 75)::integer,
  current_date - interval '1 day' * (random() * 30)::integer,
  current_date + interval '1 day' * (random() * 30 + 30)::integer,
  p.id,
  p.full_name
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.organization_id = o.id AND p.role = 'admin'
LIMIT 32;

-- Step 7: Create incident logs
INSERT INTO public.incident_logs (org_id, title, description, severity, status, category, reported_at, reported_by, assigned_to, created_by, created_by_name)
SELECT 
  o.id,
  unnest(ARRAY[
    'System Outage - Core Platform',
    'Data Security Incident',
    'Payment Processing Failure',
    'Network Connectivity Issues',
    'Vendor Service Disruption',
    'Database Performance Issues',
    'Authentication System Failure',
    'Regulatory Compliance Gap'
  ]),
  unnest(ARRAY[
    'Core banking platform experienced unexpected downtime',
    'Unauthorized access attempt detected',
    'Payment processing system failure affecting transactions',
    'Network connectivity issues impacting operations',
    'Third-party vendor service disruption',
    'Database performance degradation affecting response times',
    'Authentication system temporary failure',
    'Gap identified in regulatory compliance documentation'
  ]),
  unnest(ARRAY['critical', 'high', 'high', 'medium', 'medium', 'low', 'high', 'medium']),
  unnest(ARRAY['resolved', 'in_progress', 'resolved', 'open', 'resolved', 'in_progress', 'resolved', 'open']),
  unnest(ARRAY['operational', 'security', 'operational', 'technical', 'vendor', 'technical', 'security', 'compliance']),
  current_date - interval '1 day' * (random() * 30)::integer,
  p.id,
  p.id,
  p.id,
  p.full_name
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.organization_id = o.id AND p.role = 'admin'
LIMIT 32;

-- Step 8: Create analytics insights
INSERT INTO public.analytics_insights (org_id, insight_type, insight_data, confidence_score, created_by, valid_until)
SELECT 
  o.id,
  unnest(ARRAY['trend_analysis', 'risk_assessment', 'performance_metrics', 'compliance_status']),
  unnest(ARRAY[
    '{"trend": "improving", "metric": "system_uptime", "change": "+2.5%"}',
    '{"risk_level": "medium", "factors": ["vendor_concentration", "system_age"], "recommendation": "diversify_vendors"}',
    '{"performance": "stable", "key_metrics": {"response_time": "good", "throughput": "excellent"}}',
    '{"status": "compliant", "frameworks": ["SOX", "PIPEDA"], "next_review": "2024-03-15"}'
  ]::jsonb[]),
  (random() * 0.3 + 0.7),
  p.id,
  current_date + interval '30 days'
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.organization_id = o.id AND p.role = 'admin'
LIMIT 16;

-- Step 9: Fix security warnings by updating more functions
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

-- Step 10: Create governance policies
INSERT INTO public.governance_policies (org_id, policy_name, policy_description, policy_type, status, created_by, created_by_name)
SELECT 
  o.id,
  unnest(ARRAY[
    'Data Security Policy',
    'Risk Management Framework',
    'Incident Response Policy',
    'Vendor Management Policy',
    'Business Continuity Policy'
  ]),
  unnest(ARRAY[
    'Guidelines for handling sensitive data and security measures',
    'Comprehensive framework for managing organizational risks',
    'Procedures for responding to security and operational incidents',
    'Standards for managing third-party vendor relationships',
    'Plans and procedures for business continuity operations'
  ]),
  unnest(ARRAY['security', 'risk', 'operational', 'vendor', 'continuity']),
  'approved',
  p.id,
  p.full_name
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.organization_id = o.id AND p.role = 'admin'
LIMIT 20;