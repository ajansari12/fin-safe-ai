
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getKRIBreaches } from "@/services/dashboard-analytics-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle } from "lucide-react";

const chartConfig = {
  breaches: {
    label: "Total Breaches",
    color: "#ef4444",
  },
  critical: {
    label: "Critical",
    color: "#dc2626",
  },
  warning: {
    label: "Warning",
    color: "#f59e0b",
  },
};

export default function KRIBreachesChart() {
  const { data: breaches, isLoading } = useQuery({
    queryKey: ['kriBreaches'],
    queryFn: getKRIBreaches
  });

  const totalBreaches = breaches?.reduce((sum, day) => sum + day.breaches, 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            KRIs Breached This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-100 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          KRIs Breached This Month
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          {totalBreaches} total breaches
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={breaches}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="breaches"
                stroke="var(--color-breaches)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="critical"
                stroke="var(--color-critical)"
                strokeWidth={1}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="warning"
                stroke="var(--color-warning)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
