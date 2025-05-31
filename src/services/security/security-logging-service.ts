
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface SecurityLog {
  id: string;
  org_id: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  action_type: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  action_details: any;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  status: 'success' | 'failure' | 'warning';
  error_message?: string;
  risk_score: number;
  created_at: string;
}

class SecurityLoggingService {
  async logSecurityAction(
    actionType: string,
    resourceType: string,
    details: {
      resourceId?: string;
      resourceName?: string;
      actionDetails?: any;
      status?: 'success' | 'failure' | 'warning';
      errorMessage?: string;
      riskScore?: number;
    } = {}
  ): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return;

      const logEntry = {
        org_id: profile.organization_id,
        user_id: profile.id,
        user_email: profile.email || 'unknown',
        user_name: profile.full_name || 'Unknown User',
        action_type: actionType,
        resource_type: resourceType,
        resource_id: details.resourceId,
        resource_name: details.resourceName,
        action_details: details.actionDetails || {},
        user_agent: navigator.userAgent,
        status: details.status || 'success',
        error_message: details.errorMessage,
        risk_score: details.riskScore || 0
      };

      const { error } = await supabase
        .from('security_logs')
        .insert([logEntry]);

      if (error) {
        console.error('Failed to log security action:', error);
      }
    } catch (error) {
      console.error('Error logging security action:', error);
    }
  }

  async getSecurityLogs(limit: number = 100): Promise<SecurityLog[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching security logs:', error);
      return [];
    }
  }

  async getHighRiskLogs(): Promise<SecurityLog[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .gte('risk_score', 7)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching high-risk logs:', error);
      return [];
    }
  }
}

export const securityLoggingService = new SecurityLoggingService();
