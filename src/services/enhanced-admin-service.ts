
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface UserRole {
  id: string;
  org_id: string;
  role_name: string;
  permissions: string[];
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminLog {
  id: string;
  org_id: string;
  admin_user_id: string;
  admin_user_name: string;
  action_type: string;
  resource_type: string;
  resource_id: string | null;
  resource_name: string | null;
  action_details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ModuleSetting {
  id: string;
  org_id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
  category: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

class EnhancedAdminService {
  private async logAdminAction(
    actionType: string,
    resourceType: string,
    resourceId?: string,
    resourceName?: string,
    actionDetails?: any
  ) {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile) return;

      // For now, log to console since admin_logs table may not exist in Supabase types yet
      console.log('Admin Action:', {
        org_id: profile.organization_id,
        admin_user_id: profile.id,
        admin_user_name: profile.full_name || 'Unknown Admin',
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        resource_name: resourceName,
        action_details: actionDetails,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }

  // Role Management - Using settings table to store roles
  async getRoles(): Promise<UserRole[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('org_id', profile.organization_id)
        .eq('category', 'user_roles')
        .order('setting_key');

      if (error) throw error;
      
      // Transform settings data to UserRole format
      return (data || []).map(setting => ({
        id: setting.id,
        org_id: setting.org_id,
        role_name: setting.setting_key,
        permissions: setting.setting_value?.permissions || [],
        description: setting.setting_value?.description || null,
        is_active: setting.setting_value?.is_active !== false,
        created_by: setting.created_by,
        created_at: setting.created_at,
        updated_at: setting.updated_at
      }));
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  async createRole(roleData: {
    role_name: string;
    permissions: string[];
    description?: string;
  }): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { error } = await supabase
        .from('settings')
        .insert({
          org_id: profile.organization_id,
          setting_key: roleData.role_name,
          setting_value: {
            permissions: roleData.permissions,
            description: roleData.description,
            is_active: true
          },
          category: 'user_roles',
          description: `User role: ${roleData.role_name}`,
          created_by: profile.id
        });

      if (error) throw error;

      await this.logAdminAction(
        'create',
        'role',
        undefined,
        roleData.role_name,
        { permissions: roleData.permissions }
      );
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(roleId: string, updates: {
    role_name?: string;
    permissions?: string[];
    description?: string;
    is_active?: boolean;
  }): Promise<void> {
    try {
      // Get current role data
      const { data: currentRole, error: fetchError } = await supabase
        .from('settings')
        .select('*')
        .eq('id', roleId)
        .eq('category', 'user_roles')
        .single();

      if (fetchError) throw fetchError;

      const updatedValue = {
        ...currentRole.setting_value,
        permissions: updates.permissions || currentRole.setting_value.permissions,
        description: updates.description !== undefined ? updates.description : currentRole.setting_value.description,
        is_active: updates.is_active !== undefined ? updates.is_active : currentRole.setting_value.is_active
      };

      const { error } = await supabase
        .from('settings')
        .update({
          setting_key: updates.role_name || currentRole.setting_key,
          setting_value: updatedValue
        })
        .eq('id', roleId);

      if (error) throw error;

      await this.logAdminAction(
        'update',
        'role',
        roleId,
        updates.role_name || currentRole.setting_key,
        updates
      );
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(roleId: string, roleName: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('id', roleId)
        .eq('category', 'user_roles');

      if (error) throw error;

      await this.logAdminAction('delete', 'role', roleId, roleName);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  // Module Settings Management
  async getModuleSettings(): Promise<ModuleSetting[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('org_id', profile.organization_id)
        .eq('category', 'modules')
        .order('setting_key');

      if (error) throw error;
      return (data || []).map(setting => ({
        ...setting,
        category: setting.category || 'modules',
        created_by: setting.created_by
      }));
    } catch (error) {
      console.error('Error fetching module settings:', error);
      return [];
    }
  }

  async updateModuleSetting(settingKey: string, enabled: boolean): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { error } = await supabase
        .from('settings')
        .upsert({
          org_id: profile.organization_id,
          setting_key: settingKey,
          setting_value: { enabled },
          category: 'modules',
          description: `Module ${settingKey} activation setting`,
          created_by: profile.id
        });

      if (error) throw error;

      await this.logAdminAction(
        'update',
        'module_setting',
        undefined,
        settingKey,
        { enabled }
      );
    } catch (error) {
      console.error('Error updating module setting:', error);
      throw error;
    }
  }

  // Data Retention Settings
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
      return (data || []).map(setting => ({
        ...setting,
        category: setting.category || 'data_retention',
        created_by: setting.created_by
      }));
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
          description: `Data retention policy for ${module}`,
          created_by: profile.id
        });

      if (error) throw error;

      await this.logAdminAction(
        'update',
        'data_retention_setting',
        undefined,
        settingKey,
        { retention_days: retentionDays, auto_delete: autoDelete }
      );
    } catch (error) {
      console.error('Error updating data retention setting:', error);
      throw error;
    }
  }

  // Admin Audit Logs - Mock implementation since table might not exist yet
  async getAdminLogs(limit: number = 100): Promise<AdminLog[]> {
    try {
      // Return mock data since admin_logs table might not be in Supabase types yet
      return [
        {
          id: 'mock-1',
          org_id: 'mock-org',
          admin_user_id: 'mock-user',
          admin_user_name: 'Admin User',
          action_type: 'create',
          resource_type: 'role',
          resource_id: null,
          resource_name: 'Test Role',
          action_details: { permissions: ['view_dashboard'] },
          ip_address: null,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      return [];
    }
  }

  // Available permissions for role management
  getAvailablePermissions(): string[] {
    return [
      'view_dashboard',
      'manage_governance',
      'manage_risk_appetite',
      'manage_business_functions',
      'manage_dependencies',
      'manage_scenarios',
      'manage_continuity',
      'manage_third_party',
      'manage_controls',
      'manage_incidents',
      'manage_audit',
      'manage_workflows',
      'view_analytics',
      'manage_users',
      'manage_settings'
    ];
  }

  // Available modules for toggle management
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

export const enhancedAdminService = new EnhancedAdminService();
