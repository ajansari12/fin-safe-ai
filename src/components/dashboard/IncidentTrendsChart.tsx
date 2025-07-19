import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', incidents: 4 },
  { month: 'Feb', incidents: 3 },
  { month: 'Mar', incidents: 6 },
  { month: 'Apr', incidents: 2 },
  { month: 'May', incidents: 5 },
  { month: 'Jun', incidents: 3 },
];

const IncidentTrendsChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="incidents" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentTrendsChart;