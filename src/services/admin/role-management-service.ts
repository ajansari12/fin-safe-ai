
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  permissions: string[];
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
          *,
          profiles!inner(full_name, email)
        `)
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        role: item.role,
        permissions: item.permissions || [],
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_name: item.profiles?.full_name || 'Unknown',
        user_email: item.profiles?.email || 'Unknown'
      }));
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  async updateUserRole(userId: string, role: string, permissions: string[]): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          org_id: profile.organization_id,
          role,
          permissions,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async removeUserRole(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
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
}

export const roleManagementService = new RoleManagementService();
