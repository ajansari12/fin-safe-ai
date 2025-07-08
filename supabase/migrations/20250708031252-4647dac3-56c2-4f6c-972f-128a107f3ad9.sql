-- Update sample data generation to include realistic Canadian banking examples
-- First, let's create realistic organization data for Canadian financial institutions

-- Update existing organizations table with better defaults
INSERT INTO public.organizations (id, name, sector, size, regulatory_guidelines, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Northern Bank of Canada', 'schedule_i_bank', 'large', ARRAY['osfi_e21', 'basel_iii', 'fintrac', 'pipeda'], now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'Prairie Credit Union', 'credit_union', 'medium', ARRAY['osfi_e21', 'pipeda', 'fintrac'], now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Atlantic Trust Company', 'trust_company', 'small', ARRAY['osfi_e21', 'ifrs', 'pipeda'], now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sector = EXCLUDED.sector,
  size = EXCLUDED.size,
  regulatory_guidelines = EXCLUDED.regulatory_guidelines,
  updated_at = now();

-- Create realistic business functions for Canadian banking
INSERT INTO public.business_functions (id, org_id, name, description, criticality, category, owner, created_at, updated_at) VALUES
  ('bf111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Retail Banking Operations', 'Customer accounts, deposits, withdrawals, and basic banking services', 'critical', 'core_banking', 'VP Retail Banking', now(), now()),
  ('bf222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Payment Processing', 'Interac, wire transfers, and electronic payment systems', 'critical', 'payments', 'Director of Payments', now(), now()),
  ('bf333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Commercial Lending', 'Business loans, credit facilities, and commercial banking', 'high', 'lending', 'VP Commercial Banking', now(), now()),
  ('bf444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'IT Infrastructure', 'Core banking systems, networks, and cybersecurity', 'critical', 'technology', 'CIO', now(), now()),
  ('bf555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Risk Management', 'Credit risk, operational risk, and compliance monitoring', 'high', 'risk', 'Chief Risk Officer', now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  criticality = EXCLUDED.criticality,
  category = EXCLUDED.category,
  owner = EXCLUDED.owner,
  updated_at = now();

-- Create realistic incident categories and templates
INSERT INTO public.incident_logs (id, org_id, title, description, severity, category, status, business_function_id, impact_rating, max_response_time_hours, max_resolution_time_hours, reported_at, created_at, updated_at) VALUES
  ('il111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Core Banking System Latency', 'Customer transactions experiencing 30+ second delays during peak hours. Affecting online banking and ATM networks.', 'high', 'system_failure', 'resolved', 'bf111111-1111-1111-1111-111111111111', 7, 4, 24, now() - interval '2 days', now() - interval '2 days', now() - interval '1 day'),
  ('il222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Suspicious Payment Activity Detected', 'Multiple failed authentication attempts from foreign IP addresses targeting commercial banking portal.', 'medium', 'cyber_security', 'in_progress', 'bf222222-2222-2222-2222-222222222222', 5, 24, 72, now() - interval '6 hours', now() - interval '6 hours', now()),
  ('il333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Third-Party Data Center Outage', 'Primary cloud provider experiencing regional outage affecting backup systems and disaster recovery capabilities.', 'critical', 'third_party', 'open', 'bf444444-4444-4444-4444-444444444444', 9, 1, 4, now() - interval '30 minutes', now() - interval '30 minutes', now())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  severity = EXCLUDED.severity,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  updated_at = now();

-- Create realistic vendor profiles for Canadian banking
INSERT INTO public.third_party_profiles (id, org_id, vendor_name, services, criticality, contact_name, contact_email, last_assessment_date, risk_rating, created_at, updated_at) VALUES
  ('tp111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Canadian Core Banking Solutions Inc.', ARRAY['Core Banking Platform', 'Customer Database Management', 'Transaction Processing'], 'critical', 'Sarah Chen', 'sarah.chen@ccbs.ca', now() - interval '90 days', 'medium', now(), now()),
  ('tp222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'SecureCloud Canada Ltd.', ARRAY['Cloud Infrastructure', 'Data Storage', 'Disaster Recovery'], 'high', 'Mike Thompson', 'mike.thompson@securecloud.ca', now() - interval '45 days', 'low', now(), now()),
  ('tp333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'CyberGuard Financial Security', ARRAY['Threat Detection', 'Security Monitoring', 'Incident Response'], 'high', 'Jennifer Liu', 'jennifer.liu@cyberguard.ca', now() - interval '30 days', 'low', now(), now()),
  ('tp444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Interac Association', ARRAY['Interac Debit', 'Interac e-Transfer', 'Payment Network'], 'critical', 'David Rodriguez', 'david.rodriguez@interac.ca', now() - interval '180 days', 'medium', now(), now())
ON CONFLICT (id) DO UPDATE SET
  vendor_name = EXCLUDED.vendor_name,
  services = EXCLUDED.services,
  criticality = EXCLUDED.criticality,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  last_assessment_date = EXCLUDED.last_assessment_date,
  risk_rating = EXCLUDED.risk_rating,
  updated_at = now();

-- Create realistic control examples
INSERT INTO public.controls (id, org_id, title, description, scope, frequency, owner, status, next_test_due_date, created_at, updated_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Multi-Factor Authentication (MFA)', 'Mandatory MFA for all banking system access in compliance with OSFI Cyber Security Self-Assessment requirements', 'All banking system access points', 'continuous', 'IT Security Manager', 'active', now() + interval '30 days', now(), now()),
  ('c2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Daily Transaction Monitoring', 'Automated monitoring of suspicious transactions per FINTRAC requirements and AML compliance', 'All customer transactions', 'daily', 'AML Compliance Officer', 'active', now() + interval '7 days', now(), now()),
  ('c3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Quarterly Penetration Testing', 'External penetration testing of core banking infrastructure per OSFI E-21 guidelines', 'External-facing banking systems', 'quarterly', 'Chief Information Security Officer', 'active', now() + interval '60 days', now(), now()),
  ('c4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Monthly Data Backup Testing', 'Verification of critical data backup and recovery procedures for business continuity', 'All critical banking data', 'monthly', 'IT Operations Manager', 'active', now() + interval '15 days', now(), now())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  scope = EXCLUDED.scope,
  frequency = EXCLUDED.frequency,
  owner = EXCLUDED.owner,
  status = EXCLUDED.status,
  next_test_due_date = EXCLUDED.next_test_due_date,
  updated_at = now();