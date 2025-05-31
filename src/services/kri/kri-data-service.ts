
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface KRI {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  measurement_frequency: string;
  target_value?: string;
  warning_threshold?: string;
  critical_threshold?: string;
  control_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface KRILog {
  id: string;
  kri_id: string;
  measurement_date: string;
  actual_value: number;
  target_value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class KRIDataService {
  async createKRI(data: any): Promise<KRI> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    const kriData = {
      name: data.name,
      description: data.description,
      measurement_frequency: data.measurement_frequency || 'monthly',
      target_value: data.target_value,
      warning_threshold: data.warning_threshold,
      critical_threshold: data.critical_threshold,
      control_id: data.control_id,
      status: data.status || 'active',
      org_id: profile.organization_id,
      threshold_id: null,
    };

    const { data: kri, error } = await supabase
      .from('kri_definitions')
      .insert(kriData)
      .select()
      .single();

    if (error) {
      console.error('Database error creating KRI:', error);
      throw new Error('Failed to create KRI');
    }

    return this.transformKRIResponse(kri);
  }

  async updateKRI(id: string, updates: any): Promise<KRI> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data: kri, error } = await supabase
      .from('kri_definitions')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', profile.organization_id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating KRI:', error);
      throw new Error('Failed to update KRI');
    }

    return this.transformKRIResponse(kri);
  }

  async getKRIs(): Promise<KRI[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return [];
    }

    const { data: kris, error } = await supabase
      .from('kri_definitions')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching KRIs:', error);
      throw new Error('Failed to fetch KRIs');
    }

    return kris.map(kri => this.transformKRIResponse(kri));
  }

  async getKRIById(id: string): Promise<KRI | null> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return null;
    }

    const { data: kri, error } = await supabase
      .from('kri_definitions')
      .select('*')
      .eq('id', id)
      .eq('org_id', profile.organization_id)
      .single();

    if (error) {
      console.error('Database error fetching KRI:', error);
      return null;
    }

    return this.transformKRIResponse(kri);
  }

  private transformKRIResponse(rawKRI: any): KRI {
    return {
      id: rawKRI.id,
      org_id: rawKRI.org_id,
      name: rawKRI.name,
      description: rawKRI.description,
      measurement_frequency: rawKRI.measurement_frequency,
      target_value: rawKRI.target_value,
      warning_threshold: rawKRI.warning_threshold,
      critical_threshold: rawKRI.critical_threshold,
      control_id: rawKRI.control_id,
      status: rawKRI.status,
      created_at: rawKRI.created_at,
      updated_at: rawKRI.updated_at,
    };
  }
}

export const kriDataService = new KRIDataService();
