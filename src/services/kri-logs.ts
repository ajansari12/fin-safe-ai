
import { supabase } from "@/integrations/supabase/client";

export interface KRILog {
  id: string;
  kri_id: string;
  measurement_date: string;
  actual_value: number;
  threshold_breached?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getKRILogs(kriId: string): Promise<KRILog[]> {
  const { data, error } = await supabase
    .from('kri_logs')
    .select('*')
    .eq('kri_id', kriId)
    .order('measurement_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as KRILog[];
}

export async function createKRILog(log: Omit<KRILog, 'id' | 'created_at' | 'updated_at'>): Promise<KRILog> {
  const { data, error } = await supabase
    .from('kri_logs')
    .insert(log)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as KRILog;
}
