import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface IncidentTrendsProps {
  config: any;
  filters: any;
}

const IncidentTrends: React.FC<IncidentTrendsProps> = ({ config, filters }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchIncidentTrends = async () => {
      try {
        // Get user's organization
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (!profile?.organization_id) return;

        // Get incidents from last 6 weeks
        const { data: incidents } = await supabase
          .from('incident_logs')
          .select('*')
          .eq('org_id', profile.organization_id)
          .gte('reported_at', new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString())
          .order('reported_at', { ascending: true });

        if (!incidents) return;

        // Group incidents by week
        const weeklyData = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          
          const weekIncidents = incidents.filter(incident => {
            const reportedAt = new Date(incident.reported_at);
            return reportedAt >= weekStart && reportedAt < weekEnd;
          });

          const resolved = weekIncidents.filter(incident => incident.status === 'resolved').length;

          weeklyData.push({
            week: `W${6 - i}`,
            incidents: weekIncidents.length,
            resolved: resolved
          });
        }

        setData(weeklyData);
      } catch (error) {
        console.error('Error fetching incident trends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentTrends();
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading incident trends...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="incidents" fill="#f59e0b" name="Total Incidents" />
          <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncidentTrends;