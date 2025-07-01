
-- Create data loss prevention patterns table
CREATE TABLE public.dlp_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_regex TEXT NOT NULL,
  classification_level TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 5,
  action_on_match TEXT NOT NULL DEFAULT 'block',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, pattern_name)
);

-- Create enhanced authentication sessions table
CREATE TABLE public.enhanced_auth_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  org_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_fingerprint_id UUID REFERENCES device_fingerprints,
  risk_score INTEGER NOT NULL DEFAULT 0,
  trust_score INTEGER NOT NULL DEFAULT 50,
  authentication_factors JSONB NOT NULL DEFAULT '[]',
  behavioral_score INTEGER DEFAULT 50,
  location_data JSONB,
  is_privileged BOOLEAN DEFAULT false,
  privileged_expires_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  auto_logout_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create threat intelligence indicators table
CREATE TABLE public.threat_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  indicator_type TEXT NOT NULL,
  indicator_value TEXT NOT NULL,
  threat_type TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL,
  severity TEXT NOT NULL,
  source_feed TEXT NOT NULL,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, indicator_type, indicator_value)
);

-- Create compliance frameworks table
CREATE TABLE public.compliance_frameworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  framework_name TEXT NOT NULL,
  framework_version TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]',
  controls JSONB NOT NULL DEFAULT '[]',
  assessment_frequency TEXT NOT NULL DEFAULT 'quarterly',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, framework_name, framework_version)
);

-- Create security playbooks table
CREATE TABLE public.security_playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  playbook_name TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  response_steps JSONB NOT NULL DEFAULT '[]',
  escalation_rules JSONB NOT NULL DEFAULT '{}',
  automation_level TEXT NOT NULL DEFAULT 'manual',
  priority INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, playbook_name)
);

-- Create security metrics table
CREATE TABLE public.security_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  measurement_period TEXT NOT NULL DEFAULT 'daily',
  baseline_value NUMERIC,
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  trend_direction TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, metric_type, metric_name, measurement_date, measurement_period)
);

-- Add RLS policies
ALTER TABLE public.dlp_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_metrics ENABLE ROW LEVEL SECURITY;

-- DLP patterns policies
CREATE POLICY "Users can manage their org's DLP patterns" 
  ON public.dlp_patterns FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Enhanced auth sessions policies
CREATE POLICY "Users can view their org's auth sessions" 
  ON public.enhanced_auth_sessions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's auth sessions" 
  ON public.enhanced_auth_sessions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Threat indicators policies
CREATE POLICY "Users can view their org's threat indicators" 
  ON public.threat_indicators FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's threat indicators" 
  ON public.threat_indicators FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Compliance frameworks policies
CREATE POLICY "Users can manage their org's compliance frameworks" 
  ON public.compliance_frameworks FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Security playbooks policies
CREATE POLICY "Users can manage their org's security playbooks" 
  ON public.security_playbooks FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Security metrics policies
CREATE POLICY "Users can view their org's security metrics" 
  ON public.security_metrics FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can insert security metrics for their org" 
  ON public.security_metrics FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Create indexes for performance
CREATE INDEX idx_dlp_patterns_org_id ON public.dlp_patterns(org_id);
CREATE INDEX idx_enhanced_auth_sessions_user_id ON public.enhanced_auth_sessions(user_id);
CREATE INDEX idx_enhanced_auth_sessions_org_id ON public.enhanced_auth_sessions(org_id);
CREATE INDEX idx_enhanced_auth_sessions_last_activity ON public.enhanced_auth_sessions(last_activity_at);
CREATE INDEX idx_threat_indicators_org_id ON public.threat_indicators(org_id);
CREATE INDEX idx_threat_indicators_type_value ON public.threat_indicators(indicator_type, indicator_value);
CREATE INDEX idx_compliance_frameworks_org_id ON public.compliance_frameworks(org_id);
CREATE INDEX idx_security_playbooks_org_id ON public.security_playbooks(org_id);
CREATE INDEX idx_security_metrics_org_id ON public.security_metrics(org_id);
CREATE INDEX idx_security_metrics_date ON public.security_metrics(measurement_date);
