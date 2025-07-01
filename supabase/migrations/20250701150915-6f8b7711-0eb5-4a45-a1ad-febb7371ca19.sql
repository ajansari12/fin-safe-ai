
-- Create comprehensive organizational profiles table
CREATE TABLE public.organizational_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  
  -- Basic Info
  sub_sector TEXT,
  employee_count INTEGER,
  asset_size BIGINT,
  geographic_scope TEXT CHECK (geographic_scope IN ('local', 'regional', 'national', 'international')),
  customer_base TEXT CHECK (customer_base IN ('retail', 'commercial', 'institutional', 'mixed')),
  
  -- Risk Profile
  risk_maturity TEXT CHECK (risk_maturity IN ('basic', 'developing', 'advanced', 'sophisticated')),
  risk_culture TEXT CHECK (risk_culture IN ('risk-averse', 'balanced', 'risk-taking')),
  compliance_maturity TEXT CHECK (compliance_maturity IN ('basic', 'developing', 'mature', 'advanced')),
  previous_incidents INTEGER DEFAULT 0,
  regulatory_history TEXT CHECK (regulatory_history IN ('clean', 'minor-issues', 'significant-issues')),
  
  -- Operational Complexity
  business_lines TEXT[],
  geographic_locations INTEGER DEFAULT 1,
  third_party_dependencies INTEGER DEFAULT 0,
  technology_maturity TEXT CHECK (technology_maturity IN ('basic', 'developing', 'advanced', 'cutting-edge')),
  digital_transformation TEXT CHECK (digital_transformation IN ('early', 'progressing', 'advanced', 'leader')),
  
  -- Regulatory Environment
  primary_regulators TEXT[],
  applicable_frameworks TEXT[],
  upcoming_regulations TEXT[],
  international_exposure BOOLEAN DEFAULT FALSE,
  
  -- Strategic Objectives
  growth_strategy TEXT CHECK (growth_strategy IN ('conservative', 'moderate', 'aggressive')),
  digital_strategy TEXT CHECK (digital_strategy IN ('follower', 'fast-follower', 'leader', 'innovator')),
  market_position TEXT CHECK (market_position IN ('niche', 'regional', 'national', 'international')),
  competitive_strategy TEXT CHECK (competitive_strategy IN ('cost-leader', 'differentiator', 'focused')),
  
  -- Profile Metadata
  profile_score NUMERIC DEFAULT 0,
  completeness_percentage INTEGER DEFAULT 0,
  last_assessment_date DATE,
  next_assessment_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questionnaire templates table
CREATE TABLE public.questionnaire_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_sector TEXT,
  target_size TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  is_active BOOLEAN DEFAULT TRUE,
  questions JSONB NOT NULL DEFAULT '[]'::JSONB,
  branching_logic JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questionnaire responses table
CREATE TABLE public.questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  template_id UUID NOT NULL REFERENCES public.questionnaire_templates(id),
  responses JSONB NOT NULL DEFAULT '{}'::JSONB,
  completion_percentage INTEGER DEFAULT 0,
  current_section TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk framework templates table
CREATE TABLE public.risk_framework_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_profile JSONB NOT NULL DEFAULT '{}'::JSONB,
  framework_components JSONB NOT NULL DEFAULT '{}'::JSONB,
  implementation_roadmap JSONB NOT NULL DEFAULT '[]'::JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated frameworks table
CREATE TABLE public.generated_frameworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  profile_id UUID NOT NULL REFERENCES public.organizational_profiles(id),
  template_id UUID REFERENCES public.risk_framework_templates(id),
  framework_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  customizations JSONB NOT NULL DEFAULT '{}'::JSONB,
  implementation_status TEXT DEFAULT 'draft',
  effectiveness_score NUMERIC,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for organizational profiles
ALTER TABLE public.organizational_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's profile"
  ON public.organizational_profiles
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their org's profile"
  ON public.organizational_profiles
  FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Add RLS policies for questionnaire responses
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org's questionnaire responses"
  ON public.questionnaire_responses
  FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Add RLS policies for generated frameworks
