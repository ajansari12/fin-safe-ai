
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { ModuleSetting } from "./module-settings-service";

class DataRetentionService {
  async getDataRetentionSettings(): Promise<ModuleSetting[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('org_id', profile.organization_id)
        .eq('category', 'data_retention')
        .order('setting_key');

      if (error) throw error;
      
      const retentionSettings: ModuleSetting[] = [];
      
      if (data) {
        data.forEach(setting => {
          const retentionSetting: ModuleSetting = {
            id: setting.id,
            org_id: setting.org_id,
            setting_key: setting.setting_key,
            setting_value: setting.setting_value,
            description: setting.description,
            category: 'data_retention',
            created_by: null,
            created_at: setting.created_at,
            updated_at: setting.updated_at
          };
          retentionSettings.push(retentionSetting);
        });
      }
      
      return retentionSettings;
    } catch (error) {
      console.error('Error fetching data retention settings:', error);
      return [];
    }
  }

  async updateDataRetentionSetting(
    module: string,
    retentionDays: number,
    autoDelete: boolean
  ): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const settingKey = `${module}_retention`;
      const { error } = await supabase
        .from('settings')
        .upsert({
          org_id: profile.organization_id,
          setting_key: settingKey,
          setting_value: { retention_days: retentionDays, auto_delete: autoDelete },
          category: 'data_retention',
          description: `Data retention policy for ${module}`
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating data retention setting:', error);
      throw error;
    }
  }
}

export const dataRetentionService = new DataRetentionService();
