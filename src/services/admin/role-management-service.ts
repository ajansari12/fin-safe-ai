
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

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

      // For now, return the predefined roles as user roles
      const roleDefinitions = this.getRoleDefinitions();
      return roleDefinitions.map((roleDef, index) => ({
        id: `role-${index}`,
        user_id: profile.id || '',
        role: roleDef.role,
        role_name: roleDef.role,
        permissions: roleDef.permissions,
        description: roleDef.description,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_name: 'System',
        user_email: 'system@example.com'
      }));
    } catch (error) {
      console.error('Error fetching user roles:', error);
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

  async updateUserRole(userId: string, role: string, permissions: string[]): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      // This would update the user's role in a proper user_roles table
      console.log('Updating user role:', { userId, role, permissions });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async removeUserRole(userId: string): Promise<void> {
    try {
      // This would remove the user's role from a proper user_roles table
      console.log('Removing user role:', userId);
    } catch (error) {
      console.error('Error removing user role:', error);
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
        role: 'viewer',
        permissions: [
          'dashboard.view',
          'reports.view'
        ],
        description: 'Read-only access to dashboards and reports'
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
}

export const roleManagementService = new RoleManagementService();
