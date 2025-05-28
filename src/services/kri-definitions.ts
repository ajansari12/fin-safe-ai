
import { supabase } from "@/integrations/supabase/client";

export interface KRIDefinition {
  id: string;
  name: string;
  description?: string;
  control_id?: string;
  threshold_id: string;
  measurement_frequency?: string;
  warning_threshold?: string;
  critical_threshold?: string;
  target_value?: string;
  status: 'active' | 'inactive';
  org_id: string;
  created_at: string;
  updated_at: string;
}

export async function getKRIDefinitions(): Promise<KRIDefinition[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return [];
  }

  const { data, error } = await supabase
    .from('kri_definitions')
    .select('*')
    .eq('org_id', profile.organization_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as KRIDefinition[];
}

export async function createKRIDefinition(kri: Omit<KRIDefinition, 'id' | 'created_at' | 'updated_at' | 'org_id'>): Promise<KRIDefinition> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error('User not associated with an organization');
  }

  const { data, error } = await supabase
    .from('kri_definitions')
    .insert({
      ...kri,
      org_id: profile.organization_id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as KRIDefinition;
}
