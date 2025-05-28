
import { supabase } from "@/integrations/supabase/client";

export interface Control {
  id: string;
  title: string;
  description?: string;
  scope: string;
  frequency: string;
  owner: string;
  status: 'active' | 'inactive' | 'under_review';
  org_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

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

export interface KRILog {
  id: string;
  kri_id: string;
  measurement_date: string;
  actual_value: number;
  threshold_breached?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getControls(): Promise<Control[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return [];
  }

  const { data, error } = await supabase
    .from('controls')
    .select('*')
    .eq('org_id', profile.organization_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createControl(control: Omit<Control, 'id' | 'created_at' | 'updated_at' | 'org_id' | 'created_by'>): Promise<Control> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error('User not associated with an organization');
  }

  const { data, error } = await supabase
    .from('controls')
    .insert({
      ...control,
      org_id: profile.organization_id,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateControl(id: string, updates: Partial<Control>): Promise<Control> {
  const { data, error } = await supabase
    .from('controls')
    .update({
      ...updates,
      updated_by: (await supabase.auth.getUser()).data.user?.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteControl(id: string): Promise<void> {
  const { error } = await supabase
    .from('controls')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
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

  return data || [];
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

  return data;
}

export async function getKRILogs(kriId: string): Promise<KRILog[]> {
  const { data, error } = await supabase
    .from('kri_logs')
    .select('*')
    .eq('kri_id', kriId)
    .order('measurement_date', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createKRILog(log: Omit<KRILog, 'id' | 'created_at' | 'updated_at'>): Promise<KRILog> {
  const { data, error } = await supabase
    .from('kri_logs')
    .insert(log)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
