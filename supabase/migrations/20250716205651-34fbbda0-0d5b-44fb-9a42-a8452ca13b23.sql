-- Phase 3: Advanced Security Features & Performance Optimization (Fixed)

-- First, create the base security_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    user_id UUID,
    session_id UUID,
    event_type TEXT NOT NULL,
    event_source TEXT NOT NULL DEFAULT 'application',
    event_category TEXT NOT NULL CHECK (event_category IN ('authentication', 'authorization', 'data_access', 'configuration', 'session', 'system')),
    risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    event_data JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    location_data JSONB,
    detection_rules TEXT[],
    false_positive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security_events
CREATE POLICY "Users can view security events for their org" ON public.security_events
    FOR SELECT USING (check_user_org_access(org_id));

CREATE POLICY "System can insert security events" ON public.security_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage security events for their org" ON public.security_events
    FOR ALL USING (is_admin_secure() AND check_user_org_access(org_id));

-- Create performance indexes for security_events
CREATE INDEX IF NOT EXISTS idx_security_events_org_time 
ON public.security_events (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_user_time 
ON public.security_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_type_risk 
ON public.security_events (event_type, risk_score DESC);

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, config_category, config_name)
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
CREATE INDEX IF NOT EXISTS idx_security_events_org_time_risk 
ON public.security_events (org_id, created_at DESC, risk_score DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_type_time 
ON public.security_events (event_type, created_at DESC) WHERE risk_score >= 60;

CREATE INDEX IF NOT EXISTS idx_security_intelligence_org_type_active 
ON public.security_intelligence (org_id, intel_type, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_security_baseline_org_compliance 
ON public.security_baseline_config (org_id, compliance_status, risk_level);

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