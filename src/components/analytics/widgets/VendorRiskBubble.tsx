import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface VendorRiskBubbleProps {
  config: any;
  filters: any;
}

const VendorRiskBubble: React.FC<VendorRiskBubbleProps> = ({ config, filters }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchVendorData = async () => {
      try {
        // Get user's organization
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (!profile?.organization_id) return;

        // Get vendor profiles with contract data
        const { data: vendors } = await supabase
          .from('third_party_profiles')
          .select(`
            *,
            vendor_contracts(contract_value, end_date)
          `)
          .eq('org_id', profile.organization_id);

        if (!vendors) return;

        // Convert vendor data to bubble chart format
        const bubbleData = vendors
          .filter(vendor => vendor.vendor_contracts && vendor.vendor_contracts.length > 0)
          .map(vendor => {
            // Calculate risk score (1-100)
            let riskScore = 10; // Base score
            
            // Risk rating contribution
            switch (vendor.risk_rating) {
              case 'critical': riskScore += 40; break;
              case 'high': riskScore += 30; break;
              case 'medium': riskScore += 20; break;
              case 'low': riskScore += 10; break;
            }

            // Criticality contribution
            switch (vendor.criticality) {
              case 'critical': riskScore += 30; break;
              case 'high': riskScore += 20; break;
              case 'medium': riskScore += 10; break;
              case 'low': riskScore += 5; break;
            }

            // Assessment overdue penalty
            if (vendor.last_assessment_date) {
              const daysSinceAssessment = (Date.now() - new Date(vendor.last_assessment_date).getTime()) / (1000 * 60 * 60 * 24);
              if (daysSinceAssessment > 365) riskScore += 15;
              else if (daysSinceAssessment > 180) riskScore += 10;
            } else {
              riskScore += 20; // No assessment
            }

            // Get total contract value
            const contractValue = vendor.vendor_contracts.reduce((sum: number, contract: any) => {
              return sum + (contract.contract_value || 0);
            }, 0);

            // Calculate bubble size based on number of dependencies/criticality
            const bubbleSize = vendor.criticality === 'critical' ? 25 : 
                              vendor.criticality === 'high' ? 20 : 
                              vendor.criticality === 'medium' ? 15 : 10;

            return {
              x: Math.min(100, riskScore), // Risk score (0-100)
              y: contractValue, // Contract value
              z: bubbleSize, // Bubble size
              vendor: vendor.vendor_name || 'Unknown Vendor'
            };
          })
          .filter(item => item.y > 0); // Only include vendors with contract values

        setData(bubbleData);
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading vendor data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">No vendor data available</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="x" 
            name="Risk Score" 
            label={{ value: 'Risk Score', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            dataKey="y" 
            name="Contract Value" 
            label={{ value: 'Contract Value ($)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value, name) => [
              name === 'x' ? value : `$${value.toLocaleString()}`,
              name === 'x' ? 'Risk Score' : 'Contract Value'
            ]}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.vendor || ''}
          />
          <Scatter dataKey="y" fill="#2563eb" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VendorRiskBubble;