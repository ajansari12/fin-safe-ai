-- Create missing tables for AI framework generation (Fixed)

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