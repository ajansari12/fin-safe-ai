-- Phase 3: Advanced Security Features & Performance Optimization

-- Create advanced security logging with partitioning for performance
CREATE TABLE IF NOT EXISTS public.security_events_archive (
    LIKE public.security_events INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for the last 6 months and next 6 months
CREATE TABLE IF NOT EXISTS public.security_events_2024_01 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE IF NOT EXISTS public.security_events_2024_02 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE IF NOT EXISTS public.security_events_2024_03 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE IF NOT EXISTS public.security_events_2024_04 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE IF NOT EXISTS public.security_events_2024_05 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE IF NOT EXISTS public.security_events_2024_06 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE IF NOT EXISTS public.security_events_2024_07 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE IF NOT EXISTS public.security_events_2024_08 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE IF NOT EXISTS public.security_events_2024_09 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE IF NOT EXISTS public.security_events_2024_10 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE IF NOT EXISTS public.security_events_2024_11 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE IF NOT EXISTS public.security_events_2024_12 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
CREATE TABLE IF NOT EXISTS public.security_events_2025_01 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE IF NOT EXISTS public.security_events_2025_02 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE IF NOT EXISTS public.security_events_2025_03 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS public.security_events_2025_04 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE IF NOT EXISTS public.security_events_2025_05 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE IF NOT EXISTS public.security_events_2025_06 PARTITION OF public.security_events_archive
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

-- Create security metrics materialized view for fast analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.security_metrics_summary AS
SELECT 
    org_id,
    DATE_TRUNC('hour', created_at) as hour_bucket,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(risk_score) as avg_risk_score,
    MAX(risk_score) as max_risk_score,
    COUNT(CASE WHEN risk_score >= 80 THEN 1 END) as high_risk_events,
    COUNT(CASE WHEN risk_score >= 60 AND risk_score < 80 THEN 1 END) as medium_risk_events,
    COUNT(CASE WHEN risk_score < 60 THEN 1 END) as low_risk_events
FROM public.security_events 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY org_id, DATE_TRUNC('hour', created_at), event_type;

-- Create unique index on materialized view for fast queries
CREATE UNIQUE INDEX IF NOT EXISTS security_metrics_summary_idx 
ON public.security_metrics_summary (org_id, hour_bucket, event_type);

-- Create function to refresh security metrics
CREATE OR REPLACE FUNCTION public.refresh_security_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.security_metrics_summary;
END;
$$;

-- Create advanced threat detection rules
CREATE TABLE IF NOT EXISTS public.security_threat_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('anomaly', 'pattern', 'threshold', 'ml')),
    rule_config JSONB NOT NULL DEFAULT '{}',
    detection_logic TEXT NOT NULL,
    severity_level TEXT NOT NULL CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    false_positive_rate NUMERIC DEFAULT 0,
    accuracy_score NUMERIC DEFAULT 0,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Enable RLS on threat rules
ALTER TABLE public.security_threat_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for threat rules
CREATE POLICY "Users can view threat rules for their org" ON public.security_threat_rules
    FOR SELECT USING (check_user_org_access(org_id));

CREATE POLICY "Admins can manage threat rules for their org" ON public.security_threat_rules
    FOR ALL USING (is_admin_secure() AND check_user_org_access(org_id));

-- Create security intelligence table for threat feeds
CREATE TABLE IF NOT EXISTS public.security_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    intel_type TEXT NOT NULL CHECK (intel_type IN ('ip_reputation', 'domain_reputation', 'malware_signature', 'vulnerability', 'threat_indicator')),
    intel_source TEXT NOT NULL,
    intel_data JSONB NOT NULL,
    confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    severity_level TEXT NOT NULL CHECK (severity_level IN ('info', 'low', 'medium', 'high', 'critical')),
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security intelligence
ALTER TABLE public.security_intelligence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security intelligence
CREATE POLICY "Users can view security intelligence for their org" ON public.security_intelligence
    FOR SELECT USING (check_user_org_access(org_id));

CREATE POLICY "Admins can manage security intelligence for their org" ON public.security_intelligence
    FOR ALL USING (is_admin_secure() AND check_user_org_access(org_id));

-- Create security baseline configuration
CREATE TABLE IF NOT EXISTS public.security_baseline_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    config_category TEXT NOT NULL CHECK (config_category IN ('authentication', 'authorization', 'encryption', 'logging', 'monitoring', 'network', 'data_protection')),
    config_name TEXT NOT NULL,
    config_value JSONB NOT NULL,
    baseline_value JSONB NOT NULL,
    compliance_status TEXT NOT NULL CHECK (compliance_status IN ('compliant', 'non_compliant', 'partially_compliant', 'not_applicable')),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    remediation_steps TEXT,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on baseline config
ALTER TABLE public.security_baseline_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for baseline config
CREATE POLICY "Users can view baseline config for their org" ON public.security_baseline_config
    FOR SELECT USING (check_user_org_access(org_id));

CREATE POLICY "Admins can manage baseline config for their org" ON public.security_baseline_config
    FOR ALL USING (is_admin_secure() AND check_user_org_access(org_id));

