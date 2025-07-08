-- Create framework activity tracking tables
CREATE TABLE IF NOT EXISTS public.framework_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework_id UUID NOT NULL REFERENCES public.generated_frameworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'updated', 'component_completed', 'review_requested', 'approved', 'rejected', 'assigned', 'comment_added', 'milestone_reached')),
  activity_description TEXT,
  activity_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create component progress tracking
CREATE TABLE IF NOT EXISTS public.framework_component_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component_id UUID NOT NULL REFERENCES public.framework_components(id) ON DELETE CASCADE,
  assigned_to_id UUID,
  assigned_to_name TEXT,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'review', 'completed', 'blocked')),
  due_date DATE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  estimated_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create framework assignments
CREATE TABLE IF NOT EXISTS public.framework_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework_id UUID NOT NULL REFERENCES public.generated_frameworks(id) ON DELETE CASCADE,
  assigned_to_id UUID NOT NULL,
  assigned_to_name TEXT,
  assigned_by_id UUID,
  assigned_by_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'reviewer', 'contributor', 'observer')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add progress tracking columns to generated_frameworks
ALTER TABLE public.generated_frameworks 
ADD COLUMN IF NOT EXISTS overall_completion_percentage INTEGER DEFAULT 0 CHECK (overall_completion_percentage >= 0 AND overall_completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS estimated_completion_date DATE,
ADD COLUMN IF NOT EXISTS actual_start_date DATE,
ADD COLUMN IF NOT EXISTS is_stagnant BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stagnant_since TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_framework_activities_framework_id ON public.framework_activities(framework_id);
CREATE INDEX IF NOT EXISTS idx_framework_activities_created_at ON public.framework_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_component_progress_component_id ON public.framework_component_progress(component_id);
CREATE INDEX IF NOT EXISTS idx_component_progress_assigned_to ON public.framework_component_progress(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_framework_assignments_framework_id ON public.framework_assignments(framework_id);
CREATE INDEX IF NOT EXISTS idx_generated_frameworks_last_activity ON public.generated_frameworks(last_activity_at DESC);

-- Enable RLS
ALTER TABLE public.framework_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_component_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage activities for their org frameworks"
ON public.framework_activities
FOR ALL
USING (framework_id IN (
  SELECT id FROM public.generated_frameworks gf 
  WHERE gf.organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
));

CREATE POLICY "Users can manage component progress for their org"
ON public.framework_component_progress
FOR ALL
USING (component_id IN (
  SELECT fc.id FROM public.framework_components fc
  JOIN public.generated_frameworks gf ON fc.framework_id = gf.id
  WHERE gf.organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
));

CREATE POLICY "Users can manage assignments for their org frameworks"
ON public.framework_assignments
FOR ALL
USING (framework_id IN (
  SELECT id FROM public.generated_frameworks gf 
  WHERE gf.organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
));

-- Create function to update framework progress automatically
CREATE OR REPLACE FUNCTION public.update_framework_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update overall completion percentage based on component progress
  UPDATE public.generated_frameworks
  SET 
    overall_completion_percentage = (
      SELECT COALESCE(AVG(fcp.completion_percentage), 0)::INTEGER
      FROM public.framework_components fc
      LEFT JOIN public.framework_component_progress fcp ON fc.id = fcp.component_id
      WHERE fc.framework_id = COALESCE(NEW.component_id, OLD.component_id, 
        (SELECT framework_id FROM public.framework_components WHERE id = COALESCE(NEW.component_id, OLD.component_id)))
    ),
    last_activity_at = now(),
    is_stagnant = false,
    stagnant_since = NULL
  WHERE id = (
    SELECT framework_id FROM public.framework_components 
    WHERE id = COALESCE(NEW.component_id, OLD.component_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic progress updates
CREATE TRIGGER update_framework_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.framework_component_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_framework_progress();

-- Create function to detect stagnant frameworks
CREATE OR REPLACE FUNCTION public.detect_stagnant_frameworks()
RETURNS void AS $$
BEGIN
  UPDATE public.generated_frameworks
  SET 
    is_stagnant = true,
    stagnant_since = COALESCE(stagnant_since, now())
  WHERE 
    implementation_status = 'in_progress'
    AND last_activity_at < (now() - INTERVAL '30 days')
    AND NOT is_stagnant;
END;
$$ LANGUAGE plpgsql;

-- Create function to log framework activities
CREATE OR REPLACE FUNCTION public.log_framework_activity(
  p_framework_id UUID,
  p_user_id UUID,
  p_user_name TEXT,
  p_activity_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.framework_activities (
    framework_id, user_id, user_name, activity_type, activity_description, activity_data
  )
  VALUES (
    p_framework_id, p_user_id, p_user_name, p_activity_type, p_description, p_data
  )
  RETURNING id INTO activity_id;
  
  -- Update framework last activity
  UPDATE public.generated_frameworks
  SET last_activity_at = now()
  WHERE id = p_framework_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql;