-- Add RLS policies for onboarding_sessions table
-- Enable RLS on onboarding_sessions
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own onboarding sessions
CREATE POLICY "Users can view their own onboarding sessions" 
ON public.onboarding_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to create their own onboarding sessions
CREATE POLICY "Users can create their own onboarding sessions" 
ON public.onboarding_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own onboarding sessions
CREATE POLICY "Users can update their own onboarding sessions" 
ON public.onboarding_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);