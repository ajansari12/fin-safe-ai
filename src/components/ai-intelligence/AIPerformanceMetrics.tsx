import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Target, TrendingUp, CheckCircle } from "lucide-react";

export const AIPerformanceMetrics = () => {
  const performanceData = [
    { metric: 'Accuracy', value: 94, target: 90 },
    { metric: 'Precision', value: 89, target: 85 },
    { metric: 'Recall', value: 92, target: 88 },
    { metric: 'F1-Score', value: 90, target: 87 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2" />
          AI Model Performance
        </CardTitle>
        <CardDescription>Real-time AI engine performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
            <Bar dataKey="target" fill="#e5e7eb" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};