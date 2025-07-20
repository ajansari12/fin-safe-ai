import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Network, TrendingUp, AlertTriangle, Eye, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export const PatternRecognition = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const correlationData = [
    { name: 'Vendor Issues', incidents: 23, riskScore: 75 },
    { name: 'System Outages', incidents: 18, riskScore: 82 },
    { name: 'Compliance Gaps', incidents: 15, riskScore: 68 },
    { name: 'Security Events', incidents: 31, riskScore: 89 },
    { name: 'Process Failures', incidents: 12, riskScore: 54 },
  ];

  const patternTrends = [
    { month: 'Jan', anomalies: 12, patterns: 5 },
    { month: 'Feb', anomalies: 18, patterns: 8 },
    { month: 'Mar', anomalies: 15, patterns: 6 },
    { month: 'Apr', anomalies: 22, patterns: 11 },
    { month: 'May', anomalies: 19, patterns: 9 },
    { month: 'Jun', anomalies: 25, patterns: 13 },
  ];

  const detectedPatterns = [
    {
      id: 1,
      name: "Vendor Concentration Risk",
      description: "High correlation between vendor dependency and operational incidents",
      confidence: 94,
      frequency: "Weekly",
      impact: "High",
      affected: ["Third Party Risk", "Operational Risk"],
      firstDetected: "2024-01-15",
      occurrences: 23,
      trend: "increasing"
    },
    {
      id: 2,
      name: "Seasonal Cyber Activity",
      description: "Increased phishing attempts during holiday periods",
      confidence: 87,
      frequency: "Seasonal",
      impact: "Medium",
      affected: ["Cyber Risk", "Information Security"],
      firstDetected: "2024-02-01",
      occurrences: 15,
      trend: "stable"
    },
    {
      id: 3,
      name: "Compliance Deadline Stress",
      description: "Quality degradation in submissions near regulatory deadlines",
      confidence: 91,
      frequency: "Quarterly",
      impact: "Critical",
      affected: ["Compliance Risk", "Operational Risk"],
      firstDetected: "2024-03-10",
      occurrences: 8,
      trend: "decreasing"
    }
  ];

  const anomalies = [
    {
      id: 1,
      type: "Risk Score Spike",
      description: "Unexpected 45% increase in cyber risk scores",
      severity: "High",
      detected: "2024-06-15 14:23",
      confidence: 96,
      affectedSystems: ["Email Security", "Network Monitoring"],
      status: "investigating"
    },
    {
      id: 2,
      type: "Pattern Deviation",
      description: "Vendor payment delays outside normal distribution",
      severity: "Medium",
      detected: "2024-06-14 09:15",
      confidence: 78,
      affectedSystems: ["Vendor Management", "Financial Controls"],
      status: "resolved"
    },
    {
      id: 3,
      type: "Control Effectiveness Drop",
      description: "Security control effectiveness below threshold",
      severity: "Critical",
      detected: "2024-06-13 16:45",
      confidence: 89,
      affectedSystems: ["Identity Management", "Access Controls"],
      status: "mitigated"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
          <h2 className="text-2xl font-bold">Pattern Recognition & Anomaly Detection</h2>
          <p className="text-muted-foreground">AI-powered pattern analysis and anomaly identification</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Correlation Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Network className="h-5 w-5 mr-2" />
              Risk Correlation Matrix
            </CardTitle>
            <CardDescription>
              AI-identified correlations between risk events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="incidents" name="Incidents" />
                <YAxis dataKey="riskScore" name="Risk Score" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter dataKey="riskScore" fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pattern Detection Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Pattern Detection Trends
            </CardTitle>
            <CardDescription>
              Monthly anomaly and pattern detection activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={patternTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="anomalies" fill="#ef4444" name="Anomalies" />
                <Bar dataKey="patterns" fill="#3b82f6" name="Patterns" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detected Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Detected Risk Patterns
          </CardTitle>
          <CardDescription>
            AI-identified recurring patterns in risk data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {detectedPatterns.map((pattern) => (
              <div key={pattern.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{pattern.name}</h4>
                      <Badge variant="outline" className={getSeverityColor(pattern.impact)}>
                        {pattern.impact} Impact
                      </Badge>
                      {getTrendIcon(pattern.trend)}
                    </div>
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{pattern.confidence}% Confidence</div>
                    <div className="text-xs text-muted-foreground">{pattern.occurrences} occurrences</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Frequency:</span> {pattern.frequency}
                  </div>
                  <div>
                    <span className="font-medium">First Detected:</span> {pattern.firstDetected}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Affected Areas:</div>
                  <div className="flex flex-wrap gap-1">
                    {pattern.affected.map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    View Analysis
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Recent Anomalies
          </CardTitle>
          <CardDescription>
            Latest anomalies detected by AI algorithms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {anomalies.map((anomaly) => (
              <div key={anomaly.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{anomaly.type}</h4>
                    <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>Detected: {anomaly.detected}</span>
                      <span>Confidence: {anomaly.confidence}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getSeverityColor(anomaly.severity)}>
                    {anomaly.severity}
                  </Badge>
                  <Badge variant={anomaly.status === 'resolved' ? 'default' : 'secondary'}>
                    {anomaly.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};