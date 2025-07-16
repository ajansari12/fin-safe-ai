-- Strengthen RLS policies for template_customization_rules
-- Add comprehensive organization-scoped access control

-- First, let's examine the current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'template_customization_rules';

-- Add proper RLS policies if they don't exist
DO $$
BEGIN
  -- Check if RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' 
    AND c.relname = 'template_customization_rules' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.template_customization_rules ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Users can select template customization rules for their org" ON public.template_customization_rules;
DROP POLICY IF EXISTS "Users can insert template customization rules for their org" ON public.template_customization_rules;
DROP POLICY IF EXISTS "Users can update template customization rules for their org" ON public.template_customization_rules;
DROP POLICY IF EXISTS "Users can delete template customization rules for their org" ON public.template_customization_rules;

-- Create strengthened RLS policies
CREATE POLICY "Users can select template customization rules for their org" ON public.template_customization_rules
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.industry_template_libraries itl
    JOIN public.profiles p ON p.organization_id = itl.org_id
    WHERE itl.id = template_customization_rules.template_id
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can insert template customization rules for their org" ON public.template_customization_rules
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.industry_template_libraries itl
    JOIN public.profiles p ON p.organization_id = itl.org_id
    WHERE itl.id = template_customization_rules.template_id
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can update template customization rules for their org" ON public.template_customization_rules
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.industry_template_libraries itl
    JOIN public.profiles p ON p.organization_id = itl.org_id
    WHERE itl.id = template_customization_rules.template_id
    AND p.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.industry_template_libraries itl
    JOIN public.profiles p ON p.organization_id = itl.org_id
    WHERE itl.id = template_customization_rules.template_id
    AND p.id = auth.uid()
  )
);

CREATE POLICY "Users can delete template customization rules for their org" ON public.template_customization_rules
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.industry_template_libraries itl
    JOIN public.profiles p ON p.organization_id = itl.org_id
    WHERE itl.id = template_customization_rules.template_id
    AND p.id = auth.uid()
  )
);

-- Add additional security policies for admin access
CREATE POLICY "Admins can manage all template customization rules" ON public.template_customization_rules
FOR ALL
TO authenticated
USING (is_admin_secure())
WITH CHECK (is_admin_secure());

-- Create index for better performance on RLS policy checks
CREATE INDEX IF NOT EXISTS idx_template_customization_rules_template_id 
ON public.template_customization_rules (template_id);

-- Add comments for documentation
COMMENT ON POLICY "Users can select template customization rules for their org" ON public.template_customization_rules IS 
'Allow users to view customization rules for templates belonging to their organization';

COMMENT ON POLICY "Users can insert template customization rules for their org" ON public.template_customization_rules IS 
'Allow users to create customization rules for templates belonging to their organization';

COMMENT ON POLICY "Users can update template customization rules for their org" ON public.template_customization_rules IS 
'Allow users to modify customization rules for templates belonging to their organization';

COMMENT ON POLICY "Users can delete template customization rules for their org" ON public.template_customization_rules IS 
'Allow users to delete customization rules for templates belonging to their organization';

COMMENT ON POLICY "Admins can manage all template customization rules" ON public.template_customization_rules IS 
'Allow system administrators to manage all template customization rules across organizations';