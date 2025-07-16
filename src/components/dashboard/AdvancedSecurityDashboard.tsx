import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Lock,
  Users,
  Database,
} from 'lucide-react';
import { useAdvancedSecurityAnalytics } from '@/hooks/useAdvancedSecurityAnalytics';

export function AdvancedSecurityDashboard() {
  const {
    analytics,
    compliance,
    loading,
    error,
    refreshAnalytics,
    overallRiskLevel,
    complianceScore,
    criticalIssuesCount,
    highIssuesCount,
    allRecommendations,
    securityTrend,
    getMetricByName,
  } = useAdvancedSecurityAnalytics();

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getComplianceIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <Lock className="h-4 w-4" />;
      case 'authorization': return <Users className="h-4 w-4" />;
      case 'data_protection': return <Database className="h-4 w-4" />;
      case 'monitoring': return <Eye className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading security analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advanced Security Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time security monitoring and threat detection
          </p>
        </div>
        <Button onClick={refreshAnalytics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={getRiskLevelColor(overallRiskLevel)}>
                {overallRiskLevel.toUpperCase()}
              </Badge>
              {securityTrend && (
                <div className="flex items-center">
                  {getTrendIcon(securityTrend)}
                  <span className="text-xs text-muted-foreground ml-1">
                    {securityTrend}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <Progress value={complianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalIssuesCount}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority Issues</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highIssuesCount}</div>
            <p className="text-xs text-muted-foreground">
              Should be resolved soon
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Security Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {metric.metric_name.replace(/_/g, ' ')}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(metric.metric_trend)}
                    <Badge variant={getRiskLevelColor(metric.risk_level)}>
                      {metric.risk_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.metric_value}</div>
                  <div className="mt-4 space-y-1">
                    {metric.recommendations.map((rec, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {rec}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compliance.map((category, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize flex items-center">
                    {getComplianceIcon(category.category)}
                    <span className="ml-2">{category.category.replace(/_/g, ' ')}</span>
                  </CardTitle>
                  <Badge variant={category.compliance_percentage >= 80 ? 'default' : 'destructive'}>
                    {category.compliance_percentage}%
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compliant: {category.compliant_count}</span>
                      <span>Non-compliant: {category.non_compliant_count}</span>
                    </div>
                    <Progress value={category.compliance_percentage} />
                    
                    {(category.critical_issues > 0 || category.high_issues > 0) && (
                      <div className="flex space-x-4 text-sm mt-2">
                        {category.critical_issues > 0 && (
                          <span className="text-red-600">
                            {category.critical_issues} critical
                          </span>
                        )}
                        {category.high_issues > 0 && (
                          <span className="text-orange-600">
                            {category.high_issues} high
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>
                Prioritized actions to improve your security posture
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {allRecommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4" />
                  <p>No security recommendations at this time</p>
                  <p className="text-sm">Your security posture looks good!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}