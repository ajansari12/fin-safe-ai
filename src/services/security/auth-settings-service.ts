
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface AuthSettings {
  id: string;
  org_id: string;
  mfa_enforced: boolean;
  mfa_enforcement_date?: string;
  allowed_auth_methods: string[];
  session_timeout_minutes: number;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
  };
  ip_whitelist: string[];
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

class AuthSettingsService {
  async getAuthSettings(): Promise<AuthSettings | null> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return null;

      const { data, error } = await supabase
        .from('auth_settings')
        .select('*')
        .eq('org_id', profile.organization_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching auth settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching auth settings:', error);
      return null;
    }
  }

  async updateAuthSettings(updates: Partial<AuthSettings>): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { error } = await supabase
        .from('auth_settings')
        .upsert({
          org_id: profile.organization_id,
          updated_by: profile.id,
          ...updates
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating auth settings:', error);
      throw error;
    }
  }

  async enforceMFA(enabled: boolean): Promise<void> {
    const updates: Partial<AuthSettings> = {
      mfa_enforced: enabled,
      mfa_enforcement_date: enabled ? new Date().toISOString() : undefined
    };
    
    await this.updateAuthSettings(updates);
  }
}

export const authSettingsService = new AuthSettingsService();
