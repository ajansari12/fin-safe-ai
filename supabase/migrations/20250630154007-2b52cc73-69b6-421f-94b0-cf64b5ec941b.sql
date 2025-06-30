
-- Add onboarding tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'not_started' CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed', 'skipped')),
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
ADD COLUMN IF NOT EXISTS onboarding_data jsonb DEFAULT '{}';

-- Create user onboarding progress table
CREATE TABLE IF NOT EXISTS public.user_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  step_id text NOT NULL,
  step_name text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, step_id)
);

-- Create onboarding sessions table
CREATE TABLE IF NOT EXISTS public.onboarding_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  current_step text,
  total_steps integer DEFAULT 5,
  completion_percentage integer DEFAULT 0,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_onboarding_progress
CREATE POLICY "Users can view their own onboarding progress" ON public.user_onboarding_progress
  FOR SELECT USING (auth.uid()::text = (SELECT profiles.id::text FROM public.profiles WHERE profiles.id = user_onboarding_progress.user_id));

CREATE POLICY "Users can update their own onboarding progress" ON public.user_onboarding_progress
  FOR ALL USING (auth.uid()::text = (SELECT profiles.id::text FROM public.profiles WHERE profiles.id = user_onboarding_progress.user_id));

-- Create RLS policies for onboarding_sessions
CREATE POLICY "Users can view their own onboarding sessions" ON public.onboarding_sessions
  FOR SELECT USING (auth.uid()::text = (SELECT profiles.id::text FROM public.profiles WHERE profiles.id = onboarding_sessions.user_id));

CREATE POLICY "Users can update their own onboarding sessions" ON public.onboarding_sessions
  FOR ALL USING (auth.uid()::text = (SELECT profiles.id::text FROM public.profiles WHERE profiles.id = onboarding_sessions.user_id));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_onboarding_progress_user_id ON public.user_onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_progress_step_id ON public.user_onboarding_progress(step_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_id ON public.onboarding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON public.onboarding_sessions(status);

-- Create function to update onboarding progress
CREATE OR REPLACE FUNCTION public.update_onboarding_step(
  p_user_id uuid,
  p_step_id text,
  p_step_name text,
  p_completed boolean DEFAULT true,
  p_data jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_onboarding_progress (user_id, step_id, step_name, completed, completed_at, data)
  VALUES (p_user_id, p_step_id, p_step_name, p_completed, 
          CASE WHEN p_completed THEN now() ELSE NULL END, p_data)
  ON CONFLICT (user_id, step_id) 
  DO UPDATE SET 
    completed = p_completed,
    completed_at = CASE WHEN p_completed THEN now() ELSE NULL END,
    data = p_data,
    updated_at = now();
END;
$$;
