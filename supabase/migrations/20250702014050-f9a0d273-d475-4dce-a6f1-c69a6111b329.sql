-- Create RPC function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.industry_template_libraries 
  SET usage_count = usage_count + 1 
  WHERE id = template_id;
END;
$$;