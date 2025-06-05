
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, BarChart3, FileText, Settings } from "lucide-react";
import RiskAppetiteOverview from "./RiskAppetiteOverview";
import RiskCategoryForm from "./RiskCategoryForm";
import KRIList from "./KRIList";
import AppetiteBreachAlerts from "./AppetiteBreachAlerts";
import BoardReportGenerator from "./BoardReportGenerator";
import EscalationWorkflow from "./EscalationWorkflow";

interface RiskMetric {
  id: string;
  name: string;
  current_value: number;
  target_value: number;
  threshold_warning: number;
  threshold_critical: number;
  trend: 'up' | 'down' | 'stable';
  status: 'within_appetite' | 'warning' | 'breach';
  last_updated: string;
}

const UnifiedRiskAppetite: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const mockMetrics: RiskMetric[] = [
    {
      id: '1',
      name: 'Operational Risk Score',
      current_value: 75,
      target_value: 60,
      threshold_warning: 70,
      threshold_critical: 85,
      trend: 'up',
      status: 'warning',
      last_updated: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Cyber Risk Exposure',
      current_value: 45,
      target_value: 50,
      threshold_warning: 60,
      threshold_critical: 80,
      trend: 'down',
      status: 'within_appetite',
      last_updated: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      name: 'Third-Party Risk Rating',
      current_value: 90,
      target_value: 70,
      threshold_warning: 75,
      threshold_critical: 85,
      trend: 'up',
      status: 'breach',
      last_updated: '2024-01-15T11:45:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'within_appetite': return 'default';
      case 'warning': return 'destructive';
      case 'breach': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'within_appetite': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'breach': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Risk Appetite Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage your organization's risk appetite and tolerance levels
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure Appetite
        </Button>
      </div>

      {/* Risk Appetite Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockMetrics.map(metric => (
          <Card key={metric.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                {getTrendIcon(metric.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metric.current_value}</span>
                  <Badge variant={getStatusColor(metric.status)} className="flex items-center gap-1">
                    {getStatusIcon(metric.status)}
                    {metric.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Target: {metric.target_value}</span>
                    <span>Warning: {metric.threshold_warning}</span>
                  </div>
                  <Progress 
                    value={(metric.current_value / metric.threshold_critical) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(metric.last_updated).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Banner for Critical Issues */}
      {mockMetrics.some(m => m.status === 'breach') && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Risk Appetite Breach Detected!</strong> 
            {' '}One or more risk categories have exceeded critical thresholds. Immediate attention required.
            <Button variant="outline" size="sm" className="ml-4">
              View Details
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="kris" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            KRIs
          </TabsTrigger>
          <TabsTrigger value="breaches" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Breaches
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Workflow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <RiskAppetiteOverview />
        </TabsContent>

        <TabsContent value="categories">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Categories</CardTitle>
                <CardDescription>
                  Define and manage risk categories and their appetite levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskCategoryForm />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kris">
          <KRIList />
        </TabsContent>

        <TabsContent value="breaches">
          <AppetiteBreachAlerts />
        </TabsContent>

        <TabsContent value="reports">
          <BoardReportGenerator />
        </TabsContent>

        <TabsContent value="workflow">
          <EscalationWorkflow />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedRiskAppetite;
