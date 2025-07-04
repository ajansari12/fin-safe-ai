import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface IncidentTrendsProps {
  config: any;
  filters: any;
}

const IncidentTrends: React.FC<IncidentTrendsProps> = ({ config, filters }) => {
  // Mock data
  const data = [
    { week: 'W1', incidents: 12, resolved: 10 },
    { week: 'W2', incidents: 15, resolved: 13 },
    { week: 'W3', incidents: 8, resolved: 8 },
    { week: 'W4', incidents: 20, resolved: 16 },
    { week: 'W5', incidents: 11, resolved: 9 },
    { week: 'W6', incidents: 14, resolved: 12 },
  ];

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