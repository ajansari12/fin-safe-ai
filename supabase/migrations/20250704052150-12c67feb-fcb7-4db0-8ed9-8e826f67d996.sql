-- Create optimized database functions for summary queries

-- Incident logs summary function (already exists but ensuring it's available)
CREATE OR REPLACE FUNCTION public.get_incidents_summary(org_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- KRI summary function with date range support (already exists but ensuring it's available)
CREATE OR REPLACE FUNCTION public.get_kri_summary(
  start_date_param date DEFAULT NULL,
  end_date_param date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Analytics insights summary function (already exists but ensuring it's available)
CREATE OR REPLACE FUNCTION public.get_analytics_summary(org_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;