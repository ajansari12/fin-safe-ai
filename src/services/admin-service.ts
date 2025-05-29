
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  user_roles?: { role: string }[];
}

export interface UserInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_by: string | null;
  expires_at: string;
  created_at: string;
}

export interface OrganizationSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  key_name: string;
  key_value: string;
  key_type: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

export interface DataRetentionPolicy {
  id: string;
  table_name: string;
  retention_period_days: number;
  auto_delete: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// User Management
export async function getOrganizationUsers(): Promise<UserProfile[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles(role)
    `)
    .eq('organization_id', profile.organization_id);

  if (error) throw error;
  return data || [];
}

export async function inviteUser(email: string, role: string): Promise<UserInvitation> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) throw new Error('No organization found');

  const { data, error } = await supabase
    .from('user_invitations')
    .insert([{
      org_id: profile.organization_id,
      email,
      role,
      invited_by: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserRole(userId: string, newRole: string): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) throw new Error('No organization found');

  const { error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      organization_id: profile.organization_id,
      role: newRole
    });

  if (error) throw error;
}

export async function deactivateUser(userId: string): Promise<void> {
  // This would typically involve setting a status field or removing from user_roles
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

// Organization Settings
export async function getOrganizationSettings(): Promise<OrganizationSetting[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) return [];

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('org_id', profile.organization_id);

  if (error) throw error;
  return data || [];
}

export async function updateOrganizationSetting(key: string, value: any, description?: string): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) throw new Error('No organization found');

  const { error } = await supabase
    .from('settings')
    .upsert({
      org_id: profile.organization_id,
      setting_key: key,
      setting_value: value,
      description
    });

  if (error) throw error;
}

// API Keys Management
export async function getApiKeys(): Promise<ApiKey[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) return [];

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('org_id', profile.organization_id);

  if (error) throw error;
  return data || [];
}

export async function createApiKey(keyName: string, keyType: string, description?: string): Promise<ApiKey> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) throw new Error('No organization found');

  // Generate a random API key
  const keyValue = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const { data, error } = await supabase
    .from('api_keys')
    .insert([{
      org_id: profile.organization_id,
      key_name: keyName,
      key_value: keyValue,
      key_type: keyType,
      description,
      created_by: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateApiKey(keyId: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId);

  if (error) throw error;
}

// Data Retention Policies
export async function getDataRetentionPolicies(): Promise<DataRetentionPolicy[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) return [];

  const { data, error } = await supabase
    .from('data_retention_policies')
    .select('*')
    .eq('org_id', profile.organization_id);

  if (error) throw error;
  return data || [];
}

export async function createDataRetentionPolicy(
  tableName: string,
  retentionDays: number,
  autoDelete: boolean,
  description?: string
): Promise<DataRetentionPolicy> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) throw new Error('No organization found');

  const { data, error } = await supabase
    .from('data_retention_policies')
    .insert([{
      org_id: profile.organization_id,
      table_name: tableName,
      retention_period_days: retentionDays,
      auto_delete: autoDelete,
      description,
      created_by: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDataRetentionPolicy(
  policyId: string,
  retentionDays: number,
  autoDelete: boolean,
  description?: string
): Promise<void> {
  const { error } = await supabase
    .from('data_retention_policies')
    .update({
      retention_period_days: retentionDays,
      auto_delete: autoDelete,
      description
    })
    .eq('id', policyId);

  if (error) throw error;
}
