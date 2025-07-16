-- Add SET search_path = '' to all remaining SECURITY DEFINER functions for security

-- Fix calculate_kri_appetite_variance_enhanced function
CREATE OR REPLACE FUNCTION public.calculate_kri_appetite_variance_enhanced(p_kri_id uuid, p_actual_value numeric, p_measurement_date date)
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

-- Fix check_user_framework_access function
CREATE OR REPLACE FUNCTION public.check_user_framework_access(framework_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.governance_frameworks f 
    JOIN public.profiles p ON p.organization_id = f.org_id 
    WHERE f.id = framework_id AND p.id = auth.uid()
  );
END;
$function$;

-- Fix check_user_framework_for_changelog function
CREATE OR REPLACE FUNCTION public.check_user_framework_for_changelog(framework_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.governance_frameworks f 
    JOIN public.profiles p ON p.organization_id = f.org_id 
    WHERE f.id = framework_id AND p.id = auth.uid()
  );
END;
$function$;

-- Fix check_user_org_for_framework function
CREATE OR REPLACE FUNCTION public.check_user_org_for_framework(org_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND organization_id = org_id
  );
END;
$function$;

-- Fix check_user_policy_access function
CREATE OR REPLACE FUNCTION public.check_user_policy_access(policy_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.governance_policies pol
    JOIN public.governance_frameworks f ON f.id = pol.framework_id
    JOIN public.profiles p ON p.organization_id = f.org_id 
    WHERE pol.id = policy_id AND p.id = auth.uid()
  );
END;
$function$;

-- Fix detect_data_patterns function
CREATE OR REPLACE FUNCTION public.detect_data_patterns(data_content text, org_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  classifications JSONB := '[]'::JSONB;
  pattern_record RECORD;
BEGIN
  -- Check against data classification patterns
  FOR pattern_record IN
    SELECT classification_name, data_patterns
    FROM public.data_classifications
    WHERE data_classifications.org_id = detect_data_patterns.org_id
  LOOP
    -- Simplified pattern matching - in production would use more sophisticated methods
    IF data_content ~ ANY(ARRAY(SELECT jsonb_array_elements_text(pattern_record.data_patterns))) THEN
      classifications := classifications || jsonb_build_object(
        'classification', pattern_record.classification_name,
        'confidence', 0.8
      );
    END IF;
  END LOOP;
  
  RETURN classifications;
END;
$function$;

-- Fix refresh_performance_dashboard function
CREATE OR REPLACE FUNCTION public.refresh_performance_dashboard()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.performance_dashboard_metrics;
END;
$function$;

-- Fix cleanup_expired_sessions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.user_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$function$;

-- Fix validate_password_strength function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text, org_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix check_session_timeout function
CREATE OR REPLACE FUNCTION public.check_session_timeout(session_token text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix handle_user_update function
CREATE OR REPLACE FUNCTION public.handle_user_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.profiles
  SET 
    full_name = NEW.raw_user_meta_data->>'full_name',
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$;

-- Fix log_role_change function
CREATE OR REPLACE FUNCTION public.log_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix invalidate_user_sessions_on_role_change function
CREATE OR REPLACE FUNCTION public.invalidate_user_sessions_on_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
    -- Invalidate all sessions for the user when their role changes
    IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
        UPDATE public.authentication_sessions
        SET is_active = false
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Fix create_organizational_profile_safe function
CREATE OR REPLACE FUNCTION public.create_organizational_profile_safe(p_organization_id uuid, p_preferred_framework_types text[] DEFAULT '{}'::text[], p_auto_generate_frameworks boolean DEFAULT true)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix get_kri_summary function
CREATE OR REPLACE FUNCTION public.get_kri_summary(start_date_param date DEFAULT NULL::date, end_date_param date DEFAULT NULL::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  result jsonb;
  total_logs integer;
  breached_count integer;
  unique_kris integer;
  avg_value numeric;
  trend_direction text;
BEGIN
  -- Build base query with optional date filters
  WITH filtered_logs AS (
    SELECT *
    FROM public.kri_logs
    WHERE (start_date_param IS NULL OR measurement_date >= start_date_param)
      AND (end_date_param IS NULL OR measurement_date <= end_date_param)
  )
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE threshold_breached IS NOT NULL AND threshold_breached != 'none'),
    COUNT(DISTINCT kri_id),
    COALESCE(AVG(actual_value), 0)
  INTO total_logs, breached_count, unique_kris, avg_value
  FROM filtered_logs;

  -- Simple trend calculation (comparing recent 1/3 vs older 1/3 of data)
  WITH filtered_logs AS (
    SELECT actual_value, measurement_date,
           ROW_NUMBER() OVER (ORDER BY measurement_date DESC) as rn,
           COUNT(*) OVER () as total_count
    FROM public.kri_logs
    WHERE (start_date_param IS NULL OR measurement_date >= start_date_param)
      AND (end_date_param IS NULL OR measurement_date <= end_date_param)
  ),
  recent_avg AS (
    SELECT AVG(actual_value) as avg_val
    FROM filtered_logs
    WHERE rn <= GREATEST(1, total_count / 3)
  ),
  older_avg AS (
    SELECT AVG(actual_value) as avg_val
    FROM filtered_logs
    WHERE rn > total_count - GREATEST(1, total_count / 3)
  )
  SELECT 
    CASE 
      WHEN r.avg_val > o.avg_val * 1.05 THEN 'up'
      WHEN r.avg_val < o.avg_val * 0.95 THEN 'down'
      ELSE 'stable'
    END
  INTO trend_direction
  FROM recent_avg r, older_avg o;

  -- Build result
  result := jsonb_build_object(
    'totalLogs', total_logs,
    'breachedThresholds', breached_count,
    'uniqueKRIs', unique_kris,
    'averageValue', ROUND(avg_value, 2),
    'trendDirection', COALESCE(trend_direction, 'stable')
  );

  RETURN result;
END;
$function$;

-- Fix get_analytics_summary function
CREATE OR REPLACE FUNCTION public.get_analytics_summary(org_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  result jsonb;
  total_count integer;
  active_count integer;
  high_confidence_count integer;
  types_json jsonb;
BEGIN
  -- Get total insights count
  SELECT COUNT(*) INTO total_count
  FROM public.analytics_insights
  WHERE org_id = org_id_param;

  -- Get active insights count (not expired)
  SELECT COUNT(*) INTO active_count
  FROM public.analytics_insights
  WHERE org_id = org_id_param
    AND (valid_until IS NULL OR valid_until > NOW());

  -- Get high confidence insights count (>= 0.8)
  SELECT COUNT(*) INTO high_confidence_count
  FROM public.analytics_insights
  WHERE org_id = org_id_param
    AND confidence_score >= 0.8;

  -- Get insights by type
  SELECT jsonb_object_agg(insight_type, count)
  INTO types_json
  FROM (
    SELECT insight_type, COUNT(*) as count
    FROM public.analytics_insights
    WHERE org_id = org_id_param
    GROUP BY insight_type
  ) type_counts;

  -- Build result
  result := jsonb_build_object(
    'totalInsights', total_count,
    'activeInsights', active_count,
    'highConfidenceInsights', high_confidence_count,
    'insightsByType', COALESCE(types_json, '{}'::jsonb)
  );

  RETURN result;
END;
$function$;