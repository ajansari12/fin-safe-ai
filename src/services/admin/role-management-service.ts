
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

class RoleManagementService {
  async getRoles(): Promise<UserRole[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data: settingsData, error } = await supabase
        .from('settings')
        .select('id, org_id, setting_key, setting_value, created_at, updated_at')
        .eq('org_id', profile.organization_id)
        .eq('category', 'user_roles')
        .order('setting_key');

      if (error) throw error;
      
      const roles: UserRole[] = [];
      
      if (settingsData) {
        settingsData.forEach((setting: any) => {
          let settingValue: any = {};
          try {
            settingValue = typeof setting.setting_value === 'string' 
              ? JSON.parse(setting.setting_value) 
              : setting.setting_value || {};
          } catch {
            settingValue = {};
          }
          
          const role: UserRole = {
            id: setting.id,
            org_id: setting.org_id,
            role_name: setting.setting_key,
            permissions: Array.isArray(settingValue.permissions) ? settingValue.permissions : [],
            description: settingValue.description || null,
            is_active: settingValue.is_active !== false,
            created_by: null,
            created_at: setting.created_at,
            updated_at: setting.updated_at
          };
          roles.push(role);
        });
      }
      
      return roles;
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
          description: `User role: ${roleData.role_name}`
        });

      if (error) throw error;
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
      const { data: currentRole, error: fetchError } = await supabase
        .from('settings')
        .select('id, setting_key, setting_value')
        .eq('id', roleId)
        .eq('category', 'user_roles')
        .single();

      if (fetchError) throw fetchError;

      let currentValue: any = {};
      try {
        currentValue = typeof currentRole.setting_value === 'string' 
          ? JSON.parse(currentRole.setting_value) 
          : currentRole.setting_value || {};
      } catch {
        currentValue = {};
      }

      const updatedValue = {
        permissions: updates.permissions || currentValue.permissions || [],
        description: updates.description !== undefined ? updates.description : currentValue.description,
        is_active: updates.is_active !== undefined ? updates.is_active : currentValue.is_active
      };

      const { error } = await supabase
        .from('settings')
        .update({
          setting_key: updates.role_name || currentRole.setting_key,
          setting_value: updatedValue
        })
        .eq('id', roleId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('id', roleId)
        .eq('category', 'user_roles');

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

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
      'manage_settings',
      'manage_reports'
    ];
  }
}

export const roleManagementService = new RoleManagementService();
