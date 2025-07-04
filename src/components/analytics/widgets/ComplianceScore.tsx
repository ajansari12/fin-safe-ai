import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ComplianceScoreProps {
  config: any;
  filters: any;
}

const ComplianceScore: React.FC<ComplianceScoreProps> = ({ config, filters }) => {
  // Mock data
  const data = [
    { name: 'Compliant', value: 75, color: '#10b981' },
    { name: 'At Risk', value: 15, color: '#f59e0b' },
    { name: 'Non-Compliant', value: 10, color: '#ef4444' },
  ];

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