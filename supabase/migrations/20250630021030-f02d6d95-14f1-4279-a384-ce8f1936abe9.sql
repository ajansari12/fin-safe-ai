
-- Zero-Trust Security Model Tables
CREATE TABLE public.device_fingerprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  org_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  fingerprint_hash TEXT NOT NULL,
  device_info JSONB NOT NULL DEFAULT '{}',
  risk_score INTEGER NOT NULL DEFAULT 0,
  is_trusted BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_id)
);

CREATE TABLE public.authentication_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  org_id UUID NOT NULL,
  device_fingerprint_id UUID REFERENCES device_fingerprints NOT NULL,
  session_token TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  authentication_factors JSONB NOT NULL DEFAULT '[]',
  location_data JSONB,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.behavioral_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  org_id UUID NOT NULL,
  session_id UUID REFERENCES authentication_sessions,
  activity_type TEXT NOT NULL,
  activity_data JSONB NOT NULL DEFAULT '{}',
  risk_indicators JSONB NOT NULL DEFAULT '{}',
  anomaly_score INTEGER NOT NULL DEFAULT 0,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data Loss Prevention Tables
CREATE TABLE public.data_classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  classification_name TEXT NOT NULL,
  classification_level TEXT NOT NULL,
  data_patterns JSONB NOT NULL DEFAULT '[]',
  protection_rules JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, classification_name)
);

CREATE TABLE public.data_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  access_type TEXT NOT NULL,
  data_classification TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0,
  access_granted BOOLEAN NOT NULL DEFAULT true,
  denial_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.dlp_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  violation_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  detected_data JSONB NOT NULL,
  context_data JSONB,
  action_taken TEXT NOT NULL,
  investigation_status TEXT NOT NULL DEFAULT 'pending',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Advanced Threat Protection Tables
CREATE TABLE public.security_threats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  threat_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  threat_indicators JSONB NOT NULL DEFAULT '{}',
  affected_resources JSONB NOT NULL DEFAULT '[]',
  detection_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  mitigation_actions JSONB NOT NULL DEFAULT '[]',
  assigned_to UUID REFERENCES auth.users,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.security_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT,
  affected_systems JSONB NOT NULL DEFAULT '[]',
  evidence_data JSONB NOT NULL DEFAULT '{}',
  response_actions JSONB NOT NULL DEFAULT '[]',
  assigned_team UUID REFERENCES auth.users,
  escalation_level INTEGER NOT NULL DEFAULT 1,
  escalated_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.siem_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  authentication_config JSONB NOT NULL DEFAULT '{}',
  event_filters JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance Automation Tables
CREATE TABLE public.compliance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  policy_name TEXT NOT NULL,
  framework TEXT NOT NULL,
  policy_rules JSONB NOT NULL DEFAULT '{}',
  check_frequency TEXT NOT NULL DEFAULT 'daily',
  severity TEXT NOT NULL DEFAULT 'medium',
  auto_remediation BOOLEAN NOT NULL DEFAULT false,
  remediation_actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, policy_name)
);

CREATE TABLE public.compliance_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  policy_id UUID REFERENCES compliance_policies NOT NULL,
  check_result TEXT NOT NULL,
  compliance_score INTEGER NOT NULL DEFAULT 0,
  violations_found JSONB NOT NULL DEFAULT '[]',
  remediation_status TEXT NOT NULL DEFAULT 'pending',
  remediated_at TIMESTAMP WITH TIME ZONE,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.compliance_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  framework TEXT NOT NULL,
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  compliance_data JSONB NOT NULL DEFAULT '{}',
  overall_score INTEGER,
  critical_findings JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  generated_by UUID REFERENCES auth.users,
  approved_by UUID REFERENCES auth.users,
  approval_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incident Response Tables
CREATE TABLE public.incident_playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  playbook_name TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity_levels JSONB NOT NULL DEFAULT '[]',
  response_steps JSONB NOT NULL DEFAULT '[]',
  escalation_matrix JSONB NOT NULL DEFAULT '{}',
  communication_templates JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, playbook_name)
);

CREATE TABLE public.forensic_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  incident_id UUID REFERENCES security_incidents NOT NULL,
  evidence_type TEXT NOT NULL,
  evidence_data JSONB NOT NULL DEFAULT '{}',
  chain_of_custody JSONB NOT NULL DEFAULT '[]',
  collection_method TEXT NOT NULL,
  integrity_hash TEXT NOT NULL,
  collected_by UUID REFERENCES auth.users NOT NULL,
  preservation_status TEXT NOT NULL DEFAULT 'active',
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authentication_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dlp_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siem_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forensic_evidence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organization-based access
CREATE POLICY "Users can access their org's device fingerprints" ON public.device_fingerprints
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's auth sessions" ON public.authentication_sessions
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's behavioral analytics" ON public.behavioral_analytics
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's data classifications" ON public.data_classifications
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's data access logs" ON public.data_access_logs
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's DLP violations" ON public.dlp_violations
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's security threats" ON public.security_threats
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's security incidents" ON public.security_incidents
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's SIEM integrations" ON public.siem_integrations
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's compliance policies" ON public.compliance_policies
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's compliance checks" ON public.compliance_checks
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's compliance reports" ON public.compliance_reports
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's incident playbooks" ON public.incident_playbooks
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can access their org's forensic evidence" ON public.forensic_evidence
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX idx_device_fingerprints_user_id ON public.device_fingerprints(user_id);
CREATE INDEX idx_device_fingerprints_org_id ON public.device_fingerprints(org_id);
CREATE INDEX idx_authentication_sessions_user_id ON public.authentication_sessions(user_id);
CREATE INDEX idx_authentication_sessions_expires_at ON public.authentication_sessions(expires_at);
CREATE INDEX idx_behavioral_analytics_user_id ON public.behavioral_analytics(user_id);
CREATE INDEX idx_behavioral_analytics_detected_at ON public.behavioral_analytics(detected_at);
CREATE INDEX idx_data_access_logs_user_id ON public.data_access_logs(user_id);
CREATE INDEX idx_data_access_logs_accessed_at ON public.data_access_logs(accessed_at);
CREATE INDEX idx_dlp_violations_org_id ON public.dlp_violations(org_id);
CREATE INDEX idx_dlp_violations_detected_at ON public.dlp_violations(detected_at);
CREATE INDEX idx_security_threats_org_id ON public.security_threats(org_id);
CREATE INDEX idx_security_threats_detected_at ON public.security_threats(detected_at);
CREATE INDEX idx_security_incidents_org_id ON public.security_incidents(org_id);
CREATE INDEX idx_security_incidents_status ON public.security_incidents(status);
CREATE INDEX idx_compliance_checks_policy_id ON public.compliance_checks(policy_id);
CREATE INDEX idx_compliance_checks_checked_at ON public.compliance_checks(checked_at);
CREATE INDEX idx_forensic_evidence_incident_id ON public.forensic_evidence(incident_id);

-- Create functions for automated security checks
CREATE OR REPLACE FUNCTION public.calculate_session_risk_score(
  user_id UUID,
  device_fingerprint_id UUID,
  location_data JSONB
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION public.detect_data_patterns(
  data_content TEXT,
  org_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
