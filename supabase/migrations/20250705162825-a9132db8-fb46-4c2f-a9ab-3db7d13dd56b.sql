-- Add missing foreign key constraints for organizational_profiles table

-- First, ensure data integrity by cleaning up any orphaned records
DELETE FROM public.organizational_profiles 
WHERE organization_id NOT IN (SELECT id FROM public.organizations);

-- Add foreign key constraint from organizational_profiles to organizations
ALTER TABLE public.organizational_profiles 
ADD CONSTRAINT fk_organizational_profiles_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add index for better performance on foreign key lookups
CREATE INDEX IF NOT EXISTS idx_organizational_profiles_organization_id 
ON public.organizational_profiles(organization_id);

-- Add foreign key constraint from profiles to organizations (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_profiles_organization' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT fk_profiles_organization 
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add a function to ensure atomic organization and profile creation
CREATE OR REPLACE FUNCTION public.create_organization_with_profile(
    p_org_name TEXT,
    p_sector TEXT,
    p_size TEXT,
    p_regulatory_guidelines TEXT[] DEFAULT '{}',
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE(organization_id UUID, profile_updated BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_org_id UUID;
    v_profile_updated BOOLEAN := FALSE;
BEGIN
    -- Create organization
    INSERT INTO public.organizations (name, sector, size, regulatory_guidelines)
    VALUES (p_org_name, p_sector, p_size, p_regulatory_guidelines)
    RETURNING id INTO v_org_id;
    
    -- Update user profile with organization ID
    UPDATE public.profiles 
    SET organization_id = v_org_id,
        updated_at = now()
    WHERE id = p_user_id;
    
    GET DIAGNOSTICS v_profile_updated = ROW_COUNT;
    v_profile_updated := v_profile_updated > 0;
    
    RETURN QUERY SELECT v_org_id, v_profile_updated;
END;
$$;

-- Add a function to safely create organizational profile
CREATE OR REPLACE FUNCTION public.create_organizational_profile_safe(
    p_organization_id UUID,
    p_preferred_framework_types TEXT[] DEFAULT '{}',
    p_auto_generate_frameworks BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id UUID;
    v_org_exists BOOLEAN;
BEGIN
    -- Verify organization exists
    SELECT EXISTS(SELECT 1 FROM public.organizations WHERE id = p_organization_id) INTO v_org_exists;
    
    IF NOT v_org_exists THEN
        RAISE EXCEPTION 'Organization with ID % does not exist', p_organization_id;
    END IF;
    
    -- Check if profile already exists
    SELECT id INTO v_profile_id
    FROM public.organizational_profiles
    WHERE organization_id = p_organization_id;
    
    IF v_profile_id IS NOT NULL THEN
        -- Update existing profile
        UPDATE public.organizational_profiles
        SET preferred_framework_types = p_preferred_framework_types,
            auto_generate_frameworks = p_auto_generate_frameworks,
            framework_preferences = jsonb_build_object(
                'onboarding_generated', TRUE,
                'selected_types', p_preferred_framework_types
            ),
            updated_at = now()
        WHERE id = v_profile_id;
        
        RETURN v_profile_id;
    ELSE
        -- Create new profile
        INSERT INTO public.organizational_profiles (
            organization_id,
            preferred_framework_types,
            auto_generate_frameworks,
            framework_preferences,
            employee_count,
            risk_maturity,
            sub_sector
        )
        VALUES (
            p_organization_id,
            p_preferred_framework_types,
            p_auto_generate_frameworks,
            jsonb_build_object(
                'onboarding_generated', TRUE,
                'selected_types', p_preferred_framework_types
            ),
            100, -- Default value
            'developing', -- Default value
            'financial_services' -- Default value
        )
        RETURNING id INTO v_profile_id;
        
        RETURN v_profile_id;
    END IF;
END;
$$;