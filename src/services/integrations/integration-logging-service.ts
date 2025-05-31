
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface IntegrationLog {
  id: string;
  org_id: string;
  integration_id: string | null;
  event_type: string;
  event_data: any;
  status: string;
  error_message: string | null;
  response_time_ms: number | null;
  created_at: string;
}

class IntegrationLoggingService {
  async getIntegrationLogs(integrationId?: string): Promise<IntegrationLog[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('integration_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching integration logs:', error);
      return [];
    }
  }

  async logIntegrationEvent(
    integrationId: string | null,
    eventType: string,
    eventData: any,
    status: 'success' | 'error' | 'warning' = 'success',
    errorMessage?: string,
    responseTimeMs?: number
  ): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return;

      const { error } = await supabase
        .from('integration_logs')
        .insert({
          org_id: profile.organization_id,
          integration_id: integrationId,
          event_type: eventType,
          event_data: eventData,
          status,
          error_message: errorMessage,
          response_time_ms: responseTimeMs
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging integration event:', error);
    }
  }
}

export const integrationLoggingService = new IntegrationLoggingService();
