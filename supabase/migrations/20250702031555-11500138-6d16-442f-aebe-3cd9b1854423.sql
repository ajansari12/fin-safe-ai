-- Create tables for Phase 2 integrations

-- Notification logs for email tracking
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('incident', 'kri_breach', 'audit_finding', 'system_alert')),
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document analysis logs
CREATE TABLE IF NOT EXISTS public.document_analysis_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('policy_review', 'risk_assessment', 'compliance_gap', 'control_mapping')),
  framework TEXT,
  analysis_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk intelligence feeds
CREATE TABLE IF NOT EXISTS public.risk_intelligence_feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_type TEXT NOT NULL CHECK (feed_type IN ('cyber_threats', 'regulatory_updates', 'market_risks', 'operational_incidents')),
  region TEXT NOT NULL DEFAULT 'global',
  sector TEXT NOT NULL DEFAULT 'financial',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  risk_category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_intelligence_feeds ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notification_logs (admin/system access)
CREATE POLICY "System can insert notification logs" 
ON public.notification_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view notification logs" 
ON public.notification_logs 
FOR SELECT 
USING (true);

-- Create RLS policies for document_analysis_logs (user-specific)
CREATE POLICY "Users can view their own document analysis" 
ON public.document_analysis_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create document analysis" 
ON public.document_analysis_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for risk_intelligence_feeds (organization-wide access)
CREATE POLICY "Users can view risk intelligence feeds" 
ON public.risk_intelligence_feeds 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert risk intelligence feeds" 
ON public.risk_intelligence_feeds 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_notification_logs_recipient ON public.notification_logs(recipient);
CREATE INDEX idx_notification_logs_type ON public.notification_logs(type);
CREATE INDEX idx_notification_logs_sent_at ON public.notification_logs(sent_at);

CREATE INDEX idx_document_analysis_user_id ON public.document_analysis_logs(user_id);
CREATE INDEX idx_document_analysis_type ON public.document_analysis_logs(analysis_type);
CREATE INDEX idx_document_analysis_created_at ON public.document_analysis_logs(created_at);

CREATE INDEX idx_risk_feeds_type ON public.risk_intelligence_feeds(feed_type);
CREATE INDEX idx_risk_feeds_severity ON public.risk_intelligence_feeds(severity);
CREATE INDEX idx_risk_feeds_published_at ON public.risk_intelligence_feeds(published_at);
CREATE INDEX idx_risk_feeds_region_sector ON public.risk_intelligence_feeds(region, sector);