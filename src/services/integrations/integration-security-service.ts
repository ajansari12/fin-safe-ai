import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface ApiKey {
  id: string;
  org_id: string;
  key_name: string;
  key_type: string;
  key_value: string;
  description?: string;
  is_active: boolean;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
}

export interface AuthenticationConfig {
  type: 'api_key' | 'oauth' | 'basic' | 'bearer' | 'custom';
  credentials: Record<string, any>;
  refreshConfig?: {
    endpoint: string;
    method: string;
    body?: any;
  };
}

class IntegrationSecurityService {
  async createApiKey(name: string, type: string, description?: string, expiresAt?: Date): Promise<ApiKey> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) {
        throw new Error('User organization not found');
      }

      const keyValue = this.generateSecureKey();
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          org_id: profile.organization_id,
          key_name: name,
          key_type: type,
          key_value: keyValue,
          description,
          expires_at: expiresAt?.toISOString(),
          created_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }

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

  async deactivateApiKey(keyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deactivating API key:', error);
      throw error;
    }
  }

  async updateLastUsed(keyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', keyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating last used:', error);
    }
  }

  async validateApiKey(keyValue: string): Promise<ApiKey | null> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key_value', keyValue)
        .eq('is_active', true)
        .single();

      if (error || !data) return null;

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await this.deactivateApiKey(data.id);
        return null;
      }

      // Update last used
      await this.updateLastUsed(data.id);
      
      return data;
    } catch (error) {
      console.error('Error validating API key:', error);
      return null;
    }
  }

  private generateSecureKey(): string {
    const prefix = 'fsa_';
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const key = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return prefix + key;
  }

  encryptCredentials(credentials: any): string {
    // In a real implementation, use proper encryption
    // For now, we'll use base64 encoding as a placeholder
    return btoa(JSON.stringify(credentials));
  }

  decryptCredentials(encryptedCredentials: string): any {
    try {
      return JSON.parse(atob(encryptedCredentials));
    } catch (error) {
      console.error('Error decrypting credentials:', error);
      return {};
    }
  }

  buildAuthHeaders(authConfig: AuthenticationConfig): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (authConfig.type) {
      case 'api_key':
        if (authConfig.credentials.header) {
          headers[authConfig.credentials.header] = authConfig.credentials.key;
        } else {
          headers['X-API-Key'] = authConfig.credentials.key;
        }
        break;

      case 'bearer':
        headers['Authorization'] = `Bearer ${authConfig.credentials.token}`;
        break;

      case 'basic':
        const basicAuth = btoa(`${authConfig.credentials.username}:${authConfig.credentials.password}`);
        headers['Authorization'] = `Basic ${basicAuth}`;
        break;

      case 'oauth':
        headers['Authorization'] = `Bearer ${authConfig.credentials.access_token}`;
        break;

      case 'custom':
        Object.assign(headers, authConfig.credentials.headers || {});
        break;
    }

    return headers;
  }

  async refreshOAuthToken(authConfig: AuthenticationConfig): Promise<string | null> {
    if (!authConfig.refreshConfig || authConfig.type !== 'oauth') {
      return null;
    }

    try {
      const response = await fetch(authConfig.refreshConfig.endpoint, {
        method: authConfig.refreshConfig.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: authConfig.credentials.refresh_token,
          ...authConfig.refreshConfig.body
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing OAuth token:', error);
      return null;
    }
  }

  validateIntegrationPermissions(integration: any, requiredPermissions: string[]): boolean {
    const userPermissions = integration.configuration?.permissions || [];
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }

  sanitizeConfigurationData(config: any): any {
    // Remove sensitive fields from configuration before logging
    const sanitized = { ...config };
    const sensitiveFields = ['password', 'secret', 'token', 'key', 'credentials'];
    
    function sanitizeObject(obj: any): any {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const result: any = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          result[key] = '***REDACTED***';
        } else if (typeof value === 'object') {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    }
    
    return sanitizeObject(sanitized);
  }
}

export const integrationSecurityService = new IntegrationSecurityService();