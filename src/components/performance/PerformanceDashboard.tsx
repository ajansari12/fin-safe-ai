import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Zap, 
  Database, 
  Globe, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { performanceMonitor } from '@/utils/performance-monitor';
import { vendorFeedIntegrationService } from '@/services/vendor-feed-integration-service';
import OptimizedChart from '@/components/common/OptimizedChart';

interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: number;
    cacheHitRate: number;
  };
  vendorFeedMetrics: {
    averageProcessingTime: number;
    throughputPerMinute: number;
    errorRate: number;
    queueSize: number;
  };
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Get performance report
      const report = performanceMonitor.getReport();
      
      // Get vendor feed metrics
      const vendorMetrics = await vendorFeedIntegrationService.getPerformanceMetrics();
      
      // Simulate query performance metrics
      const queryMetrics = {
        averageQueryTime: Math.random() * 1000 + 200,
        slowQueries: Math.floor(Math.random() * 5),
        cacheHitRate: Math.random() * 40 + 60
      };

      const performanceData: PerformanceMetrics = {
        bundleSize: 1.2, // MB
        loadTime: report.summary.loadTime,
        renderTime: report.summary.renderTime,
        memoryUsage: report.summary.memoryUsage || 0,
        queryPerformance: queryMetrics,
        vendorFeedMetrics: vendorMetrics
      };

      setMetrics(performanceData);
      
      // Update chart data
      setChartData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString(),
          loadTime: performanceData.loadTime,
          renderTime: performanceData.renderTime,
          memoryUsage: performanceData.memoryUsage,
          queryTime: queryMetrics.averageQueryTime
        }].slice(-20); // Keep last 20 data points
        
        return newData;
      });
      
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) {
      return <Badge className="bg-green-100 text-green-800">Good</Badge>;
    } else if (value <= thresholds.warning) {
      return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
    }
  };

  const getHealthScore = () => {
    if (!metrics) return 0;
    
    let score = 100;
    
    // Bundle size impact
    if (metrics.bundleSize > 1.5) score -= 20;
    else if (metrics.bundleSize > 1.0) score -= 10;
    
    // Load time impact
    if (metrics.loadTime > 3000) score -= 25;
    else if (metrics.loadTime > 2000) score -= 15;
    
    // Memory usage impact
    if (metrics.memoryUsage > 100) score -= 20;
    else if (metrics.memoryUsage > 75) score -= 10;
    
    // Query performance impact
    if (metrics.queryPerformance.averageQueryTime > 1000) score -= 15;
    else if (metrics.queryPerformance.averageQueryTime > 500) score -= 10;
    
    return Math.max(0, score);
  };

  if (isLoading && !metrics) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time application performance monitoring and optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="text-sm">
            Health Score: {getHealthScore()}%
          </Badge>
          <Button onClick={loadMetrics} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Bundle Size
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold">{metrics?.bundleSize.toFixed(2)} MB</div>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(metrics?.bundleSize || 0, { good: 1.0, warning: 1.5 })}
              <span className="text-xs text-muted-foreground">Target: &lt;1.5MB</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Load Time
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold">{metrics?.loadTime.toFixed(0)}ms</div>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(metrics?.loadTime || 0, { good: 2000, warning: 3000 })}
              <span className="text-xs text-muted-foreground">Target: &lt;3s</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold">{metrics?.memoryUsage.toFixed(1)} MB</div>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(metrics?.memoryUsage || 0, { good: 75, warning: 100 })}
              <span className="text-xs text-muted-foreground">Target: &lt;100MB</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Query Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold">{metrics?.queryPerformance.averageQueryTime.toFixed(0)}ms</div>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(metrics?.queryPerformance.averageQueryTime || 0, { good: 500, warning: 1000 })}
              <span className="text-xs text-muted-foreground">Target: &lt;1s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Feed Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Feed Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics?.vendorFeedMetrics.averageProcessingTime.toFixed(0)}ms</div>
              <div className="text-sm text-muted-foreground">Avg Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics?.vendorFeedMetrics.throughputPerMinute}</div>
              <div className="text-sm text-muted-foreground">Throughput/min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics?.vendorFeedMetrics.errorRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics?.vendorFeedMetrics.queueSize}</div>
              <div className="text-sm text-muted-foreground">Queue Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <div className="text-sm text-muted-foreground mb-4">
              Real-time performance metrics over time
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {chartData.slice(-5).map((point, index) => (
                <div key={index} className="p-3 bg-muted rounded">
                  <div className="text-xs text-muted-foreground">{point.time}</div>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Load:</span>
                      <span className="font-medium">{point.loadTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Render:</span>
                      <span className="font-medium">{point.renderTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Query:</span>
                      <span className="font-medium">{point.queryTime?.toFixed(0)}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics?.bundleSize && metrics.bundleSize > 1.5 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">Large Bundle Size</p>
                  <p className="text-sm text-orange-700">
                    Consider implementing additional code splitting for vendor libraries
                  </p>
                </div>
              </div>
            )}
            
            {metrics?.loadTime && metrics.loadTime > 3000 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Slow Load Time</p>
                  <p className="text-sm text-red-700">
                    Optimize critical rendering path and consider lazy loading more components
                  </p>
                </div>
              </div>
            )}
            
            {metrics?.queryPerformance.averageQueryTime && metrics.queryPerformance.averageQueryTime > 1000 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Slow Database Queries</p>
                  <p className="text-sm text-yellow-700">
                    Implement query optimization and consider adding database indexes
                  </p>
                </div>
              </div>
            )}
            
            {getHealthScore() > 85 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Excellent Performance</p>
                  <p className="text-sm text-green-700">
                    All performance metrics are within optimal ranges
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;