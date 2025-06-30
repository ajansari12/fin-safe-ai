
-- Create external data sources table
CREATE TABLE public.external_data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('credit_rating', 'regulatory', 'cyber_threat', 'economic', 'industry')),
  endpoint_url TEXT NOT NULL,
  authentication_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency_hours INTEGER NOT NULL DEFAULT 24,
  data_quality_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk intelligence table
CREATE TABLE public.risk_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  vendor_id UUID,
  source_id UUID REFERENCES public.external_data_sources(id),
  intelligence_type TEXT NOT NULL,
  risk_score NUMERIC NOT NULL,
  risk_level TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_freshness_hours INTEGER NOT NULL DEFAULT 0,
  raw_data JSONB NOT NULL DEFAULT '{}',
  processed_data JSONB NOT NULL DEFAULT '{}',
  attribution TEXT NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk alerts table
CREATE TABLE public.risk_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  vendor_id UUID,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('rating_change', 'regulatory_action', 'cyber_incident', 'compliance_violation')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  current_value JSONB,
  previous_value JSONB,
  change_magnitude NUMERIC,
  description TEXT NOT NULL,
  source_attribution TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.external_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;

-- External data sources policies
CREATE POLICY "Users can view their org's external data sources" 
  ON public.external_data_sources FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's external data sources" 
  ON public.external_data_sources FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Risk intelligence policies
CREATE POLICY "Users can view their org's risk intelligence" 
  ON public.risk_intelligence FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's risk intelligence" 
  ON public.risk_intelligence FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Risk alerts policies
CREATE POLICY "Users can view their org's risk alerts" 
  ON public.risk_alerts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's risk alerts" 
  ON public.risk_alerts FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_external_data_sources_org_id ON public.external_data_sources(org_id);
CREATE INDEX idx_external_data_sources_source_type ON public.external_data_sources(source_type);
CREATE INDEX idx_risk_intelligence_org_id ON public.risk_intelligence(org_id);
CREATE INDEX idx_risk_intelligence_vendor_id ON public.risk_intelligence(vendor_id);
CREATE INDEX idx_risk_intelligence_source_id ON public.risk_intelligence(source_id);
CREATE INDEX idx_risk_alerts_org_id ON public.risk_alerts(org_id);
CREATE INDEX idx_risk_alerts_vendor_id ON public.risk_alerts(vendor_id);
CREATE INDEX idx_risk_alerts_acknowledged ON public.risk_alerts(acknowledged);
