-- Create document_versions table for version control
CREATE TABLE public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  is_current_version BOOLEAN NOT NULL DEFAULT true,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  checksum TEXT,
  description TEXT,
  ai_summary TEXT,
  ai_analysis_status TEXT DEFAULT 'pending',
  uploaded_by UUID,
  uploaded_by_name TEXT,
  status TEXT DEFAULT 'active',
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(document_id, version_number)
);

-- Enable RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view document versions for their org"
  ON public.document_versions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = document_versions.org_id
  ));

CREATE POLICY "Users can create document versions for their org"
  ON public.document_versions
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = document_versions.org_id
  ));

CREATE POLICY "Users can update document versions for their org"
  ON public.document_versions
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = document_versions.org_id
  ));

-- Create function to manage document versions
CREATE OR REPLACE FUNCTION public.create_document_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a version entry for every document insert/update
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.document_versions (
      document_id,
      version_number,
      is_current_version,
      file_path,
      file_size,
      mime_type,
      checksum,
      description,
      ai_summary,
      ai_analysis_status,
      uploaded_by,
      uploaded_by_name,
      status,
      org_id
    ) VALUES (
      NEW.id,
      COALESCE(NEW.version_number, 1),
      COALESCE(NEW.is_current_version, true),
      NEW.file_path,
      NEW.file_size,
      NEW.mime_type,
      NEW.checksum,
      NEW.description,
      NEW.ai_summary,
      NEW.ai_analysis_status,
      NEW.uploaded_by,
      NEW.uploaded_by_name,
      NEW.status,
      NEW.org_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create versions
CREATE TRIGGER create_document_version_trigger
  AFTER INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_document_version();

-- Add indexes for performance
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_org_id ON public.document_versions(org_id);
CREATE INDEX idx_document_versions_version_number ON public.document_versions(document_id, version_number);