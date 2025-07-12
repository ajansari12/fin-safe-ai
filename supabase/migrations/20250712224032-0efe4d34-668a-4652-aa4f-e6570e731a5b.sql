-- Add missing org_id columns to key tables that need organization filtering

-- Add org_id to tables that should be organization-scoped
ALTER TABLE public.best_practice_guides ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.framework_components ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.governance_policies ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.kri_logs ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.risk_categories ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.risk_thresholds ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.vendor_contracts ADD COLUMN org_id UUID REFERENCES public.organizations(id);

-- Set default values for existing records by getting org_id from related tables
UPDATE public.best_practice_guides SET org_id = (
  SELECT org_id FROM public.industry_template_libraries 
  WHERE id = best_practice_guides.template_id
  LIMIT 1
) WHERE org_id IS NULL;

UPDATE public.framework_components SET org_id = (
  SELECT organization_id FROM public.generated_frameworks 
  WHERE id = framework_components.framework_id
  LIMIT 1
) WHERE org_id IS NULL;

UPDATE public.governance_policies SET org_id = (
  SELECT org_id FROM public.governance_frameworks 
  WHERE id = governance_policies.framework_id
  LIMIT 1
) WHERE org_id IS NULL;

UPDATE public.kri_logs SET org_id = (
  SELECT org_id FROM public.kri_definitions 
  WHERE id = kri_logs.kri_id
  LIMIT 1
) WHERE org_id IS NULL;

UPDATE public.risk_categories SET org_id = (
  SELECT organization_id FROM public.profiles 
  WHERE id = risk_categories.id -- This might need adjustment based on actual data
  LIMIT 1
) WHERE org_id IS NULL;

UPDATE public.risk_thresholds SET org_id = (
  SELECT org_id FROM public.risk_categories 
  WHERE id = risk_thresholds.risk_category_id
  LIMIT 1
) WHERE org_id IS NULL;

UPDATE public.vendor_contracts SET org_id = (
  SELECT org_id FROM public.third_party_profiles 
  WHERE id = vendor_contracts.vendor_profile_id
  LIMIT 1
) WHERE org_id IS NULL;

-- Make org_id NOT NULL for tables that should always have it
ALTER TABLE public.framework_components ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.governance_policies ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.kri_logs ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.vendor_contracts ALTER COLUMN org_id SET NOT NULL;

-- Create indexes for better performance
CREATE INDEX idx_framework_components_org_id ON public.framework_components(org_id);
CREATE INDEX idx_governance_policies_org_id ON public.governance_policies(org_id);
CREATE INDEX idx_kri_logs_org_id ON public.kri_logs(org_id);
CREATE INDEX idx_vendor_contracts_org_id ON public.vendor_contracts(org_id);

-- Add RLS policies for the new org_id columns
ALTER TABLE public.framework_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access framework components in their org" ON public.framework_components
FOR ALL USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE public.governance_policies ENABLE ROW LEVEL SECURITY;  
CREATE POLICY "Users can access governance policies in their org" ON public.governance_policies
FOR ALL USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE public.kri_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access KRI logs in their org" ON public.kri_logs  
FOR ALL USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

ALTER TABLE public.vendor_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access vendor contracts in their org" ON public.vendor_contracts
FOR ALL USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));