-- Insert sample data for framework generation tables

-- Insert sample data for sector thresholds
INSERT INTO public.sector_thresholds (sector, sub_sector, metric, recommended_value, rationale, regulatory_basis) VALUES
('banking', 'commercial', 'Core Payment System RTO', '4 hours', 'OSFI guidelines require critical payment systems to recover within 4 hours to maintain financial stability', 'OSFI E-21'),
('banking', 'commercial', 'Customer Data RPO', '15 minutes', 'Banking regulations require minimal data loss for customer transaction records', 'OSFI E-21'),
('banking', 'commercial', 'System Availability', '99.9%', 'Industry standard for critical banking services to ensure customer access', 'Industry Standard'),
('insurance', 'property', 'Claims Processing RTO', '8 hours', 'Claims processing systems should recover within business day to maintain customer service', 'Provincial Guidelines'),
('fintech', 'payments', 'Digital Service RTO', '2 hours', 'Digital-first services require rapid recovery to maintain competitive advantage', 'Industry Best Practice');

-- Insert sample framework generation rules
INSERT INTO public.framework_generation_rules (rule_name, org_criteria, framework_type, rule_definition) VALUES
('Small Bank Governance', '{"employee_count": {"max": 100}, "sector": "banking"}', 'governance', '{"committees": ["audit", "risk"], "board_size": "5-7", "independence_ratio": 0.5}'),
('Large Enterprise Risk', '{"employee_count": {"min": 1000}}', 'risk_appetite', '{"risk_categories": ["strategic", "operational", "financial", "compliance"], "tolerance_levels": 5}'),
('FinTech Controls', '{"sector": "fintech"}', 'control', '{"focus_areas": ["cyber", "operational", "third_party"], "automation_level": "high"}');

-- Insert sample control library items
INSERT INTO public.control_libraries (control_name, control_description, control_type, risk_categories, implementation_guidance, effectiveness_rating, regulatory_references) VALUES
('Multi-Factor Authentication', 'Requires users to provide multiple factors of authentication', 'technical', ARRAY['cyber', 'operational'], 'Implement for all privileged accounts and external access', 4, ARRAY['OSFI E-21', 'ISO 27001']),
('Data Encryption', 'Encrypts sensitive data at rest and in transit', 'technical', ARRAY['cyber', 'compliance'], 'Use AES-256 encryption for data at rest, TLS 1.3 for data in transit', 5, ARRAY['OSFI E-21', 'PIPEDA']),
('Change Management Process', 'Formal process for managing system changes', 'process', ARRAY['operational', 'cyber'], 'Implement approval workflow with testing requirements', 4, ARRAY['OSFI E-21', 'ISO 22301']),
('Vendor Risk Assessment', 'Regular assessment of third-party vendors', 'process', ARRAY['third_party', 'operational'], 'Annual assessments with continuous monitoring', 3, ARRAY['OSFI E-21']);

-- Insert sample regulatory mapping
INSERT INTO public.regulatory_mapping (regulation_name, regulation_code, applicable_sectors, requirements, compliance_timeline, enforcement_date) VALUES
('OSFI Guideline E-21', 'E-21', ARRAY['banking', 'insurance'], '{"operational_resilience": "mandatory", "testing": "annual", "governance": "board_oversight"}', '12 months', '2023-01-01'),
('ISO 22301', 'ISO-22301', ARRAY['banking', 'insurance', 'fintech'], '{"business_continuity": "mandatory", "testing": "bi_annual", "documentation": "required"}', '6 months', null),
('Privacy Act', 'PIPEDA', ARRAY['banking', 'insurance', 'fintech'], '{"data_protection": "mandatory", "breach_notification": "72_hours", "consent": "explicit"}', 'immediate', '2018-05-25');