
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { AppetiteBreach } from "./types";

export const appetiteBreachesService = {
  async getAppetiteBreaches(status?: string): Promise<AppetiteBreach[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('appetite_breaches')
        .select(`
          *,
          risk_category:risk_categories(name)
        `)
        .eq('org_id', profile.organization_id)
        .order('breach_date', { ascending: false });

      if (status) {
        query = query.eq('resolution_status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
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
        .from('appetite_breaches')
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
        .from('appetite_breaches')
        .update(updateData)
        .eq('id', breachId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating breach status:', error);
      throw error;
    }
  }
};
