
import { supabase } from "@/integrations/supabase/client";

export interface Organization {
  id: string;
  name: string;
  sector: string;
  size: string;
  regulatory_guidelines: string[];
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'admin' | 'analyst' | 'reviewer';
  created_at: string;
}

export interface OrganizationPolicy {
  id: string;
  organization_id: string;
  name: string;
  file_path: string | null;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export async function createOrganization(organizationData: {
  name: string;
  sector: string;
  size: string;
  regulatory_guidelines: string[];
}) {
  const { data, error } = await supabase
    .from('organizations')
    .insert([organizationData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(organizationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const { error } = await supabase
    .from('profiles')
    .update({ organization_id: organizationId })
    .eq('id', user.id);

  if (error) throw error;
}

export async function createUserRole(organizationId: string, role: 'admin' | 'analyst' | 'reviewer') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const { data, error } = await supabase
    .from('user_roles')
    .insert([{
      user_id: user.id,
      organization_id: organizationId,
      role: role
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadPolicyFile(file: File, organizationId: string) {
  const fileName = `${organizationId}/${Date.now()}-${file.name}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('organization-policies')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('organization_policies')
    .insert([{
      organization_id: organizationId,
      name: file.name,
      file_path: uploadData.path,
      file_type: file.type
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
