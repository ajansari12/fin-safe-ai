-- Critical Security Fix: Add SET search_path = '' to all remaining SECURITY DEFINER functions

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

-- Fix update_user_role_safe function
CREATE OR REPLACE FUNCTION public.update_user_role_safe(p_user_id uuid, p_new_role text, p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_current_user_id UUID;
    v_current_user_org UUID;
    v_is_admin BOOLEAN := FALSE;
    v_result JSONB;
BEGIN
    -- Get current user info
    v_current_user_id := auth.uid();
    
    -- Check if current user exists and get their org
    SELECT organization_id INTO v_current_user_org
    FROM public.profiles
    WHERE id = v_current_user_id;
    
    -- Verify current user is admin in the same organization
    SELECT EXISTS(
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = v_current_user_id
        AND ur.organization_id = p_organization_id
        AND ur.role_type = 'admin'
    ) INTO v_is_admin;
    
    -- Security checks
    IF v_current_user_org IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    
    IF v_current_user_org != p_organization_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Organization access denied');
    END IF;
    
    IF NOT v_is_admin THEN
        RETURN jsonb_build_object('success', false, 'error', 'Admin privileges required');
    END IF;
    
    -- Validate role
    IF p_new_role NOT IN ('admin', 'analyst', 'reviewer') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid role specified');
    END IF;
    
    -- Update or insert user role
    INSERT INTO public.user_roles (user_id, organization_id, role, role_type)
    VALUES (p_user_id, p_organization_id, p_new_role, p_new_role::app_role)
    ON CONFLICT (user_id, organization_id) 
    DO UPDATE SET 
        role = p_new_role,
        role_type = p_new_role::app_role,
        created_at = COALESCE(user_roles.created_at, now());
    
    -- Log the action
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
        p_organization_id,
        v_current_user_id,
        COALESCE(p.full_name, 'Unknown Admin'),
        'UPDATE_USER_ROLE',
        'user_role',
        p_user_id::TEXT,
        COALESCE(target_p.full_name, 'Unknown User'),
        jsonb_build_object(
            'new_role', p_new_role,
            'target_user_id', p_user_id,
            'timestamp', now()
        )
    FROM public.profiles p
    LEFT JOIN public.profiles target_p ON target_p.id = p_user_id
    WHERE p.id = v_current_user_id;
    
    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Role updated successfully',
        'user_id', p_user_id,
        'new_role', p_new_role
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Database error: ' || SQLERRM
        );
END;
$function$;

