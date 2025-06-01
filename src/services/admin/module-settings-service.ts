
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface ModuleSetting {
  id: string;
  org_id: string;
  setting_key: string;
  setting_value: {
    enabled?: boolean;
    retention_days?: number;
    auto_delete?: boolean;
  };
  description: string | null;
  category: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

class ModuleSettingsService {
  async getModuleSettings(): Promise<ModuleSetting[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data } = await supabase
        .from('settings')
        .select('id, org_id, setting_key, setting_value, description, created_at, updated_at')
        .eq('org_id', profile.organization_id)
        .eq('category', 'modules')
        .order('setting_key');

      return (data || []).map(item => ({
        id: item.id,
        org_id: item.org_id,
        setting_key: item.setting_key,
        setting_value: this.transformSettingValue(item.setting_value),
        description: item.description,
        category: 'modules',
        created_by: null,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error in getModuleSettings:', error);
      return [];
    }
  }

  async updateModuleSetting(settingKey: string, enabled: boolean): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      await supabase
        .from('settings')
        .upsert({
          org_id: profile.organization_id,
          setting_key: settingKey,
          setting_value: { enabled },
          category: 'modules',
          description: `Module ${settingKey} activation setting`
        });
    } catch (error) {
      console.error('Error updating module setting:', error);
      throw error;
    }
  }

  private transformSettingValue(value: any): { enabled?: boolean; retention_days?: number; auto_delete?: boolean } {
    if (value && typeof value === 'object') {
      return {
        enabled: Boolean(value.enabled),
        retention_days: typeof value.retention_days === 'number' ? value.retention_days : undefined,
        auto_delete: Boolean(value.auto_delete)
      };
    }
    if (typeof value === 'boolean') {
      return { enabled: value };
    }
    return { enabled: false };
  }

  getAvailableModules(): Array<{ key: string; name: string; description: string }> {
    return [
      { key: 'governance_framework', name: 'Governance Framework', description: 'Policy and governance management' },
      { key: 'risk_appetite', name: 'Risk Appetite', description: 'Risk appetite statements and thresholds' },
      { key: 'business_functions', name: 'Business Functions', description: 'Critical business function mapping' },
      { key: 'impact_tolerances', name: 'Impact Tolerances', description: 'Impact tolerance management' },
      { key: 'dependencies', name: 'Dependencies', description: 'Dependency mapping and monitoring' },
      { key: 'scenario_testing', name: 'Scenario Testing', description: 'Business continuity scenario testing' },
      { key: 'business_continuity', name: 'Business Continuity', description: 'Continuity planning and testing' },
      { key: 'third_party_risk', name: 'Third-Party Risk', description: 'Vendor and third-party risk management' },
      { key: 'controls_kri', name: 'Controls & KRIs', description: 'Control testing and KRI monitoring' },
      { key: 'incident_log', name: 'Incident Management', description: 'Incident logging and response' },
      { key: 'audit_compliance', name: 'Audit & Compliance', description: 'Audit management and compliance tracking' },
      { key: 'workflow_center', name: 'Workflow Center', description: 'Workflow automation and management' },
      { key: 'analytics_hub', name: 'Analytics Hub', description: 'Advanced analytics and reporting' }
    ];
  }
}

export const moduleSettingsService = new ModuleSettingsService();
