import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export const InsightsGeneration = () => {
  const insights = [
    {
      id: 1,
      type: "Risk Trend",
      title: "Vendor Concentration Risk Increasing",
      description: "AI analysis shows 40% increase in dependency on top 3 vendors across critical operations",
      confidence: 94,
      impact: "High",
      actionable: true,
      recommendations: ["Diversify vendor portfolio", "Establish backup vendors", "Review contract terms"]
    },
    {
      id: 2,
      type: "Control Gap",
      title: "Emerging AI/ML Governance Gap",
      description: "Technology policies lack specific controls for AI/ML systems deployment and monitoring",
      confidence: 89,
      impact: "Medium",
      actionable: true,
      recommendations: ["Develop AI governance framework", "Implement ML monitoring", "Update policies"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI-Generated Insights</h2>
          <p className="text-muted-foreground">Intelligent risk insights and recommendations</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  {insight.title}
                </CardTitle>
                <Badge variant="outline">{insight.type}</Badge>
              </div>
              <CardDescription>{insight.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Confidence: {insight.confidence}%</span>
                  <Badge variant={insight.impact === 'High' ? 'destructive' : 'secondary'}>
                    {insight.impact} Impact
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Recommendations:</h5>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" size="sm">Create Action Plan</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};