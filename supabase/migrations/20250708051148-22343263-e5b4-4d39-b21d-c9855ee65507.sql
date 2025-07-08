-- Create framework generation status table for tracking progress
CREATE TABLE IF NOT EXISTS public.framework_generation_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    profile_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
    current_step TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_framework_generation_status_org_id ON public.framework_generation_status(organization_id);
CREATE INDEX IF NOT EXISTS idx_framework_generation_status_profile_id ON public.framework_generation_status(profile_id);
CREATE INDEX IF NOT EXISTS idx_framework_generation_status_status ON public.framework_generation_status(status);

-- Enable RLS
ALTER TABLE public.framework_generation_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view generation status for their org" 
ON public.framework_generation_status 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = framework_generation_status.organization_id
));

CREATE POLICY "Users can insert generation status for their org" 
ON public.framework_generation_status 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = framework_generation_status.organization_id
));

CREATE POLICY "Users can update generation status for their org" 
ON public.framework_generation_status 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = framework_generation_status.organization_id
));

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_framework_generation_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_framework_generation_status_updated_at
    BEFORE UPDATE ON public.framework_generation_status
    FOR EACH ROW
    EXECUTE FUNCTION public.update_framework_generation_status_timestamp();