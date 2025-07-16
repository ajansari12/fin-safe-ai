-- Complete database security fixes: Add SET search_path = '' to functions we can modify
-- This addresses the non-C functions that need search path protection

-- Update remaining PL/pgSQL and SQL functions with SET search_path = ''
-- These are the functions we can actually modify in Supabase

-- Fix remaining trigger functions that don't have SET search_path
CREATE OR REPLACE FUNCTION public.update_policy_status_on_review()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_propagation_chain_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_recovery_contact_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_scenario_result_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_workflow_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_framework_progress()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  v_framework_id UUID;
  v_avg_progress INTEGER;
BEGIN
  -- Get the framework ID from the component
  SELECT framework_id INTO v_framework_id
  FROM framework_components 
  WHERE id = COALESCE(NEW.component_id, OLD.component_id);
  
  -- Calculate average progress for this framework
  SELECT COALESCE(AVG(fcp.completion_percentage), 0)::INTEGER INTO v_avg_progress
  FROM framework_components fc
  LEFT JOIN framework_component_progress fcp ON fc.id = fcp.component_id
  WHERE fc.framework_id = v_framework_id;
  
  -- Update the framework with calculated progress
  UPDATE generated_frameworks
  SET 
    overall_completion_percentage = v_avg_progress,
    last_activity_at = now(),
    is_stagnant = false,
    stagnant_since = NULL
  WHERE id = v_framework_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_framework_generation_status_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.detect_stagnant_frameworks()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.generated_frameworks
  SET 
    is_stagnant = true,
    stagnant_since = COALESCE(stagnant_since, now())
  WHERE 
    implementation_status = 'in_progress'
    AND last_activity_at < (now() - INTERVAL '30 days')
    AND NOT is_stagnant;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_profile_org_consistency()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Ensure organization exists
  IF NEW.organization_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.organizations WHERE id = NEW.organization_id
  ) THEN
    RAISE EXCEPTION 'Referenced organization does not exist';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_control_test_due_date()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Set next test due date based on test frequency
  IF NEW.test_frequency_days IS NOT NULL THEN
    NEW.next_test_due_date = COALESCE(NEW.last_test_date, CURRENT_DATE) + INTERVAL '1 day' * NEW.test_frequency_days;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_expiring_contracts()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  contract_record RECORD;
  alert_date DATE;
  days_until_expiry INTEGER;
