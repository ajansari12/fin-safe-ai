
-- Phase 1: Enhanced Data Foundation - Database Schema Extensions

-- Extend organizational_profiles with detailed characteristics
ALTER TABLE organizational_profiles 
ADD COLUMN IF NOT EXISTS board_size integer,
ADD COLUMN IF NOT EXISTS regulatory_complexity text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS business_model text,
ADD COLUMN IF NOT EXISTS operational_complexity text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS stakeholder_types jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS governance_maturity text DEFAULT 'developing';

-- Create sector_thresholds table for industry-specific benchmarks
CREATE TABLE IF NOT EXISTS sector_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector text NOT NULL,
  sub_sector text,
  metric_name text NOT NULL,
  threshold_type text NOT NULL, -- 'rto', 'rpo', 'availability', 'risk_appetite'
  recommended_value numeric NOT NULL,
  min_value numeric,
  max_value numeric,
  rationale text,
  regulatory_basis text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create framework_generation_rules table for AI-driven generation logic
CREATE TABLE IF NOT EXISTS framework_generation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  rule_type text NOT NULL, -- 'governance', 'risk_appetite', 'control', 'compliance'
  org_criteria jsonb NOT NULL, -- conditions for applying this rule
  generation_logic jsonb NOT NULL, -- the actual generation instructions
  priority integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create control_libraries table with pre-built control templates
CREATE TABLE IF NOT EXISTS control_libraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_name text NOT NULL,
  control_category text NOT NULL,
  control_type text NOT NULL, -- 'preventive', 'detective', 'corrective'
  control_description text NOT NULL,
  implementation_guidance text,
  testing_procedures text,
  applicable_sectors text[] DEFAULT '{}',
  risk_categories text[] DEFAULT '{}',
  regulatory_references text[] DEFAULT '{}',
  effectiveness_metrics jsonb DEFAULT '[]'::jsonb,
  cost_complexity text DEFAULT 'medium', -- 'low', 'medium', 'high'
  automation_potential text DEFAULT 'partial', -- 'none', 'partial', 'full'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create regulatory_mapping table for compliance requirements
CREATE TABLE IF NOT EXISTS regulatory_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_name text NOT NULL,
  jurisdiction text NOT NULL,
  applicable_sectors text[] DEFAULT '{}',
  requirement_reference text NOT NULL,
  requirement_description text NOT NULL,
  compliance_level text NOT NULL, -- 'mandatory', 'recommended', 'best_practice'
  implementation_guidance text,
  related_controls text[] DEFAULT '{}',
  reporting_requirements text,
  penalties_for_non_compliance text,
  effective_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create generated_frameworks table to store AI-generated frameworks
CREATE TABLE IF NOT EXISTS generated_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  framework_type text NOT NULL, -- 'governance', 'risk_appetite', 'control', 'compliance', 'scenario_testing'
  framework_name text NOT NULL,
  framework_version text DEFAULT '1.0',
  generation_metadata jsonb DEFAULT '{}',
  framework_data jsonb NOT NULL,
  customization_options jsonb DEFAULT '{}',
  implementation_status text DEFAULT 'generated', -- 'generated', 'customized', 'approved', 'implemented'
  effectiveness_score numeric,
  last_reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create framework_components table for modular framework pieces
CREATE TABLE IF NOT EXISTS framework_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid REFERENCES generated_frameworks(id) ON DELETE CASCADE,
  component_type text NOT NULL, -- 'committee', 'policy', 'procedure', 'control', 'kri'
  component_name text NOT NULL,
  component_description text,
  component_data jsonb NOT NULL,
  dependencies text[] DEFAULT '{}',
  implementation_priority integer DEFAULT 1,
  estimated_effort_hours integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for new tables
ALTER TABLE sector_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_generation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_components ENABLE ROW LEVEL SECURITY;

-- RLS policies for sector_thresholds (public read, admin write)
CREATE POLICY "Anyone can view sector thresholds" ON sector_thresholds
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage sector thresholds" ON sector_thresholds
  FOR ALL USING (is_admin_user());

-- RLS policies for framework_generation_rules (public read, admin write)
CREATE POLICY "Anyone can view framework generation rules" ON framework_generation_rules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage framework generation rules" ON framework_generation_rules
  FOR ALL USING (is_admin_user());

-- RLS policies for control_libraries (public read, admin write)
CREATE POLICY "Anyone can view control libraries" ON control_libraries
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage control libraries" ON control_libraries
  FOR ALL USING (is_admin_user());

