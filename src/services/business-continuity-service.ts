
import { supabase } from "@/integrations/supabase/client";

export interface ContinuityPlan {
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
  file_size?: number;
  mime_type?: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  last_tested_date?: string;
  next_test_date?: string;
  created_by?: string;
  created_by_name?: string;
  updated_by?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
  business_functions?: {
    name: string;
    criticality: string;
  };
}

export interface ContinuityTest {
  id: string;
  org_id: string;
  continuity_plan_id: string;
  test_name: string;
  test_type: 'tabletop' | 'dry_run' | 'full_scale';
  test_description?: string;
  scheduled_date: string;
  conducted_date?: string;
  duration_minutes?: number;
  test_scope?: string;
  participants?: string[];
  test_scenario?: string;
  success_criteria?: string;
  actual_outcomes?: string;
  issues_identified?: string;
  improvements_identified?: string;
  overall_score?: number;
  rto_achieved_hours?: number;
  rto_target_met?: boolean;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  conducted_by?: string;
  conducted_by_name?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  continuity_plans?: {
    plan_name: string;
    business_functions?: {
      name: string;
    };
  };
}

export interface RecoveryContact {
  id: string;
  org_id: string;
  continuity_plan_id: string;
  contact_name: string;
  contact_role: string;
  contact_type: 'internal' | 'external' | 'vendor' | 'emergency';
  primary_phone?: string;
  secondary_phone?: string;
  email?: string;
  department?: string;
  organization?: string;
  availability?: string;
  escalation_order: number;
  notes?: string;
  last_contacted_date?: string;
  contact_verified_date?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export const businessContinuityService = {
  // Continuity Plans
  async getContinuityPlans(orgId: string): Promise<ContinuityPlan[]> {
    const { data, error } = await supabase
      .from('continuity_plans')
      .select(`
        *,
        business_functions!business_function_id(name, criticality)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'draft' | 'active' | 'archived',
      business_functions: Array.isArray(item.business_functions) && item.business_functions.length > 0
        ? item.business_functions[0]
        : item.business_functions
    }));
  },

  async createContinuityPlan(plan: Omit<ContinuityPlan, 'id' | 'created_at' | 'updated_at'>): Promise<ContinuityPlan> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    const { data, error } = await supabase
      .from('continuity_plans')
      .insert({
        ...plan,
        created_by: user?.id,
        created_by_name: profile?.full_name || 'Unknown User'
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as 'draft' | 'active' | 'archived'
    };
  },

  async updateContinuityPlan(id: string, updates: Partial<ContinuityPlan>): Promise<ContinuityPlan> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    const { data, error } = await supabase
      .from('continuity_plans')
      .update({
        ...updates,
        updated_by: user?.id,
        updated_by_name: profile?.full_name || 'Unknown User'
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as 'draft' | 'active' | 'archived'
    };
  },

  async uploadPlanDocument(file: File, planId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${planId}/${Date.now()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('continuity-plans')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    return fileName;
  },

  // Continuity Tests
  async getContinuityTests(orgId: string): Promise<ContinuityTest[]> {
    const { data, error } = await supabase
      .from('continuity_tests')
      .select(`
        *,
        continuity_plans!continuity_plan_id(
          plan_name,
          business_functions!business_function_id(name)
        )
      `)
      .eq('org_id', orgId)
      .order('scheduled_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      test_type: item.test_type as 'tabletop' | 'dry_run' | 'full_scale',
      status: item.status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    }));
  },

  async createContinuityTest(test: Omit<ContinuityTest, 'id' | 'created_at' | 'updated_at'>): Promise<ContinuityTest> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    const { data, error } = await supabase
      .from('continuity_tests')
      .insert({
        ...test,
        created_by: user?.id,
        created_by_name: profile?.full_name || 'Unknown User'
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      test_type: data.test_type as 'tabletop' | 'dry_run' | 'full_scale',
      status: data.status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    };
  },

  async updateContinuityTest(id: string, updates: Partial<ContinuityTest>): Promise<ContinuityTest> {
    const { data, error } = await supabase
      .from('continuity_tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      test_type: data.test_type as 'tabletop' | 'dry_run' | 'full_scale',
      status: data.status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    };
  },

  // Recovery Contacts
  async getRecoveryContacts(planId: string): Promise<RecoveryContact[]> {
    const { data, error } = await supabase
      .from('recovery_contacts')
      .select('*')
      .eq('continuity_plan_id', planId)
      .order('escalation_order', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      contact_type: item.contact_type as 'internal' | 'external' | 'vendor' | 'emergency'
    }));
  },

  async createRecoveryContact(contact: Omit<RecoveryContact, 'id' | 'created_at' | 'updated_at'>): Promise<RecoveryContact> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    const { data, error } = await supabase
      .from('recovery_contacts')
      .insert({
        ...contact,
        created_by: user?.id,
        created_by_name: profile?.full_name || 'Unknown User'
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      contact_type: data.contact_type as 'internal' | 'external' | 'vendor' | 'emergency'
    };
  },

  async updateRecoveryContact(id: string, updates: Partial<RecoveryContact>): Promise<RecoveryContact> {
    const { data, error } = await supabase
      .from('recovery_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      contact_type: data.contact_type as 'internal' | 'external' | 'vendor' | 'emergency'
    };
  },

  async deleteRecoveryContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('recovery_contacts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
