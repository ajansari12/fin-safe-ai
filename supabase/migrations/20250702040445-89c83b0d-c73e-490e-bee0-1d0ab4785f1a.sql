-- Create tables for framework generation
CREATE TABLE IF NOT EXISTS public.generated_frameworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  framework_type TEXT NOT NULL,
  framework_name TEXT NOT NULL,
  framework_version TEXT NOT NULL DEFAULT '1.0',
  generation_metadata JSONB NOT NULL DEFAULT '{}',
  framework_data JSONB NOT NULL DEFAULT '{}',
  customization_options JSONB NOT NULL DEFAULT '{}',
  implementation_status TEXT NOT NULL DEFAULT 'generated',
  effectiveness_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

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

-- Add organizational profile columns for framework generation
ALTER TABLE public.organizational_profiles 
ADD COLUMN IF NOT EXISTS framework_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS implementation_readiness TEXT DEFAULT 'assessing',
ADD COLUMN IF NOT EXISTS auto_generate_frameworks BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_framework_types TEXT[] DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_frameworks_org_id ON public.generated_frameworks(org_id);
CREATE INDEX IF NOT EXISTS idx_framework_components_framework_id ON public.framework_components(framework_id);

-- Enable RLS
ALTER TABLE public.generated_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_components ENABLE ROW LEVEL SECURITY;

-- RLS policies for generated_frameworks
CREATE POLICY "Users can manage their org's generated frameworks"
ON public.generated_frameworks
FOR ALL
USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- RLS policies for framework_components  
CREATE POLICY "Users can manage their org's framework components"
ON public.framework_components
FOR ALL
USING (framework_id IN (
  SELECT id FROM public.generated_frameworks gf 
  WHERE gf.org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
));

-- Add trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_generated_frameworks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generated_frameworks_updated_at
  BEFORE UPDATE ON public.generated_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_generated_frameworks_timestamp();