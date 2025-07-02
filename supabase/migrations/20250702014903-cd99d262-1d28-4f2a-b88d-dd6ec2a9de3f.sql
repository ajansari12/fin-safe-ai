-- Create table for temporary organization setup data (save/resume functionality)
CREATE TABLE public.temp_organization_setup (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  setup_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  current_step INTEGER NOT NULL DEFAULT 1,
  completion_estimate INTEGER NOT NULL DEFAULT 15,
  framework_progress JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.temp_organization_setup ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can manage their own setup data" 
ON public.temp_organization_setup 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_temp_organization_setup_updated_at
BEFORE UPDATE ON public.temp_organization_setup
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();