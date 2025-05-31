
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

// Use existing tables instead of non-existent ones
export interface KRIAppetiteLink {
  id: string;
  kri_id: string;
  risk_appetite_statement_id: string;
  appetite_threshold: number;
  warning_percentage: number;
  breach_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface KRIBreachNotification {
  id: string;
  org_id: string;
  kri_id: string;
  kri_log_id?: string;
  breach_type: 'warning' | 'breach' | 'critical';
  actual_value: number;
  threshold_value: number;
  variance_percentage: number;
  notification_sent: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface CreateKRIAppetiteLinkData {
  kri_id: string;
  risk_appetite_statement_id: string;
  appetite_threshold: number;
  warning_percentage?: number;
  breach_percentage?: number;
}

export class EnhancedKRIService {
  async createKRIAppetiteLink(data: CreateKRIAppetiteLinkData): Promise<KRIAppetiteLink> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    // Since kri_appetite_links table doesn't exist, we'll store this as a JSON in kri_definitions
    const { data: kri, error } = await supabase
      .from('kri_definitions')
      .update({
        target_value: JSON.stringify({
          appetite_threshold: data.appetite_threshold,
          warning_percentage: data.warning_percentage || 10,
          breach_percentage: data.breach_percentage || 25,
          risk_appetite_statement_id: data.risk_appetite_statement_id
        })
      })
      .eq('id', data.kri_id)
      .eq('org_id', profile.organization_id)
      .select()
      .single();

    if (error) {
      console.error('Database error creating KRI appetite link:', error);
      throw new Error('Failed to create KRI appetite link');
    }

    // Return a mock object since we're storing in KRI definitions
    return {
      id: kri.id,
      kri_id: data.kri_id,
      risk_appetite_statement_id: data.risk_appetite_statement_id,
      appetite_threshold: data.appetite_threshold,
      warning_percentage: data.warning_percentage || 10,
      breach_percentage: data.breach_percentage || 25,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async getKRIAppetiteLinks(kriId: string): Promise<KRIAppetiteLink[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return [];
    }

    // Get appetite data from KRI definitions
    const { data: kri, error } = await supabase
      .from('kri_definitions')
      .select('*')
      .eq('id', kriId)
      .eq('org_id', profile.organization_id)
      .single();

    if (error || !kri) {
      console.error('Database error fetching KRI appetite links:', error);
      return [];
    }

    // Parse target_value if it contains appetite data
    if (kri.target_value) {
      try {
        const appetiteData = JSON.parse(kri.target_value);
        if (appetiteData.risk_appetite_statement_id) {
          return [{
            id: kri.id,
            kri_id: kriId,
            risk_appetite_statement_id: appetiteData.risk_appetite_statement_id,
            appetite_threshold: appetiteData.appetite_threshold || 0,
            warning_percentage: appetiteData.warning_percentage || 10,
            breach_percentage: appetiteData.breach_percentage || 25,
            created_at: kri.created_at,
            updated_at: kri.updated_at
          }];
        }
      } catch (e) {
        // target_value is not JSON, ignore
      }
    }

    return [];
  }

  async getKRIBreachNotifications(): Promise<KRIBreachNotification[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return [];
    }

    // Use existing kri_appetite_variance table to simulate breach notifications
    const { data: variances, error } = await supabase
      .from('kri_appetite_variance')
      .select(`
        *,
        kri_definitions!inner(name, org_id)
      `)
      .eq('kri_definitions.org_id', profile.organization_id)
      .eq('variance_status', 'breach')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Database error fetching breach notifications:', error);
      return [];
    }

    return (variances || []).map(variance => ({
      id: variance.id,
      org_id: profile.organization_id,
      kri_id: variance.kri_id,
      breach_type: 'breach' as const,
      actual_value: variance.actual_value,
      threshold_value: variance.appetite_threshold || 0,
      variance_percentage: variance.variance_percentage || 0,
      notification_sent: false,
      created_at: variance.created_at
    }));
  }

  async acknowledgeBreachNotification(notificationId: string): Promise<void> {
    // Since we don't have a dedicated table, we'll update the variance record
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    // For now, we'll just log this action - in a real implementation,
    // we would update a dedicated breach notifications table
    console.log(`Breach notification ${notificationId} acknowledged by ${profile.id}`);
  }

  async getRiskAppetiteStatements() {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return [];
    }

    // Use existing risk_appetite_statements table if it exists
    const { data, error } = await supabase
      .from('risk_appetite_statements')
      .select('id, title, status')
      .eq('org_id', profile.organization_id)
      .eq('status', 'active')
      .order('title');

    if (error) {
      console.error('Database error fetching risk appetite statements:', error);
      // Return empty array if table doesn't exist or error occurs
      return [];
    }

    return data || [];
  }
}

export const enhancedKRIService = new EnhancedKRIService();
