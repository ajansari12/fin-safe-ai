import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Brain, RefreshCw } from "lucide-react";

export const PredictiveAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedRiskType, setSelectedRiskType] = useState("all");

  const riskForecastData = [
    { month: 'Jan', operational: 65, cyber: 45, financial: 35, compliance: 25, predicted: 55 },
    { month: 'Feb', operational: 70, cyber: 50, financial: 40, compliance: 30, predicted: 62 },
    { month: 'Mar', operational: 68, cyber: 55, financial: 38, compliance: 28, predicted: 67 },
    { month: 'Apr', operational: 75, cyber: 60, financial: 45, compliance: 35, predicted: 71 },
    { month: 'May', operational: 72, cyber: 58, financial: 42, compliance: 32, predicted: 68 },
    { month: 'Jun', operational: 78, cyber: 65, financial: 48, compliance: 38, predicted: 75 },
  ];

  const incidentPredictionData = [
    { week: 'W1', actual: 12, predicted: 14, confidence: 89 },
    { week: 'W2', actual: 8, predicted: 10, confidence: 92 },
    { week: 'W3', actual: 15, predicted: 13, confidence: 86 },
    { week: 'W4', actual: 11, predicted: 12, confidence: 91 },
    { week: 'W5', actual: null, predicted: 16, confidence: 85 },
    { week: 'W6', actual: null, predicted: 14, confidence: 88 },
  ];

  const riskProbabilityData = [
    { name: 'Low Risk', value: 45, color: '#10b981' },
    { name: 'Medium Risk', value: 35, color: '#f59e0b' },
    { name: 'High Risk', value: 15, color: '#ef4444' },
    { name: 'Critical Risk', value: 5, color: '#dc2626' },
  ];

  const predictions = [
    {
      id: 1,
      type: "Operational Risk",
      prediction: "23% increase in vendor-related incidents",
      confidence: 89,
      timeframe: "Next 30 days",
      impact: "Medium",
      factors: ["Vendor concentration", "Contract renewals", "Performance metrics"],
      status: "active"
    },
    {
      id: 2,
      type: "Cyber Risk",
      prediction: "Elevated phishing attack probability",
      confidence: 94,
      timeframe: "Next 14 days",
      impact: "High", 
      factors: ["Seasonal patterns", "Industry threats", "Email volume"],
      status: "active"
    },
    {
      id: 3,
      type: "Compliance Risk",
      prediction: "Regulatory filing deadline stress",
      confidence: 96,
      timeframe: "Next 7 days",
      impact: "Critical",
      factors: ["Historical patterns", "Resource allocation", "Document status"],
      status: "attention"
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predictive Risk Analytics</h2>
          <p className="text-muted-foreground">AI-powered risk forecasting and trend analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="365d">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Risk Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Risk Forecast Model
          </CardTitle>
          <CardDescription>
            AI-powered 6-month risk trend prediction across key categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={riskForecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="predicted" stackId="1" stroke="#3b82f6" fill="#dbeafe" />
              <Area type="monotone" dataKey="operational" stackId="2" stroke="#ef4444" fill="#fecaca" />
              <Area type="monotone" dataKey="cyber" stackId="2" stroke="#f59e0b" fill="#fed7aa" />
              <Area type="monotone" dataKey="financial" stackId="2" stroke="#10b981" fill="#bbf7d0" />
              <Area type="monotone" dataKey="compliance" stackId="2" stroke="#8b5cf6" fill="#ddd6fe" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Prediction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Incident Prediction
            </CardTitle>
            <CardDescription>
              Weekly incident volume prediction vs actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={incidentPredictionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Probability Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Risk Probability Distribution
            </CardTitle>
            <CardDescription>
              Predicted risk levels for next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskProbabilityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskProbabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {riskProbabilityData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Active Predictions
          </CardTitle>
          <CardDescription>
            Current AI-generated risk predictions requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{prediction.type}</h4>
                      <Badge variant="outline" className={getImpactColor(prediction.impact)}>
                        {prediction.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{prediction.prediction}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{prediction.confidence}% Confidence</div>
                    <div className="text-xs text-muted-foreground">{prediction.timeframe}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Key Factors:</div>
                  <div className="flex flex-wrap gap-1">
                    {prediction.factors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};