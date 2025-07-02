-- Only create what doesn't exist
CREATE TABLE IF NOT EXISTS public.framework_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework_id UUID NOT NULL,
  component_type TEXT NOT NULL,
  component_name TEXT NOT NULL,
  component_description TEXT,
  component_data JSONB NOT NULL DEFAULT '{}',
  dependencies UUID[],
  implementation_priority INTEGER,
  estimated_effort_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add organizational profile columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizational_profiles' AND column_name = 'framework_preferences') THEN
    ALTER TABLE public.organizational_profiles ADD COLUMN framework_preferences JSONB DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizational_profiles' AND column_name = 'implementation_readiness') THEN
    ALTER TABLE public.organizational_profiles ADD COLUMN implementation_readiness TEXT DEFAULT 'assessing';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizational_profiles' AND column_name = 'auto_generate_frameworks') THEN
    ALTER TABLE public.organizational_profiles ADD COLUMN auto_generate_frameworks BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizational_profiles' AND column_name = 'preferred_framework_types') THEN
    ALTER TABLE public.organizational_profiles ADD COLUMN preferred_framework_types TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_framework_components_framework_id ON public.framework_components(framework_id);

-- Enable RLS for new table
ALTER TABLE public.framework_components ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'framework_components' AND policyname = 'Users can manage their org''s framework components') THEN
    EXECUTE 'CREATE POLICY "Users can manage their org''s framework components"
    ON public.framework_components
    FOR ALL
    USING (framework_id IN (
      SELECT id FROM public.generated_frameworks gf 
      WHERE gf.organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    ))';
  END IF;
END $$;