-- Create advanced security analytics function
CREATE OR REPLACE FUNCTION public.get_advanced_security_analytics(
    p_org_id UUID DEFAULT NULL,
    p_time_range INTERVAL DEFAULT '24 hours'
)
RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    metric_trend TEXT,
    risk_level TEXT,
    recommendations TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id UUID;
    v_current_period_start TIMESTAMP WITH TIME ZONE;
    v_previous_period_start TIMESTAMP WITH TIME ZONE;
    v_current_events BIGINT;
    v_previous_events BIGINT;
    v_trend TEXT;
BEGIN
    -- Get user's org ID if not provided
    v_org_id := COALESCE(p_org_id, get_user_org_safe());
    
    -- Verify user has access to this org
    IF NOT check_user_org_access(v_org_id) THEN
        RAISE EXCEPTION 'Access denied to organization data';
    END IF;
    
    -- Calculate time periods
    v_current_period_start := NOW() - p_time_range;
    v_previous_period_start := v_current_period_start - p_time_range;
    
    -- Security Events Trend
    SELECT COUNT(*) INTO v_current_events
    FROM public.security_events 
    WHERE org_id = v_org_id 
    AND created_at >= v_current_period_start;
    
    SELECT COUNT(*) INTO v_previous_events
    FROM public.security_events 
    WHERE org_id = v_org_id 
    AND created_at >= v_previous_period_start 
    AND created_at < v_current_period_start;
    
    -- Determine trend
    IF v_previous_events = 0 THEN
        v_trend := CASE WHEN v_current_events > 0 THEN 'increasing' ELSE 'stable' END;
    ELSE
        v_trend := CASE 
            WHEN v_current_events > v_previous_events * 1.1 THEN 'increasing'
            WHEN v_current_events < v_previous_events * 0.9 THEN 'decreasing'
            ELSE 'stable'
        END;
    END IF;
    
    -- Return security events metric
    RETURN QUERY SELECT 
        'security_events'::TEXT,
        v_current_events::NUMERIC,
        v_trend,
        CASE 
            WHEN v_current_events > 100 THEN 'high'
            WHEN v_current_events > 50 THEN 'medium'
            ELSE 'low'
        END::TEXT,
        CASE 
            WHEN v_current_events > 100 THEN ARRAY['Investigate high volume of security events', 'Review security policies']
            WHEN v_trend = 'increasing' THEN ARRAY['Monitor increasing security events', 'Check for potential threats']
            ELSE ARRAY['Continue monitoring security events']
        END;
    
    -- High Risk Events
    RETURN QUERY SELECT 
        'high_risk_events'::TEXT,
        COUNT(*)::NUMERIC,
        'stable'::TEXT,
        CASE 
            WHEN COUNT(*) > 10 THEN 'critical'
            WHEN COUNT(*) > 5 THEN 'high'
            WHEN COUNT(*) > 0 THEN 'medium'
            ELSE 'low'
        END::TEXT,
        CASE 
            WHEN COUNT(*) > 10 THEN ARRAY['Immediate investigation required', 'Review security controls']
            WHEN COUNT(*) > 5 THEN ARRAY['Investigation recommended', 'Enhance monitoring']
            WHEN COUNT(*) > 0 THEN ARRAY['Monitor closely', 'Review event details']
            ELSE ARRAY['No high-risk events detected']
        END
    FROM public.security_events 
    WHERE org_id = v_org_id 
    AND created_at >= v_current_period_start
    AND risk_score >= 80;
    
    -- Authentication Failures
    RETURN QUERY SELECT 
        'auth_failures'::TEXT,
        COUNT(*)::NUMERIC,
        'stable'::TEXT,
        CASE 
            WHEN COUNT(*) > 50 THEN 'high'
            WHEN COUNT(*) > 20 THEN 'medium'
            ELSE 'low'
        END::TEXT,
        CASE 
            WHEN COUNT(*) > 50 THEN ARRAY['Review authentication policies', 'Check for brute force attacks']
            WHEN COUNT(*) > 20 THEN ARRAY['Monitor authentication attempts', 'Consider rate limiting']
            ELSE ARRAY['Authentication failures within normal range']
        END
    FROM public.security_events 
    WHERE org_id = v_org_id 
    AND created_at >= v_current_period_start
    AND event_type = 'authentication_failure';
    
    -- Session Anomalies
    RETURN QUERY SELECT 
        'session_anomalies'::TEXT,
        COUNT(*)::NUMERIC,
        'stable'::TEXT,
        CASE 
            WHEN COUNT(*) > 20 THEN 'high'
            WHEN COUNT(*) > 10 THEN 'medium'
            ELSE 'low'
        END::TEXT,
        CASE 
            WHEN COUNT(*) > 20 THEN ARRAY['Investigate session anomalies', 'Review session policies']
            WHEN COUNT(*) > 10 THEN ARRAY['Monitor session patterns', 'Check for suspicious activity']
            ELSE ARRAY['Session activity appears normal']
        END
    FROM public.security_events 
    WHERE org_id = v_org_id 
    AND created_at >= v_current_period_start
    AND event_type IN ('session_anomaly', 'concurrent_session_limit');
