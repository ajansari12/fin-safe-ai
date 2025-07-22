
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  Database,
  FileCheck,
  AlertCircle
} from "lucide-react";

const DataQualityMonitor: React.FC = () => {
  // Mock data - in real implementation, this would come from the service
  const qualityMetrics = {
    overall_score: 94,
    completeness: 98,
    accuracy: 92,
    consistency: 91,
    timeliness: 95
  };

  const dataSourceQuality = [
    { source: 'KRI Data', score: 96, issues: 2, trend: 'improving' },
    { source: 'Incident Data', score: 91, issues: 5, trend: 'stable' },
    { source: 'Control Data', score: 88, issues: 8, trend: 'declining' },
    { source: 'Vendor Data', score: 93, issues: 3, trend: 'improving' }
  ];

  const validationIssues = [
    {
      id: '1',
      severity: 'high',
      rule: 'KRI Completeness Check',
      message: 'Missing KRI values for 3 indicators in Q4 2024',
      affected_records: 12,
      data_source: 'KRI Data'
    },
    {
      id: '2',
      severity: 'medium',
      rule: 'Incident Category Validation',
      message: 'Inconsistent incident categorization detected',
      affected_records: 5,
      data_source: 'Incident Data'
    },
    {
      id: '3',
      severity: 'low',
      rule: 'Control Testing Frequency',
      message: 'Some controls tested outside recommended frequency',
      affected_records: 8,
      data_source: 'Control Data'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 95) return 'bg-green-500';
    if (score >= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Quality Monitoring</h2>
        <p className="text-muted-foreground">
          Real-time monitoring and validation of data quality across all sources
        </p>
      </div>

      {/* Overall Quality Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Overall Data Quality Score
          </CardTitle>
          <CardDescription>
            Comprehensive quality assessment across all data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold ${getScoreColor(qualityMetrics.overall_score)}`}>
              {qualityMetrics.overall_score}%
            </div>
            <p className="text-muted-foreground mt-2">Overall Quality Score</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{qualityMetrics.completeness}%</div>
              <p className="text-sm text-muted-foreground">Completeness</p>
              <Progress value={qualityMetrics.completeness} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{qualityMetrics.accuracy}%</div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <Progress value={qualityMetrics.accuracy} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{qualityMetrics.consistency}%</div>
              <p className="text-sm text-muted-foreground">Consistency</p>
              <Progress value={qualityMetrics.consistency} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{qualityMetrics.timeliness}%</div>
              <p className="text-sm text-muted-foreground">Timeliness</p>
              <Progress value={qualityMetrics.timeliness} className="mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source Quality */}
      <Card>
        <CardHeader>
          <CardTitle>Data Source Quality Breakdown</CardTitle>
          <CardDescription>Quality metrics by individual data source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataSourceQuality.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-medium">{source.source}</h4>
                    <p className="text-sm text-muted-foreground">
                      {source.issues} validation issues
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {getTrendIcon(source.trend)}
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getScoreColor(source.score)}`}>
                      {source.score}%
                    </div>
                    <Progress value={source.score} className="w-20 h-2 mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Active Validation Issues
          </CardTitle>
          <CardDescription>
            Issues requiring attention before report generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validationIssues.map((issue) => (
              <Alert key={issue.id} className="relative">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{issue.rule}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{issue.data_source}</Badge>
                        <Badge variant={
                          issue.severity === 'high' ? 'destructive' :
                          issue.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {issue.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <AlertDescription className="mb-2">
                      {issue.message}
                    </AlertDescription>
                    <p className="text-xs text-muted-foreground">
                      Affected records: {issue.affected_records}
                    </p>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Improvement Recommendations</CardTitle>
          <CardDescription>AI-powered suggestions for data quality enhancement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Data Completeness</h4>
              <p className="text-sm text-blue-800">
                Implement automated data validation checks at the source to prevent incomplete data entry.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Control Testing Frequency</h4>
              <p className="text-sm text-yellow-800">
                Consider implementing automated reminders for control testing to maintain consistency.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Incident Categorization</h4>
              <p className="text-sm text-green-800">
                Create standardized incident category guidelines with dropdown selections to improve consistency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataQualityMonitor;
