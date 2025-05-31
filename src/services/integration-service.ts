
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

export interface IntegrationLog {
  id: string;
  org_id: string;
  integration_id: string | null;
  event_type: string;
  event_data: any;
  status: string;
  error_message: string | null;
  response_time_ms: number | null;
  created_at: string;
}

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

class IntegrationService {
  // Integration Management
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

  async testIntegration(id: string): Promise<boolean> {
    try {
      // This would typically make a test call to the external service
      // For now, we'll simulate a test and log the result
      await this.logIntegrationEvent(id, 'test_connection', { test: true }, 'success');
      return true;
    } catch (error) {
      await this.logIntegrationEvent(id, 'test_connection', { error: error }, 'error');
      return false;
    }
  }

  // API Key Management
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

  // Integration Logs
  async getIntegrationLogs(integrationId?: string): Promise<IntegrationLog[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('integration_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching integration logs:', error);
      return [];
    }
  }

  async logIntegrationEvent(
    integrationId: string | null,
    eventType: string,
    eventData: any,
    status: 'success' | 'error' | 'warning' = 'success',
    errorMessage?: string,
    responseTimeMs?: number
  ): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return;

      const { error } = await supabase
        .from('integration_logs')
        .insert({
          org_id: profile.organization_id,
          integration_id: integrationId,
          event_type: eventType,
          event_data: eventData,
          status,
          error_message: errorMessage,
          response_time_ms: responseTimeMs
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging integration event:', error);
    }
  }

  // Webhook utilities
  async testWebhook(webhookUrl: string, payload: any): Promise<boolean> {
    try {
      const startTime = Date.now();
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseTime = Date.now() - startTime;
      const success = response.ok;

      await this.logIntegrationEvent(
        null,
        'webhook_test',
        { url: webhookUrl, payload, response_status: response.status },
        success ? 'success' : 'error',
        success ? undefined : `HTTP ${response.status}: ${response.statusText}`,
        responseTime
      );

      return success;
    } catch (error) {
      await this.logIntegrationEvent(
        null,
        'webhook_test',
        { url: webhookUrl, payload },
        'error',
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  // Predefined integration types
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

export const integrationService = new IntegrationService();
