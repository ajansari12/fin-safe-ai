import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Monitor,
  HardDrive
} from 'lucide-react';
import { CacheManager } from '@/lib/performance/cache-utils';

interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  renderTime: number;
  queryTime: number;
  errorRate: number;
  timestamp: number;
}

interface PerformanceMonitoringDashboardProps {
  onOptimize?: () => void;
  refreshInterval?: number;
}

const PerformanceMonitoringDashboard: React.FC<PerformanceMonitoringDashboardProps> = ({
  onOptimize,
  refreshInterval = 5000
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    bundleSize: 0,
    loadTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    renderTime: 0,
    queryTime: 0,
    errorRate: 0,
    timestamp: Date.now()
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Collect performance metrics
  const collectMetrics = () => {
    const startTime = performance.now();
    
    // Get bundle size from performance entries
    const bundleEntries = performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('.js') || entry.name.includes('.css'));
    const bundleSize = bundleEntries.reduce((total, entry) => {
      const resourceEntry = entry as PerformanceResourceTiming;
      return total + (resourceEntry.transferSize || 0);
    }, 0);

    // Get memory usage (if available)
    const memoryInfo = (performance as any).memory;
    const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;

    // Get cache statistics
    const cacheStats = CacheManager.getStats();
    
    // Get navigation timing
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navEntry ? navEntry.loadEventEnd - navEntry.fetchStart : 0;

    // Calculate render time from recent measurements
    const renderEntries = performance.getEntriesByType('measure')
      .filter(entry => entry.name.includes('render') || entry.name.includes('component'));
    const avgRenderTime = renderEntries.length > 0 
      ? renderEntries.reduce((sum, entry) => sum + entry.duration, 0) / renderEntries.length 
      : 0;

    // Calculate query time from recent measurements
    const queryEntries = performance.getEntriesByType('measure')
      .filter(entry => entry.name.includes('query') || entry.name.includes('fetch'));
    const avgQueryTime = queryEntries.length > 0
      ? queryEntries.reduce((sum, entry) => sum + entry.duration, 0) / queryEntries.length
      : 0;

    const newMetrics: PerformanceMetrics = {
      bundleSize: bundleSize / 1024, // Convert to KB
      loadTime: loadTime,
      memoryUsage: memoryUsage,
      cacheHitRate: cacheStats.hitRate,
      renderTime: avgRenderTime,
      queryTime: avgQueryTime,
      errorRate: 0, // Would need error tracking implementation
      timestamp: Date.now()
    };

    setMetrics(newMetrics);
    checkAlerts(newMetrics);
    
    const collectionTime = performance.now() - startTime;
    console.debug(`Performance metrics collected in ${collectionTime.toFixed(2)}ms`);
  };

  // Check for performance alerts
  const checkAlerts = (metrics: PerformanceMetrics) => {
    const newAlerts: string[] = [];
    
    if (metrics.bundleSize > 300) {
      newAlerts.push(`Bundle size is ${metrics.bundleSize.toFixed(0)}KB (>300KB)`);
    }
    
    if (metrics.loadTime > 3000) {
      newAlerts.push(`Load time is ${(metrics.loadTime / 1000).toFixed(1)}s (>3s)`);
    }
    
    if (metrics.memoryUsage > 50) {
      newAlerts.push(`Memory usage is ${metrics.memoryUsage.toFixed(0)}MB (>50MB)`);
    }
    
    if (metrics.cacheHitRate < 80) {
      newAlerts.push(`Cache hit rate is ${metrics.cacheHitRate.toFixed(1)}% (<80%)`);
    }
    
    if (metrics.renderTime > 100) {
      newAlerts.push(`Render time is ${metrics.renderTime.toFixed(0)}ms (>100ms)`);
    }
    
    setAlerts(newAlerts);
  };

  // Performance score calculation
  const performanceScore = useMemo(() => {
    let score = 100;
    
    // Deduct points for each performance issue
    if (metrics.bundleSize > 300) score -= 20;
    if (metrics.loadTime > 3000) score -= 25;
    if (metrics.memoryUsage > 50) score -= 15;
    if (metrics.cacheHitRate < 80) score -= 15;
    if (metrics.renderTime > 100) score -= 15;
    
    return Math.max(0, score);
  }, [metrics]);

  // Performance grade
  const getPerformanceGrade = (score: number): { grade: string; color: string } => {
    if (score >= 90) return { grade: 'A', color: 'text-green-600' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  // Start/stop monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  // Auto-refresh metrics
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(collectMetrics, refreshInterval);
      collectMetrics(); // Initial collection
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, refreshInterval]);

  // Initial metrics collection
  useEffect(() => {
    collectMetrics();
  }, []);

  const { grade, color } = getPerformanceGrade(performanceScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time application performance metrics and optimization insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMonitoring}
            className="flex items-center gap-2"
          >
            <Monitor className="h-4 w-4" />
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collectMetrics}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-6xl font-bold ${color}">{grade}</div>
              <div className="text-sm text-muted-foreground">
                Score: {performanceScore}/100
              </div>
            </div>
            <div className="flex-1 ml-8">
              <Progress value={performanceScore} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4" />
              Bundle Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.bundleSize.toFixed(0)}KB
            </div>
            <div className="text-sm text-muted-foreground">
              Target: &lt;300KB
            </div>
            <Progress 
              value={Math.min(100, (metrics.bundleSize / 300) * 100)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Load Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.loadTime / 1000).toFixed(1)}s
            </div>
            <div className="text-sm text-muted-foreground">
              Target: &lt;3s
            </div>
            <Progress 
              value={Math.min(100, (metrics.loadTime / 3000) * 100)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.memoryUsage.toFixed(0)}MB
            </div>
            <div className="text-sm text-muted-foreground">
              Target: &lt;50MB
            </div>
            <Progress 
              value={Math.min(100, (metrics.memoryUsage / 50) * 100)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cacheHitRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              Target: &gt;80%
            </div>
            <Progress 
              value={metrics.cacheHitRate} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{alert}</span>
                </div>
              ))}
            </div>
            {onOptimize && (
              <Button onClick={onOptimize} className="mt-4" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Optimize Performance
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {CacheManager.getStats().size}
              </div>
              <div className="text-sm text-muted-foreground">Cache Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {CacheManager.getStats().hitCount}
              </div>
              <div className="text-sm text-muted-foreground">Cache Hits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {CacheManager.getStats().missCount}
              </div>
              <div className="text-sm text-muted-foreground">Cache Misses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {CacheManager.getStats().totalRequests}
              </div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitoringDashboard;