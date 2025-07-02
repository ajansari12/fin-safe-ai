-- Seed sample data for demo and testing purposes

-- Insert sample organization if not exists
INSERT INTO public.organizations (id, name, sector, size, regulatory_guidelines) 
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Demo Financial Institution',
  'financial_services',
  'large',
  ARRAY['OSFI', 'COSO', 'ISO27001']
) 
ON CONFLICT (id) DO NOTHING;

-- Insert sample profile for admin user
INSERT INTO public.profiles (id, organization_id, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Demo Admin User',
  'admin'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample business functions
INSERT INTO public.business_functions (id, org_id, function_name, criticality, description) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Trading Operations', 'critical', 'Primary trading and market making activities'),
('11111111-1111-1111-1111-111111111112'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Lending Operations', 'high', 'Commercial and retail lending processes'),
('11111111-1111-1111-1111-111111111113'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Technology Infrastructure', 'critical', 'Core banking systems and IT infrastructure'),
('11111111-1111-1111-1111-111111111114'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Compliance Operations', 'high', 'Regulatory compliance and reporting'),
('11111111-1111-1111-1111-111111111115'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Customer Operations', 'medium', 'Customer service and account management')
ON CONFLICT (id) DO NOTHING;

-- Insert sample incidents for the last 6 months
INSERT INTO public.incident_logs (id, org_id, title, description, severity, status, category, reported_at, resolved_at) VALUES
('22222222-2222-2222-2222-222222222221'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Trading System Outage', 'Primary trading platform experienced 2-hour outage', 'critical', 'resolved', 'operational', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '2 hours'),
('22222222-2222-2222-2222-222222222222'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Cybersecurity Breach Attempt', 'Failed attempt to access customer database', 'high', 'resolved', 'cyber', NOW() - INTERVAL '45 days', NOW() - INTERVAL '44 days'),
('22222222-2222-2222-2222-222222222223'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Vendor Service Disruption', 'Third-party payment processor service interruption', 'medium', 'resolved', 'third_party', NOW() - INTERVAL '60 days', NOW() - INTERVAL '59 days'),
('22222222-2222-2222-2222-222222222224'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Compliance Reporting Delay', 'Monthly regulatory report submitted late', 'low', 'resolved', 'compliance', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days'),
('22222222-2222-2222-2222-222222222225'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Data Center Power Issue', 'Backup generator failure during maintenance', 'high', 'in_progress', 'operational', NOW() - INTERVAL '7 days', NULL),
('22222222-2222-2222-2222-222222222226'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Network Security Alert', 'Unusual network traffic detected', 'medium', 'open', 'cyber', NOW() - INTERVAL '3 days', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample controls
INSERT INTO public.controls (id, org_id, control_name, control_type, status, frequency, last_test_date, effectiveness_score, risk_reduction_score) VALUES
('33333333-3333-3333-3333-333333333331'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Multi-Factor Authentication', 'access_control', 'active', 'continuous', NOW() - INTERVAL '30 days', 95, 85),
('33333333-3333-3333-3333-333333333332'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Data Backup and Recovery', 'data_protection', 'active', 'daily', NOW() - INTERVAL '1 day', 92, 90),
('33333333-3333-3333-3333-333333333333'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Vendor Due Diligence', 'third_party', 'active', 'quarterly', NOW() - INTERVAL '60 days', 87, 75),
('33333333-3333-3333-3333-333333333334'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Transaction Monitoring', 'operational', 'active', 'continuous', NOW() - INTERVAL '7 days', 89, 80),
('33333333-3333-3333-3333-333333333335'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Change Management Process', 'process', 'active', 'monthly', NOW() - INTERVAL '15 days', 85, 70)
ON CONFLICT (id) DO NOTHING;

-- Insert sample third party vendors
INSERT INTO public.third_party_profiles (id, org_id, vendor_name, vendor_type, risk_rating, status, last_assessment_date) VALUES
('44444444-4444-4444-4444-444444444441'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'TechPay Solutions', 'payment_processor', 'medium', 'active', NOW() - INTERVAL '90 days'),
('44444444-4444-4444-4444-444444444442'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'CloudSecure Hosting', 'technology', 'low', 'active', NOW() - INTERVAL '45 days'),
('44444444-4444-4444-4444-444444444443'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'DataAnalytics Corp', 'analytics', 'high', 'active', NOW() - INTERVAL '180 days'),
('44444444-4444-4444-4444-444444444444'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Compliance Consultants LLC', 'consulting', 'low', 'active', NOW() - INTERVAL '60 days'),
('44444444-4444-4444-4444-444444444445'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'SecureComms Inc', 'communication', 'medium', 'under_review', NOW() - INTERVAL '120 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample KRI definitions
INSERT INTO public.kri_definitions (id, org_id, kri_name, metric_category, status, warning_threshold, critical_threshold, measurement_frequency) VALUES
('55555555-5555-5555-5555-555555555551'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'System Availability', 'operational', 'active', 95.0, 90.0, 'daily'),
('55555555-5555-5555-5555-555555555552'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Cybersecurity Events', 'security', 'active', 5.0, 10.0, 'daily'),
('55555555-5555-5555-5555-555555555553'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Vendor Risk Score', 'third_party', 'active', 3.0, 4.0, 'monthly'),
('55555555-5555-5555-5555-555555555554'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Compliance Violations', 'compliance', 'active', 2.0, 5.0, 'monthly')
ON CONFLICT (id) DO NOTHING;

-- Insert sample KRI logs for the last 30 days
INSERT INTO public.kri_logs (id, kri_id, measurement_date, actual_value, threshold_breached) 
SELECT 
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555551'::uuid,
  date_series.date,
  CASE 
    WHEN random() < 0.1 THEN 88 + random() * 7  -- 10% chance of critical breach
    WHEN random() < 0.25 THEN 93 + random() * 4  -- 25% chance of warning
    ELSE 96 + random() * 4  -- Normal range
  END as actual_value,
  CASE 
    WHEN random() < 0.1 THEN 'critical'
    WHEN random() < 0.25 THEN 'warning'
    ELSE NULL
  END as threshold_breached
FROM generate_series(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE,
  INTERVAL '1 day'
) AS date_series(date);

-- Insert control test results
INSERT INTO public.control_tests (id, org_id, control_id, test_date, effectiveness_rating, risk_reduction_impact, test_result) VALUES
('66666666-6666-6666-6666-666666666661'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '33333333-3333-3333-3333-333333333331'::uuid, NOW() - INTERVAL '30 days', 95, 85, 'pass'),
('66666666-6666-6666-6666-666666666662'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '33333333-3333-3333-3333-333333333332'::uuid, NOW() - INTERVAL '1 day', 92, 90, 'pass'),
('66666666-6666-6666-6666-666666666663'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, NOW() - INTERVAL '60 days', 87, 75, 'pass'),
('66666666-6666-6666-6666-666666666664'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '33333333-3333-3333-3333-333333333334'::uuid, NOW() - INTERVAL '7 days', 89, 80, 'pass'),
('66666666-6666-6666-6666-666666666665'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '33333333-3333-3333-3333-333333333335'::uuid, NOW() - INTERVAL '15 days', 85, 70, 'pass')
ON CONFLICT (id) DO NOTHING;