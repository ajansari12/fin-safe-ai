
import { supabase } from "@/integrations/supabase/client";

export interface VendorProfile {
  id: string;
  org_id: string;
  vendor_name: string;
  service_provided: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  sla_expiry_date?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  annual_spend?: number;
  status: 'active' | 'inactive' | 'under_review' | 'terminated';
  risk_rating?: 'low' | 'medium' | 'high' | 'critical';
  last_assessment_date?: string;
  next_assessment_date?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorSLAAlert {
  id: string;
  vendor_profile_id: string;
  alert_type: 'sla_expiry' | 'contract_renewal' | 'review_due' | 'assessment_overdue';
  alert_date: string;
  days_before_alert: number;
  status: 'pending' | 'sent' | 'acknowledged' | 'resolved';
  email_sent_at?: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorBusinessFunction {
  id: string;
  vendor_profile_id: string;
  business_function_id: string;
  dependency_level: 'critical' | 'high' | 'medium' | 'low';
  created_at: string;
  business_function?: {
    id: string;
    name: string;
    criticality: string;
  };
}

export interface VendorDocument {
  id: string;
  vendor_profile_id: string;
  document_name: string;
  document_type: 'contract' | 'security_review' | 'sla' | 'certificate' | 'other';
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
  upload_date: string;
  expiry_date?: string;
  description?: string;
}

export async function getVendorProfiles(): Promise<VendorProfile[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return [];
  }

  const { data, error } = await supabase
    .from('third_party_profiles')
    .select('*')
    .eq('org_id', profile.organization_id)
    .order('vendor_name', { ascending: true });

  if (error) throw error;
  return (data || []) as VendorProfile[];
}

export async function createVendorProfile(vendor: Omit<VendorProfile, 'id' | 'org_id' | 'created_at' | 'updated_at'>): Promise<VendorProfile> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error('User organization not found');
  }

  const { data, error } = await supabase
    .from('third_party_profiles')
    .insert({
      ...vendor,
      org_id: profile.organization_id,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data as VendorProfile;
}

export async function updateVendorProfile(id: string, updates: Partial<VendorProfile>): Promise<VendorProfile> {
  const { data, error } = await supabase
    .from('third_party_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as VendorProfile;
}

export async function deleteVendorProfile(id: string): Promise<void> {
  const { error } = await supabase
    .from('third_party_profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getVendorBusinessFunctions(vendorId: string): Promise<VendorBusinessFunction[]> {
  const { data, error } = await supabase
    .from('vendor_business_functions')
    .select(`
      *,
      business_function:business_functions(id, name, criticality)
    `)
    .eq('vendor_profile_id', vendorId);

  if (error) throw error;
  return (data || []) as VendorBusinessFunction[];
}

export async function addVendorBusinessFunction(vendorId: string, businessFunctionId: string, dependencyLevel: string): Promise<VendorBusinessFunction> {
  const { data, error } = await supabase
    .from('vendor_business_functions')
    .insert({
      vendor_profile_id: vendorId,
      business_function_id: businessFunctionId,
      dependency_level: dependencyLevel
    })
    .select()
    .single();

  if (error) throw error;
  return data as VendorBusinessFunction;
}

export async function removeVendorBusinessFunction(id: string): Promise<void> {
  const { error } = await supabase
    .from('vendor_business_functions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getVendorSLAAlerts(vendorId?: string): Promise<VendorSLAAlert[]> {
  let query = supabase.from('vendor_sla_alerts').select('*');
  
  if (vendorId) {
    query = query.eq('vendor_profile_id', vendorId);
  }

  const { data, error } = await query.order('alert_date', { ascending: true });

  if (error) throw error;
  return (data || []) as VendorSLAAlert[];
}

export async function createVendorSLAAlert(alert: Omit<VendorSLAAlert, 'id' | 'created_at' | 'updated_at'>): Promise<VendorSLAAlert> {
  const { data, error } = await supabase
    .from('vendor_sla_alerts')
    .insert(alert)
    .select()
    .single();

  if (error) throw error;
  return data as VendorSLAAlert;
}

export async function updateVendorSLAAlert(id: string, updates: Partial<VendorSLAAlert>): Promise<VendorSLAAlert> {
  const { data, error } = await supabase
    .from('vendor_sla_alerts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as VendorSLAAlert;
}

export async function getVendorDocuments(vendorId: string): Promise<VendorDocument[]> {
  const { data, error } = await supabase
    .from('vendor_documents')
    .select('*')
    .eq('vendor_profile_id', vendorId)
    .order('upload_date', { ascending: false });

  if (error) throw error;
  return (data || []) as VendorDocument[];
}

export async function uploadVendorDocument(
  vendorId: string,
  file: File,
  documentType: string,
  description?: string,
  expiryDate?: string
): Promise<VendorDocument> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${vendorId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('vendor-documents')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('vendor_documents')
    .insert({
      vendor_profile_id: vendorId,
      document_name: file.name,
      document_type: documentType,
      file_path: fileName,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      description,
      expiry_date: expiryDate
    })
    .select()
    .single();

  if (error) throw error;
  return data as VendorDocument;
}

export async function deleteVendorDocument(id: string, filePath?: string): Promise<void> {
  if (filePath) {
    await supabase.storage
      .from('vendor-documents')
      .remove([filePath]);
  }

  const { error } = await supabase
    .from('vendor_documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
