-- Fix database security issues - Phase 1: Fix function signatures and search paths
-- This migration corrects the function definitions and adds proper search_path protection

-- Fix user_has_org_access function to use the correct function name
CREATE OR REPLACE FUNCTION public.user_has_org_access(target_org_id uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = COALESCE(user_has_org_access.user_id, auth.uid()) 
        AND organization_id = target_org_id
    ) OR EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_roles.user_id = COALESCE(user_has_org_access.user_id, auth.uid())
        AND role IN ('admin', 'super_admin')
    );
$function$;

-- Fix validate_org_access function to use correct function calls
CREATE OR REPLACE FUNCTION public.validate_org_access(table_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT table_org_id = (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    ) OR EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    );
$function$;

-- Update additional critical functions with search_path protection
CREATE OR REPLACE FUNCTION public.update_onboarding_step(p_user_id uuid, p_step_id text, p_step_name text, p_completed boolean DEFAULT true, p_data jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_onboarding_progress (user_id, step_id, step_name, completed, completed_at, data)
  VALUES (p_user_id, p_step_id, p_step_name, p_completed, 
          CASE WHEN p_completed THEN now() ELSE NULL END, p_data)
  ON CONFLICT (user_id, step_id) 
  DO UPDATE SET 
    completed = p_completed,
    completed_at = CASE WHEN p_completed THEN now() ELSE NULL END,
    data = p_data,
    updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_framework_activity(p_framework_id uuid, p_user_id uuid, p_user_name text, p_activity_type text, p_description text DEFAULT NULL::text, p_data jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.framework_activities (
    framework_id, user_id, user_name, activity_type, activity_description, activity_data
  )
  VALUES (
    p_framework_id, p_user_id, p_user_name, p_activity_type, p_description, p_data
  )
  RETURNING id INTO activity_id;
  
  -- Update framework last activity
  UPDATE public.generated_frameworks
  SET last_activity_at = now()
  WHERE id = p_framework_id;
  
  RETURN activity_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_kri_appetite_variance(p_kri_id uuid, p_actual_value numeric, p_measurement_date date)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_appetite_threshold NUMERIC;
  v_variance_percentage NUMERIC;
  v_variance_status TEXT;
  v_warning_threshold NUMERIC;
  v_critical_threshold NUMERIC;
BEGIN
  -- Get KRI thresholds and appetite data
  SELECT 
    CASE 
      WHEN kd.warning_threshold IS NOT NULL THEN kd.warning_threshold::NUMERIC
      ELSE NULL
    END,
    CASE 
      WHEN kd.critical_threshold IS NOT NULL THEN kd.critical_threshold::NUMERIC
      ELSE NULL
    END
  INTO v_warning_threshold, v_critical_threshold
  FROM public.kri_definitions kd
  WHERE kd.id = p_kri_id;

  -- Use warning threshold as appetite threshold for now
  v_appetite_threshold := v_warning_threshold;

  -- Calculate variance percentage
  IF v_appetite_threshold IS NOT NULL AND v_appetite_threshold != 0 THEN
    v_variance_percentage := ((p_actual_value - v_appetite_threshold) / v_appetite_threshold) * 100;
    
    -- Determine variance status
    IF v_critical_threshold IS NOT NULL AND p_actual_value >= v_critical_threshold THEN
      v_variance_status := 'breach';
    ELSIF v_warning_threshold IS NOT NULL AND p_actual_value >= v_warning_threshold THEN
      v_variance_status := 'warning';
    ELSE
      v_variance_status := 'within_appetite';
    END IF;
  ELSE
    v_variance_percentage := NULL;
    v_variance_status := 'within_appetite';
  END IF;

  -- Insert or update variance record
  INSERT INTO public.kri_appetite_variance (
    kri_id,
    measurement_date,
    actual_value,
    appetite_threshold,
    variance_percentage,
    variance_status
  ) VALUES (
    p_kri_id,
    p_measurement_date,
    p_actual_value,
    v_appetite_threshold,
    v_variance_percentage,
    v_variance_status
  )
  ON CONFLICT (kri_id, measurement_date) 
  DO UPDATE SET
    actual_value = EXCLUDED.actual_value,
    appetite_threshold = EXCLUDED.appetite_threshold,
    variance_percentage = EXCLUDED.variance_percentage,
    variance_status = EXCLUDED.variance_status,
    updated_at = now();

  RETURN v_variance_status;
END;
$function$;

-- Add documentation comments
COMMENT ON FUNCTION public.user_has_org_access(uuid, uuid) IS 'Secure function to check organization access with proper search_path protection';
COMMENT ON FUNCTION public.validate_org_access(uuid) IS 'Secure function to validate organization access with proper search_path protection';
COMMENT ON FUNCTION public.update_onboarding_step(uuid, text, text, boolean, jsonb) IS 'Secure function to update onboarding progress with proper search_path protection';
COMMENT ON FUNCTION public.log_framework_activity(uuid, uuid, text, text, text, jsonb) IS 'Secure function to log framework activities with proper search_path protection';
COMMENT ON FUNCTION public.calculate_kri_appetite_variance(uuid, numeric, date) IS 'Secure function to calculate KRI variance with proper search_path protection';