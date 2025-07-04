import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface KRIChartProps {
  config: any;
  filters: any;
}

const KRIChart: React.FC<KRIChartProps> = ({ config, filters }) => {
  // Mock data - in real implementation, this would come from the API
  const data = [
    { date: '2024-01', value: 85, threshold: 90 },
    { date: '2024-02', value: 88, threshold: 90 },
    { date: '2024-03', value: 92, threshold: 90 },
    { date: '2024-04', value: 87, threshold: 90 },
    { date: '2024-05', value: 95, threshold: 90 },
    { date: '2024-06', value: 89, threshold: 90 },
  ];

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