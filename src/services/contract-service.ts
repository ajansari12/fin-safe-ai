
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VendorContract {
  id: string;
  vendor_profile_id: string;
  contract_name: string;
  contract_type: 'service_agreement' | 'software_license' | 'consulting' | 'maintenance' | 'other';
  version_number: number;
  start_date: string;
  end_date: string;
  auto_renewal: boolean;
  renewal_notice_days: number;
  contract_value?: number;
  responsible_user_id?: string;
  responsible_user_name?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  status: 'active' | 'expired' | 'pending_renewal' | 'terminated';
  uploaded_by?: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface ContractRenewalAlert {
  id: string;
  contract_id: string;
  alert_date: string;
  days_until_expiry: number;
  alert_type: 'renewal_reminder' | 'expiry_warning' | 'urgent_renewal';
  status: 'pending' | 'sent' | 'acknowledged' | 'resolved';
  email_sent_at?: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
  updated_at: string;
}

export async function getVendorContracts(vendorId: string): Promise<VendorContract[]> {
  try {
    const { data, error } = await supabase
      .from('vendor_contracts')
      .select('*')
      .eq('vendor_profile_id', vendorId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data as VendorContract[];
  } catch (error) {
    console.error('Error fetching vendor contracts:', error);
    toast.error("Failed to load vendor contracts");
    return [];
  }
}

export async function createVendorContract(
  contract: Omit<VendorContract, 'id' | 'created_at' | 'updated_at' | 'uploaded_at'>,
  file?: File
): Promise<VendorContract | null> {
  try {
    let filePath = null;
    let fileSize = null;
    let mimeType = null;

    // Upload contract file if provided
    if (file) {
      const fileName = `${contract.vendor_profile_id}/${Date.now()}-${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('vendor-contracts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      filePath = uploadData?.path;
      fileSize = file.size;
      mimeType = file.type;
    }

    const { data, error } = await supabase
      .from('vendor_contracts')
      .insert({
        ...contract,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    toast.success("Contract created successfully");
    return data as VendorContract;
  } catch (error) {
    console.error('Error creating contract:', error);
    toast.error("Failed to create contract");
    return null;
  }
}

export async function updateVendorContract(
  id: string, 
  updates: Partial<VendorContract>,
  file?: File
): Promise<VendorContract | null> {
  try {
    let filePath = updates.file_path;
    let fileSize = updates.file_size;
    let mimeType = updates.mime_type;

    // Upload new contract file if provided
    if (file) {
      // Delete old file if it exists
      if (filePath) {
        await supabase.storage.from('vendor-contracts').remove([filePath]);
      }

      const fileName = `${updates.vendor_profile_id}/${Date.now()}-${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('vendor-contracts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      filePath = uploadData?.path;
      fileSize = file.size;
      mimeType = file.type;
    }

    const { data, error } = await supabase
      .from('vendor_contracts')
      .update({
        ...updates,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    toast.success("Contract updated successfully");
    return data as VendorContract;
  } catch (error) {
    console.error('Error updating contract:', error);
    toast.error("Failed to update contract");
    return null;
  }
}

export async function deleteVendorContract(id: string, filePath?: string): Promise<boolean> {
  try {
    // Delete file from storage if it exists
    if (filePath) {
      await supabase.storage.from('vendor-contracts').remove([filePath]);
    }

    const { error } = await supabase
      .from('vendor_contracts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success("Contract deleted successfully");
    return true;
  } catch (error) {
    console.error('Error deleting contract:', error);
    toast.error("Failed to delete contract");
    return false;
  }
}

export async function getContractRenewalAlerts(): Promise<ContractRenewalAlert[]> {
  try {
    const { data, error } = await supabase
      .from('contract_renewal_alerts')
      .select(`
        *,
        vendor_contracts!inner (
          contract_name,
          vendor_profile_id,
          third_party_profiles!inner (
            vendor_name
          )
        )
      `)
      .eq('status', 'pending')
      .order('days_until_expiry', { ascending: true });

    if (error) throw error;
    return data as ContractRenewalAlert[];
  } catch (error) {
    console.error('Error fetching contract renewal alerts:', error);
    toast.error("Failed to load contract renewal alerts");
    return [];
  }
}

export async function checkExpiringContracts(): Promise<void> {
  try {
    const { error } = await supabase.rpc('check_expiring_contracts');
    
    if (error) throw error;

    console.log('Successfully checked for expiring contracts');
  } catch (error) {
    console.error('Error checking expiring contracts:', error);
    toast.error("Failed to check expiring contracts");
  }
}

export async function acknowledgeRenewalAlert(alertId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('contract_renewal_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_by: user.user?.id,
        acknowledged_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) throw error;

    toast.success("Alert acknowledged");
    return true;
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    toast.error("Failed to acknowledge alert");
    return false;
  }
}

export async function getContractFileUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .storage
      .from('vendor-contracts')
      .createSignedUrl(filePath, 60);

    if (error) throw error;
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error getting contract file URL:', error);
    toast.error("Failed to get contract download link");
    return null;
  }
}
