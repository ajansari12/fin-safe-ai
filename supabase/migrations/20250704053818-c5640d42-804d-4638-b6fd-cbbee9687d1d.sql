-- Extend organizations table for enhanced classification and AI-based onboarding
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS org_type text,
ADD COLUMN IF NOT EXISTS sub_sector text,
ADD COLUMN IF NOT EXISTS employee_count integer,
ADD COLUMN IF NOT EXISTS asset_size numeric,
ADD COLUMN IF NOT EXISTS capital_tier text,
ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'started',
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS geographic_scope text,
ADD COLUMN IF NOT EXISTS regulatory_classification text[];

-- Add check constraints for valid values
ALTER TABLE public.organizations
ADD CONSTRAINT organizations_org_type_check 
CHECK (org_type IN ('banking-schedule-i', 'banking-schedule-ii', 'banking-schedule-iii', 'credit-union', 'trust-company', 'insurance', 'fintech', 'other'));

ALTER TABLE public.organizations
ADD CONSTRAINT organizations_capital_tier_check 
CHECK (capital_tier IN ('Tier 1', 'Tier 2', 'Tier 3', 'Not Applicable'));

ALTER TABLE public.organizations
ADD CONSTRAINT organizations_onboarding_status_check 
CHECK (onboarding_status IN ('started', 'in_progress', 'completed', 'pending_review'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_organizations_org_type ON public.organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_onboarding_status ON public.organizations(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_organizations_regulatory_classification ON public.organizations USING GIN(regulatory_classification);

-- Update existing RLS policies to work with new fields (they should already work since they check organization_id)
-- No changes needed to RLS policies as they use organization_id for access control

-- Add comments for documentation
COMMENT ON COLUMN public.organizations.org_type IS 'Type of financial institution (banking-schedule-i, banking-schedule-ii, etc.)';
COMMENT ON COLUMN public.organizations.sub_sector IS 'Business sub-sector (Retail, Commercial, Investment, etc.)';
COMMENT ON COLUMN public.organizations.employee_count IS 'Number of employees in the organization';
COMMENT ON COLUMN public.organizations.asset_size IS 'Total asset size in dollars';
COMMENT ON COLUMN public.organizations.capital_tier IS 'Capital adequacy tier classification';
COMMENT ON COLUMN public.organizations.onboarding_status IS 'Current status of the onboarding process';
COMMENT ON COLUMN public.organizations.onboarding_completed_at IS 'Timestamp when onboarding was completed';
COMMENT ON COLUMN public.organizations.geographic_scope IS 'Geographic scope of operations (Local, Regional, National, International)';
COMMENT ON COLUMN public.organizations.regulatory_classification IS 'Array of applicable regulatory frameworks';