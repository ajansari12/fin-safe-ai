
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { logger } from "@/lib/logger";

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

class AdminLoggingService {
  async logAdminAction(
    actionType: string,
    resourceType: string,
    resourceId?: string,
    resourceName?: string,
    actionDetails?: any
  ): Promise<void> {
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
      logger.error('Failed to log admin action', {
        component: 'AdminLoggingService',
        module: 'admin',
        metadata: { actionType, resourceType, resourceId }
      }, error);
    }
  }

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
      logger.error('Error fetching admin logs', {
        component: 'AdminLoggingService',
        module: 'admin',
        metadata: { limit }
      }, error);
      return [];
    }
  }
}

export const adminLoggingService = new AdminLoggingService();
