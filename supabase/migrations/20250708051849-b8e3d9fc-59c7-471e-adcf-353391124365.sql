-- Fix generated_frameworks table schema to match service expectations
-- Add missing required columns
ALTER TABLE public.generated_frameworks 
ADD COLUMN IF NOT EXISTS framework_type TEXT,
ADD COLUMN IF NOT EXISTS framework_name TEXT,
ADD COLUMN IF NOT EXISTS framework_version TEXT DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}';

-- Rename customizations to customization_options for consistency
ALTER TABLE public.generated_frameworks 
RENAME COLUMN customizations TO customization_options;

-- Update implementation_status default
ALTER TABLE public.generated_frameworks 
ALTER COLUMN implementation_status SET DEFAULT 'generated';

-- Make required columns NOT NULL (but first set defaults for existing data)
UPDATE public.generated_frameworks 
SET framework_type = 'governance' WHERE framework_type IS NULL;
UPDATE public.generated_frameworks 
SET framework_name = 'Generated Framework' WHERE framework_name IS NULL;

ALTER TABLE public.generated_frameworks 
ALTER COLUMN framework_type SET NOT NULL,
ALTER COLUMN framework_name SET NOT NULL;

-- Drop template_id column as it's not used
ALTER TABLE public.generated_frameworks 
DROP COLUMN IF EXISTS template_id;

-- Create framework_components table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.framework_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework_id UUID NOT NULL REFERENCES public.generated_frameworks(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL,
  component_name TEXT NOT NULL,
  component_description TEXT,
  component_data JSONB NOT NULL DEFAULT '{}',
  dependencies UUID[] DEFAULT '{}',
  implementation_priority INTEGER,
  estimated_effort_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_generated_frameworks_org_id ON public.generated_frameworks(organization_id);
CREATE INDEX IF NOT EXISTS idx_framework_components_framework_id ON public.framework_components(framework_id);

-- Enable RLS if not already enabled
ALTER TABLE public.generated_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_components ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to use correct column names
DROP POLICY IF EXISTS "Users can manage their org's generated frameworks" ON public.generated_frameworks;
CREATE POLICY "Users can manage their org's generated frameworks"
ON public.generated_frameworks
FOR ALL
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their org's framework components" ON public.framework_components;
CREATE POLICY "Users can manage their org's framework components"
ON public.framework_components
FOR ALL
USING (framework_id IN (
  SELECT id FROM public.generated_frameworks gf 
  WHERE gf.organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
));