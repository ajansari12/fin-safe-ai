import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface KRIChartProps {
  config: {
    kri_id?: string;
    time_period?: number; // days
  };
  filters: any;
}

const KRIChart: React.FC<KRIChartProps> = ({ config, filters }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchKRIData = async () => {
      try {
        // Get user's organization
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (!profile?.organization_id) return;

        // Get KRI logs for the specified period
        const timePeriod = config.time_period || 180; // Default 6 months
        const { data: kriLogs } = await supabase
          .from('kri_logs')
          .select(`
            *,
            kri_definitions!inner(
              name,
              warning_threshold,
              critical_threshold,
              risk_thresholds!inner(
                statement_id,
                risk_appetite_statements!inner(org_id)
              )
            )
          `)
          .eq('kri_definitions.risk_thresholds.risk_appetite_statements.org_id', profile.organization_id)
          .gte('measurement_date', new Date(Date.now() - timePeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('measurement_date', { ascending: true });

        if (!kriLogs || kriLogs.length === 0) {
          setData([]);
          return;
        }

        // Process data by month for better visualization
        const monthlyData: Record<string, { values: number[], threshold: number }> = {};
        
        kriLogs.forEach(log => {
          const date = new Date(log.measurement_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { 
              values: [], 
              threshold: log.kri_definitions?.warning_threshold || 90 
            };
          }
          
          monthlyData[monthKey].values.push(log.actual_value);
        });

        // Convert to chart data
        const chartData = Object.entries(monthlyData)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, data]) => ({
            date,
            value: Math.round(data.values.reduce((sum, val) => sum + val, 0) / data.values.length),
            threshold: data.threshold
          }));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching KRI data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKRIData();
  }, [user, config.kri_id, config.time_period]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading KRI data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">No KRI data available</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="KRI Value"
          />
          <Line 
            type="monotone" 
            dataKey="threshold" 
            stroke="#dc2626" 
            strokeDasharray="5 5"
            name="Threshold"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KRIChart;