
-- Create workflows table
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  workflow_definition JSONB NOT NULL DEFAULT '{"nodes": [], "edges": [], "version": 1}'::jsonb,
  triggers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation_rules table
CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  execution_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for workflows
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflows from their org" 
  ON public.workflows 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = workflows.org_id
  ));

CREATE POLICY "Users can create workflows in their org" 
  ON public.workflows 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = workflows.org_id
  ));

CREATE POLICY "Users can update workflows in their org" 
  ON public.workflows 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = workflows.org_id
  ));

CREATE POLICY "Users can delete workflows in their org" 
  ON public.workflows 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = workflows.org_id
  ));

-- Add RLS policies for automation_rules
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view automation rules from their org" 
  ON public.automation_rules 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = automation_rules.org_id
  ));

CREATE POLICY "Users can create automation rules in their org" 
  ON public.automation_rules 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = automation_rules.org_id
  ));

CREATE POLICY "Users can update automation rules in their org" 
  ON public.automation_rules 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = automation_rules.org_id
  ));

CREATE POLICY "Users can delete automation rules in their org" 
  ON public.automation_rules 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.organization_id = automation_rules.org_id
  ));

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_workflow_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workflow_timestamp();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
