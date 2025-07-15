import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface ComplianceScoreProps {
  config: any;
  filters: any;
}

const ComplianceScore: React.FC<ComplianceScoreProps> = ({ config, filters }) => {
  const { user } = useAuth();
  const [data, setData] = useState([
    { name: 'Compliant', value: 0, color: '#10b981' },
    { name: 'At Risk', value: 0, color: '#f59e0b' },
    { name: 'Non-Compliant', value: 0, color: '#ef4444' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchComplianceData = async () => {
      try {
        // Get user's organization
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (!profile?.organization_id) return;

        // Get compliance findings
        const { data: findings } = await supabase
          .from('compliance_findings')
          .select('*')
          .eq('org_id', profile.organization_id);

        // Get compliance checks
        const { data: checks } = await supabase
          .from('compliance_checks')
          .select('*')
          .eq('org_id', profile.organization_id);

        const totalItems = (findings?.length || 0) + (checks?.length || 0);
        
        if (totalItems === 0) {
          setData([
            { name: 'Compliant', value: 100, color: '#10b981' },
            { name: 'At Risk', value: 0, color: '#f59e0b' },
            { name: 'Non-Compliant', value: 0, color: '#ef4444' },
          ]);
          return;
        }

        // Calculate compliance status
        const resolvedFindings = findings?.filter(f => f.status === 'resolved').length || 0;
        const passedChecks = checks?.filter(c => c.check_result === 'pass').length || 0;
        const failedChecks = checks?.filter(c => c.check_result === 'fail').length || 0;
        const warningChecks = checks?.filter(c => c.check_result === 'warning').length || 0;

        const compliant = resolvedFindings + passedChecks;
        const atRisk = warningChecks;
        const nonCompliant = (findings?.length || 0) - resolvedFindings + failedChecks;

        const total = compliant + atRisk + nonCompliant;
        
        setData([
          { name: 'Compliant', value: Math.round((compliant / total) * 100), color: '#10b981' },
          { name: 'At Risk', value: Math.round((atRisk / total) * 100), color: '#f59e0b' },
          { name: 'Non-Compliant', value: Math.round((nonCompliant / total) * 100), color: '#ef4444' },
        ]);
      } catch (error) {
        console.error('Error fetching compliance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading compliance data...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComplianceScore;