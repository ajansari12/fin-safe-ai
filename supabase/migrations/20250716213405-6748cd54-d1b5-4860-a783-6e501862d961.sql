-- Phase 1: Critical Database Security Fixes - Simple approach
-- Add SET search_path = '' to existing functions one by one

-- Update timestamp functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_microservices_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_document_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Mark previous versions as not current
  IF NEW.is_current_version = true THEN
    UPDATE public.documents 
    SET is_current_version = false 
    WHERE parent_document_id = NEW.parent_document_id 
    AND id != NEW.id;
  END IF;
  
  -- Set version number for new documents
  IF NEW.version_number IS NULL THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO NEW.version_number
    FROM public.documents 
    WHERE parent_document_id = NEW.parent_document_id OR id = NEW.parent_document_id;
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update policy review functions
CREATE OR REPLACE FUNCTION public.update_policy_status_on_review()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Update policy status and timestamps when review is completed
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.governance_policies 
    SET 
      status = 'approved',
      approved_at = now(),
      rejected_at = NULL
    WHERE id = NEW.policy_id;
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    UPDATE public.governance_policies 
    SET 
      status = 'rejected',
      rejected_at = now(),
      approved_at = NULL
    WHERE id = NEW.policy_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update framework progress function
CREATE OR REPLACE FUNCTION public.update_framework_progress()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_framework_id UUID;
  v_avg_progress INTEGER;
BEGIN
  -- Get the framework ID from the component
  SELECT framework_id INTO v_framework_id
  FROM public.framework_components 
  WHERE id = COALESCE(NEW.component_id, OLD.component_id);
  
  -- Calculate average progress for this framework
  SELECT COALESCE(AVG(fcp.completion_percentage), 0)::INTEGER INTO v_avg_progress
  FROM public.framework_components fc
  LEFT JOIN public.framework_component_progress fcp ON fc.id = fcp.component_id
  WHERE fc.framework_id = v_framework_id;
  
  -- Update the framework with calculated progress
  UPDATE public.generated_frameworks
  SET 
    overall_completion_percentage = v_avg_progress,
    last_activity_at = now(),
    is_stagnant = false,
    stagnant_since = NULL
  WHERE id = v_framework_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update role validation function
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    -- Validate role is in allowed values
    IF NEW.role NOT IN ('admin', 'analyst', 'reviewer', 'auditor', 'executive', 'super_admin') THEN
        RAISE EXCEPTION 'Invalid role: %', NEW.role;
    END IF;
    
    -- Validate organization exists
    IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = NEW.organization_id) THEN
        RAISE EXCEPTION 'Invalid organization ID: %', NEW.organization_id;
    END IF;
    
    -- Validate user exists and belongs to organization
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = NEW.user_id AND organization_id = NEW.organization_id
    ) THEN
        RAISE EXCEPTION 'User does not belong to organization';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Update profile validation function
CREATE OR REPLACE FUNCTION public.validate_profile_org_consistency()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
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

-- Update audit timestamp functions
CREATE OR REPLACE FUNCTION public.update_ai_chat_logs_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_auth_settings_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Record security event about leaked password protection
INSERT INTO public.security_events (
    org_id,
    event_type,
    event_category,
    severity,
    event_description,
    event_data,
    user_id
) 
SELECT 
    p.organization_id,
    'security_configuration',
    'authentication', 
    'warning',
    'Database functions secured with search_path restrictions. Leaked password protection still needs manual enablement.',
    jsonb_build_object(
        'functions_updated', 'timestamp and validation functions',
        'action_required', 'Enable leaked password protection in Supabase Dashboard > Authentication > Settings',
        'priority', 'high'
    ),
    p.id
FROM public.profiles p
WHERE p.id = auth.uid()
ON CONFLICT DO NOTHING;