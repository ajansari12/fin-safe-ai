-- PHASE 1: CRITICAL SECURITY FIXES

-- 1. Add missing RLS policies for template_customization_rules table
CREATE POLICY "Users can view template rules for their org"
ON public.template_customization_rules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = template_customization_rules.org_id
  )
);

CREATE POLICY "Users can create template rules for their org"
ON public.template_customization_rules FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = template_customization_rules.org_id
  )
);

CREATE POLICY "Users can update template rules for their org"
ON public.template_customization_rules FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = template_customization_rules.org_id
  )
);

CREATE POLICY "Users can delete template rules for their org"
ON public.template_customization_rules FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = template_customization_rules.org_id
  )
);

-- 2. Fix critical database functions by adding search_path security
-- These are the most critical user-facing SECURITY DEFINER functions

CREATE OR REPLACE FUNCTION public.get_user_role_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT COALESCE(ur.role, 'user')::text
    FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(target_user_id, auth.uid())
    AND ur.organization_id IN (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = COALESCE(target_user_id, auth.uid())
    )
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_secure(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = COALESCE(target_user_id, auth.uid())
        AND ur.role IN ('admin', 'super_admin')
        AND p.organization_id = ur.organization_id
    );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_user_roles(target_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'super_admin')
        AND ur.organization_id = target_org_id
        AND p.organization_id = target_org_id
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_safe(user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = COALESCE(get_user_org_safe.user_id, auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.check_user_org_access(target_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND organization_id = target_org_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_password_strength(password text, org_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  policy_record RECORD;
  result jsonb := '{"valid": true, "errors": []}'::jsonb;
  errors text[] := '{}';
BEGIN
  -- Get active password policy for org
  SELECT * INTO policy_record
  FROM public.password_policies
  WHERE password_policies.org_id = validate_password_strength.org_id
  AND is_active = true
  LIMIT 1;

  IF policy_record IS NULL THEN
    RETURN result;
  END IF;

  -- Check minimum length
  IF length(password) < policy_record.min_length THEN
    errors := array_append(errors, 'Password must be at least ' || policy_record.min_length || ' characters long');
  END IF;

  -- Check uppercase requirement
  IF policy_record.require_uppercase AND password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;

  -- Check lowercase requirement
  IF policy_record.require_lowercase AND password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;

  -- Check numbers requirement
  IF policy_record.require_numbers AND password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;

  -- Check symbols requirement
  IF policy_record.require_symbols AND password !~ '[^A-Za-z0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;

  -- Build result
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object('valid', false, 'errors', to_jsonb(errors));
  END IF;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_session_timeout(session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  session_record RECORD;
  policy_record RECORD;
  idle_timeout_exceeded boolean := false;
  absolute_timeout_exceeded boolean := false;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.user_sessions
  WHERE user_sessions.session_token = check_session_timeout.session_token
  AND is_active = true;

  IF session_record IS NULL THEN
    RETURN false;
  END IF;

  -- Get session policy
  SELECT * INTO policy_record
  FROM public.session_policies
  WHERE org_id = session_record.org_id
  AND is_active = true
  LIMIT 1;

  IF policy_record IS NULL THEN
    RETURN true; -- No policy, session is valid
  END IF;

  -- Check idle timeout
  IF session_record.last_activity_at < (now() - interval '1 minute' * policy_record.idle_timeout_minutes) THEN
    idle_timeout_exceeded := true;
  END IF;

  -- Check absolute timeout
  IF session_record.created_at < (now() - interval '1 minute' * policy_record.absolute_timeout_minutes) THEN
    absolute_timeout_exceeded := true;
  END IF;

  -- Deactivate session if timeout exceeded
  IF idle_timeout_exceeded OR absolute_timeout_exceeded THEN
    UPDATE public.user_sessions
    SET is_active = false
    WHERE id = session_record.id;
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles table when a new user is created
  INSERT INTO public.profiles (id, full_name, role, organization_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    NULL
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    full_name = NEW.raw_user_meta_data->>'full_name',
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_session_risk_score(user_id uuid, device_fingerprint_id uuid, location_data jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  risk_score INTEGER := 0;
  device_trusted BOOLEAN;
  unusual_location BOOLEAN;
BEGIN
  -- Check if device is trusted
  SELECT is_trusted INTO device_trusted
  FROM public.device_fingerprints
  WHERE id = device_fingerprint_id;
  
  IF NOT COALESCE(device_trusted, false) THEN
    risk_score := risk_score + 30;
  END IF;
  
  -- Add more risk calculation logic here
  -- This is a simplified version
  
  RETURN LEAST(risk_score, 100);
END;
$$;

-- 3. Add database logging for security function access
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Log role changes to admin_logs
    INSERT INTO public.admin_logs (
        org_id,
        admin_user_id,
        admin_user_name,
        action_type,
        resource_type,
        resource_id,
        resource_name,
        action_details
    )
    SELECT 
        COALESCE(NEW.organization_id, OLD.organization_id),
        auth.uid(),
        COALESCE(p.full_name, 'System'),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'CREATE_ROLE'
            WHEN TG_OP = 'UPDATE' THEN 'UPDATE_ROLE'
            WHEN TG_OP = 'DELETE' THEN 'DELETE_ROLE'
        END,
        'user_role',
        COALESCE(NEW.user_id::text, OLD.user_id::text),
        COALESCE(target_p.full_name, 'Unknown User'),
        jsonb_build_object(
            'old_role', OLD.role,
            'new_role', NEW.role,
            'organization_id', COALESCE(NEW.organization_id, OLD.organization_id),
            'timestamp', now()
        )
    FROM public.profiles p
    LEFT JOIN public.profiles target_p ON target_p.id = COALESCE(NEW.user_id, OLD.user_id)
    WHERE p.id = auth.uid();
    
    RETURN COALESCE(NEW, OLD);
END;
$$;