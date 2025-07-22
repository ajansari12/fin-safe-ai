import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Monitor,
  Users
} from 'lucide-react';
import { 
  createPerformanceMonitoringService, 
  PerformanceMetric, 
  AnalysisFindings,
  OptimizationRecommendation,
  CapacityPlanningAnalysis
} from '@/services/performance/performance-monitoring-service';

interface PerformanceMonitoringDashboardProps {
  org_id: string;
}

const PerformanceMonitoringDashboard: React.FC<PerformanceMonitoringDashboardProps> = ({ org_id }) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [findings, setFindings] = useState<AnalysisFindings[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [capacityAnalysis, setCapacityAnalysis] = useState<CapacityPlanningAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const performanceService = createPerformanceMonitoringService(org_id);

  useEffect(() => {
    loadPerformanceData();
    performanceService.startRealTimeMonitoring();
  }, [org_id]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const [metricsData, findingsData, capacityData] = await Promise.all([
        performanceService.collectMetrics(),
        performanceService.analyzePerformance({
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        }),
        performanceService.analyzeCapacityRequirements()
      ]);
      
      setMetrics(metricsData);
      setFindings(findingsData);
      setCapacityAnalysis(capacityData);
      
      const recommendationsData = await performanceService.generateOptimizationRecommendations(findingsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'degrading': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-pulse" />
      </div>
    );
  }

  const criticalIssues = findings.filter(f => f.severity === 'critical').length;
  const avgResponseTime = metrics.find(m => m.metricId === 'api_response_time')?.currentValue || 0;
  const throughput = metrics.find(m => m.metricId === 'throughput')?.currentValue || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Performance Monitoring</h2>
        <p className="text-muted-foreground">
          Real-time performance monitoring and optimization recommendations
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(metrics.find(m => m.metricId === 'api_response_time')?.trend || 'stable')}
              API response time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{throughput.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">requests per second</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">all systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalIssues}</div>
            <p className="text-xs text-muted-foreground">requiring immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {metrics.map((metric) => (
              <Card key={metric.metricId}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">{metric.metricName}</CardTitle>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <CardDescription>{metric.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.currentValue.toFixed(1)} {metric.unit}
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Target: {metric.targetValue} {metric.unit}</span>
                      <span>Warning: {metric.thresholds.warning}</span>
                    </div>
                    <Progress 
                      value={(metric.currentValue / metric.thresholds.critical) * 100} 
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.recommendationId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{rec.title}</CardTitle>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                    <Badge className={getSeverityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium">Expected Benefits</h4>
                      <ul className="text-sm text-muted-foreground">
                        <li>Response time: -{rec.estimatedBenefit.responseTimeImprovement}%</li>
                        <li>Throughput: +{rec.estimatedBenefit.throughputIncrease}%</li>
                        <li>Cost savings: ${rec.estimatedBenefit.costSavings}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Implementation</h4>
                      <p className="text-sm text-muted-foreground">
                        Effort: {rec.implementationEffort}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <div className="space-y-4">
            {capacityAnalysis.map((analysis) => (
              <Card key={analysis.analysisId}>
                <CardHeader>
                  <CardTitle className="capitalize">{analysis.resourceType} Capacity</CardTitle>
                  <CardDescription>
                    Current: {analysis.currentUtilization.toFixed(1)}% | 
                    Projected: {analysis.projectedUtilization.toFixed(1)}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={analysis.currentUtilization} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium">Recommendations</h4>
                        {analysis.recommendations.map((rec, idx) => (
                          <div key={idx} className="text-sm">
                            <Badge variant="outline">{rec.recommendationType}</Badge>
                            <p className="mt-1">{rec.description}</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium">Cost Projections</h4>
                        {analysis.costProjections.map((proj, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium">{proj.scenario}:</span> 
                            ${proj.monthlyCost}/month
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-4">
            {findings.map((finding) => (
              <Alert key={finding.findingId}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>{finding.type.replace('_', ' ').toUpperCase()}</strong>
                      <p>{finding.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Impact: User Experience ({finding.impact.userExperience}) | 
                        System Performance ({finding.impact.systemPerformance})
                      </p>
                    </div>
                    <Badge className={getSeverityColor(finding.severity)}>
                      {finding.severity}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitoringDashboard;