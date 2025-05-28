
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { getKRIVarianceData, KRIVarianceData } from "@/services/kri-appetite-service";

const KRIVarianceChart: React.FC = () => {
  const [data, setData] = useState<KRIVarianceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const varianceData = await getKRIVarianceData(30);
        setData(varianceData);
      } catch (error) {
        console.error('Error loading variance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KRI Variance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KRI Variance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">No variance data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>KRI Variance Trend (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [
                  name === 'variance_percentage' ? `${value.toFixed(2)}%` : value.toFixed(2),
                  name === 'actual_value' ? 'Actual Value' : 
                  name === 'appetite_threshold' ? 'Appetite Threshold' : 'Variance %'
                ]}
              />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
              <Line 
                type="monotone" 
                dataKey="actual_value" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Actual Value"
              />
              <Line 
                type="monotone" 
                dataKey="appetite_threshold" 
                stroke="#dc2626" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Appetite Threshold"
              />
              <Line 
                type="monotone" 
                dataKey="variance_percentage" 
                stroke="#16a34a" 
                strokeWidth={2}
                name="Variance %"
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default KRIVarianceChart;