-- Fix create_organization_with_profile function
CREATE OR REPLACE FUNCTION public.create_organization_with_profile(p_org_name text, p_sector text, p_size text, p_regulatory_guidelines text[] DEFAULT '{}'::text[], p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(organization_id uuid, profile_updated boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
$function$;

-- Fix increment_template_usage function
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.industry_template_libraries 
  SET usage_count = usage_count + 1 
  WHERE id = template_id;
END;
$function$;

-- Fix cleanup_old_logs function
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Clean up logs older than specified periods
    DELETE FROM public.admin_logs WHERE created_at < NOW() - INTERVAL '2 years';
    DELETE FROM public.ai_chat_logs WHERE created_at < NOW() - INTERVAL '1 year';
    DELETE FROM public.integration_logs WHERE created_at < NOW() - INTERVAL '6 months';
    DELETE FROM public.performance_analytics WHERE created_at < NOW() - INTERVAL '3 months';
    
    -- Log cleanup activity
    INSERT INTO public.admin_logs (
        org_id, admin_user_id, admin_user_name, action_type, resource_type, action_details
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        'system',
        'System Cleanup',
        'CLEANUP',
        'logs',
        json_build_object('action', 'automated_log_cleanup', 'timestamp', NOW())
    );
END;
$function$;

-- Fix get_incidents_summary function
CREATE OR REPLACE FUNCTION public.get_incidents_summary(org_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  result jsonb;
  total_count integer;
  critical_count integer;
  open_count integer;
  avg_resolution_hours numeric;
  categories_json jsonb;
  severities_json jsonb;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_count
  FROM public.incident_logs
  WHERE org_id = org_id_param;

  -- Get critical incidents count
  SELECT COUNT(*) INTO critical_count
  FROM public.incident_logs
  WHERE org_id = org_id_param AND severity = 'critical';

  -- Get open incidents count
  SELECT COUNT(*) INTO open_count
  FROM public.incident_logs
  WHERE org_id = org_id_param AND status = 'open';

  -- Calculate average resolution time in hours
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600), 0) INTO avg_resolution_hours
  FROM public.incident_logs
  WHERE org_id = org_id_param AND resolved_at IS NOT NULL;

  -- Get incidents by category
  SELECT jsonb_object_agg(category, count)
  INTO categories_json
  FROM (
    SELECT category, COUNT(*) as count
    FROM public.incident_logs
    WHERE org_id = org_id_param
    GROUP BY category
  ) cat_counts;

  -- Get incidents by severity
  SELECT jsonb_object_agg(severity, count)
  INTO severities_json
  FROM (
    SELECT severity, COUNT(*) as count
    FROM public.incident_logs
    WHERE org_id = org_id_param
    GROUP BY severity
  ) sev_counts;

  -- Build result
  result := jsonb_build_object(
    'totalIncidents', total_count,
    'criticalIncidents', critical_count,
    'openIncidents', open_count,
    'averageResolutionTime', ROUND(avg_resolution_hours, 2),
    'incidentsByCategory', COALESCE(categories_json, '{}'::jsonb),
    'incidentsBySeverity', COALESCE(severities_json, '{}'::jsonb)
  );

  RETURN result;
END;
$function$;

-- Fix validate_user_org_relationship function
CREATE OR REPLACE FUNCTION public.validate_user_org_relationship(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

-- Fix repair_user_data function
CREATE OR REPLACE FUNCTION public.repair_user_data(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

-- Fix calculate_vendor_risk_score function
CREATE OR REPLACE FUNCTION public.calculate_vendor_risk_score(vendor_criticality text, last_assessment_date date, contract_end_date date, sla_expiry_date date, status text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  risk_score INTEGER := 1;
  days_since_assessment INTEGER;
  days_to_contract_end INTEGER;
  days_to_sla_expiry INTEGER;
BEGIN
  -- Base score from criticality
  CASE vendor_criticality
    WHEN 'critical' THEN risk_score := risk_score + 2;
    WHEN 'high' THEN risk_score := risk_score + 1;
    WHEN 'medium' THEN risk_score := risk_score + 0;
    WHEN 'low' THEN risk_score := risk_score - 1;
  END CASE;

  -- Add score based on last assessment
  IF last_assessment_date IS NOT NULL THEN
    days_since_assessment := CURRENT_DATE - last_assessment_date;
    IF days_since_assessment > 365 THEN
      risk_score := risk_score + 2;
    ELSIF days_since_assessment > 180 THEN
      risk_score := risk_score + 1;
    END IF;
  ELSE
    risk_score := risk_score + 2; -- No assessment = high risk
  END IF;

  -- Add score based on contract expiry
  IF contract_end_date IS NOT NULL THEN
    days_to_contract_end := contract_end_date - CURRENT_DATE;
    IF days_to_contract_end <= 30 THEN
      risk_score := risk_score + 2;
    ELSIF days_to_contract_end <= 90 THEN
      risk_score := risk_score + 1;
    END IF;
  END IF;

  -- Add score based on SLA expiry
  IF sla_expiry_date IS NOT NULL THEN
    days_to_sla_expiry := sla_expiry_date - CURRENT_DATE;
    IF days_to_sla_expiry <= 30 THEN
      risk_score := risk_score + 1;
    END IF;
  END IF;

  -- Add score based on vendor status
  CASE status
    WHEN 'inactive' THEN risk_score := risk_score + 1;
    WHEN 'under_review' THEN risk_score := risk_score + 1;
    WHEN 'terminated' THEN risk_score := risk_score + 3;
  END CASE;

  -- Ensure score is within 1-5 range
  risk_score := GREATEST(1, LEAST(5, risk_score));
  
  RETURN risk_score;
END;
$function$;

-- Fix check_incident_sla_breaches function
CREATE OR REPLACE FUNCTION public.check_incident_sla_breaches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  incident_record RECORD;
  hours_since_reported INTEGER;
  hours_since_first_response INTEGER;
  escalation_reason TEXT;
  escalation_type TEXT;
BEGIN
  -- Check for incidents that have breached SLA
  FOR incident_record IN 
    SELECT il.*
    FROM public.incident_logs il
    WHERE il.status IN ('open', 'in_progress')
    AND il.escalation_level < 3  -- Don't escalate beyond level 3
  LOOP
    hours_since_reported := EXTRACT(EPOCH FROM (now() - incident_record.reported_at)) / 3600;
    
    -- Check for response time breach
    IF incident_record.first_response_at IS NULL 
       AND hours_since_reported > incident_record.max_response_time_hours THEN
      
      escalation_reason := format('Response SLA breach: %s hours elapsed, maximum %s hours allowed',
                                hours_since_reported::text, 
                                incident_record.max_response_time_hours::text);
      escalation_type := 'response_sla_breach';
      
      -- Create escalation record
      INSERT INTO public.incident_escalations (
        incident_id,
        escalation_level,
        escalation_reason,
        escalation_type
      ) VALUES (
        incident_record.id,
        incident_record.escalation_level + 1,
        escalation_reason,
        escalation_type
      );
      
      -- Update incident escalation level
      UPDATE public.incident_logs 
      SET escalation_level = escalation_level + 1,
          escalated_at = now()
      WHERE id = incident_record.id;
      
    -- Check for resolution time breach
    ELSIF incident_record.resolved_at IS NULL 
          AND hours_since_reported > incident_record.max_resolution_time_hours THEN
      
      escalation_reason := format('Resolution SLA breach: %s hours elapsed, maximum %s hours allowed',
                                hours_since_reported::text, 
                                incident_record.max_resolution_time_hours::text);
      escalation_type := 'resolution_sla_breach';
      
      -- Create escalation record
      INSERT INTO public.incident_escalations (
        incident_id,
        escalation_level,
        escalation_reason,
        escalation_type
      ) VALUES (
        incident_record.id,
        incident_record.escalation_level + 1,
        escalation_reason,
        escalation_type
      );
      
      -- Update incident escalation level
      UPDATE public.incident_logs 
      SET escalation_level = escalation_level + 1,
          escalated_at = now()
      WHERE id = incident_record.id;
    END IF;
  END LOOP;
END;
$function$;