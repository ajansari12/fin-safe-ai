
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

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

    const { data: link, error } = await supabase
      .from('kri_appetite_links')
      .insert({
        kri_id: data.kri_id,
        risk_appetite_statement_id: data.risk_appetite_statement_id,
        appetite_threshold: data.appetite_threshold,
        warning_percentage: data.warning_percentage || 10,
        breach_percentage: data.breach_percentage || 25,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating KRI appetite link:', error);
      throw new Error('Failed to create KRI appetite link');
    }

    return link;
  }

  async getKRIAppetiteLinks(kriId: string): Promise<KRIAppetiteLink[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return [];
    }

    const { data: links, error } = await supabase
      .from('kri_appetite_links')
      .select(`
        *,
        risk_appetite_statements(title)
      `)
      .eq('kri_id', kriId);

    if (error) {
      console.error('Database error fetching KRI appetite links:', error);
      throw new Error('Failed to fetch KRI appetite links');
    }

    return links || [];
  }

  async getKRIBreachNotifications(): Promise<KRIBreachNotification[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return [];
    }

    const { data: notifications, error } = await supabase
      .from('kri_breach_notifications')
      .select(`
        *,
        kri_definitions(name)
      `)
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching breach notifications:', error);
      throw new Error('Failed to fetch breach notifications');
    }

    return notifications || [];
  }

  async acknowledgeBreachNotification(notificationId: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    const { error } = await supabase
      .from('kri_breach_notifications')
      .update({
        acknowledged_by: profile.id,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('org_id', profile.organization_id);

    if (error) {
      console.error('Database error acknowledging breach notification:', error);
      throw new Error('Failed to acknowledge breach notification');
    }
  }

  async getRiskAppetiteStatements() {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return [];
    }

    const { data, error } = await supabase
      .from('risk_appetite_statements')
      .select('id, title, status')
      .eq('org_id', profile.organization_id)
      .eq('status', 'active')
      .order('title');

    if (error) {
      console.error('Database error fetching risk appetite statements:', error);
      throw new Error('Failed to fetch risk appetite statements');
    }

    return data || [];
  }
}

export const enhancedKRIService = new EnhancedKRIService();
