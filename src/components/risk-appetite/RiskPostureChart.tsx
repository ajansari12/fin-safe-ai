
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, Cell } from "recharts";
import { getRiskCategories } from "@/services/risk-management-service";
import { getAppetiteBreachLogs } from "@/services/appetite-breach-service";
import { RiskCategory } from "@/pages/risk-management/types";

interface RiskPostureData {
  category: string;
  appetite: number;
  actual: number;
  variance: number;
  status: 'within' | 'warning' | 'breach';
}

const RiskPostureChart: React.FC = () => {
  const [data, setData] = useState<RiskPostureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRiskPostureData();
  }, []);

  const loadRiskPostureData = async () => {
    try {
      setIsLoading(true);
      const [categories, breaches] = await Promise.all([
        getRiskCategories(),
        getAppetiteBreachLogs()
      ]);

      // Generate risk posture data for each category
      const postureData: RiskPostureData[] = categories.map(category => {
        // Get recent breaches for this category
        const categoryBreaches = breaches.filter(b => b.risk_category_id === category.id);
        const recentBreaches = categoryBreaches.filter(b => 
          new Date(b.breach_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        // Calculate mock appetite and actual values
        const appetite = Math.random() * 40 + 30; // 30-70 range
        const hasRecentBreaches = recentBreaches.length > 0;
        const actual = hasRecentBreaches 
          ? appetite + (Math.random() * 30 + 10) // Above appetite if breaches
          : appetite - (Math.random() * 20); // Below or at appetite if no breaches

        const variance = ((actual - appetite) / appetite) * 100;
        
        let status: 'within' | 'warning' | 'breach' = 'within';
        if (variance > 20) status = 'breach';
        else if (variance > 10) status = 'warning';

        return {
          category: category.name.substring(0, 10), // Truncate for display
          appetite,
          actual,
          variance,
          status
        };
      });

      setData(postureData);
    } catch (error) {
      console.error('Error loading risk posture data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBarColor = (status: string) => {
    switch (status) {
      case 'breach': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Posture Analysis</CardTitle>
          <CardDescription>Appetite vs Actual variance by risk domain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse">Loading risk posture data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Risk Appetite vs Actual</CardTitle>
          <CardDescription>Comparison across risk domains</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="appetite" fill="#8884d8" name="Risk Appetite" />
              <Bar dataKey="actual" fill="#82ca9d" name="Actual Risk" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Variance Scatter</CardTitle>
          <CardDescription>Risk domains positioned by variance severity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="appetite" 
                name="Risk Appetite"
                domain={[0, 100]}
              />
              <YAxis 
                dataKey="actual" 
                name="Actual Risk"
                domain={[0, 100]}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => [value?.toFixed(1), name]}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Scatter name="Risk Domains" dataKey="actual">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Variance Summary</CardTitle>
          <CardDescription>Risk variance details by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {data.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{item.category}</h4>
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      item.status === 'breach' ? 'bg-red-500' :
                      item.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  />
                </div>
                <div className="space-y-1 text-sm">
                  <div>Appetite: {item.appetite.toFixed(1)}</div>
                  <div>Actual: {item.actual.toFixed(1)}</div>
                  <div className={`font-medium ${
                    item.variance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    Variance: {item.variance > 0 ? '+' : ''}{item.variance.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskPostureChart;
