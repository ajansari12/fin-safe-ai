-- Create SQL function for vector similarity search
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  org_filter uuid
)
RETURNS TABLE (
  id uuid,
  org_id uuid,
  title text,
  category text,
  content text,
  tags text[],
  visibility text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.org_id,
    kb.title,
    kb.category,
    kb.content,
    kb.tags,
    kb.visibility,
    kb.created_at,
    kb.updated_at,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM knowledge_base kb
  WHERE kb.org_id = org_filter
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;