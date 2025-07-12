-- 1. First, create missing profile records for any authenticated users without profiles
INSERT INTO public.profiles (id, full_name, organization_id, onboarding_status)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'User'),
  NULL,
  'not_started'
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 2. Add foreign key constraint to ensure onboarding_sessions references profiles
ALTER TABLE public.onboarding_sessions 
ADD CONSTRAINT fk_onboarding_sessions_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Re-enable RLS on onboarding_sessions
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to avoid conflicts and recreate them properly
DROP POLICY IF EXISTS "Users can view their own onboarding sessions" ON public.onboarding_sessions;
DROP POLICY IF EXISTS "Users can create their own onboarding sessions" ON public.onboarding_sessions;
DROP POLICY IF EXISTS "Users can update their own onboarding sessions" ON public.onboarding_sessions;

-- 5. Create proper RLS policies for onboarding_sessions
CREATE POLICY "Users can view their own onboarding sessions" 
ON public.onboarding_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding sessions" 
ON public.onboarding_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding sessions" 
ON public.onboarding_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);