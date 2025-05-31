
import { supabase } from "@/integrations/supabase/client";

export interface ScenarioTemplate {
  id: string;
  org_id: string;
  template_name: string;
  template_description?: string;
  crisis_type: string;
  severity_level: string;
  template_steps: any[];
  affected_functions?: any[];
  estimated_duration_hours?: number;
  recovery_objectives?: any;
  success_criteria?: string;
  is_predefined: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScenarioTemplateData {
  template_name: string;
  template_description?: string;
  crisis_type: string;
  severity_level: string;
  template_steps: any[];
  affected_functions?: any[];
  estimated_duration_hours?: number;
  recovery_objectives?: any;
  success_criteria?: string;
}

export async function getScenarioTemplates(): Promise<ScenarioTemplate[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return [];
  }

  const { data, error } = await (supabase as any)
    .from('scenario_templates')
    .select('*')
    .eq('org_id', profile.organization_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createScenarioTemplate(templateData: CreateScenarioTemplateData): Promise<ScenarioTemplate> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error('User organization not found');
  }

  const { data, error } = await (supabase as any)
    .from('scenario_templates')
    .insert({
      ...templateData,
      org_id: profile.organization_id,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScenarioTemplate(id: string, updates: Partial<ScenarioTemplate>): Promise<ScenarioTemplate> {
  const { data, error } = await (supabase as any)
    .from('scenario_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteScenarioTemplate(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('scenario_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getPredefinedTemplates(): Promise<ScenarioTemplate[]> {
  const { data, error } = await (supabase as any)
    .from('scenario_templates')
    .select('*')
    .eq('is_predefined', true)
    .order('template_name');

  if (error) throw error;
  return data || [];
}
