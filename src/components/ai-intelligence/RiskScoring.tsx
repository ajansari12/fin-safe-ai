import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Settings, RefreshCw, Gauge, AlertTriangle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const RiskScoring = () => {
  const [selectedEntity, setSelectedEntity] = useState("organization");

  const riskScoreComponents = [
    { name: 'Operational', current: 75, target: 60, weight: 0.3 },
    { name: 'Cyber', current: 68, target: 50, weight: 0.25 },
    { name: 'Financial', current: 45, target: 40, weight: 0.2 },
    { name: 'Compliance', current: 52, target: 45, weight: 0.15 },
    { name: 'Third Party', current: 82, target: 65, weight: 0.1 }
  ];

  const scoringHistory = [
    { date: 'Jan', overall: 65, operational: 70, cyber: 60, financial: 50, compliance: 55 },
    { date: 'Feb', overall: 68, operational: 72, cyber: 65, financial: 52, compliance: 58 },
    { date: 'Mar', overall: 72, operational: 75, cyber: 68, financial: 48, compliance: 52 },
    { date: 'Apr', overall: 69, operational: 73, cyber: 70, financial: 45, compliance: 50 },
    { date: 'May', overall: 71, operational: 76, cyber: 69, financial: 47, compliance: 53 },
    { date: 'Jun', overall: 74, operational: 78, cyber: 72, financial: 46, compliance: 52 }
  ];

  const entityScores = [
    {
      id: 1,
      name: "Technology Division",
      type: "Business Unit",
      overallScore: 82,
      components: {
        operational: 85,
        cyber: 89,
        financial: 65,
        compliance: 78
      },
      trend: "increasing",
      lastUpdated: "2024-06-15 14:30"
    },
    {
      id: 2,
      name: "ABC Corp (Vendor)",
      type: "Third Party",
      overallScore: 67,
      components: {
        operational: 70,
        cyber: 62,
        financial: 75,
        compliance: 68
      },
      trend: "stable",
      lastUpdated: "2024-06-15 12:15"
    },
    {
      id: 3,
      name: "Customer Data Platform",
      type: "System",
      overallScore: 91,
      components: {
        operational: 88,
        cyber: 95,
        financial: 85,
        compliance: 92
      },
      trend: "decreasing",
      lastUpdated: "2024-06-15 10:45"
    }
  ];

  const scoringFactors = [
    {
      category: "Incident History",
      impact: "High",
      weight: 35,
      description: "Recent incidents and their severity contribute significantly to risk scores",
      adjustment: "+15 points"
    },
    {
      category: "Control Effectiveness",
      impact: "High",
      weight: 30,
      description: "AI assessment of control performance and testing results",
      adjustment: "-8 points"
    },
    {
      category: "Threat Intelligence",
      impact: "Medium",
      weight: 20,
      description: "Current threat landscape and intelligence feeds",
      adjustment: "+5 points"
    },
    {
      category: "Compliance Status",
      impact: "Medium",
      weight: 15,
      description: "Regulatory compliance gaps and audit findings",
      adjustment: "+3 points"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const overallScore = Math.round(
    riskScoreComponents.reduce((sum, comp) => sum + (comp.current * comp.weight), 0)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dynamic Risk Scoring</h2>
          <p className="text-muted-foreground">AI-powered real-time risk assessment and scoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="organization">Organization Level</SelectItem>
              <SelectItem value="business-units">Business Units</SelectItem>
              <SelectItem value="vendors">Third Parties</SelectItem>
              <SelectItem value="systems">Systems</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Overall Score Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gauge className="h-5 w-5 mr-2" />
              Overall Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <p className="text-muted-foreground mb-4">Current Risk Level</p>
            <Badge variant="outline" className={getScoreColor(overallScore)}>
              {overallScore >= 80 ? 'Critical' : overallScore >= 60 ? 'High' : overallScore >= 40 ? 'Medium' : 'Low'} Risk
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk Score Breakdown</CardTitle>
            <CardDescription>Component risk scores and targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskScoreComponents.map((component, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{component.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Target: {component.target}</span>
                      <Badge variant="outline" className={getScoreColor(component.current)}>
                        {component.current}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={component.current} className="w-full" />
                    <div 
                      className="absolute top-0 h-full w-1 bg-blue-600 rounded"
                      style={{ left: `${component.target}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Risk Profile Analysis
            </CardTitle>
            <CardDescription>
              Current vs target risk profile comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={riskScoreComponents}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Current" dataKey="current" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Radar name="Target" dataKey="target" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score History Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Risk Score Trends
            </CardTitle>
            <CardDescription>
              6-month risk score evolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoringHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="overall" stroke="#1f2937" strokeWidth={3} />
                <Line type="monotone" dataKey="operational" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="cyber" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="financial" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="compliance" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Entity Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Entity Risk Scores</CardTitle>
          <CardDescription>
            Individual risk assessments for business units, vendors, and systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entityScores.map((entity) => (
              <div key={entity.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{entity.name}</h4>
                    <p className="text-sm text-muted-foreground">{entity.type}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getScoreColor(entity.overallScore)}>
                      {entity.overallScore}
                    </Badge>
                    {getTrendIcon(entity.trend)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {Object.entries(entity.components).map(([key, value]) => (
                    <div key={key} className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium capitalize">{key}</div>
                      <div className={`text-lg font-bold ${getScoreColor(value as number)}`}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Last Updated: {entity.lastUpdated}</span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            AI Scoring Factors
          </CardTitle>
          <CardDescription>
            Key factors influencing current risk scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scoringFactors.map((factor, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{factor.category}</h4>
                    <Badge variant="outline" className={
                      factor.impact === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }>
                      {factor.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{factor.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{factor.weight}% Weight</div>
                  <div className="text-xs text-muted-foreground">{factor.adjustment}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};