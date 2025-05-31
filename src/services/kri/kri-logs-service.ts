
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { KRILog } from "./kri-data-service";

export class KRILogsService {
  async createKRILog(data: any): Promise<KRILog> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    // Verify KRI belongs to organization
    const { data: kri, error: kriError } = await supabase
      .from('kri_definitions')
      .select('id')
      .eq('id', data.kri_id)
      .eq('org_id', profile.organization_id)
      .single();

    if (kriError || !kri) {
      throw new Error('KRI not found or access denied');
    }

    const logData = {
      kri_id: data.kri_id,
      measurement_date: data.measurement_date.toISOString().split('T')[0],
      actual_value: data.actual_value,
      target_value: data.target_value,
      notes: data.notes,
    };

    const { data: kriLog, error } = await supabase
      .from('kri_logs')
      .insert(logData)
      .select()
      .single();

    if (error) {
      console.error('Database error creating KRI log:', error);
      throw new Error('Failed to create KRI log');
    }

    return this.transformKRILogResponse(kriLog);
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
}

export const kriLogsService = new KRILogsService();
