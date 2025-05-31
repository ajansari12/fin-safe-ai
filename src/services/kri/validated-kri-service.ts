
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { kriSchema, kriLogSchema, KRIFormData, KRILogFormData, validateWithSchema } from "@/lib/validations";

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

export class ValidatedKRIService {
  async createKRI(data: KRIFormData): Promise<KRI> {
    // Client-side validation
    const validation = validateWithSchema(kriSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    const kriData = {
      ...validation.data,
      org_id: profile.organization_id,
    };

    const { data: kri, error } = await supabase
      .from('kri_definitions')
      .insert([kriData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating KRI:', error);
      throw new Error('Failed to create KRI');
    }

    return this.transformKRIResponse(kri);
  }

  async updateKRI(id: string, updates: Partial<KRIFormData>): Promise<KRI> {
    // Validate updates against partial schema
    const updateSchema = kriSchema.partial();
    const validation = validateWithSchema(updateSchema, updates);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    const { data: kri, error } = await supabase
      .from('kri_definitions')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
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

  async createKRILog(data: KRILogFormData): Promise<KRILog> {
    // Client-side validation
    const validation = validateWithSchema(kriLogSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    // Verify KRI belongs to organization
    const { data: kri, error: kriError } = await supabase
      .from('kri_definitions')
      .select('id')
      .eq('id', validation.data.kri_id)
      .eq('org_id', profile.organization_id)
      .single();

    if (kriError || !kri) {
      throw new Error('KRI not found or access denied');
    }

    const logData = {
      ...validation.data,
      measurement_date: validation.data.measurement_date.toISOString().split('T')[0],
    };

    const { data: kriLog, error } = await supabase
      .from('kri_logs')
      .insert([logData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating KRI log:', error);
      throw new Error('Failed to create KRI log');
    }

    return this.transformKRILogResponse(kriLog);
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

  async getKRILogs(kriId: string): Promise<KRILog[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return [];
    }

    // Verify KRI belongs to organization
    const { data: kri, error: kriError } = await supabase
      .from('kri_definitions')
      .select('id')
      .eq('id', kriId)
      .eq('org_id', profile.organization_id)
      .single();

    if (kriError || !kri) {
      throw new Error('KRI not found or access denied');
    }

    const { data: logs, error } = await supabase
      .from('kri_logs')
      .select('*')
      .eq('kri_id', kriId)
      .order('measurement_date', { ascending: false });

    if (error) {
      console.error('Database error fetching KRI logs:', error);
      throw new Error('Failed to fetch KRI logs');
    }

    return logs.map(log => this.transformKRILogResponse(log));
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

  private transformKRILogResponse(rawLog: any): KRILog {
    return {
      id: rawLog.id,
      kri_id: rawLog.kri_id,
      measurement_date: rawLog.measurement_date,
      actual_value: rawLog.actual_value,
      target_value: rawLog.target_value,
      notes: rawLog.notes,
      created_at: rawLog.created_at,
      updated_at: rawLog.updated_at,
    };
  }

  // Server-side validation helpers
  static validateKRIData(data: unknown): { isValid: boolean; errors?: string[]; data?: KRIFormData } {
    const validation = validateWithSchema(kriSchema, data);
    if (validation.success) {
      return { isValid: true, data: validation.data };
    }
    return { isValid: false, errors: validation.errors };
  }

  static validateKRILogData(data: unknown): { isValid: boolean; errors?: string[]; data?: KRILogFormData } {
    const validation = validateWithSchema(kriLogSchema, data);
    if (validation.success) {
      return { isValid: true, data: validation.data };
    }
    return { isValid: false, errors: validation.errors };
  }
}

export const validatedKRIService = new ValidatedKRIService();
