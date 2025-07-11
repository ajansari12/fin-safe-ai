import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  BarChart3,
  Zap,
  Bell
} from "lucide-react";

interface RiskAppetiteMetric {
  id: string;
  category: string;
  metric: string;
  currentValue: number;
  threshold: number;
  tolerance: number;
  unit: string;
  status: 'within-appetite' | 'approaching-limit' | 'exceeded';
  trend: 'improving' | 'stable' | 'deteriorating';
  lastUpdate: string;
  forecastValue?: number;
}

interface QuantitativeLimit {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  warningThreshold: number;
  hardLimit: number;
  unit: string;
  boardApproved: boolean;
  lastReview: string;
  nextReview: string;
}

export default function EnhancedRiskAppetite() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // OSFI E-21 Principle 3 compliant risk appetite metrics
  const riskAppetiteMetrics: RiskAppetiteMetric[] = [
    {
      id: "1",
      category: "Operational Resilience",
      metric: "Maximum System Downtime",
      currentValue: 0.15,
      threshold: 0.2,
      tolerance: 0.1,
      unit: "% per month",
      status: "within-appetite",
      trend: "stable",
      lastUpdate: "2024-07-11T10:00:00Z",
      forecastValue: 0.12
    },
    {
      id: "2", 
      category: "Critical Operations",
      metric: "RTO Breach Frequency",
      currentValue: 2,
      threshold: 3,
      tolerance: 1,
      unit: "incidents/quarter",
      status: "approaching-limit",
      trend: "deteriorating",
      lastUpdate: "2024-07-11T09:30:00Z",
      forecastValue: 3.2
    },
    {
      id: "3",
      category: "Third-Party Risk",
      metric: "Critical Vendor Failures",
      currentValue: 1,
      threshold: 2,
      tolerance: 0,
      unit: "failures/quarter",
      status: "within-appetite",
      trend: "improving",
      lastUpdate: "2024-07-11T08:45:00Z",
      forecastValue: 0.8
    },
    {
      id: "4",
      category: "Cyber Security",
      metric: "Security Incident Severity",
      currentValue: 6.2,
      threshold: 7.0,
      tolerance: 5.0,
      unit: "severity score",
      status: "within-appetite",
      trend: "stable",
      lastUpdate: "2024-07-11T11:15:00Z",
      forecastValue: 6.0
    }
  ];

  const quantitativeLimits: QuantitativeLimit[] = [
    {
      id: "1",
      name: "Operational Loss Limit",
      description: "Maximum acceptable operational loss per incident",
      currentValue: 2.5,
      warningThreshold: 8.0,
      hardLimit: 10.0,
      unit: "CAD Million",
      boardApproved: true,
      lastReview: "2024-03-15",
      nextReview: "2024-09-15"
    },
    {
      id: "2",
      name: "Business Continuity RTO",
      description: "Maximum recovery time for critical operations",
      currentValue: 45,
      warningThreshold: 90,
      hardLimit: 120,
      unit: "minutes",
      boardApproved: true,
      lastReview: "2024-04-01",
      nextReview: "2024-10-01"
    },
    {
      id: "3",
      name: "Data Breach Impact",
      description: "Maximum customer records at risk per incident",
      currentValue: 0,
      warningThreshold: 1000,
      hardLimit: 5000,
      unit: "customer records",
      boardApproved: true,
      lastReview: "2024-05-01",
      nextReview: "2024-11-01"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'within-appetite':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'approaching-limit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'exceeded':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      case 'deteriorating':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const calculateUtilization = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Risk Appetite Framework</h2>
          <p className="text-muted-foreground">
            OSFI E-21 Principle 3 compliant risk appetite with quantitative limits and forward-looking assessments
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Target className="h-3 w-3 mr-1" />
          Board Approved
        </Badge>
      </div>

      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          <strong>OSFI E-21 Principle 3:</strong> Risk appetite framework includes board-approved statements, 
          quantitative limits, forward-looking assessments, and integration with business strategy and capital planning.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-Time Metrics
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quantitative Limits
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Forward-Looking
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Business Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {riskAppetiteMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                      <p className="text-xs text-muted-foreground">{metric.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metric.trend)}
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{metric.currentValue}{metric.unit}</span>
                      <span className="text-sm text-muted-foreground">
                        Limit: {metric.threshold}{metric.unit}
                      </span>
                    </div>
                    <Progress 
                      value={calculateUtilization(metric.currentValue, metric.threshold)} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Tolerance: {metric.tolerance}{metric.unit}</span>
                      <span>Updated: {new Date(metric.lastUpdate).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="limits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Board-Approved Quantitative Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quantitativeLimits.map((limit) => (
                  <div key={limit.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{limit.name}</h4>
                        <p className="text-sm text-muted-foreground">{limit.description}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Board Approved
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="text-center p-3 border rounded">
                        <div className="text-lg font-bold text-green-600">
                          {limit.currentValue}
                        </div>
                        <div className="text-xs text-muted-foreground">Current</div>
                      </div>
                      
                      <div className="text-center p-3 border rounded">
                        <div className="text-lg font-bold text-yellow-600">
                          {limit.warningThreshold}
                        </div>
                        <div className="text-xs text-muted-foreground">Warning</div>
                      </div>
                      
                      <div className="text-center p-3 border rounded">
                        <div className="text-lg font-bold text-red-600">
                          {limit.hardLimit}
                        </div>
                        <div className="text-xs text-muted-foreground">Hard Limit</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span>Last Review: {limit.lastReview}</span>
                      <span>Next Review: {limit.nextReview}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Forward-Looking Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAppetiteMetrics.filter(m => m.forecastValue).map((metric) => (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{metric.metric}</h4>
                      <Badge variant="outline">{metric.category}</Badge>
                    </div>
                    
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="text-center">
                        <div className="text-lg font-bold">{metric.currentValue}{metric.unit}</div>
                        <div className="text-xs text-muted-foreground">Current</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-lg font-bold ${
                          metric.forecastValue! > metric.threshold ? 'text-red-600' : 
                          metric.forecastValue! > metric.threshold * 0.8 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {metric.forecastValue}{metric.unit}
                        </div>
                        <div className="text-xs text-muted-foreground">3-Month Forecast</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-600">{metric.threshold}{metric.unit}</div>
                        <div className="text-xs text-muted-foreground">Appetite Limit</div>
                      </div>
                    </div>
                    
                    {metric.forecastValue! > metric.threshold && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center gap-2 text-sm text-red-700">
                          <AlertTriangle className="h-4 w-4" />
                          Forecast exceeds risk appetite - immediate action required
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Business Strategy Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Integration Status:</strong> Risk appetite framework is integrated with annual strategic planning, 
                    capital allocation, and business performance management processes.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Strategic Planning Cycle</h4>
                    <div className="text-sm text-muted-foreground">
                      Risk appetite calibrated annually with business strategy review
                    </div>
                    <Badge className="mt-2 bg-green-100 text-green-800">Q2 2024 Complete</Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Capital Planning</h4>
                    <div className="text-sm text-muted-foreground">
                      Operational risk capital allocation aligned with appetite limits
                    </div>
                    <Badge className="mt-2 bg-green-100 text-green-800">Integrated</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}