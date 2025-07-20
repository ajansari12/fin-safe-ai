
-- Create scenario_tests table
CREATE TABLE IF NOT EXISTS public.scenario_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  disruption_type TEXT NOT NULL,
  severity_level TEXT NOT NULL CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'in_progress', 'completed', 'cancelled')),
  current_step INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  outcome TEXT,
  response_plan TEXT,
  post_mortem TEXT,
  lessons_learned TEXT,
  improvements_identified TEXT
);

-- Create scenario_test_functions table for business function mapping
CREATE TABLE IF NOT EXISTS public.scenario_test_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_test_id UUID NOT NULL REFERENCES public.scenario_tests(id) ON DELETE CASCADE,
  business_function_id UUID NOT NULL,
  estimated_downtime TEXT,
  actual_downtime TEXT,
  impact_level TEXT NOT NULL CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scenario_results table for execution tracking
CREATE TABLE IF NOT EXISTS public.scenario_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  scenario_test_id UUID NOT NULL REFERENCES public.scenario_tests(id) ON DELETE CASCADE,
  execution_started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  execution_completed_at TIMESTAMP WITH TIME ZONE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  success_rate NUMERIC CHECK (success_rate >= 0 AND success_rate <= 100),
  response_time_minutes INTEGER,
  recovery_time_minutes INTEGER,
  affected_functions_count INTEGER DEFAULT 0,
  test_coverage_score NUMERIC CHECK (test_coverage_score >= 0 AND test_coverage_score <= 100),
  execution_notes TEXT,
  lessons_learned TEXT,
  ai_recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scenario_execution_steps table for step tracking
CREATE TABLE IF NOT EXISTS public.scenario_execution_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_result_id UUID NOT NULL REFERENCES public.scenario_results(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_description TEXT,
  expected_outcome TEXT,
  actual_outcome TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  responsible_person TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scenario_templates table for reusable templates
CREATE TABLE IF NOT EXISTS public.scenario_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_description TEXT,
  crisis_type TEXT NOT NULL,
  severity_level TEXT NOT NULL CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  template_steps JSONB DEFAULT '[]'::jsonb,
  affected_functions JSONB DEFAULT '[]'::jsonb,
  estimated_duration_hours INTEGER,
  recovery_objectives JSONB DEFAULT '{}'::jsonb,
  success_criteria TEXT,
  is_predefined BOOLEAN DEFAULT false,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for scenario_tests
ALTER TABLE public.scenario_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scenario tests for their org" ON public.scenario_tests
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can manage scenario tests for their org" ON public.scenario_tests
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Add RLS policies for scenario_test_functions
ALTER TABLE public.scenario_test_functions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage scenario test functions via org" ON public.scenario_test_functions
  FOR ALL USING (
    scenario_test_id IN (
      SELECT id FROM public.scenario_tests 
      WHERE org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Add RLS policies for scenario_results
ALTER TABLE public.scenario_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scenario results for their org" ON public.scenario_results
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can manage scenario results for their org" ON public.scenario_results
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Add RLS policies for scenario_execution_steps
ALTER TABLE public.scenario_execution_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage execution steps via org" ON public.scenario_execution_steps
  FOR ALL USING (
    scenario_result_id IN (
      SELECT id FROM public.scenario_results 
      WHERE org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Add RLS policies for scenario_templates
ALTER TABLE public.scenario_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scenario templates for their org" ON public.scenario_templates
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR is_predefined = true
  );

CREATE POLICY "Users can manage scenario templates for their org" ON public.scenario_templates
  FOR ALL USING (
    org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_scenario_tests_org_id ON public.scenario_tests(org_id);
CREATE INDEX IF NOT EXISTS idx_scenario_test_functions_scenario_id ON public.scenario_test_functions(scenario_test_id);
CREATE INDEX IF NOT EXISTS idx_scenario_results_org_id ON public.scenario_results(org_id);
CREATE INDEX IF NOT EXISTS idx_scenario_results_test_id ON public.scenario_results(scenario_test_id);
CREATE INDEX IF NOT EXISTS idx_scenario_execution_steps_result_id ON public.scenario_execution_steps(scenario_result_id);
CREATE INDEX IF NOT EXISTS idx_scenario_templates_org_id ON public.scenario_templates(org_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_scenario_result_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scenario_results_timestamp
  BEFORE UPDATE ON public.scenario_results
  FOR EACH ROW
  EXECUTE FUNCTION update_scenario_result_timestamp();

CREATE TRIGGER update_scenario_execution_steps_timestamp
  BEFORE UPDATE ON public.scenario_execution_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenario_templates_timestamp
  BEFORE UPDATE ON public.scenario_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
