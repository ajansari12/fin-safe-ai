import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VendorRiskBubbleProps {
  config: any;
  filters: any;
}

const VendorRiskBubble: React.FC<VendorRiskBubbleProps> = ({ config, filters }) => {
  // Mock data
  const data = [
    { x: 25, y: 500000, z: 15, vendor: 'TechCorp' },
    { x: 65, y: 200000, z: 8, vendor: 'DataSys' },
    { x: 45, y: 800000, z: 22, vendor: 'CloudInc' },
    { x: 80, y: 150000, z: 5, vendor: 'RiskVendor' },
    { x: 30, y: 600000, z: 12, vendor: 'SafeTech' },
  ];

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