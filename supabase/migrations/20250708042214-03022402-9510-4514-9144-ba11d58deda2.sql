-- Fix the create_organization_with_profile function to handle ROW_COUNT properly
CREATE OR REPLACE FUNCTION public.create_organization_with_profile(p_org_name text, p_sector text, p_size text, p_regulatory_guidelines text[] DEFAULT '{}'::text[], p_user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(organization_id uuid, profile_updated boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_org_id UUID;
    v_rows_affected INTEGER;
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
    
    -- Get the number of affected rows and convert to boolean
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    v_profile_updated := v_rows_affected > 0;
    
    RETURN QUERY SELECT v_org_id, v_profile_updated;
END;
$function$