-- Create missing tables for AI framework generation

-- Create sector_thresholds table
CREATE TABLE IF NOT EXISTS public.sector_thresholds (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sector text NOT NULL,
    sub_sector text,
    metric text NOT NULL,
    recommended_value text NOT NULL,
    rationale text NOT NULL,
    regulatory_basis text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create framework_generation_rules table
CREATE TABLE IF NOT EXISTS public.framework_generation_rules (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_name text NOT NULL,
    org_criteria jsonb NOT NULL DEFAULT '{}',
    framework_type text NOT NULL,
    rule_definition jsonb NOT NULL DEFAULT '{}',
    priority integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create control_libraries table
CREATE TABLE IF NOT EXISTS public.control_libraries (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    control_name text NOT NULL,
    control_description text NOT NULL,
    control_type text NOT NULL,
    risk_categories text[] NOT NULL DEFAULT '{}',
    implementation_guidance text,
    effectiveness_rating integer DEFAULT 3,
    regulatory_references text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create regulatory_mapping table
CREATE TABLE IF NOT EXISTS public.regulatory_mapping (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    regulation_name text NOT NULL,
    regulation_code text NOT NULL,
    applicable_sectors text[] NOT NULL DEFAULT '{}',
    requirements jsonb NOT NULL DEFAULT '{}',
    compliance_timeline text,
    enforcement_date date,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sector_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_generation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_mapping ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow reading for all authenticated users, system can insert)
CREATE POLICY "Anyone can read sector thresholds" ON public.sector_thresholds
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read framework rules" ON public.framework_generation_rules
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read control libraries" ON public.control_libraries
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read regulatory mapping" ON public.regulatory_mapping
    FOR SELECT USING (true);

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
('Multi-Factor Authentication', 'Requires users to provide multiple factors of authentication', 'technical', '{"cyber", "operational"}', 'Implement for all privileged accounts and external access', 4, '{"OSFI E-21", "ISO 27001"}'),
('Data Encryption', 'Encrypts sensitive data at rest and in transit', 'technical', '{"cyber", "compliance"}', 'Use AES-256 encryption for data at rest, TLS 1.3 for data in transit', 5, '{"OSFI E-21", "PIPEDA"}'),
('Change Management Process', 'Formal process for managing system changes', 'process', '{"operational", "cyber"}', 'Implement approval workflow with testing requirements', 4, '{"OSFI E-21", "ISO 22301"}'),
('Vendor Risk Assessment', 'Regular assessment of third-party vendors', 'process', '{"third_party", "operational"}', 'Annual assessments with continuous monitoring', 3, '{"OSFI E-21"});

-- Insert sample regulatory mapping
INSERT INTO public.regulatory_mapping (regulation_name, regulation_code, applicable_sectors, requirements, compliance_timeline, enforcement_date) VALUES
('OSFI Guideline E-21', 'E-21', '{"banking", "insurance"}', '{"operational_resilience": "mandatory", "testing": "annual", "governance": "board_oversight"}', '12 months', '2023-01-01'),
('ISO 22301', 'ISO-22301', '{"banking", "insurance", "fintech"}', '{"business_continuity": "mandatory", "testing": "bi_annual", "documentation": "required"}', '6 months', null),
('Privacy Act', 'PIPEDA', '{"banking", "insurance", "fintech"}', '{"data_protection": "mandatory", "breach_notification": "72_hours", "consent": "explicit"}', 'immediate', '2018-05-25');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sector_thresholds_updated_at BEFORE UPDATE ON public.sector_thresholds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_framework_generation_rules_updated_at BEFORE UPDATE ON public.framework_generation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_control_libraries_updated_at BEFORE UPDATE ON public.control_libraries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regulatory_mapping_updated_at BEFORE UPDATE ON public.regulatory_mapping FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();