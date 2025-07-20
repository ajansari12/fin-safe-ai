import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  PlayCircle, 
  PauseCircle, 
  Settings, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Database,
  FileCheck,
  Send,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { automatedRegulatoryReportingService, AutomationMetrics } from '@/services/automated-regulatory-reporting-service';
import AutomationConfigManager from './AutomationConfigManager';
import DataSourceManager from './DataSourceManager';
import ValidationRulesManager from './ValidationRulesManager';
import SubmissionManager from './SubmissionManager';

const AutomatedReportingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: automationConfigs = [] } = useQuery({
    queryKey: ['automation-configs'],
    queryFn: () => automatedRegulatoryReportingService.getAutomatedReportConfigs(),
  });

  const { data: metrics } = useQuery({
    queryKey: ['automation-metrics'],
    queryFn: () => automatedRegulatoryReportingService.getAutomationMetrics({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    }),
  });

  const activeConfigs = automationConfigs.filter(config => config.status === 'active');
  const totalTimeSavings = metrics?.timeSavings || 0;
  const automationRate = automationConfigs.length > 0 ? (activeConfigs.length / automationConfigs.length) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            Automated Regulatory Reporting
          </h1>
          <p className="text-muted-foreground">
            AI-powered automated report generation, validation, and submission
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <PlayCircle className="h-4 w-4 mr-2" />
            Run Automation
          </Button>
        </div>
      </div>

      {/* Automation Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeConfigs.length}</div>
            <p className="text-xs text-muted-foreground">
              {automationRate.toFixed(1)}% automation rate
            </p>
            <Progress value={automationRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.complianceRate.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalTimeSavings}h</div>
            <p className="text-xs text-muted-foreground">
              Estimated hours saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <Database className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics?.dataQualityScore.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="configurations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurations
          </TabsTrigger>
          <TabsTrigger value="data-sources" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Sources
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="submission" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Submission
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Automation Runs</CardTitle>
                <CardDescription>Latest automated report generations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationConfigs.slice(0, 5).map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{config.reportName}</p>
                          <p className="text-sm text-muted-foreground">
                            Last run: {config.lastExecution ? new Date(config.lastExecution).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        config.status === 'active' ? 'default' :
                        config.status === 'inactive' ? 'secondary' : 'destructive'
                      }>
                        {config.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation Performance</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reports Generated</span>
                    <Badge variant="outline">{metrics?.totalAutomatedReports || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Success Rate</span>
                    <Badge variant="secondary">{metrics?.complianceRate.toFixed(1) || 0}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Generation Time</span>
                    <Badge variant="outline">{Math.round(metrics?.averageGenerationTime || 0)}ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Error Rate</span>
                    <Badge variant={metrics?.errorRate && metrics.errorRate > 10 ? 'destructive' : 'secondary'}>
                      {metrics?.errorRate.toFixed(1) || 0}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Automation Pipeline Status</CardTitle>
                <CardDescription>Real-time status of automation components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Database className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="font-medium">Data Collection</p>
                    <p className="text-sm text-muted-foreground">Operational</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <FileCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="font-medium">Validation</p>
                    <p className="text-sm text-muted-foreground">Operational</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Bot className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="font-medium">Generation</p>
                    <p className="text-sm text-muted-foreground">Operational</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Send className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="font-medium">Submission</p>
                    <p className="text-sm text-muted-foreground">Monitoring</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configurations">
          <AutomationConfigManager />
        </TabsContent>

        <TabsContent value="data-sources">
          <DataSourceManager />
        </TabsContent>

        <TabsContent value="validation">
          <ValidationRulesManager />
        </TabsContent>

        <TabsContent value="submission">
          <SubmissionManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Automation Analytics</CardTitle>
              <CardDescription>Detailed performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold text-blue-600">
                    {((metrics?.successfulGenerations || 0) / Math.max(metrics?.totalAutomatedReports || 1, 1) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Success Trend</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round((metrics?.averageGenerationTime || 0) / 1000)}s
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Processing Time</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics?.failedGenerations || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Failed Generations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedReportingDashboard;