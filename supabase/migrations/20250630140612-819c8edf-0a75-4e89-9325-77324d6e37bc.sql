
-- Create document management tables
CREATE TABLE public.document_repositories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL CHECK (document_type IN ('policy', 'procedure', 'risk_assessment', 'audit_report', 'compliance_doc', 'contract', 'other')),
  access_level TEXT NOT NULL DEFAULT 'internal' CHECK (access_level IN ('public', 'internal', 'confidential', 'restricted')),
  retention_years INTEGER DEFAULT 7,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  repository_id UUID REFERENCES public.document_repositories(id),
  parent_document_id UUID REFERENCES public.documents(id),
  version_number INTEGER DEFAULT 1,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  checksum TEXT,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  ai_analysis_status TEXT DEFAULT 'pending' CHECK (ai_analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  ai_confidence_score NUMERIC CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
  extracted_text TEXT,
  ai_summary TEXT,
  key_risk_indicators JSONB DEFAULT '[]',
  compliance_gaps JSONB DEFAULT '[]',
  document_classification JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  is_current_version BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  uploaded_by UUID,
  uploaded_by_name TEXT,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'archived', 'obsolete')),
  review_due_date DATE,
  expiry_date DATE
);

-- Create document relationships table
CREATE TABLE public.document_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  source_document_id UUID NOT NULL REFERENCES public.documents(id),
  target_document_id UUID NOT NULL REFERENCES public.documents(id),
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('references', 'supersedes', 'implements', 'supports', 'conflicts', 'similar')),
  relationship_strength NUMERIC CHECK (relationship_strength >= 0 AND relationship_strength <= 1),
  auto_detected BOOLEAN DEFAULT false,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source_document_id, target_document_id, relationship_type)
);

-- Create document comments table
CREATE TABLE public.document_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.documents(id),
  parent_comment_id UUID REFERENCES public.document_comments(id),
  comment_text TEXT NOT NULL,
  comment_type TEXT DEFAULT 'general' CHECK (comment_type IN ('general', 'review', 'approval', 'revision_request')),
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_by_name TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document approvals table
CREATE TABLE public.document_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.documents(id),
  approver_id UUID NOT NULL,
  approver_name TEXT NOT NULL,
  approval_status TEXT NOT NULL CHECK (approval_status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  approval_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  digital_signature TEXT,
  approval_level INTEGER DEFAULT 1,
  is_final_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, approver_id)
);

-- Create document access logs table
CREATE TABLE public.document_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.documents(id),
  user_id UUID,
  user_name TEXT,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'edit', 'share', 'delete')),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  failure_reason TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document sharing table
CREATE TABLE public.document_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.documents(id),
  shared_with_email TEXT,
  shared_with_organization TEXT,
  access_level TEXT DEFAULT 'view' CHECK (access_level IN ('view', 'comment', 'edit')),
  expires_at TIMESTAMP WITH TIME ZONE,
  access_token TEXT UNIQUE,
  password_protected BOOLEAN DEFAULT false,
  password_hash TEXT,
  download_allowed BOOLEAN DEFAULT false,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Add RLS policies
ALTER TABLE public.document_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- Document repositories policies
CREATE POLICY "Users can view their org's document repositories" 
  ON public.document_repositories FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's document repositories" 
  ON public.document_repositories FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Documents policies
CREATE POLICY "Users can view their org's documents" 
  ON public.documents FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's documents" 
  ON public.documents FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Document relationships policies
CREATE POLICY "Users can view their org's document relationships" 
  ON public.document_relationships FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's document relationships" 
  ON public.document_relationships FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Document comments policies
CREATE POLICY "Users can view their org's document comments" 
  ON public.document_comments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's document comments" 
  ON public.document_comments FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Document approvals policies
CREATE POLICY "Users can view their org's document approvals" 
  ON public.document_approvals FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's document approvals" 
  ON public.document_approvals FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Document access logs policies
CREATE POLICY "Users can view their org's document access logs" 
  ON public.document_access_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can create document access logs" 
  ON public.document_access_logs FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Document shares policies
CREATE POLICY "Users can view their org's document shares" 
  ON public.document_shares FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

CREATE POLICY "Users can manage their org's document shares" 
  ON public.document_shares FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = org_id
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_document_repositories_org_id ON public.document_repositories(org_id);
CREATE INDEX idx_documents_org_id ON public.documents(org_id);
CREATE INDEX idx_documents_repository_id ON public.documents(repository_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_ai_analysis_status ON public.documents(ai_analysis_status);
CREATE INDEX idx_documents_review_due_date ON public.documents(review_due_date);
CREATE INDEX idx_document_relationships_source ON public.document_relationships(source_document_id);
CREATE INDEX idx_document_relationships_target ON public.document_relationships(target_document_id);
CREATE INDEX idx_document_comments_document_id ON public.document_comments(document_id);
CREATE INDEX idx_document_approvals_document_id ON public.document_approvals(document_id);
CREATE INDEX idx_document_access_logs_document_id ON public.document_access_logs(document_id);
CREATE INDEX idx_document_shares_document_id ON public.document_shares(document_id);
CREATE INDEX idx_document_shares_access_token ON public.document_shares(access_token);

-- Full-text search index on documents
CREATE INDEX idx_documents_search ON public.documents USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(extracted_text, '')));

-- Add trigger to update document versions
CREATE OR REPLACE FUNCTION public.update_document_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark previous versions as not current
  IF NEW.is_current_version = true THEN
    UPDATE public.documents 
    SET is_current_version = false 
    WHERE parent_document_id = NEW.parent_document_id 
    AND id != NEW.id;
  END IF;
  
  -- Set version number for new documents
  IF NEW.version_number IS NULL THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO NEW.version_number
    FROM public.documents 
    WHERE parent_document_id = NEW.parent_document_id OR id = NEW.parent_document_id;
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_document_version_trigger
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_document_version();

-- Add trigger to log document access
CREATE OR REPLACE FUNCTION public.log_document_access()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.access_count = COALESCE(OLD.access_count, 0) + 1;
  NEW.last_accessed_at = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_document_access_trigger
  BEFORE UPDATE ON public.documents
  FOR EACH ROW 
  WHEN (NEW.last_accessed_at IS DISTINCT FROM OLD.last_accessed_at)
  EXECUTE FUNCTION public.log_document_access();
