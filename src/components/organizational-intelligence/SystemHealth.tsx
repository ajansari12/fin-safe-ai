
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  RefreshCw,
  Database,
  Server,
  Globe,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface HealthCheck {
  id: string;
  name: string;
  category: 'database' | 'api' | 'security' | 'infrastructure';
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  responseTime?: number;
  lastCheck: string;
  message?: string;
  uptime?: number;
}

interface SystemHealthProps {
  orgId: string;
}

const SystemHealth: React.FC<SystemHealthProps> = ({ orgId }) => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    runHealthChecks();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(runHealthChecks, 120000);
    
    return () => clearInterval(interval);
  }, [orgId]);

  const runHealthChecks = async () => {
    try {
      setLoading(true);
      
      // Mock health check data
      const mockChecks: HealthCheck[] = [
        {
          id: 'db-primary',
          name: 'Primary Database',
          category: 'database',
          status: 'healthy',
          responseTime: 12,
          lastCheck: new Date().toISOString(),
          uptime: 99.9,
          message: 'All database operations nominal'
        },
        {
          id: 'api-gateway',
          name: 'API Gateway',
          category: 'api',
          status: 'healthy',
          responseTime: 45,
          lastCheck: new Date().toISOString(),
          uptime: 99.8,
          message: 'API endpoints responding normally'
        },
        {
          id: 'auth-service',
          name: 'Authentication Service',
          category: 'security',
          status: 'warning',
          responseTime: 180,
          lastCheck: new Date().toISOString(),
          uptime: 98.5,
          message: 'Elevated response times detected'
        },
        {
          id: 'web-service',
          name: 'Web Application',
          category: 'infrastructure',
          status: 'healthy',
          responseTime: 89,
          lastCheck: new Date().toISOString(),
          uptime: 99.7,
          message: 'Application server healthy'
        },
        {
          id: 'backup-system',
          name: 'Backup System',
          category: 'infrastructure',
          status: 'critical',
          responseTime: undefined,
          lastCheck: new Date(Date.now() - 3600000).toISOString(),
          uptime: 95.2,
          message: 'Backup service unreachable'
        },
        {
          id: 'monitoring',
          name: 'Monitoring Service',
          category: 'infrastructure',
          status: 'healthy',
          responseTime: 23,
          lastCheck: new Date().toISOString(),
          uptime: 99.9,
          message: 'All monitoring systems operational'
        }
      ];

      setHealthChecks(mockChecks);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error running health checks:', error);
      toast.error('Failed to run health checks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'api': return <Globe className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'infrastructure': return <Server className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const overallHealth = {
    healthy: healthChecks.filter(c => c.status === 'healthy').length,
    warning: healthChecks.filter(c => c.status === 'warning').length,
    critical: healthChecks.filter(c => c.status === 'critical').length,
    total: healthChecks.length
  };

  const overallStatus = overallHealth.critical > 0 ? 'critical' : 
                      overallHealth.warning > 0 ? 'warning' : 'healthy';

  const averageUptime = healthChecks.reduce((sum, check) => sum + (check.uptime || 0), 0) / healthChecks.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">System Health</h2>
            <p className="text-muted-foreground">
              Real-time system health monitoring and diagnostics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Last check: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button onClick={runHealthChecks} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overall Status Alert */}
      {overallStatus !== 'healthy' && (
        <Alert variant={overallStatus === 'critical' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {overallStatus === 'critical' 
              ? `${overallHealth.critical} critical issue(s) detected. Immediate attention required.`
              : `${overallHealth.warning} warning(s) detected. System monitoring recommended.`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Health Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            {getStatusIcon(overallStatus)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{overallStatus}</div>
            <p className="text-xs text-muted-foreground">
              {overallHealth.healthy}/{overallHealth.total} services healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageUptime.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average system uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overallHealth.warning}</div>
            <p className="text-xs text-muted-foreground">
              Active warnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallHealth.critical}</div>
            <p className="text-xs text-muted-foreground">
              Critical issues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Health Checks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Service Status</h3>
        
        {healthChecks.map((check) => (
          <Card key={check.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(check.category)}
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {check.message}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {check.responseTime && (
                    <div className="text-right">
                      <div className="text-sm font-medium">{check.responseTime}ms</div>
                      <div className="text-xs text-muted-foreground">Response</div>
                    </div>
                  )}
                  
                  {check.uptime && (
                    <div className="text-right">
                      <div className="text-sm font-medium">{check.uptime}%</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                  )}
                  
                  <Badge variant={getStatusColor(check.status) as any} className="min-w-[80px] justify-center">
                    {getStatusIcon(check.status)}
                    {check.status}
                  </Badge>
                </div>
              </div>
              
              {check.uptime && (
                <div className="mt-3">
                  <Progress value={check.uptime} className="h-1" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SystemHealth;
