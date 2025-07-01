
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Server,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { performanceMonitoringService } from '@/services/performance-monitoring-service';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  target: number;
}

interface PerformanceMonitorProps {
  orgId: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ orgId }) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadPerformanceMetrics();
    
    // Update metrics every 30 seconds
    const interval = setInterval(loadPerformanceMetrics, 30000);
    
    return () => clearInterval(interval);
  }, [orgId]);

  const loadPerformanceMetrics = async () => {
    try {
      const rawMetrics = await performanceMonitoringService.collectMetrics(orgId);
      
      // Transform to UI format
      const uiMetrics: PerformanceMetric[] = rawMetrics.map(metric => ({
        id: metric.id,
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        status: getMetricStatus(metric.value, metric.category),
        trend: 'stable' as const,
        target: getTargetValue(metric.category)
      }));

      setMetrics(uiMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricStatus = (value: number, category: string): 'good' | 'warning' | 'critical' => {
    switch (category) {
      case 'application':
        return value > 500 ? 'critical' : value > 200 ? 'warning' : 'good';
      case 'infrastructure':
        return value > 80 ? 'critical' : value > 65 ? 'warning' : 'good';
      default:
        return 'good';
    }
  };

  const getTargetValue = (category: string): number => {
    switch (category) {
      case 'application': return 200;
      case 'infrastructure': return 80;
      case 'database': return 50;
      default: return 100;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-muted-foreground">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Monitor</h2>
          <p className="text-muted-foreground">
            Real-time system performance and health metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(metric.status)}
                    {getTrendIcon(metric.trend)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value} {metric.unit}
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Target: {metric.target} {metric.unit}</span>
                      <Badge variant={getStatusColor(metric.status) as any} className="text-xs">
                        {metric.status}
                      </Badge>
                    </div>
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className="h-1"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {metrics.filter(m => ['response-time', 'throughput', 'error-rate'].includes(m.id)).map((metric) => (
              <Card key={metric.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    {metric.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metric.value} {metric.unit}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Target: {metric.target} {metric.unit}
                    </span>
                    <Badge variant={getStatusColor(metric.status) as any}>
                      {metric.status}
                    </Badge>
                  </div>
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {metrics.filter(m => ['cpu-usage', 'memory-usage'].includes(m.id)).map((metric) => (
              <Card key={metric.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    {metric.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metric.value}{metric.unit}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Threshold: {metric.target}{metric.unit}
                    </span>
                    <Badge variant={getStatusColor(metric.status) as any}>
                      {metric.status}
                    </Badge>
                  </div>
                  <Progress 
                    value={metric.value} 
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {metrics.filter(m => ['db-response'].includes(m.id)).map((metric) => (
              <Card key={metric.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {metric.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metric.value} {metric.unit}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Max: {metric.target} {metric.unit}
                    </span>
                    <Badge variant={getStatusColor(metric.status) as any}>
                      {metric.status}
                    </Badge>
                  </div>
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitor;
