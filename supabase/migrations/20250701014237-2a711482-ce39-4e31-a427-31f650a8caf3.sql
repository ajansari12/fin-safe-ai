
-- Create collaboration tables for document management
CREATE TABLE public.collaboration_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  document_id UUID REFERENCES public.documents(id),
  session_type TEXT NOT NULL CHECK (session_type IN ('document_editing', 'whiteboard', 'meeting', 'discussion')),
  participants JSONB NOT NULL DEFAULT '[]',
  session_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.collaboration_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  document_id UUID REFERENCES public.documents(id),
  parent_comment_id UUID REFERENCES public.collaboration_comments(id),
  thread_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  reactions JSONB DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.collaboration_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  sender_id UUID,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('workflow', 'mention', 'deadline', 'escalation', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  channels TEXT[] NOT NULL DEFAULT '{"in_app"}',
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.external_stakeholders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  role TEXT,
  access_level TEXT NOT NULL DEFAULT 'view' CHECK (access_level IN ('view', 'comment', 'edit')),
  permitted_modules TEXT[] DEFAULT '{}',
  access_expires_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  invited_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.knowledge_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID,
  author_name TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  views INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.collaboration_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  organizer_id UUID,
  organizer_name TEXT,
  attendees TEXT[] DEFAULT '{}',
  agenda TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  meeting_type TEXT DEFAULT 'virtual' CHECK (meeting_type IN ('virtual', 'in_person', 'hybrid')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_meetings ENABLE ROW LEVEL SECURITY;

-- Collaboration sessions policies
CREATE POLICY "Users can view their org's collaboration sessions" 
  ON public.collaboration_sessions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's collaboration sessions" 
  ON public.collaboration_sessions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Collaboration comments policies
CREATE POLICY "Users can view their org's collaboration comments" 
  ON public.collaboration_comments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's collaboration comments" 
  ON public.collaboration_comments FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Collaboration notifications policies
CREATE POLICY "Users can view their own notifications" 
  ON public.collaboration_notifications FOR SELECT 
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can manage notifications in their org" 
  ON public.collaboration_notifications FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- External stakeholders policies
CREATE POLICY "Users can view their org's external stakeholders" 
  ON public.external_stakeholders FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's external stakeholders" 
  ON public.external_stakeholders FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Knowledge articles policies
CREATE POLICY "Users can view their org's knowledge articles" 
  ON public.knowledge_articles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's knowledge articles" 
  ON public.knowledge_articles FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Collaboration meetings policies
CREATE POLICY "Users can view their org's collaboration meetings" 
  ON public.collaboration_meetings FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's collaboration meetings" 
  ON public.collaboration_meetings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_collaboration_sessions_org_id ON public.collaboration_sessions(org_id);
CREATE INDEX idx_collaboration_sessions_document_id ON public.collaboration_sessions(document_id);
CREATE INDEX idx_collaboration_comments_org_id ON public.collaboration_comments(org_id);
CREATE INDEX idx_collaboration_comments_document_id ON public.collaboration_comments(document_id);
CREATE INDEX idx_collaboration_notifications_recipient_id ON public.collaboration_notifications(recipient_id);
CREATE INDEX idx_external_stakeholders_org_id ON public.external_stakeholders(org_id);
CREATE INDEX idx_knowledge_articles_org_id ON public.knowledge_articles(org_id);
CREATE INDEX idx_collaboration_meetings_org_id ON public.collaboration_meetings(org_id);

-- Full-text search indexes
CREATE INDEX idx_knowledge_articles_search ON public.knowledge_articles 
  USING gin(to_tsvector('english', title || ' ' || content));
