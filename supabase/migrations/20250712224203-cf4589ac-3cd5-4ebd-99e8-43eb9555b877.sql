-- Add missing org_id columns to key tables (allowing NULL initially)
ALTER TABLE public.best_practice_guides ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.framework_components ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.governance_policies ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.kri_logs ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.risk_categories ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.risk_thresholds ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.vendor_contracts ADD COLUMN org_id UUID REFERENCES public.organizations(id);

-- Get the first organization ID to use as default
DO $$
DECLARE
    default_org_id UUID;
BEGIN
    SELECT id INTO default_org_id FROM public.organizations LIMIT 1;
    
    -- Only proceed if we have an organization
    IF default_org_id IS NOT NULL THEN
        -- Update framework_components with org_id from generated_frameworks
        UPDATE public.framework_components SET org_id = COALESCE(
            (SELECT organization_id FROM public.generated_frameworks WHERE id = framework_components.framework_id LIMIT 1),
            default_org_id
        );
        
        -- Update governance_policies with org_id from governance_frameworks
        UPDATE public.governance_policies SET org_id = COALESCE(
            (SELECT org_id FROM public.governance_frameworks WHERE id = governance_policies.framework_id LIMIT 1),
            default_org_id
        );
        
        -- Update kri_logs with org_id from kri_definitions
        UPDATE public.kri_logs SET org_id = COALESCE(
            (SELECT org_id FROM public.kri_definitions WHERE id = kri_logs.kri_id LIMIT 1),
            default_org_id
        );
        
        -- Update vendor_contracts with org_id from third_party_profiles
        UPDATE public.vendor_contracts SET org_id = COALESCE(
            (SELECT org_id FROM public.third_party_profiles WHERE id = vendor_contracts.vendor_profile_id LIMIT 1),
            default_org_id
        );
        
        -- Set default org_id for remaining tables
        UPDATE public.best_practice_guides SET org_id = default_org_id WHERE org_id IS NULL;
        UPDATE public.risk_categories SET org_id = default_org_id WHERE org_id IS NULL;
        UPDATE public.risk_thresholds SET org_id = default_org_id WHERE org_id IS NULL;
    END IF;
END $$;