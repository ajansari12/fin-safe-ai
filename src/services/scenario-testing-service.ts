
import { supabase } from "@/integrations/supabase/client";

export interface ScenarioTest {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  disruption_type: string;
  severity_level: string;
  status: string;
  current_step: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  outcome?: string;
  response_plan?: string;
  post_mortem?: string;
  lessons_learned?: string;
  improvements_identified?: string;
}

export interface ScenarioTestFunction {
  id: string;
  scenario_test_id: string;
  business_function_id: string;
  estimated_downtime?: string;
  actual_downtime?: string;
  impact_level: string;
  business_function?: {
    id: string;
    name: string;
    criticality: string;
  };
}

export interface ScenarioTestControl {
  id: string;
  scenario_test_id: string;
  control_name: string;
  control_type?: string;
  effectiveness: string;
  notes?: string;
}

export async function getScenarioTests(): Promise<ScenarioTest[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return [];
  }

  const { data, error } = await supabase
    .from('scenario_tests')
    .select('*')
    .eq('org_id', profile.organization_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createScenarioTest(scenarioTest: Omit<ScenarioTest, 'id' | 'org_id' | 'created_at' | 'updated_at'>): Promise<ScenarioTest> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error('User organization not found');
  }

  const { data, error } = await supabase
    .from('scenario_tests')
    .insert({
      ...scenarioTest,
      org_id: profile.organization_id,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScenarioTest(id: string, updates: Partial<ScenarioTest>): Promise<ScenarioTest> {
  const { data, error } = await supabase
    .from('scenario_tests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteScenarioTest(id: string): Promise<void> {
  const { error } = await supabase
    .from('scenario_tests')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getScenarioTestFunctions(scenarioTestId: string): Promise<ScenarioTestFunction[]> {
  const { data, error } = await supabase
    .from('scenario_test_functions')
    .select(`
      *,
      business_function:business_functions(id, name, criticality)
    `)
    .eq('scenario_test_id', scenarioTestId);

  if (error) throw error;
  return data || [];
}

export async function addScenarioTestFunction(scenarioTestFunction: Omit<ScenarioTestFunction, 'id' | 'created_at'>): Promise<ScenarioTestFunction> {
  const { data, error } = await supabase
    .from('scenario_test_functions')
    .insert(scenarioTestFunction)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeScenarioTestFunction(id: string): Promise<void> {
  const { error } = await supabase
    .from('scenario_test_functions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getScenarioTestControls(scenarioTestId: string): Promise<ScenarioTestControl[]> {
  const { data, error } = await supabase
    .from('scenario_test_controls')
    .select('*')
    .eq('scenario_test_id', scenarioTestId);

  if (error) throw error;
  return data || [];
}

export async function addScenarioTestControl(control: Omit<ScenarioTestControl, 'id' | 'created_at'>): Promise<ScenarioTestControl> {
  const { data, error } = await supabase
    .from('scenario_test_controls')
    .insert(control)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScenarioTestControl(id: string, updates: Partial<ScenarioTestControl>): Promise<ScenarioTestControl> {
  const { data, error } = await supabase
    .from('scenario_test_controls')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
