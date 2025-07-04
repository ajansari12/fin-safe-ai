-- Enable pgvector extension for vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge_base table with vector search capabilities
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('public', 'internal', 'private')),
  embedding vector(1536), -- OpenAI embedding dimension
  search_vector tsvector, -- Pre-computed search vector
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX knowledge_base_embedding_idx ON public.knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create text search index on pre-computed tsvector
CREATE INDEX knowledge_base_search_idx ON public.knowledge_base USING gin(search_vector);

-- Create org_id index for performance
CREATE INDEX knowledge_base_org_id_idx ON public.knowledge_base (org_id);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their org's knowledge base" ON public.knowledge_base
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR visibility = 'public'
  );

CREATE POLICY "Users can create knowledge base entries for their org" ON public.knowledge_base
  FOR INSERT WITH CHECK (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their org's knowledge base" ON public.knowledge_base
  FOR UPDATE USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete their org's knowledge base" ON public.knowledge_base
  FOR DELETE USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Function to update search vector and updated_at
CREATE OR REPLACE FUNCTION update_knowledge_base_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.content, '') || ' ' || 
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search vector and updated_at
CREATE TRIGGER update_knowledge_base_search_vector
  BEFORE INSERT OR UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_search_vector();