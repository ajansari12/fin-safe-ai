
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface KRIBreachesTrendChartProps {
  breachesData: Array<{
    date: string;
    critical: number;
    warning: number;
    total: number;
  }>;
}

const KRIBreachesTrendChart: React.FC<KRIBreachesTrendChartProps> = ({
  breachesData
}) => {
  if (breachesData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>KRI Breaches Trend (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={breachesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
            <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Warning" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default KRIBreachesTrendChart;
