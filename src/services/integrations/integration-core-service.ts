
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
      { value: 'webhook', label: 'Webhook', description: 'Send data to external webhooks' },
      { value: 'slack', label: 'Slack', description: 'Slack workspace integration' },
      { value: 'teams', label: 'Microsoft Teams', description: 'Teams channel integration' },
      { value: 'email', label: 'Email Notifications', description: 'SMTP email integration' },
      { value: 'crm', label: 'CRM Integration', description: 'Customer relationship management' },
      { value: 'dms', label: 'Document Management', description: 'Document management system' },
      { value: 'siem', label: 'SIEM Integration', description: 'Security information and event management' },
      { value: 'api', label: 'REST API', description: 'Custom REST API integration' }
    ];
  }
}

export const integrationCoreService = new IntegrationCoreService();
