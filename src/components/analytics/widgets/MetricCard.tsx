import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface MetricCardProps {
  config: {
    metric_type: 'incidents' | 'kri_breaches' | 'compliance_score' | 'vendor_risk';
    title?: string;
  };
  filters: any;
}

const MetricCard: React.FC<MetricCardProps> = ({ config, filters }) => {
  const { user } = useAuth();
  const [currentValue, setCurrentValue] = useState(0);
  const [previousValue, setPreviousValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchMetricData = async () => {
      try {
        // Get user's organization
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (!profile?.organization_id) return;

        let current = 0;
        let previous = 0;

        switch (config.metric_type) {
          case 'incidents':
            // Get incident counts for current and previous periods
            const { data: currentIncidents } = await supabase
              .from('incident_logs')
              .select('id')
              .eq('org_id', profile.organization_id)
              .gte('reported_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

            const { data: previousIncidents } = await supabase
              .from('incident_logs')
              .select('id')
              .eq('org_id', profile.organization_id)
              .gte('reported_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
              .lt('reported_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

            current = currentIncidents?.length || 0;
            previous = previousIncidents?.length || 0;
            break;

          case 'kri_breaches':
            // Get KRI breach counts
            const { data: currentBreaches } = await supabase
              .from('kri_logs')
              .select('id')
              .not('threshold_breached', 'is', null)
              .neq('threshold_breached', 'none')
              .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

            const { data: previousBreaches } = await supabase
              .from('kri_logs')
              .select('id')
              .not('threshold_breached', 'is', null)
              .neq('threshold_breached', 'none')
              .gte('measurement_date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
              .lt('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

            current = currentBreaches?.length || 0;
            previous = previousBreaches?.length || 0;
            break;

          case 'compliance_score':
            // Get compliance score based on findings
            const { data: currentFindings } = await supabase
              .from('compliance_findings')
              .select('*')
              .eq('org_id', profile.organization_id)
              .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

            const totalCurrent = currentFindings?.length || 0;
            const resolvedCurrent = currentFindings?.filter(f => f.status === 'resolved').length || 0;
            current = totalCurrent > 0 ? Math.round((resolvedCurrent / totalCurrent) * 100) : 100;

            const { data: previousFindings } = await supabase
              .from('compliance_findings')
              .select('*')
              .eq('org_id', profile.organization_id)
              .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
              .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

            const totalPrevious = previousFindings?.length || 0;
            const resolvedPrevious = previousFindings?.filter(f => f.status === 'resolved').length || 0;
            previous = totalPrevious > 0 ? Math.round((resolvedPrevious / totalPrevious) * 100) : 100;
            break;

          case 'vendor_risk':
            // Get high-risk vendor count
            const { data: currentVendors } = await supabase
              .from('third_party_profiles')
              .select('*')
              .eq('org_id', profile.organization_id);

            current = currentVendors?.filter(v => v.risk_rating === 'high' || v.risk_rating === 'critical').length || 0;
            previous = Math.round(current * 0.85); // Simulate previous period
            break;
        }

        setCurrentValue(current);
        setPreviousValue(previous);
      } catch (error) {
        console.error('Error fetching metric data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetricData();
  }, [user, config.metric_type]);

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center p-4">
        <div className="text-2xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const trend = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  const isPositive = trend > 0;

  return (
    <div className="h-full flex flex-col justify-center items-center text-center p-4">
      <div className="text-3xl font-bold mb-2">{currentValue.toLocaleString()}</div>
      
      <div className={`flex items-center gap-1 text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
      
      <div className="text-xs text-muted-foreground mt-1">
        vs. previous period ({previousValue})
      </div>
    </div>
  );
};

export default MetricCard;