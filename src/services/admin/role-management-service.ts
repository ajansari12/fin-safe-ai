
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { logger } from "@/lib/logger";

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  role_name: string;
  permissions: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

export interface RolePermission {
  role: string;
  permissions: string[];
  description: string;
}

class RoleManagementService {
  async getUserRoles(): Promise<UserRole[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          role_type,
          created_at,
          profiles!user_roles_user_id_fkey(full_name, email)
        `)
        .eq('organization_id', profile.organization_id);

      if (error) throw error;

      return data.map(userRole => ({
        id: userRole.id,
        user_id: userRole.user_id,
        role: userRole.role,
        role_name: userRole.role,
        permissions: this.getPermissionsForRole(userRole.role),
        description: this.getRoleDescription(userRole.role),
        is_active: true,
        created_at: userRole.created_at || new Date().toISOString(),
        updated_at: userRole.created_at || new Date().toISOString(),
        user_name: userRole?.profiles?.[0]?.full_name || 'Unknown',
        user_email: userRole?.profiles?.[0]?.email || ''
      }));
    } catch (error) {
      logger.error('Error fetching user roles', { 
        component: 'RoleManagementService',
        module: 'admin' 
      }, error);
      return [];
    }
  }

  async getRoles(): Promise<UserRole[]> {
    return this.getUserRoles();
  }

  async createRole(roleData: {
    role_name: string;
    permissions: string[];
    description?: string;
  }): Promise<void> {
    // For now, this is a placeholder implementation
    console.log('Creating role:', roleData);
  }

  async updateRole(roleId: string, updates: {
    role_name?: string;
    permissions?: string[];
    description?: string;
    is_active?: boolean;
  }): Promise<void> {
    // For now, this is a placeholder implementation
    console.log('Updating role:', roleId, updates);
  }

  async deleteRole(roleId: string): Promise<void> {
    // For now, this is a placeholder implementation
    console.log('Deleting role:', roleId);
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase.rpc('update_user_role_safe', {
        p_user_id: userId,
        p_new_role: role,
        p_organization_id: profile.organization_id
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
    } catch (error) {
      logger.error('Error updating user role', { 
        component: 'RoleManagementService',
        module: 'admin',
        metadata: { userId, role }
      }, error);
      throw error;
    }
  }

  async removeUserRole(userId: string): Promise<void> {
    try {
      // This would remove the user's role from a proper user_roles table
      console.log('Removing user role:', userId);
    } catch (error) {
      logger.error('Error removing user role', { 
        component: 'RoleManagementService',
        module: 'admin',
        metadata: { userId }
      }, error);
      throw error;
    }
  }

  getRoleDefinitions(): RolePermission[] {
    return [
      {
        role: 'admin',
        permissions: ['*'],
        description: 'Full system access and administration rights'
      },
      {
        role: 'manager',
        permissions: [
          'incidents.manage',
          'risks.manage',
          'controls.manage',
          'governance.view',
          'reports.generate'
        ],
        description: 'Manage operational activities and generate reports'
      },
      {
        role: 'analyst',
        permissions: [
          'incidents.view',
          'risks.view',
          'controls.view',
          'governance.view'
        ],
        description: 'View and analyze operational data'
      },
      {
        role: 'reviewer',
        permissions: [
          'governance.view',
          'audit.review',
          'compliance.review',
          'reports.view'
        ],
        description: 'Review and approve governance policies and compliance documentation'
      }
    ];
  }

  getAvailablePermissions(): string[] {
    return [
      'incidents.view',
      'incidents.manage',
      'risks.view',
      'risks.manage',
      'controls.view',
      'controls.manage',
      'governance.view',
      'governance.manage',
      'reports.view',
      'reports.generate',
      'dashboard.view',
      'admin.users',
      'admin.settings',
      'admin.system'
    ];
  }

  private getPermissionsForRole(role: string): string[] {
    const roleDefinition = this.getRoleDefinitions().find(def => def.role === role);
    return roleDefinition?.permissions || [];
  }

  private getRoleDescription(role: string): string {
    const roleDefinition = this.getRoleDefinitions().find(def => def.role === role);
    return roleDefinition?.description || '';
  }
}

export const roleManagementService = new RoleManagementService();
