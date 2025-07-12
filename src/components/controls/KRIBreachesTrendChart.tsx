
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import OptimizedChart from "@/components/common/OptimizedChart";

interface KRIBreachesTrendChartProps {
  breachesData: Array<{
    date: string;
    critical: number;
    warning: number;
    total: number;
  }>;
}

const KRIBreachesTrendChart = memo<KRIBreachesTrendChartProps>(({
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
        <OptimizedChart height={300}>
          <BarChart data={breachesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
            <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Warning" />
          </BarChart>
        </OptimizedChart>
      </CardContent>
    </Card>
  );
});

KRIBreachesTrendChart.displayName = 'KRIBreachesTrendChart';

export default KRIBreachesTrendChart;
