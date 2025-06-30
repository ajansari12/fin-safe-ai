
-- Create unified data lineage tracking table
CREATE TABLE IF NOT EXISTS public.data_lineage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete', 'sync')),
  field_changes JSONB DEFAULT '{}',
  transformation_rules JSONB DEFAULT '{}',
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'failed', 'conflict')),
  conflict_data JSONB DEFAULT '{}',
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data quality metrics table
CREATE TABLE IF NOT EXISTS public.data_quality_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  quality_score NUMERIC NOT NULL DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  completeness_score NUMERIC DEFAULT 0,
  accuracy_score NUMERIC DEFAULT 0,
  consistency_score NUMERIC DEFAULT 0,
  validity_score NUMERIC DEFAULT 0,
  quality_issues JSONB DEFAULT '[]',
  last_validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validation_rules JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cross-module sync events table
CREATE TABLE IF NOT EXISTS public.sync_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  source_module TEXT NOT NULL,
  target_modules TEXT[] NOT NULL DEFAULT '{}',
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'processing', 'completed', 'failed', 'partial')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_details JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data validation rules table
CREATE TABLE IF NOT EXISTS public.data_validation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('format', 'range', 'dependency', 'business_logic', 'cross_module')),
  target_tables TEXT[] NOT NULL DEFAULT '{}',
  target_fields TEXT[] NOT NULL DEFAULT '{}',
  validation_logic JSONB NOT NULL DEFAULT '{}',
  error_message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow node types for advanced workflow capabilities
CREATE TABLE IF NOT EXISTS public.workflow_node_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_type TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  icon_name TEXT,
  color_class TEXT,
  input_schema JSONB DEFAULT '{}',
  output_schema JSONB DEFAULT '{}',
  configuration_schema JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables (skip if already enabled)
DO $$ 
BEGIN
    ALTER TABLE public.data_lineage ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.data_quality_metrics ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.sync_events ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.data_validation_rules ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.workflow_node_types ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Create RLS policies for data_lineage
DO $$ 
BEGIN
    CREATE POLICY "Users can view data lineage for their org" ON public.data_lineage
      FOR SELECT USING (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can create data lineage for their org" ON public.data_lineage
      FOR INSERT WITH CHECK (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can update data lineage for their org" ON public.data_lineage
      FOR UPDATE USING (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create RLS policies for data_quality_metrics
DO $$ 
BEGIN
    CREATE POLICY "Users can view data quality metrics for their org" ON public.data_quality_metrics
      FOR SELECT USING (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can create data quality metrics for their org" ON public.data_quality_metrics
      FOR INSERT WITH CHECK (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can update data quality metrics for their org" ON public.data_quality_metrics
      FOR UPDATE USING (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create RLS policies for sync_events
DO $$ 
BEGIN
    CREATE POLICY "Users can view sync events for their org" ON public.sync_events
      FOR SELECT USING (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can create sync events for their org" ON public.sync_events
      FOR INSERT WITH CHECK (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can update sync events for their org" ON public.sync_events
      FOR UPDATE USING (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create RLS policies for data_validation_rules
DO $$ 
BEGIN
    CREATE POLICY "Users can view validation rules for their org" ON public.data_validation_rules
      FOR SELECT USING (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can create validation rules for their org" ON public.data_validation_rules
      FOR INSERT WITH CHECK (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can update validation rules for their org" ON public.data_validation_rules
      FOR UPDATE USING (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can delete validation rules for their org" ON public.data_validation_rules
      FOR DELETE USING (check_user_org_access(org_id));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create RLS policies for workflow_node_types (system-wide, read-only for users)
DO $$ 
BEGIN
    CREATE POLICY "Anyone can view workflow node types" ON public.workflow_node_types
      FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create triggers for updated_at timestamps (skip if already exists)
DO $$ 
BEGIN
    CREATE TRIGGER update_data_lineage_updated_at 
      BEFORE UPDATE ON public.data_lineage 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE TRIGGER update_data_quality_metrics_updated_at 
      BEFORE UPDATE ON public.data_quality_metrics 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE TRIGGER update_sync_events_updated_at 
      BEFORE UPDATE ON public.sync_events 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE TRIGGER update_data_validation_rules_updated_at 
      BEFORE UPDATE ON public.data_validation_rules 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE TRIGGER update_workflow_node_types_updated_at 
      BEFORE UPDATE ON public.workflow_node_types 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Insert default workflow node types (if not already present)
INSERT INTO public.workflow_node_types (node_type, display_name, description, category, icon_name, color_class) 
VALUES
  ('start', 'Start', 'Entry point for the workflow', 'control', 'Play', 'bg-green-500'),
  ('task', 'Task', 'Execute a specific action or process', 'action', 'Square', 'bg-blue-500'),
  ('decision', 'Decision', 'Branch based on conditions', 'logic', 'Diamond', 'bg-yellow-500'),
  ('integration', 'Integration', 'Connect to external systems', 'integration', 'Settings', 'bg-purple-500'),
  ('parallel', 'Parallel', 'Execute multiple branches simultaneously', 'control', 'GitBranch', 'bg-orange-500'),
  ('merge', 'Merge', 'Combine parallel execution paths', 'control', 'GitMerge', 'bg-indigo-500'),
  ('delay', 'Delay', 'Wait for a specified duration', 'control', 'Clock', 'bg-gray-500'),
  ('trigger', 'Trigger', 'Fire events or notifications', 'action', 'Zap', 'bg-red-500'),
  ('end', 'End', 'Workflow completion point', 'control', 'Square', 'bg-red-600'),
  ('approval', 'Approval', 'Human approval step', 'human', 'UserCheck', 'bg-cyan-500'),
  ('notification', 'Notification', 'Send notifications', 'communication', 'Bell', 'bg-pink-500'),
  ('data_transform', 'Data Transform', 'Transform data between formats', 'data', 'RefreshCw', 'bg-teal-500'),
  ('validation', 'Validation', 'Validate data quality', 'data', 'CheckCircle', 'bg-emerald-500'),
  ('ml_prediction', 'ML Prediction', 'AI/ML powered predictions', 'intelligence', 'Brain', 'bg-violet-500')
ON CONFLICT (node_type) DO NOTHING;
