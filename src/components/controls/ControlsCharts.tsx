
import React, { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import OptimizedChart from "@/components/common/OptimizedChart";

interface ControlsChartsProps {
  statusData: Array<{ name: string; value: number }>;
  frequencyData: Array<{ name: string; count: number }>;
}

const ControlsCharts = memo<ControlsChartsProps>(({
  statusData,
  frequencyData
}) => {
  const COLORS = useMemo(() => ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Controls by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <OptimizedChart height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </OptimizedChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Controls by Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <OptimizedChart height={300}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </OptimizedChart>
        </CardContent>
      </Card>
    </div>
  );
});

ControlsCharts.displayName = 'ControlsCharts';

export default ControlsCharts;
