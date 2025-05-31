
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface ApiKey {
  id: string;
  org_id: string;
  key_name: string;
  key_type: string;
  key_value: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

class ApiKeyService {
  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return [];
    }
  }

  async generateApiKey(name: string, type: string, description?: string): Promise<ApiKey> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      // Generate a secure API key
      const keyValue = `bcp_${type}_${crypto.randomUUID().replace(/-/g, '')}`;

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          org_id: profile.organization_id,
          key_name: name,
          key_type: type,
          key_value: keyValue,
          description,
          created_by: profile.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  }

  async deactivateApiKey(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deactivating API key:', error);
      throw error;
    }
  }

  async deleteApiKey(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  getApiKeyTypes() {
    return [
      { value: 'api_key', label: 'API Key' },
      { value: 'webhook_token', label: 'Webhook Token' },
      { value: 'oauth_token', label: 'OAuth Token' },
      { value: 'service_account', label: 'Service Account' },
      { value: 'integration_key', label: 'Integration Key' }
    ];
  }
}

export const apiKeyService = new ApiKeyService();
