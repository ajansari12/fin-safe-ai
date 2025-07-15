import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw, Clock } from 'lucide-react';
import { deploymentCheckService } from '@/services/deployment-check-service';

interface DeploymentCheckResult {
  step: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  duration?: number;
}

interface DeploymentReadinessReport {
  overallScore: number;
  readinessPercentage: number;
  checks: DeploymentCheckResult[];
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  timestamp: string;
}

export const DeploymentCheckDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<DeploymentReadinessReport | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const runDeploymentCheck = async () => {
    setIsRunning(true);
    setCurrentStep('Initializing...');
    
    try {
      const result = await deploymentCheckService.runFullDeploymentCheck();
      setReport(result);
    } catch (error) {
      console.error('Deployment check failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentStep('');
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'pass' | 'fail' | 'warning') => {
    const variants = {
      pass: 'bg-green-100 text-green-800 border-green-200',
      fail: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getReadinessColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    return `${duration.toFixed(0)}ms`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Final Deployment Readiness Check
          </CardTitle>
          <CardDescription>
            Comprehensive validation of Fin Safe AI production deployment readiness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={runDeploymentCheck}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Check...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Deployment Check
                </>
              )}
            </Button>
            
            {isRunning && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {currentStep}
              </div>
            )}
          </div>

          {report && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Overall Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getReadinessColor(report.readinessPercentage)}`}>
                      {report.readinessPercentage}%
                    </div>
                    <Progress value={report.readinessPercentage} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Tests Passed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {report.checks.filter(c => c.status === 'pass').length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      of {report.checks.length} total
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Critical Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {report.criticalIssues.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Must be fixed
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="results" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="results">Test Results</TabsTrigger>
                  <TabsTrigger value="issues">Critical Issues</TabsTrigger>
                  <TabsTrigger value="warnings">Warnings</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="space-y-4">
                  <div className="space-y-3">
                    {report.checks.map((check, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(check.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{check.step}</span>
                                {getStatusBadge(check.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {check.message}
                              </p>
                              {check.details && (
                                <details className="text-xs text-muted-foreground">
                                  <summary className="cursor-pointer mb-1">View Details</summary>
                                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(check.details, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                          {check.duration && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(check.duration)}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="issues" className="space-y-4">
                  {report.criticalIssues.length > 0 ? (
                    <div className="space-y-3">
                      {report.criticalIssues.map((issue, index) => (
                        <Alert key={index} className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">
                            {issue}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-700">
                        No critical issues found! Your deployment is ready.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="warnings" className="space-y-4">
                  {report.warnings.length > 0 ? (
                    <div className="space-y-3">
                      {report.warnings.map((warning, index) => (
                        <Alert key={index} className="border-yellow-200 bg-yellow-50">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <AlertDescription className="text-yellow-700">
                            {warning}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-700">
                        No warnings found! Excellent deployment quality.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  {report.recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {report.recommendations.map((rec, index) => (
                        <Alert key={index} className="border-blue-200 bg-blue-50">
                          <AlertTriangle className="h-4 w-4 text-blue-500" />
                          <AlertDescription className="text-blue-700">
                            {rec}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-700">
                        No additional recommendations. Your deployment is optimized!
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="text-xs text-muted-foreground">
                Last checked: {new Date(report.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};