ALTER TABLE public.generated_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org's generated frameworks"
  ON public.generated_frameworks
  FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_organizational_profiles_org_id ON public.organizational_profiles(organization_id);
CREATE INDEX idx_questionnaire_responses_org_id ON public.questionnaire_responses(organization_id);
CREATE INDEX idx_questionnaire_responses_template_id ON public.questionnaire_responses(template_id);
CREATE INDEX idx_generated_frameworks_org_id ON public.generated_frameworks(organization_id);
CREATE INDEX idx_generated_frameworks_profile_id ON public.generated_frameworks(profile_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_organizational_profiles_updated_at
  BEFORE UPDATE ON public.organizational_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questionnaire_responses_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_frameworks_updated_at
  BEFORE UPDATE ON public.generated_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default questionnaire templates
INSERT INTO public.questionnaire_templates (name, description, target_sector, questions, branching_logic) VALUES 
('Banking Sector Assessment', 'Comprehensive questionnaire for banking institutions', 'banking', 
'[
  {
    "id": "basic_info",
    "section": "Basic Information",
    "questions": [
      {
        "id": "sub_sector",
        "type": "select",
        "text": "What type of banking institution are you?",
        "options": ["retail-banking", "commercial-banking", "investment-banking", "community-banking"],
        "required": true
      },
      {
        "id": "employee_count",
        "type": "number",
        "text": "How many employees does your organization have?",
        "required": true
      },
      {
        "id": "asset_size",
        "type": "number",
        "text": "What is your total asset size (in millions)?",
        "required": true
      }
    ]
  },
  {
    "id": "risk_management",
    "section": "Risk Management",
    "questions": [
      {
        "id": "risk_framework",
        "type": "select",
        "text": "What risk management framework do you currently use?",
        "options": ["basel-iii", "coso", "iso-31000", "custom", "none"],
        "required": true
      },
      {
        "id": "risk_maturity",
        "type": "select",
        "text": "How would you rate your organization''s risk management maturity?",
        "options": ["basic", "developing", "advanced", "sophisticated"],
        "required": true
      }
    ]
  }
]'::JSONB,
'{"risk_framework": {"none": ["risk_maturity_basic"], "custom": ["framework_details"]}}'::JSONB);

INSERT INTO public.questionnaire_templates (name, description, target_sector, questions, branching_logic) VALUES 
('Insurance Sector Assessment', 'Comprehensive questionnaire for insurance companies', 'insurance',
'[
  {
    "id": "basic_info",
    "section": "Basic Information",
    "questions": [
      {
        "id": "insurance_type",
        "type": "multiselect",
        "text": "What types of insurance do you offer?",
        "options": ["life", "property-casualty", "health", "reinsurance", "specialty"],
        "required": true
      },
      {
        "id": "distribution_channels",
        "type": "multiselect",
        "text": "What distribution channels do you use?",
        "options": ["agents", "brokers", "direct", "online", "bancassurance"],
        "required": true
      }
    ]
  }
]'::JSONB,
'{}'::JSONB);

-- Insert default risk framework templates
INSERT INTO public.risk_framework_templates (name, description, target_profile, framework_components) VALUES 
('Small Banking Institution Framework', 'Tailored framework for small banking institutions',
'{"sector": "banking", "size": "small", "risk_maturity": "basic"}'::JSONB,
'{
  "risk_categories": [
    {"name": "Credit Risk", "weight": 0.3, "controls": ["loan_approval_process", "credit_monitoring"]},
    {"name": "Operational Risk", "weight": 0.25, "controls": ["business_continuity", "staff_training"]},
    {"name": "Market Risk", "weight": 0.2, "controls": ["interest_rate_monitoring", "liquidity_management"]},
    {"name": "Compliance Risk", "weight": 0.25, "controls": ["regulatory_reporting", "compliance_training"]}
  ],
  "kris": [
    {"name": "Non-Performing Loan Ratio", "threshold": 5, "frequency": "monthly"},
    {"name": "Capital Adequacy Ratio", "threshold": 12, "frequency": "quarterly"}
  ]
}'::JSONB);