-- RLS policies for regulatory_mapping (public read, admin write)
CREATE POLICY "Anyone can view regulatory mapping" ON regulatory_mapping
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage regulatory mapping" ON regulatory_mapping
  FOR ALL USING (is_admin_user());

-- RLS policies for generated_frameworks (org-based access)
CREATE POLICY "Users can view their org's generated frameworks" ON generated_frameworks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = (
        SELECT organization_id FROM organizational_profiles 
        WHERE organizational_profiles.id = generated_frameworks.profile_id
      )
    )
  );

CREATE POLICY "Users can manage their org's generated frameworks" ON generated_frameworks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = (
        SELECT organization_id FROM organizational_profiles 
        WHERE organizational_profiles.id = generated_frameworks.profile_id
      )
    )
  );

-- RLS policies for framework_components (inherit from framework)
CREATE POLICY "Users can view framework components" ON framework_components
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generated_frameworks gf
      JOIN organizational_profiles op ON op.id = gf.profile_id
      JOIN profiles p ON p.organization_id = op.organization_id
      WHERE gf.id = framework_components.framework_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can manage framework components" ON framework_components
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM generated_frameworks gf
      JOIN organizational_profiles op ON op.id = gf.profile_id
      JOIN profiles p ON p.organization_id = op.organization_id
      WHERE gf.id = framework_components.framework_id
      AND p.id = auth.uid()
    )
  );

-- Insert sample sector thresholds
INSERT INTO sector_thresholds (sector, metric_name, threshold_type, recommended_value, rationale) VALUES
('banking', 'Core Payment System RTO', 'rto', 4, 'OSFI guidelines require critical payment systems to recover within 4 hours'),
('banking', 'Customer Data RPO', 'rpo', 0.25, 'Banking regulations require minimal data loss for customer transaction records'),
('banking', 'System Availability', 'availability', 99.9, 'Industry standard for critical banking services'),
('insurance', 'Claims Processing RTO', 'rto', 8, 'Claims processing should recover within business day'),
('insurance', 'Policy Data RPO', 'rpo', 1, 'Policy data updates should have minimal loss'),
('fintech', 'Digital Service RTO', 'rto', 2, 'Digital-first services require rapid recovery'),
('fintech', 'Transaction Data RPO', 'rpo', 0.083, 'Real-time transaction processing requires minimal data loss');

-- Insert sample framework generation rules
INSERT INTO framework_generation_rules (rule_name, rule_type, org_criteria, generation_logic) VALUES
('Small Organization Governance', 'governance', 
 '{"employee_count": {"max": 100}, "asset_size": {"max": 1000000000}}',
 '{"board_committees": ["audit", "risk"], "meeting_frequency": "quarterly", "reporting_lines": "simplified"}'),
('Large Enterprise Governance', 'governance',
 '{"employee_count": {"min": 1000}, "asset_size": {"min": 10000000000}}',
 '{"board_committees": ["audit", "risk", "technology", "governance"], "meeting_frequency": "monthly", "reporting_lines": "three_lines_of_defense"}'),
('Banking Risk Appetite', 'risk_appetite',
 '{"sub_sector": "banking"}',
 '{"risk_categories": ["credit", "market", "operational", "liquidity"], "quantitative_thresholds": true, "regulatory_alignment": "OSFI"}');

-- Insert sample control library entries
INSERT INTO control_libraries (control_name, control_category, control_type, control_description, applicable_sectors, risk_categories) VALUES
('Multi-Factor Authentication', 'Access Control', 'preventive', 'Implement MFA for all privileged accounts', 
 ARRAY['banking', 'insurance', 'fintech'], ARRAY['operational', 'cyber']),
('Data Backup Verification', 'Data Protection', 'detective', 'Regular verification of backup integrity and recoverability',
 ARRAY['banking', 'insurance', 'fintech'], ARRAY['operational', 'technology']),
('Vendor Risk Assessment', 'Third Party Management', 'preventive', 'Comprehensive risk assessment before vendor onboarding',
 ARRAY['banking', 'insurance', 'fintech'], ARRAY['operational', 'third_party']);

-- Insert sample regulatory mappings
INSERT INTO regulatory_mapping (regulation_name, jurisdiction, applicable_sectors, requirement_reference, requirement_description, compliance_level) VALUES
('OSFI E-21', 'Canada', ARRAY['banking'], 'Section 4.1', 'Operational resilience framework requirements', 'mandatory'),
('OSFI E-21', 'Canada', ARRAY['banking'], 'Section 5.2', 'Business continuity planning requirements', 'mandatory'),
('PIPEDA', 'Canada', ARRAY['banking', 'insurance', 'fintech'], 'Section 4.1', 'Personal information protection requirements', 'mandatory');
