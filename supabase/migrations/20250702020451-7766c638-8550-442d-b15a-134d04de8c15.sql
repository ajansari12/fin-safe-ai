-- Fix RLS policy for organizations table to allow INSERT operations
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

CREATE POLICY "Users can create organizations" 
ON public.organizations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Also allow users to select organizations they create
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;

CREATE POLICY "Users can view their organization" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING (id IN ( 
  SELECT profiles.organization_id
  FROM profiles
  WHERE (profiles.id = auth.uid())
) OR created_at > now() - interval '5 minutes');

-- Add Canadian banking sub-sectors to organizational profiles
ALTER TABLE public.organizational_profiles 
ADD COLUMN IF NOT EXISTS banking_schedule text,
ADD COLUMN IF NOT EXISTS banking_license_type text,
ADD COLUMN IF NOT EXISTS capital_tier text,
ADD COLUMN IF NOT EXISTS osfi_rating text,
ADD COLUMN IF NOT EXISTS deposit_insurance_coverage boolean DEFAULT false;