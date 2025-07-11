-- Phase 5: Database Consistency Fixes

-- Remove duplicate role entries (keep the most recent one)
DELETE FROM public.user_roles ur1
WHERE EXISTS (
  SELECT 1 FROM public.user_roles ur2
  WHERE ur1.user_id = ur2.user_id 
  AND ur1.organization_id = ur2.organization_id
  AND ur1.created_at < ur2.created_at
);

-- Create function to validate user-organization relationships
CREATE OR REPLACE FUNCTION public.validate_user_org_relationship(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_org_id uuid;
  role_org_ids uuid[];
  result jsonb := '{"valid": true, "issues": []}'::jsonb;
  issues text[] := '{}';
BEGIN
  -- Get user's profile organization
  SELECT organization_id INTO profile_org_id
  FROM public.profiles
  WHERE id = user_id;
  
  -- Get organizations from user roles
  SELECT array_agg(DISTINCT organization_id) INTO role_org_ids
  FROM public.user_roles
  WHERE user_roles.user_id = validate_user_org_relationship.user_id;
  
  -- Check if profile has organization
  IF profile_org_id IS NULL THEN
    issues := array_append(issues, 'User profile missing organization_id');
  END IF;
  
  -- Check if user has roles but no profile organization
  IF role_org_ids IS NOT NULL AND array_length(role_org_ids, 1) > 0 AND profile_org_id IS NULL THEN
    issues := array_append(issues, 'User has roles but no profile organization');
  END IF;
  
  -- Check if profile organization doesn't match role organizations
  IF profile_org_id IS NOT NULL AND role_org_ids IS NOT NULL 
     AND NOT (profile_org_id = ANY(role_org_ids)) THEN
    issues := array_append(issues, 'Profile organization does not match role organizations');
  END IF;
  
  -- Build result
  IF array_length(issues, 1) > 0 THEN
    result := jsonb_build_object('valid', false, 'issues', to_jsonb(issues));
  END IF;
  
  RETURN result;
END;
$$;

-- Create function to repair user data
CREATE OR REPLACE FUNCTION public.repair_user_data(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  role_record RECORD;
  repair_actions text[] := '{}';
  default_org_id uuid;
BEGIN
  -- Get user profile
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE id = user_id;
  
  -- If no profile exists, create one
  IF profile_record IS NULL THEN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (user_id, 'User', 'user');
    repair_actions := array_append(repair_actions, 'Created missing profile');
  END IF;
  
  -- If profile exists but no organization, try to get from roles
  IF profile_record.organization_id IS NULL THEN
    SELECT organization_id INTO default_org_id
    FROM public.user_roles
    WHERE user_roles.user_id = repair_user_data.user_id
    LIMIT 1;
    
    IF default_org_id IS NOT NULL THEN
      UPDATE public.profiles
      SET organization_id = default_org_id
      WHERE id = user_id;
      repair_actions := array_append(repair_actions, 'Added organization from role data');
    END IF;
  END IF;
  
  RETURN jsonb_build_object('repaired', true, 'actions', to_jsonb(repair_actions));
END;
$$;

-- Add data validation trigger
CREATE OR REPLACE FUNCTION public.validate_profile_org_consistency()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure organization exists
  IF NEW.organization_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.organizations WHERE id = NEW.organization_id
  ) THEN
    RAISE EXCEPTION 'Referenced organization does not exist';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile validation
DROP TRIGGER IF EXISTS profile_org_validation_trigger ON public.profiles;
CREATE TRIGGER profile_org_validation_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_org_consistency();