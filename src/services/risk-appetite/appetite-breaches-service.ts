
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { AppetiteBreach } from "./types";

export const appetiteBreachesService = {
  async getAppetiteBreaches(status?: string): Promise<AppetiteBreach[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('appetite_breach_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('breach_date', { ascending: false });

      if (status) {
        query = query.eq('resolution_status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform data to match AppetiteBreach interface
      return (data || []).map(item => ({
        id: item.id,
        org_id: item.org_id,
        risk_category_id: item.risk_category_id || '',
        breach_date: item.breach_date,
        breach_severity: item.breach_severity as 'warning' | 'breach' | 'critical',
        actual_value: item.actual_value,
        threshold_value: item.threshold_value,
        variance_percentage: item.variance_percentage || 0,
        escalation_level: item.escalation_level || 0,
        escalated_at: item.escalated_at,
        escalated_to: item.escalated_to,
        escalated_to_name: item.escalated_to_name,
        resolution_status: item.resolution_status as 'open' | 'acknowledged' | 'in_progress' | 'resolved',
        resolution_date: item.resolution_date,
        resolution_notes: item.resolution_notes,
        business_impact: item.business_impact,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching appetite breaches:', error);
      return [];
    }
  },

  async escalateBreach(breachId: string, escalationLevel: number, escalatedTo?: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.user?.id)
        .single();

      const { error } = await supabase
        .from('appetite_breach_logs')
        .update({
          escalation_level: escalationLevel,
          escalated_at: new Date().toISOString(),
          escalated_to: escalatedTo,
          escalated_to_name: userProfile?.full_name || 'Unknown User'
        })
        .eq('id', breachId);

      if (error) throw error;
    } catch (error) {
      console.error('Error escalating breach:', error);
      throw error;
    }
  },

  async updateBreachStatus(breachId: string, status: string, notes?: string): Promise<void> {
    try {
      const updateData: any = {
        resolution_status: status
      };

      if (status === 'resolved') {
        updateData.resolution_date = new Date().toISOString();
      }

      if (notes) {
        updateData.resolution_notes = notes;
      }

      const { error } = await supabase
        .from('appetite_breach_logs')
        .update(updateData)
        .eq('id', breachId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating breach status:', error);
      throw error;
    }
  }
};