END;
$$;

-- Create function for security baseline compliance check
CREATE OR REPLACE FUNCTION public.check_security_baseline_compliance(
    p_org_id UUID DEFAULT NULL
)
RETURNS TABLE (
    category TEXT,
    compliant_count BIGINT,
    non_compliant_count BIGINT,
    compliance_percentage NUMERIC,
    critical_issues BIGINT,
    high_issues BIGINT,
    recommendations TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Get user's org ID if not provided
    v_org_id := COALESCE(p_org_id, get_user_org_safe());
    
    -- Verify user has access to this org
    IF NOT check_user_org_access(v_org_id) THEN
        RAISE EXCEPTION 'Access denied to organization data';
    END IF;
    
    RETURN QUERY 
    SELECT 
        sbc.config_category,
        COUNT(CASE WHEN sbc.compliance_status = 'compliant' THEN 1 END) as compliant_count,
        COUNT(CASE WHEN sbc.compliance_status = 'non_compliant' THEN 1 END) as non_compliant_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN sbc.compliance_status = 'compliant' THEN 1 END) * 100.0) / COUNT(*), 2)
            ELSE 0
        END as compliance_percentage,
        COUNT(CASE WHEN sbc.risk_level = 'critical' THEN 1 END) as critical_issues,
        COUNT(CASE WHEN sbc.risk_level = 'high' THEN 1 END) as high_issues,
        ARRAY_AGG(DISTINCT sbc.remediation_steps) FILTER (WHERE sbc.remediation_steps IS NOT NULL) as recommendations
    FROM public.security_baseline_config sbc
    WHERE sbc.org_id = v_org_id
    GROUP BY sbc.config_category;
END;
$$;

-- Create performance optimization indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_org_time_risk 
ON public.security_events (org_id, created_at DESC, risk_score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_type_time 
ON public.security_events (event_type, created_at DESC) WHERE risk_score >= 60;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_intelligence_org_type_active 
ON public.security_intelligence (org_id, intel_type, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_baseline_org_compliance 
ON public.security_baseline_config (org_id, compliance_status, risk_level);

-- Create trigger for automatic security metrics refresh
CREATE OR REPLACE FUNCTION public.trigger_security_metrics_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Schedule refresh of materialized view (async)
    PERFORM pg_notify('security_metrics_refresh', NEW.org_id::text);
    RETURN NEW;
END;
$$;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'security_events_metrics_refresh') THEN
        CREATE TRIGGER security_events_metrics_refresh
        AFTER INSERT ON public.security_events
        FOR EACH ROW
        EXECUTE FUNCTION public.trigger_security_metrics_refresh();
    END IF;
END;
$$;

-- Create automated security baseline checks
INSERT INTO public.security_baseline_config (org_id, config_category, config_name, config_value, baseline_value, compliance_status, risk_level, remediation_steps)
SELECT 
    o.id,
    'authentication'::TEXT,
    'mfa_enforcement'::TEXT,
    JSONB_BUILD_OBJECT('enabled', COALESCE(auth_s.mfa_enforced, false)),
    JSONB_BUILD_OBJECT('enabled', true),
    CASE WHEN COALESCE(auth_s.mfa_enforced, false) THEN 'compliant' ELSE 'non_compliant' END,
    CASE WHEN COALESCE(auth_s.mfa_enforced, false) THEN 'low' ELSE 'high' END,
    'Enable MFA enforcement for all users in the organization'
FROM public.organizations o
LEFT JOIN public.auth_settings auth_s ON auth_s.org_id = o.id
ON CONFLICT (org_id, config_category, config_name) DO UPDATE SET
    config_value = EXCLUDED.config_value,
    compliance_status = EXCLUDED.compliance_status,
    risk_level = EXCLUDED.risk_level,
    last_checked_at = NOW();

-- Create security monitoring dashboard summary view
CREATE OR REPLACE VIEW public.security_dashboard_summary AS
SELECT 
    se.org_id,
    COUNT(*) as total_events,
    COUNT(CASE WHEN se.risk_score >= 80 THEN 1 END) as critical_events,
    COUNT(CASE WHEN se.risk_score >= 60 AND se.risk_score < 80 THEN 1 END) as high_events,
    COUNT(CASE WHEN se.risk_score >= 40 AND se.risk_score < 60 THEN 1 END) as medium_events,
    COUNT(CASE WHEN se.risk_score < 40 THEN 1 END) as low_events,
    COUNT(DISTINCT se.user_id) as affected_users,
    COUNT(DISTINCT se.session_id) as affected_sessions,
    MAX(se.created_at) as last_event_at,
    AVG(se.risk_score) as avg_risk_score
FROM public.security_events se
WHERE se.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY se.org_id;

-- Grant necessary permissions
GRANT SELECT ON public.security_dashboard_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_advanced_security_analytics(UUID, INTERVAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_security_baseline_compliance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_security_metrics() TO authenticated;