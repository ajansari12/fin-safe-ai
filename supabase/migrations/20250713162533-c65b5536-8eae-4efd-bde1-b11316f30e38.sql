-- Enhance vendor monitoring feeds table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.vendor_monitoring_feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  vendor_profile_id UUID NOT NULL,
  feed_type TEXT NOT NULL, -- 'credit_rating', 'news_sentiment', 'cybersecurity', 'financial', 'regulatory'
  feed_source TEXT NOT NULL, -- Source provider name
  monitoring_frequency TEXT NOT NULL DEFAULT 'hourly', -- 'hourly', 'daily', 'weekly'
  alert_thresholds JSONB NOT NULL DEFAULT '{}',
  current_status TEXT NOT NULL DEFAULT 'active',
  last_feed_data JSONB DEFAULT '{}',
  last_check_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_monitoring_feeds ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage vendor feeds for their org" ON public.vendor_monitoring_feeds
FOR ALL USING (
  org_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Create foreign key relationships
ALTER TABLE public.vendor_monitoring_feeds 
ADD CONSTRAINT vendor_monitoring_feeds_vendor_profile_id_fkey 
FOREIGN KEY (vendor_profile_id) REFERENCES public.third_party_profiles(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_vendor_monitoring_feeds_org_id ON public.vendor_monitoring_feeds(org_id);
CREATE INDEX idx_vendor_monitoring_feeds_vendor_id ON public.vendor_monitoring_feeds(vendor_profile_id);
CREATE INDEX idx_vendor_monitoring_feeds_last_check ON public.vendor_monitoring_feeds(last_check_at);

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_monitoring_feeds_updated_at
  BEFORE UPDATE ON public.vendor_monitoring_feeds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enhanced vendor risk alerts table for E-21/B-10 compliance
CREATE TABLE IF NOT EXISTS public.vendor_risk_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  vendor_profile_id UUID NOT NULL,
  alert_type TEXT NOT NULL, -- 'concentration_risk', 'service_disruption', 'credit_downgrade', 'cyber_incident'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  current_value JSONB,
  threshold_value JSONB,
  variance_percentage NUMERIC,
  osfi_principle TEXT NOT NULL, -- 'principle_6', 'b_10'
  regulatory_citation TEXT NOT NULL,
  disclaimer TEXT NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  resolution_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' -- 'active', 'acknowledged', 'resolved'
);

-- Enable RLS
ALTER TABLE public.vendor_risk_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage vendor risk alerts for their org" ON public.vendor_risk_alerts
FOR ALL USING (
  org_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_vendor_risk_alerts_org_id ON public.vendor_risk_alerts(org_id);
CREATE INDEX idx_vendor_risk_alerts_vendor_id ON public.vendor_risk_alerts(vendor_profile_id);
CREATE INDEX idx_vendor_risk_alerts_severity ON public.vendor_risk_alerts(severity);
CREATE INDEX idx_vendor_risk_alerts_status ON public.vendor_risk_alerts(status);

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_risk_alerts_updated_at
  BEFORE UPDATE ON public.vendor_risk_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();