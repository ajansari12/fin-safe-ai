
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface Integration {
  id: string;
  org_id: string;
  integration_name: string;
  integration_type: string;
  provider: string;
  configuration: any;
  webhook_url: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

class IntegrationCoreService {
  async getIntegrations(): Promise<Integration[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching integrations:', error);
      return [];
    }
  }

  async createIntegration(integration: Omit<Integration, 'id' | 'created_at' | 'updated_at'>): Promise<Integration> {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .insert(integration)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating integration:', error);
      throw error;
    }
  }

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<void> {
    try {
      const { error } = await supabase
        .from('integrations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    }
  }

  async deleteIntegration(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
  }

  getIntegrationTypes() {
    return [
      { value: 'core_banking', label: 'Core Banking', description: 'Core banking system integration' },
      { value: 'trading', label: 'Trading Platform', description: 'Trading and market data systems' },
      { value: 'hr', label: 'HR System', description: 'Human resources management system' },
      { value: 'vendor_mgmt', label: 'Vendor Management', description: 'Third-party vendor management' },
      { value: 'regulatory', label: 'Regulatory Portal', description: 'Regulatory reporting and compliance' },
      { value: 'third_party', label: 'Third Party API', description: 'General third-party API integration' }
    ];
  }
}

export const integrationCoreService = new IntegrationCoreService();
