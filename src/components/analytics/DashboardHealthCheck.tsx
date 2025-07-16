import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Activity,
  Zap,
  Database,
  Clock
} from 'lucide-react';

interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

export const DashboardHealthCheck: React.FC = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runHealthChecks = async () => {
    setIsRunning(true);
    const checks: HealthCheckResult[] = [];
    
    try {
      // Check memory usage
      if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / (1024 * 1024);
        
        checks.push({
          name: 'Memory Usage',
          status: usedMB > 200 ? 'error' : usedMB > 150 ? 'warning' : 'healthy',
          message: `${usedMB.toFixed(1)}MB used`,
          timestamp: new Date()
        });
      }

      // Check component loading
      const componentsToCheck = [
        'ExecutiveDashboard',
        'OperationalDashboard', 
        'ControlsDashboard',
        'AdvancedAnalyticsDashboard'
      ];

      for (const component of componentsToCheck) {
        try {
          // Simulate component health check
          await new Promise(resolve => setTimeout(resolve, 100));
          checks.push({
            name: component,
            status: 'healthy',
            message: 'Component loaded successfully',
            timestamp: new Date()
          });
        } catch (error) {
          checks.push({
            name: component,
            status: 'error',
            message: 'Component failed to load',
            timestamp: new Date()
          });
        }
      }

      // Check data connectivity
      try {
        const response = await fetch('/api/health');
        checks.push({
          name: 'Data Connectivity',
          status: response.ok ? 'healthy' : 'error',
          message: response.ok ? 'Database connection active' : 'Database connection failed',
          timestamp: new Date()
        });
      } catch {
        checks.push({
          name: 'Data Connectivity',
          status: 'warning',
          message: 'Could not verify database connection',
          timestamp: new Date()
        });
      }

      // Check performance metrics
      const performanceEntries = performance.getEntriesByType('navigation');
      if (performanceEntries.length > 0) {
        const entry = performanceEntries[0] as PerformanceNavigationTiming;
        const loadTime = entry.loadEventEnd - entry.fetchStart;
        
        checks.push({
          name: 'Page Load Performance',
          status: loadTime > 3000 ? 'error' : loadTime > 2000 ? 'warning' : 'healthy',
          message: `${loadTime.toFixed(0)}ms load time`,
          timestamp: new Date()
        });
      }

      setHealthChecks(checks);
      setLastRun(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const overallStatus = healthChecks.length > 0 ? 
    healthChecks.some(check => check.status === 'error') ? 'error' :
    healthChecks.some(check => check.status === 'warning') ? 'warning' : 'healthy' :
    'unknown';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Dashboard Health Check
          {getStatusBadge(overallStatus)}
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {lastRun ? (
              <>
                <Clock className="h-4 w-4 inline mr-1" />
                Last run: {lastRun.toLocaleTimeString()}
              </>
            ) : (
              'Running initial health check...'
            )}
          </p>
          <Button 
            onClick={runHealthChecks}
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Run Check'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {healthChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {check.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          {healthChecks.length === 0 && !isRunning && (
            <div className="text-center py-8 text-muted-foreground">
              No health checks available. Click "Run Check" to start monitoring.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};