
import { supabase } from "@/integrations/supabase/client";

export interface KRIAppetiteVariance {
  id: string;
  kri_id: string;
  measurement_date: string;
  actual_value: number;
  appetite_threshold?: number;
  variance_percentage?: number;
  variance_status: 'within_appetite' | 'warning' | 'breach';
  created_at: string;
  updated_at: string;
}

export interface KRIVarianceData {
  date: string;
  actual_value: number;
  appetite_threshold: number;
  variance_percentage: number;
  variance_status: string;
}

export async function getKRIAppetiteVariance(kriId: string): Promise<KRIAppetiteVariance[]> {
  const { data, error } = await supabase
    .from('kri_appetite_variance')
    .select('*')
    .eq('kri_id', kriId)
    .order('measurement_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as KRIAppetiteVariance[];
}

export async function getKRIVarianceData(days: number = 30): Promise<KRIVarianceData[]> {
  const { data, error } = await supabase
    .from('kri_appetite_variance')
    .select(`
      measurement_date,
      actual_value,
      appetite_threshold,
      variance_percentage,
      variance_status
    `)
    .gte('measurement_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('measurement_date', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(item => ({
    date: item.measurement_date,
    actual_value: item.actual_value,
    appetite_threshold: item.appetite_threshold || 0,
    variance_percentage: item.variance_percentage || 0,
    variance_status: item.variance_status
  }));
}

export async function getKRIAppetiteBreaches(): Promise<KRIAppetiteVariance[]> {
  const { data, error } = await supabase
    .from('kri_appetite_variance')
    .select(`
      *,
      kri_definitions!inner(name, description)
    `)
    .in('variance_status', ['warning', 'breach'])
    .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('measurement_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as KRIAppetiteVariance[];
}

export async function getVarianceSummary() {
  const { data, error } = await supabase
    .from('kri_appetite_variance')
    .select('variance_status')
    .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  if (error) {
    throw error;
  }

  const summary = (data || []).reduce((acc, item) => {
    acc[item.variance_status] = (acc[item.variance_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    within_appetite: summary.within_appetite || 0,
    warning: summary.warning || 0,
    breach: summary.breach || 0,
    total: data?.length || 0
  };
}
