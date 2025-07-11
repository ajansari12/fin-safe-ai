import { supabase } from "@/integrations/supabase/client";

/**
 * Secure role management service that uses server-side validation
 * and secure database functions to prevent privilege escalation
 */
export class SecureRoleService {
  /**
   * Update user role - Admin only operation with server-side validation
   */
  static async updateUserRole(
    userId: string, 
    newRole: string, 
    organizationId: string
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Input validation
      const allowedRoles = ['admin', 'analyst', 'reviewer', 'auditor', 'executive', 'super_admin'];
      if (!allowedRoles.includes(newRole)) {
        return { success: false, error: 'Invalid role specified' };
      }

      if (!userId || !organizationId) {
        return { success: false, error: 'Missing required parameters' };
      }

      // Use the secure database function that includes all validation
      const { data, error } = await supabase.rpc('update_user_role_safe', {
        p_user_id: userId,
        p_new_role: newRole,
        p_organization_id: organizationId
      });

      if (error) {
        console.error('Role update error:', error);
        return { success: false, error: error.message };
      }

      // The function returns a JSON response with success status
      if (data && typeof data === 'object' && !data.success) {
        return { success: false, error: data.error || 'Role update failed' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error in updateUserRole:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unexpected error occurred' 
      };
    }
  }

  /**
   * Get user roles with organization validation
   */
  static async getUserRoles(organizationId?: string) {
    try {
      let query = supabase
        .from('user_roles')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            organization_id
          )
        `);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user roles:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Unexpected error in getUserRoles:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch user roles' 
      };
    }
  }

  /**
   * Check if current user can manage roles in organization
   */
  static async canManageRoles(organizationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('can_manage_user_roles', {
        target_org_id: organizationId
      });

      if (error) {
        console.error('Error checking role management permissions:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Unexpected error in canManageRoles:', error);
      return false;
    }
  }

  /**
   * Get current user's organization ID
   */
  static async getCurrentUserOrganization(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.error('Error fetching user organization:', error);
        return null;
      }

      return data.organization_id;
    } catch (error) {
      console.error('Unexpected error in getCurrentUserOrganization:', error);
      return null;
    }
  }

  /**
   * Validate input data for role operations
   */
  static validateRoleInput(role: string, userId: string, organizationId: string): string | null {
    const allowedRoles = ['admin', 'analyst', 'reviewer', 'auditor', 'executive', 'super_admin'];
    
    if (!role || !allowedRoles.includes(role)) {
      return 'Invalid role specified';
    }
    
    if (!userId || typeof userId !== 'string') {
      return 'Invalid user ID';
    }
    
    if (!organizationId || typeof organizationId !== 'string') {
      return 'Invalid organization ID';
    }
    
    return null; // No validation errors
  }
}