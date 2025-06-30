
-- Create workflow orchestration tables in correct order

-- Main workflow definitions table (must be created first)
CREATE TABLE public.workflow_orchestrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  category TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'scheduled', 'event', 'api')),
  trigger_config JSONB DEFAULT '{}',
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  variables JSONB DEFAULT '{}',
  business_rules JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workflow execution instances
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflow_orchestrations(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  execution_context JSONB DEFAULT '{}',
  current_node TEXT,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  execution_log JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Business rules engine
CREATE TABLE public.business_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  workflow_id UUID REFERENCES public.workflow_orchestrations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('validation', 'assignment', 'routing', 'calculation')),
  conditions JSONB NOT NULL DEFAULT '[]',
  actions JSONB NOT NULL DEFAULT '[]',
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workflow integrations configuration
CREATE TABLE public.workflow_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  workflow_id UUID REFERENCES public.workflow_orchestrations(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('trigger', 'action', 'data_sync')),
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workflow execution step logs
CREATE TABLE public.workflow_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_details TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_workflow_orchestrations_org_id ON public.workflow_orchestrations(org_id);
CREATE INDEX idx_workflow_orchestrations_status ON public.workflow_orchestrations(status);
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_org_id ON public.workflow_executions(org_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX idx_business_rules_org_id ON public.business_rules(org_id);
CREATE INDEX idx_business_rules_workflow_id ON public.business_rules(workflow_id);
CREATE INDEX idx_workflow_integrations_org_id ON public.workflow_integrations(org_id);
CREATE INDEX idx_workflow_execution_logs_execution_id ON public.workflow_execution_logs(execution_id);

-- Enable Row Level Security
ALTER TABLE public.workflow_orchestrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_execution_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user organization access
CREATE OR REPLACE FUNCTION public.check_user_org_access(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND organization_id = target_org_id
  );
END;
$$;

-- RLS Policies for workflow_orchestrations
CREATE POLICY "Users can view workflows in their organization" 
  ON public.workflow_orchestrations 
  FOR SELECT 
  USING (public.check_user_org_access(org_id));

CREATE POLICY "Users can create workflows in their organization" 
  ON public.workflow_orchestrations 
  FOR INSERT 
  WITH CHECK (public.check_user_org_access(org_id));

CREATE POLICY "Users can update workflows in their organization" 
  ON public.workflow_orchestrations 
  FOR UPDATE 
  USING (public.check_user_org_access(org_id));

CREATE POLICY "Users can delete workflows in their organization" 
  ON public.workflow_orchestrations 
  FOR DELETE 
  USING (public.check_user_org_access(org_id));

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view executions in their organization" 
  ON public.workflow_executions 
  FOR SELECT 
  USING (public.check_user_org_access(org_id));

CREATE POLICY "Users can create executions in their organization" 
  ON public.workflow_executions 
  FOR INSERT 
  WITH CHECK (public.check_user_org_access(org_id));

CREATE POLICY "Users can update executions in their organization" 
  ON public.workflow_executions 
  FOR UPDATE 
  USING (public.check_user_org_access(org_id));

-- RLS Policies for business_rules
CREATE POLICY "Users can view business rules in their organization" 
  ON public.business_rules 
  FOR SELECT 
  USING (public.check_user_org_access(org_id));

CREATE POLICY "Users can create business rules in their organization" 
  ON public.business_rules 
  FOR INSERT 
  WITH CHECK (public.check_user_org_access(org_id));

CREATE POLICY "Users can update business rules in their organization" 
  ON public.business_rules 
  FOR UPDATE 
  USING (public.check_user_org_access(org_id));

CREATE POLICY "Users can delete business rules in their organization" 
  ON public.business_rules 
  FOR DELETE 
  USING (public.check_user_org_access(org_id));

-- RLS Policies for workflow_integrations
CREATE POLICY "Users can view integrations in their organization" 
  ON public.workflow_integrations 
  FOR SELECT 
  USING (public.check_user_org_access(org_id));

CREATE POLICY "Users can create integrations in their organization" 
  ON public.workflow_integrations 
  FOR INSERT 
  WITH CHECK (public.check_user_org_access(org_id));

CREATE POLICY "Users can update integrations in their organization" 
  ON public.workflow_integrations 
  FOR UPDATE 
  USING (public.check_user_org_access(org_id));

CREATE POLICY "Users can delete integrations in their organization" 
  ON public.workflow_integrations 
  FOR DELETE 
  USING (public.check_user_org_access(org_id));

-- RLS Policies for workflow_execution_logs
CREATE POLICY "Users can view execution logs in their organization" 
  ON public.workflow_execution_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.workflow_executions we 
      WHERE we.id = workflow_execution_logs.execution_id 
      AND public.check_user_org_access(we.org_id)
    )
  );

CREATE POLICY "System can insert execution logs" 
  ON public.workflow_execution_logs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workflow_executions we 
      WHERE we.id = workflow_execution_logs.execution_id 
      AND public.check_user_org_access(we.org_id)
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_workflow_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to relevant tables
CREATE TRIGGER update_workflow_orchestrations_timestamp
  BEFORE UPDATE ON public.workflow_orchestrations
  FOR EACH ROW EXECUTE FUNCTION public.update_workflow_timestamp();

CREATE TRIGGER update_workflow_executions_timestamp
  BEFORE UPDATE ON public.workflow_executions
  FOR EACH ROW EXECUTE FUNCTION public.update_workflow_timestamp();

CREATE TRIGGER update_business_rules_timestamp
  BEFORE UPDATE ON public.business_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_workflow_timestamp();

CREATE TRIGGER update_workflow_integrations_timestamp
  BEFORE UPDATE ON public.workflow_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_workflow_timestamp();
