-- Add missing INSERT policy for onboarding_sessions table
CREATE POLICY "Users can create their own onboarding sessions" 
ON public.onboarding_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);