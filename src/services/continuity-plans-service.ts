
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface ContinuityPlanData {
  id: string;
  org_id: string;
  business_function_id: string;
  plan_name: string;
  plan_description?: string;
  rto_hours: number;
  rpo_hours?: number;
  fallback_steps: string;
  plan_document_path?: string;
  plan_document_name?: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  last_tested_date?: string;
  next_test_date?: string;
  created_at: string;
  updated_at: string;
  business_functions?: {
    name: string;
    criticality: string;
  };
}

export const continuityPlansService = {
  async getContinuityPlans(): Promise<ContinuityPlanData[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('continuity_plans')
        .select(`
          *,
          business_functions!business_function_id(name, criticality)
        `)
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type-safe conversion with proper status casting and business function normalization
      return (data || []).map(item => ({
        ...item,
        status: (item.status === 'draft' || item.status === 'active' || item.status === 'archived') 
          ? item.status 
          : 'draft' as const,
        business_functions: Array.isArray(item.business_functions) && item.business_functions.length > 0
          ? item.business_functions[0]
          : item.business_functions
      }));
    } catch (error) {
      console.error('Error fetching continuity plans:', error);
      return [];
    }
  },

  async createContinuityPlan(planData: Omit<ContinuityPlanData, 'id' | 'created_at' | 'updated_at'>): Promise<ContinuityPlanData | null> {
    try {
      const { data, error } = await supabase
        .from('continuity_plans')
        .insert(planData)
        .select()
        .single();

      if (error) throw error;
      
      // Type-safe conversion
      return data ? {
        ...data,
        status: (data.status === 'draft' || data.status === 'active' || data.status === 'archived') 
          ? data.status 
          : 'draft' as const
      } : null;
    } catch (error) {
      console.error('Error creating continuity plan:', error);
      return null;
    }
  },

  async updateContinuityPlan(id: string, updates: Partial<ContinuityPlanData>): Promise<ContinuityPlanData | null> {
    try {
      const { data, error } = await supabase
        .from('continuity_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Type-safe conversion
      return data ? {
        ...data,
        status: (data.status === 'draft' || data.status === 'active' || data.status === 'archived') 
          ? data.status 
          : 'draft' as const
      } : null;
    } catch (error) {
      console.error('Error updating continuity plan:', error);
      return null;
    }
  },

  async deleteContinuityPlan(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('continuity_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting continuity plan:', error);
      return false;
    }
  }
};
