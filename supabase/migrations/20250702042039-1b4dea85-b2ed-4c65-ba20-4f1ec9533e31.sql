-- Create tables only if they don't exist
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON public.notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_document ON public.document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_org ON public.compliance_checks(org_id);

-- Enable RLS for new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications' AND schemaname = 'public') THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'document_comments' AND schemaname = 'public') THEN  
    ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'compliance_checks' AND schemaname = 'public') THEN
    ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can manage their org''s notifications') THEN
    EXECUTE 'CREATE POLICY "Users can manage their org''s notifications" ON public.notifications FOR ALL USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_comments' AND policyname = 'Users can manage their org''s document comments') THEN
    EXECUTE 'CREATE POLICY "Users can manage their org''s document comments" ON public.document_comments FOR ALL USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compliance_checks' AND policyname = 'Users can manage their org''s compliance checks') THEN
    EXECUTE 'CREATE POLICY "Users can manage their org''s compliance checks" ON public.compliance_checks FOR ALL USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))';
  END IF;
END $$;