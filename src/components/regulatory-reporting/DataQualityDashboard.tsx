
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Database,
  FileCheck,
  TrendingUp,
  RefreshCw
} from "lucide-react";

const DataQualityDashboard: React.FC = () => {
  // Mock data - in real implementation, this would come from the service
  const qualityMetrics = {
    overall_score: 92,
    completeness: 95,
    accuracy: 89,
    consistency: 94,
    validity: 90,
    total_checks: 156,
    passed_checks: 143,
    failed_checks: 8,
    warning_checks: 5
  };

  const recentChecks = [
    {
      id: 1,
      check_name: 'Incident Data Completeness',
      data_source: 'incident_logs',
      status: 'passed',
      score: 98,
      timestamp: '2024-01-15T14:30:00Z',
      issues_found: 0
    },
    {
      id: 2,
      check_name: 'KRI Threshold Validation',
      data_source: 'kri_logs',
      status: 'warning',
      score: 85,
      timestamp: '2024-01-15T14:25:00Z',
      issues_found: 3
    },
    {
      id: 3,
      check_name: 'Control Test Accuracy',
      data_source: 'control_tests',
      status: 'failed',
      score: 67,
      timestamp: '2024-01-15T14:20:00Z',
      issues_found: 12
    },
    {
      id: 4,
      check_name: 'Governance Data Consistency',
      data_source: 'governance_frameworks',
      status: 'passed',
      score: 96,
      timestamp: '2024-01-15T14:15:00Z',
      issues_found: 1
    }
  ];

  const dataSourceHealth = [
    {
      source: 'Incident Logs',
      table: 'incident_logs',
      health_score: 95,
      last_updated: '2024-01-15T14:30:00Z',
      record_count: 1247,
      issues: 2
    },
    {
      source: 'KRI Definitions',
      table: 'kri_definitions',
      health_score: 88,
      last_updated: '2024-01-15T14:25:00Z',
      record_count: 156,
      issues: 5
    },
    {
      source: 'Control Tests',
      table: 'control_tests',
      health_score: 73,
      last_updated: '2024-01-15T14:20:00Z',
      record_count: 89,
      issues: 12
    },
    {
      source: 'Governance Frameworks',
      table: 'governance_frameworks',
      health_score: 92,
      last_updated: '2024-01-15T14:15:00Z',
      record_count: 23,
      issues: 3
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Quality Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor data quality across all regulatory reporting sources
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Run All Checks
        </Button>
      </div>

      {/* Quality Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(qualityMetrics.overall_score)}`}>
              {qualityMetrics.overall_score}%
            </div>
            <Progress value={qualityMetrics.overall_score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completeness</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(qualityMetrics.completeness)}`}>
              {qualityMetrics.completeness}%
            </div>
            <Progress value={qualityMetrics.completeness} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(qualityMetrics.accuracy)}`}>
              {qualityMetrics.accuracy}%
            </div>
            <Progress value={qualityMetrics.accuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(qualityMetrics.consistency)}`}>
              {qualityMetrics.consistency}%
            </div>
            <Progress value={qualityMetrics.consistency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validity</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(qualityMetrics.validity)}`}>
              {qualityMetrics.validity}%
            </div>
            <Progress value={qualityMetrics.validity} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Quality Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Recent Quality Checks
          </CardTitle>
          <CardDescription>
            Latest data quality validation results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentChecks.map((check) => (
              <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium">{check.check_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Source: {check.data_source} • Score: {check.score}% • Issues: {check.issues_found}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getStatusColor(check.status)}`}>
                    {check.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(check.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Source Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Source Health
          </CardTitle>
          <CardDescription>
            Health status and metrics for each data source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {dataSourceHealth.map((source) => (
              <div key={source.table} className={`p-4 rounded-lg border ${getHealthBgColor(source.health_score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{source.source}</h4>
                  <div className={`text-lg font-bold ${getHealthColor(source.health_score)}`}>
                    {source.health_score}%
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Records:</span>
                    <span>{source.record_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issues:</span>
                    <span className={source.issues > 0 ? 'text-red-600' : 'text-green-600'}>
                      {source.issues}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{new Date(source.last_updated).toLocaleTimeString()}</span>
                  </div>
                </div>
                <Progress value={source.health_score} className="mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataQualityDashboard;
