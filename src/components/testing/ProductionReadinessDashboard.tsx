import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  DollarSign,
  Shield,
  Calendar,
  Download,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { ProductionMonitoringService } from '@/services/testing/ProductionMonitoringService';
import { CriticalPathTestOrchestrator } from '@/services/testing/CriticalPathTestOrchestrator';

interface ProductionReadinessProps {
  className?: string;
}

const ProductionReadinessDashboard: React.FC<ProductionReadinessProps> = ({ className }) => {
  const [readinessData, setReadinessData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [monitoringService] = useState(() => new ProductionMonitoringService());
  const [criticalPathOrchestrator] = useState(() => new CriticalPathTestOrchestrator());

  const loadReadinessData = async () => {
    setIsLoading(true);
    try {
      const data = await monitoringService.generateProductionReadinessReport();
      setReadinessData(data);
      setLastUpdate(new Date());
      toast.success('Production readiness data updated');
    } catch (error) {
      toast.error('Failed to load production readiness data');
      console.error('Error loading readiness data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeFullValidation = async () => {
    setIsLoading(true);
    try {
      toast('Starting comprehensive validation...', {
        description: 'This may take several minutes to complete'
      });

      const results = await criticalPathOrchestrator.executeAllValidations();
      
      // Generate compliance audit trail
      await monitoringService.generateComplianceAuditTrail(results.validations);
      
      // Refresh readiness data
      await loadReadinessData();
      
      toast.success('Comprehensive validation completed', {
        description: `${results.summary.passedTests}/${results.summary.totalTests} tests passed`
      });
    } catch (error) {
      toast.error('Validation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleAutomatedTesting = async () => {
    try {
      const result = await monitoringService.scheduleAutomatedTesting({
        frequency: 'daily',
        time: '02:00',
        testSuites: ['critical_path', 'compliance', 'performance'],
        notificationRecipients: ['admin@company.com']
      });

      if (result.success) {
        toast.success('Automated testing scheduled successfully');
      } else {
        toast.error('Failed to schedule automated testing');
      }
    } catch (error) {
      toast.error('Error scheduling automated testing');
    }
  };

  const downloadComplianceReport = () => {
    if (!readinessData) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      readinessScore: readinessData.readinessScore,
      complianceStatus: readinessData.complianceStatus,
      criticalIssues: readinessData.criticalIssues,
      recommendations: readinessData.recommendations,
      deploymentChecklist: readinessData.deploymentChecklist
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-readiness-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Production readiness report downloaded');
  };

  useEffect(() => {
    loadReadinessData();
  }, []);

  const getReadinessColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusIcon = (status: boolean | string) => {
    if (status === true || status === 'complete') {
      return <CheckCircle className="h-4 w-4 text-success" />;
    } else if (status === 'pending') {
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    } else {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  if (!readinessData && !isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <Button onClick={loadReadinessData}>Load Production Readiness Data</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Production Readiness Dashboard</CardTitle>
              <p className="text-muted-foreground mt-2">
                Phase 8: Production monitoring, compliance audit trails, and deployment readiness
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={executeFullValidation}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                {isLoading ? 'Validating...' : 'Run Full Validation'}
              </Button>
              <Button
                variant="outline"
                onClick={downloadComplianceReport}
                disabled={!readinessData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
        {lastUpdate && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleString()}
            </p>
          </CardContent>
        )}
      </Card>

      {readinessData && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Production Readiness Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Readiness Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getReadinessColor(readinessData.readinessScore)}`}>
                      {readinessData.readinessScore}%
                    </div>
                    <Progress 
                      value={readinessData.readinessScore} 
                      className="mt-4"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {readinessData.readinessScore >= 90 ? 'Ready for Production' : 
                       readinessData.readinessScore >= 70 ? 'Needs Attention' : 'Not Ready'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Critical Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Critical Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-destructive">
                      {readinessData.criticalIssues.length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Issues Found</p>
                    {readinessData.criticalIssues.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {readinessData.criticalIssues.slice(0, 2).map((issue: string, index: number) => (
                          <Alert key={index} className="text-left">
                            <AlertDescription className="text-xs">{issue}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Cost Estimate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Monthly Costs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      ${readinessData.estimatedCosts.monthly.toFixed(0)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Estimated Monthly</p>
                    <div className="mt-4 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>OpenAI:</span>
                        <span>${readinessData.estimatedCosts.breakdown.openai.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Supabase:</span>
                        <span>${readinessData.estimatedCosts.breakdown.supabase.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resend:</span>
                        <span>${readinessData.estimatedCosts.breakdown.resend.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {readinessData.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>OSFI E-21 Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Operational Risk Management</span>
                      {getStatusIcon(readinessData.complianceStatus.osfiE21)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Data Privacy & Protection</span>
                      {getStatusIcon(readinessData.complianceStatus.dataPrivacy)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Audit Trail Integrity</span>
                      {getStatusIcon(readinessData.complianceStatus.auditTrail)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Access Control Validation</span>
                      {getStatusIcon(readinessData.complianceStatus.accessControl)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Automated Compliance Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      onClick={scheduleAutomatedTesting}
                      className="w-full flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule Daily Compliance Checks
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Automated testing will run daily at 2:00 AM to ensure continuous compliance
                      with OSFI E-21 requirements and alert on any violations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deployment Checklist Tab */}
          <TabsContent value="deployment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Deployment Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {readinessData.deploymentChecklist.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <div className="font-medium">{item.item}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </div>
                      </div>
                      <Badge 
                        variant={item.status === 'complete' ? 'default' : 
                                item.status === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Monitoring Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Real-time Monitoring</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Performance Metrics:</span>
                        <Badge>Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate Tracking:</span>
                        <Badge>Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost Monitoring:</span>
                        <Badge>Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Alerts:</span>
                        <Badge>Active</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Alerting Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>SLA Breach Alerts:</span>
                        <Badge variant="secondary">Configured</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost Limit Alerts:</span>
                        <Badge variant="secondary">$50/day</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Compliance Violations:</span>
                        <Badge variant="secondary">Immediate</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>System Health:</span>
                        <Badge variant="secondary">5min intervals</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Analysis Tab */}
          <TabsContent value="costs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>OpenAI API Usage</span>
                      <span className="font-medium">${readinessData.estimatedCosts.breakdown.openai.toFixed(2)}/month</span>
                    </div>
                    <Progress value={(readinessData.estimatedCosts.breakdown.openai / readinessData.estimatedCosts.monthly) * 100} />
                    
                    <div className="flex justify-between items-center">
                      <span>Supabase Database</span>
                      <span className="font-medium">${readinessData.estimatedCosts.breakdown.supabase.toFixed(2)}/month</span>
                    </div>
                    <Progress value={(readinessData.estimatedCosts.breakdown.supabase / readinessData.estimatedCosts.monthly) * 100} />
                    
                    <div className="flex justify-between items-center">
                      <span>Email Service (Resend)</span>
                      <span className="font-medium">${readinessData.estimatedCosts.breakdown.resend.toFixed(2)}/month</span>
                    </div>
                    <Progress value={(readinessData.estimatedCosts.breakdown.resend / readinessData.estimatedCosts.monthly) * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <DollarSign className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Daily Spending Limit:</strong> $50.00<br />
                        <span className="text-sm">Automatic alerts when 80% reached</span>
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Settings className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Rate Limiting:</strong> Active<br />
                        <span className="text-sm">10 requests/minute per user</span>
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Usage Monitoring:</strong> Real-time<br />
                        <span className="text-sm">Continuous cost tracking enabled</span>
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ProductionReadinessDashboard;