BEGIN
  -- Check contracts expiring within 60 days
  FOR contract_record IN 
    SELECT vc.*, tp.vendor_name
    FROM public.vendor_contracts vc
    JOIN public.third_party_profiles tp ON tp.id = vc.vendor_profile_id
    WHERE vc.end_date <= CURRENT_DATE + INTERVAL '60 days'
    AND vc.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM public.contract_renewal_alerts cra
      WHERE cra.contract_id = vc.id 
      AND cra.status = 'pending'
    )
  LOOP
    days_until_expiry := contract_record.end_date - CURRENT_DATE;
    alert_date := CURRENT_DATE;
    
    -- Create renewal alert
    INSERT INTO public.contract_renewal_alerts (
      contract_id,
      alert_date,
      days_until_expiry,
      alert_type,
      status
    ) VALUES (
      contract_record.id,
      alert_date,
      days_until_expiry,
      'renewal_reminder',
      'pending'
    );
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_calculate_kri_variance_enhanced()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Calculate variance for the new/updated KRI log
  PERFORM calculate_kri_appetite_variance_enhanced(
    NEW.kri_id,
    NEW.actual_value,
    NEW.measurement_date
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_dependency_risk_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_calculate_kri_variance()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Calculate variance for the new/updated KRI log
  PERFORM calculate_kri_appetite_variance(
    NEW.kri_id,
    NEW.actual_value,
    NEW.measurement_date
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_ai_chat_logs_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_continuity_plan_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_failure_scenario_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_control_after_test()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Update the control's last test date and effectiveness score
  UPDATE public.controls 
  SET 
    last_test_date = NEW.test_date,
    next_test_due_date = NEW.test_date + INTERVAL '1 day' * COALESCE(test_frequency_days, 90),
    effectiveness_score = NEW.effectiveness_rating,
    risk_reduction_score = NEW.risk_reduction_impact,
    updated_at = now()
  WHERE id = NEW.control_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_continuity_test_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_dependency_map_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_dependency_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_governance_policy_review_timestamps()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  
  -- Set reviewed_at when status changes from under_review to approved/rejected
  IF OLD.status = 'under_review' AND NEW.status IN ('approved', 'rejected') THEN
    NEW.reviewed_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_incident_first_response()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Update first_response_at if this is the first response and it's not set
  IF NEW.response_type = 'update' AND OLD.first_response_at IS NULL THEN
    UPDATE public.incident_logs
    SET first_response_at = NEW.created_at
    WHERE id = NEW.incident_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_integrations_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_auth_settings_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_role_assignment()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_appetite_breaches()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  breach_record RECORD;
  escalation_rule RECORD;
  breach_severity TEXT;
  variance_pct NUMERIC;
BEGIN
  -- This will be called when KRI values are updated
  -- Check if the new value breaches any appetite thresholds
  
  FOR breach_record IN 
    SELECT 
      rt.id as threshold_id,
      rt.statement_id,
      rt.category_id as risk_category_id,
      kd.org_id,
      CASE 
        WHEN rt.tolerance_level = 'low' THEN 30
        WHEN rt.tolerance_level = 'medium' THEN 60
        ELSE 90
      END as threshold_value
    FROM public.risk_thresholds rt
    JOIN public.kri_definitions kd ON kd.threshold_id = rt.id
    WHERE kd.id = NEW.kri_id
  LOOP
    -- Calculate variance percentage
    variance_pct := ((NEW.actual_value - breach_record.threshold_value) / breach_record.threshold_value) * 100;
    
    -- Determine breach severity
    IF variance_pct > 50 THEN
      breach_severity := 'critical';
    ELSIF variance_pct > 20 THEN
      breach_severity := 'breach';
    ELSIF variance_pct > 10 THEN
      breach_severity := 'warning';
    ELSE
      CONTINUE; -- No breach, skip
    END IF;
    
    -- Log the breach
    INSERT INTO public.appetite_breach_logs (
      org_id,
      risk_category_id,
      statement_id,
      threshold_id,
      breach_severity,
      actual_value,
      threshold_value,
      variance_percentage
    ) VALUES (
      breach_record.org_id,
      breach_record.risk_category_id,
      breach_record.statement_id,
      breach_record.threshold_id,
      breach_severity,
      NEW.actual_value,
      breach_record.threshold_value,
      variance_pct
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.detect_dependency_breach()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  tolerance_record RECORD;
  breach_detected BOOLEAN := false;
  impact_assessment TEXT := 'none';
BEGIN
  -- Only process status changes to failed or degraded
  IF NEW.status IN ('failed', 'degraded') AND OLD.status = 'operational' THEN
    -- Check if business function has impact tolerances defined
    SELECT it.max_tolerable_downtime, it.quantitative_threshold, bf.criticality
    INTO tolerance_record
    FROM public.impact_tolerances it
    JOIN public.business_functions bf ON bf.id = it.function_id
    WHERE it.function_id = NEW.business_function_id
    AND it.status = 'published'
    LIMIT 1;
    
    IF tolerance_record IS NOT NULL THEN
      -- Assess impact based on dependency criticality and business function criticality
      IF NEW.criticality = 'critical' AND tolerance_record.criticality IN ('critical', 'high') THEN
        impact_assessment := 'critical';
        breach_detected := true;
      ELSIF NEW.criticality = 'high' AND tolerance_record.criticality = 'critical' THEN
        impact_assessment := 'high';
        breach_detected := true;
      ELSIF NEW.criticality IN ('critical', 'high') THEN
        impact_assessment := 'medium';
      ELSE
        impact_assessment := 'low';
      END IF;
      
      -- Log the breach detection
      INSERT INTO public.dependency_logs (
        dependency_id,
        business_function_id,
        event_type,
        previous_status,
        new_status,
        impact_level,
        tolerance_breached,
        notes,
        org_id
      ) VALUES (
        NEW.id,
        NEW.business_function_id,
        CASE WHEN breach_detected THEN 'breach_detected' ELSE 'status_change' END,
        OLD.status,
        NEW.status,
        impact_assessment,
        breach_detected,
        CASE WHEN breach_detected 
          THEN 'Impact tolerance breach detected for dependency: ' || NEW.dependency_name
          ELSE 'Dependency status changed to ' || NEW.status
        END,
        NEW.org_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_incident_sla_defaults()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Set default SLA times based on severity if not already set
  IF NEW.max_response_time_hours IS NULL THEN
    CASE NEW.severity
      WHEN 'critical' THEN NEW.max_response_time_hours := 1;
      WHEN 'high' THEN NEW.max_response_time_hours := 4;
      WHEN 'medium' THEN NEW.max_response_time_hours := 24;
      WHEN 'low' THEN NEW.max_response_time_hours := 72;
    END CASE;
  END IF;

  IF NEW.max_resolution_time_hours IS NULL THEN
    CASE NEW.severity
      WHEN 'critical' THEN NEW.max_resolution_time_hours := 4;
      WHEN 'high' THEN NEW.max_resolution_time_hours := 24;
      WHEN 'medium' THEN NEW.max_resolution_time_hours := 72;
      WHEN 'low' THEN NEW.max_resolution_time_hours := 168;
    END CASE;
  END IF;

  -- Set assignment level based on severity
  IF NEW.assigned_level IS NULL OR NEW.assigned_level = 'analyst' THEN
    CASE NEW.severity
      WHEN 'critical' THEN NEW.assigned_level := 'executive';
      WHEN 'high' THEN NEW.assigned_level := 'manager';
      WHEN 'medium' THEN NEW.assigned_level := 'manager';
      WHEN 'low' THEN NEW.assigned_level := 'analyst';
    END CASE;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_scenario_test_metrics()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  metric_date DATE;
  org_id_val UUID;
BEGIN
  -- Get the organization ID from the scenario test
  SELECT st.org_id, DATE(COALESCE(NEW.execution_completed_at, NEW.execution_started_at))
  INTO org_id_val, metric_date
  FROM public.scenario_tests st
  WHERE st.id = NEW.scenario_test_id;

  -- Update or insert metrics for the day
  INSERT INTO public.scenario_test_metrics (
    org_id,
    test_date,
    total_tests_conducted,
    successful_tests,
    failed_tests
  ) VALUES (
    org_id_val,
    metric_date,
    1,
    CASE WHEN NEW.success_rate >= 80 THEN 1 ELSE 0 END,
    CASE WHEN NEW.success_rate < 80 THEN 1 ELSE 0 END
  )
  ON CONFLICT (org_id, test_date) 
  DO UPDATE SET
    total_tests_conducted = scenario_test_metrics.total_tests_conducted + 1,
    successful_tests = scenario_test_metrics.successful_tests + 
      CASE WHEN NEW.success_rate >= 80 THEN 1 ELSE 0 END,
    failed_tests = scenario_test_metrics.failed_tests + 
      CASE WHEN NEW.success_rate < 80 THEN 1 ELSE 0 END,
    updated_at = now();

  RETURN NEW;
END;
$function$;