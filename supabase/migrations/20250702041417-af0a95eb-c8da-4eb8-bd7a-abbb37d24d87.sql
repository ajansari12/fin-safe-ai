-- Create tables for collaboration and communication features
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  sender_id UUID,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium',
  channels TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collaboration_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  document_id UUID,
  session_type TEXT NOT NULL,
  session_data JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collaboration_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'online',
  cursor_position JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.document_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  org_id UUID NOT NULL,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  vendor_name TEXT NOT NULL,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  last_checked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_check_due TIMESTAMP WITH TIME ZONE NOT NULL,
  findings TEXT[] DEFAULT '{}',
  regulatory_body TEXT,
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON public.notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_org ON public.collaboration_sessions(org_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_session ON public.collaboration_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_document ON public.document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_org ON public.compliance_checks(org_id);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their org's notifications" ON public.notifications FOR ALL USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage their org's collaboration sessions" ON public.collaboration_sessions FOR ALL USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage collaboration participants" ON public.collaboration_participants FOR ALL USING (session_id IN (SELECT id FROM public.collaboration_sessions WHERE org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Users can manage their org's document comments" ON public.document_comments FOR ALL USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage their org's compliance checks" ON public.compliance_checks FOR ALL USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));