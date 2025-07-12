
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, BarChart3, FileText, Settings, Building2, Activity, Shield } from "lucide-react";
import RiskAppetiteOverview from "./RiskAppetiteOverview";
import { KRIList } from "./KRIList";
import AppetiteBreachAlerts from "./AppetiteBreachAlerts";
import BoardReportGenerator from "./BoardReportGenerator";
import EscalationWorkflow from "./EscalationWorkflow";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

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
  osfi_category?: string;
  disruption_tolerance?: string;
  is_forward_looking?: boolean;
  scenario_based?: boolean;
}

const UnifiedRiskAppetite: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Enhanced mock data with OSFI E-21 categories
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
      last_updated: '2024-01-15T10:30:00Z',
      osfi_category: 'Internal Process Failures',
      disruption_tolerance: '2 hours',
      is_forward_looking: true,
      scenario_based: true
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
      last_updated: '2024-01-15T09:15:00Z',
      osfi_category: 'Technology & Cyber',
      disruption_tolerance: '30 minutes',
      is_forward_looking: true,
      scenario_based: true
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
      last_updated: '2024-01-15T11:45:00Z',
      osfi_category: 'External Dependencies',
      disruption_tolerance: '4 hours',
      is_forward_looking: false,
      scenario_based: true
    },
    {
      id: '4',
      name: 'Critical Operations RTO',
      current_value: 120,
      target_value: 60,
      threshold_warning: 90,
      threshold_critical: 180,
      trend: 'stable',
      status: 'warning',
      last_updated: '2024-01-15T12:00:00Z',
      osfi_category: 'Business Continuity',
      disruption_tolerance: '1 hour',
      is_forward_looking: true,
      scenario_based: true
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
            Monitor and manage your organization's risk appetite and tolerance levels (OSFI E-21 Compliant)
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              OSFI E-21
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              Forward-Looking
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Scenario-Based
            </Badge>
          </div>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure Appetite
        </Button>
      </div>

      {/* Risk Appetite Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockMetrics.map(metric => (
          <Card key={metric.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                {getTrendIcon(metric.trend)}
              </div>
              {metric.osfi_category && (
                <div className="text-xs text-muted-foreground">
                  OSFI: {metric.osfi_category}
                </div>
              )}
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
                
                {metric.disruption_tolerance && (
                  <div className="text-xs bg-blue-50 p-2 rounded">
                    <span className="font-medium">Disruption Tolerance:</span> {metric.disruption_tolerance}
                  </div>
                )}
                
                <div className="flex gap-1 flex-wrap">
                  {metric.is_forward_looking && (
                    <Badge variant="secondary" className="text-xs">Forward-Looking</Badge>
                  )}
                  {metric.scenario_based && (
                    <Badge variant="secondary" className="text-xs">Scenario-Based</Badge>
                  )}
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
          <TabsTrigger value="kris" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            KRIs
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Scenarios
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
          <RiskAppetiteOverview 
            statements={[]}
            onViewStatement={() => {}}
            onCreateNew={() => {}}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="kris">
          <KRIList 
            thresholdId="mock-threshold"
            kris={[]}
            onAddKRI={() => {}}
            onUpdateKRI={() => {}}
            onDeleteKRI={() => {}}
          />
        </TabsContent>

        <TabsContent value="scenarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                OSFI E-21 Forward-Looking Scenarios
              </CardTitle>
              <CardDescription>
                Severe-but-plausible scenarios aligned with OSFI E-21 requirements for forward-looking risk appetite setting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-900">Cyber Attack Scenario</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Critical systems unavailable for 6+ hours affecting customer operations
                    </p>
                    <div className="mt-2 text-xs text-orange-600">
                      Impact Tolerance: 30 minutes | Current Status: Within Appetite
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900">Third-Party Failure</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Critical vendor service disruption affecting multiple business lines
                    </p>
                    <div className="mt-2 text-xs text-red-600">
                      Impact Tolerance: 2 hours | Current Status: Approaching Threshold
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900">Operational Disruption</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Key personnel unavailable during critical processing periods
                    </p>
                    <div className="mt-2 text-xs text-yellow-600">
                      Impact Tolerance: 4 hours | Current Status: Within Appetite
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900">Technology Failure</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Core banking system failure affecting transaction processing
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      Impact Tolerance: 1 hour | Current Status: Within Appetite
                    </div>
                  </div>
                </div>
                <Button className="w-full">
                  Run Forward-Looking Scenario Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breaches">
          <ErrorBoundary>
            <AppetiteBreachAlerts />
          </ErrorBoundary>
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
