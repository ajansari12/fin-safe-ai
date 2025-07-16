import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Wifi, 
  Zap, 
  Shield, 
  Activity,
  Server,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useConnectionStabilizer } from '@/hooks/useConnectionStabilizer';
import { useProductionOptimizer } from '@/hooks/useProductionOptimizer';

interface SystemStatus {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  details?: any;
}

export const ProductionReadinessMonitor: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [readinessScore, setReadinessScore] = useState(0);
  
  const connectionStabilizer = useConnectionStabilizer();
  const productionOptimizer = useProductionOptimizer();

  const runSystemDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    const diagnostics: SystemStatus[] = [];

    try {
      // Connection Stability Check
      const latency = await connectionStabilizer.measureLatency();
      diagnostics.push({
        component: 'Connection Stability',
        status: connectionStabilizer.isStable ? 'healthy' : 'warning',
        message: `${connectionStabilizer.connectionQuality} quality (${latency.toFixed(0)}ms)`,
        timestamp: new Date(),
        details: { latency, quality: connectionStabilizer.connectionQuality }
      });

      // Performance Metrics Check
      const performanceResult = await productionOptimizer.collectMetrics();
      const performanceStatus = 
        performanceResult.cls < 0.1 && performanceResult.lcp < 2500 ? 'healthy' :
        performanceResult.cls < 0.25 && performanceResult.lcp < 4000 ? 'warning' : 'error';
      
      diagnostics.push({
        component: 'Performance Metrics',
        status: performanceStatus,
        message: `CLS: ${performanceResult.cls.toFixed(3)}, LCP: ${performanceResult.lcp.toFixed(0)}ms`,
        timestamp: new Date(),
        details: performanceResult
      });

      // Memory Usage Check
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024); // MB
        const memoryStatus = memoryUsage < 100 ? 'healthy' : memoryUsage < 200 ? 'warning' : 'error';
        
        diagnostics.push({
          component: 'Memory Management',
          status: memoryStatus,
          message: `${memoryUsage.toFixed(1)}MB used`,
          timestamp: new Date(),
          details: { usedMB: memoryUsage, totalMB: memInfo.totalJSHeapSize / (1024 * 1024) }
        });
      }

      // Error Boundary Status
      const errorBoundaryCount = document.querySelectorAll('[data-error-boundary]').length;
      diagnostics.push({
        component: 'Error Handling',
        status: errorBoundaryCount > 0 ? 'healthy' : 'warning',
        message: `${errorBoundaryCount} error boundaries active`,
        timestamp: new Date(),
        details: { boundaryCount: errorBoundaryCount }
      });

      // Auto-Recovery Status
      diagnostics.push({
        component: 'Auto-Recovery',
        status: connectionStabilizer.isReconnecting ? 'warning' : 'healthy',
        message: connectionStabilizer.isReconnecting ? 'Recovery in progress' : 'System stable',
        timestamp: new Date(),
        details: { 
          attempts: connectionStabilizer.reconnectAttempts,
          lastDisconnect: connectionStabilizer.lastDisconnect
        }
      });

      // API Response Time Check
      const apiStart = performance.now();
      try {
        await fetch('/api/health');
        const apiLatency = performance.now() - apiStart;
        diagnostics.push({
          component: 'API Responsiveness',
          status: apiLatency < 500 ? 'healthy' : apiLatency < 1000 ? 'warning' : 'error',
          message: `${apiLatency.toFixed(0)}ms response time`,
          timestamp: new Date(),
          details: { latency: apiLatency }
        });
      } catch (error) {
        diagnostics.push({
          component: 'API Responsiveness',
          status: 'error',
          message: 'API unreachable',
          timestamp: new Date(),
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }

      setSystemStatus(diagnostics);

      // Calculate readiness score
      const healthyCount = diagnostics.filter(d => d.status === 'healthy').length;
      const score = Math.round((healthyCount / diagnostics.length) * 100);
      setReadinessScore(score);

    } catch (error) {
      console.error('System diagnostics failed:', error);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  useEffect(() => {
    runSystemDiagnostics();
    
    // Run diagnostics every 30 seconds
    const interval = setInterval(runSystemDiagnostics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReadinessLevel = () => {
    if (readinessScore >= 90) return { level: 'Production Ready', color: 'text-green-600' };
    if (readinessScore >= 75) return { level: 'Near Production', color: 'text-yellow-600' };
    if (readinessScore >= 60) return { level: 'Development', color: 'text-orange-600' };
    return { level: 'Needs Attention', color: 'text-red-600' };
  };

  const readinessLevel = getReadinessLevel();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Production Readiness Monitor
          <Badge className={getStatusColor(readinessScore >= 90 ? 'healthy' : readinessScore >= 75 ? 'warning' : 'error')}>
            {readinessScore}% Ready
          </Badge>
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            System stability and performance monitoring for production deployment
          </p>
          <Button
            onClick={runSystemDiagnostics}
            disabled={isRunningDiagnostics}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
            {isRunningDiagnostics ? 'Scanning...' : 'Run Diagnostics'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">System Details</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Readiness Score */}
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                <span className={readinessLevel.color}>{readinessScore}%</span>
                {readinessScore >= 90 && <CheckCircle className="h-8 w-8 text-green-600" />}
              </div>
              <div className="text-lg font-medium mb-2">{readinessLevel.level}</div>
              <Progress value={readinessScore} className="w-full max-w-md mx-auto" />
            </div>

            {/* System Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemStatus.map((status, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.status)}
                      <span className="font-medium text-sm">{status.component}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(status.status)}`}>
                      {status.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{status.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {status.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-3">
              {systemStatus.map((status, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusIcon(status.status)}
                    <h3 className="font-medium">{status.component}</h3>
                    <Badge className={getStatusColor(status.status)}>
                      {status.status}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{status.message}</p>
                  {status.details && (
                    <div className="bg-muted/50 p-3 rounded text-xs">
                      <pre>{JSON.stringify(status.details, null, 2)}</pre>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Last checked: {status.timestamp.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Connection Optimization
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Quality: {connectionStabilizer.connectionQuality} | 
                  Latency: {connectionStabilizer.latency.toFixed(0)}ms |
                  Stable: {connectionStabilizer.isStable ? 'Yes' : 'No'}
                </p>
                <Button
                  onClick={connectionStabilizer.forceReconnect}
                  size="sm"
                  variant="outline"
                  disabled={connectionStabilizer.isReconnecting}
                >
                  {connectionStabilizer.isReconnecting ? 'Reconnecting...' : 'Force Reconnect'}
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Performance Optimization
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Button
                    onClick={productionOptimizer.optimizeImages}
                    size="sm"
                    variant="outline"
                  >
                    Optimize Images
                  </Button>
                  <Button
                    onClick={productionOptimizer.optimizeLayout}
                    size="sm"
                    variant="outline"
                  >
                    Fix Layout Shifts
                  </Button>
                  <Button
                    onClick={productionOptimizer.optimizeMemory}
                    size="sm"
                    variant="outline"
                  >
                    Clean Memory
                  </Button>
                  <Button
                    onClick={productionOptimizer.analyzeBundleSize}
                    size="sm"
                    variant="outline"
                  >
                    Analyze Bundle
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};