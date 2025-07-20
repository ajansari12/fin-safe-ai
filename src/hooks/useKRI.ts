import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { toast } from 'sonner';

export interface KRI {
  id: string;
  name: string;
  description: string;
  category: 'operational' | 'financial' | 'compliance' | 'strategic';
  subcategory?: string;
  owner?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  data_source?: string;
  calculation_method?: string;
  unit?: string;
  target_value?: number;
  warning_threshold: number;
  critical_threshold: number;
  current_value?: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  last_updated?: string;
  status: 'active' | 'inactive' | 'under_review';
  tags: string[];
  related_controls: string[];
  escalation_procedure?: string;
  org_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface KRIDataPoint {
  id: string;
  kri_id: string;
  value: number;
  record_date: string;
  data_quality: 'high' | 'medium' | 'low';
  source: string;
  comments?: string;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
}

export interface KRIBreach {
  id: string;
  kri_id: string;
  breach_date: string;
  breach_level: 'warning' | 'critical';
  breach_value: number;
  threshold_value: number;
  root_cause?: string;
  impact_assessment?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assigned_to?: string;
  resolved_date?: string;
  created_at: string;
  updated_at: string;
}

export const useKRI = () => {
  const { profile } = useAuth();
  const [kris, setKRIs] = useState<KRI[]>([]);
  const [dataPoints, setDataPoints] = useState<KRIDataPoint[]>([]);
  const [breaches, setBreaches] = useState<KRIBreach[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadKRIs = async () => {
    if (!profile?.organization_id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('kri_definitions')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKRIs(data || []);
    } catch (error) {
      console.error('Error loading KRIs:', error);
      toast.error('Failed to load KRIs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadKRIDataPoints = async (kriId: string) => {
    try {
      const { data, error } = await supabase
        .from('kri_data_points')
        .select('*')
        .eq('kri_id', kriId)
        .order('record_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setDataPoints(data || []);
    } catch (error) {
      console.error('Error loading KRI data points:', error);
      toast.error('Failed to load KRI data points');
    }
  };

  const loadKRIBreaches = async (kriId?: string) => {
    try {
      let query = supabase
        .from('kri_breaches')
        .select(`
          *,
          kri_definitions!inner(name, org_id)
        `)
        .eq('kri_definitions.org_id', profile?.organization_id);

      if (kriId) {
        query = query.eq('kri_id', kriId);
      }

      const { data, error } = await query
        .order('breach_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBreaches(data || []);
    } catch (error) {
      console.error('Error loading KRI breaches:', error);
      toast.error('Failed to load KRI breaches');
    }
  };

  const createKRI = async (kriData: {
    name: string;
    description: string;
    category: 'operational' | 'financial' | 'compliance' | 'strategic';
    subcategory?: string;
    owner?: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    data_source?: string;
    calculation_method?: string;
    unit?: string;
    target_value?: number;
    warning_threshold: number;
    critical_threshold: number;
    tags: string[];
    related_controls: string[];
    escalation_procedure?: string;
  }) => {
    if (!profile?.organization_id || !profile.id) {
      toast.error('User not authenticated');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('kri_definitions')
        .insert({
          ...kriData,
          org_id: profile.organization_id,
          created_by: profile.id,
          status: 'active',
          trend: 'stable'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('KRI created successfully');
      await loadKRIs();
      return data;
    } catch (error) {
      console.error('Error creating KRI:', error);
      toast.error('Failed to create KRI');
      return null;
    }
  };

  const updateKRI = async (kriId: string, updates: Partial<KRI>) => {
    try {
      const { error } = await supabase
        .from('kri_definitions')
        .update(updates)
        .eq('id', kriId);

      if (error) throw error;

      toast.success('KRI updated successfully');
      await loadKRIs();
    } catch (error) {
      console.error('Error updating KRI:', error);
      toast.error('Failed to update KRI');
    }
  };

  const deleteKRI = async (kriId: string) => {
    try {
      const { error } = await supabase
        .from('kri_definitions')
        .delete()
        .eq('id', kriId);

      if (error) throw error;

      toast.success('KRI deleted successfully');
      await loadKRIs();
    } catch (error) {
      console.error('Error deleting KRI:', error);
      toast.error('Failed to delete KRI');
    }
  };

  const addDataPoint = async (dataPoint: {
    kri_id: string;
    value: number;
    record_date: string;
    data_quality: 'high' | 'medium' | 'low';
    source: string;
    comments?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('kri_data_points')
        .insert(dataPoint)
        .select()
        .single();

      if (error) throw error;

      // Check for threshold breaches
      await checkThresholdBreach(dataPoint.kri_id, dataPoint.value);

      // Update KRI current value and last updated
      await supabase
        .from('kri_definitions')
        .update({
          current_value: dataPoint.value,
          last_updated: new Date().toISOString()
        })
        .eq('id', dataPoint.kri_id);

      toast.success('Data point added successfully');
      await loadKRIDataPoints(dataPoint.kri_id);
      await loadKRIs();
      return data;
    } catch (error) {
      console.error('Error adding data point:', error);
      toast.error('Failed to add data point');
      return null;
    }
  };

  const checkThresholdBreach = async (kriId: string, value: number) => {
    const kri = kris.find(k => k.id === kriId);
    if (!kri) return;

    let breachLevel: 'warning' | 'critical' | null = null;
    let thresholdValue = 0;

    if (value >= kri.critical_threshold) {
      breachLevel = 'critical';
      thresholdValue = kri.critical_threshold;
    } else if (value >= kri.warning_threshold) {
      breachLevel = 'warning';
      thresholdValue = kri.warning_threshold;
    }

    if (breachLevel) {
      try {
        await supabase
          .from('kri_breaches')
          .insert({
            kri_id: kriId,
            breach_date: new Date().toISOString().split('T')[0],
            breach_level: breachLevel,
            breach_value: value,
            threshold_value: thresholdValue,
            status: 'open'
          });

        toast.warning(`KRI threshold breach detected: ${kri.name} (${breachLevel})`, {
          description: `Value: ${value}, Threshold: ${thresholdValue}`
        });

        await loadKRIBreaches();
      } catch (error) {
        console.error('Error recording breach:', error);
      }
    }
  };

  const updateBreachStatus = async (breachId: string, status: 'open' | 'investigating' | 'resolved' | 'closed', updates?: {
    root_cause?: string;
    impact_assessment?: string;
    assigned_to?: string;
    resolved_date?: string;
  }) => {
    try {
      const updateData: any = { status };
      
      if (updates) {
        Object.assign(updateData, updates);
      }

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('kri_breaches')
        .update(updateData)
        .eq('id', breachId);

      if (error) throw error;

      toast.success(`Breach status updated to ${status}`);
      await loadKRIBreaches();
    } catch (error) {
      console.error('Error updating breach status:', error);
      toast.error('Failed to update breach status');
    }
  };

  const getKRITrend = (kriId: string, days: number = 30) => {
    const kriDataPoints = dataPoints
      .filter(dp => dp.kri_id === kriId)
      .sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime())
      .slice(-days);

    if (kriDataPoints.length < 2) return 'stable';

    const firstValue = kriDataPoints[0].value;
    const lastValue = kriDataPoints[kriDataPoints.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;

    if (change > 5) return 'deteriorating';
    if (change < -5) return 'improving';
    return 'stable';
  };

  const getKRIStatus = (kri: KRI): 'normal' | 'warning' | 'critical' => {
    if (!kri.current_value) return 'normal';
    
    if (kri.current_value >= kri.critical_threshold) return 'critical';
    if (kri.current_value >= kri.warning_threshold) return 'warning';
    return 'normal';
  };

  useEffect(() => {
    if (profile?.organization_id) {
      loadKRIs();
      loadKRIBreaches();
    }
  }, [profile?.organization_id]);

  return {
    kris,
    dataPoints,
    breaches,
    isLoading,
    loadKRIs,
    loadKRIDataPoints,
    loadKRIBreaches,
    createKRI,
    updateKRI,
    deleteKRI,
    addDataPoint,
    updateBreachStatus,
    getKRITrend,
    getKRIStatus
  };
};