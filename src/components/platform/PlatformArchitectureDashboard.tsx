
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Database,
  Cpu,
  Memory,
  Zap
} from "lucide-react";
import { databaseMicroservicesRegistry, MicroserviceRecord } from "@/services/platform/database-microservices-registry";
import { databasePerformanceMonitor, DashboardMetrics } from "@/services/platform/database-performance-monitor";
import { databaseDeploymentManager, DeploymentRecord } from "@/services/platform/database-deployment-manager";

const PlatformArchitectureDashboard: React.FC = () => {
  const [services, setServices] = useState<MicroserviceRecord[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics[]>([]);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [deploymentStats, setDeploymentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [servicesData, metricsData, deploymentsData, statsData] = await Promise.all([
        databaseMicroservicesRegistry.discoverServices(),
        databasePerformanceMonitor.getDashboardMetrics(),
        databaseDeploymentManager.getActiveDeployments(),
        databaseDeploymentManager.getDeploymentStats(7) // Last 7 days
      ]);

      setServices(servicesData);
      setMetrics(metricsData);
      setDeployments(deploymentsData);
      setDeploymentStats(statsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load platform data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
      case 'completed':
        return 'bg-green-500';
      case 'degraded':
      case 'in_progress':
        return 'bg-yellow-500';
      case 'failed':
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <Button onClick={loadDashboardData} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const healthyServices = services.filter(s => s.status === 'active').length;
  const totalServices = services.length;
  const activeDeployments = deployments.length;
  const systemHealth = totalServices > 0 ? Math.round((healthyServices / totalServices) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyServices}/{totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {systemHealth}% system health
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeployments}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deploymentStats ? Math.round((deploymentStats.successfulDeployments / Math.max(deploymentStats.totalDeployments, 1)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deploy Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deploymentStats ? Math.round(deploymentStats.averageDuration / 60) : 0}m
            </div>
            <p className="text-xs text-muted-foreground">
              Average duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Microservices Registry</CardTitle>
              <CardDescription>
                Active services and their health status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                      <div>
                        <p className="font-medium">{service.service_name}</p>
                        <p className="text-sm text-muted-foreground">
                          v{service.service_version} • {service.environment} • {service.region}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={service.status === 'active' ? 'default' : 'destructive'}>
                        {service.status}
                      </Badge>
                      <Badge variant="outline">
                        {service.instances.length} instances
                      </Badge>
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No services registered yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.slice(0, 4).map((metric) => (
              <Card key={`${metric.service_name}-${metric.metric_hour}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{metric.service_name}</CardTitle>
                  <CardDescription>
                    Last hour metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">CPU Usage</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{Math.round(metric.avg_cpu_usage)}%</div>
                      <Progress value={metric.avg_cpu_usage} className="w-20 h-2" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Memory className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Memory Usage</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{Math.round(metric.avg_memory_usage)}%</div>
                      <Progress value={metric.avg_memory_usage} className="w-20 h-2" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Response Time</span>
                    </div>
                    <div className="text-sm font-medium">{Math.round(metric.avg_response_time)}ms</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Throughput</span>
                    </div>
                    <div className="text-sm font-medium">{Math.round(metric.avg_throughput)} req/s</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {metrics.length === 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  No performance metrics available yet
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deployments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Deployments</CardTitle>
              <CardDescription>
                Currently running deployment operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deployments.map((deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(deployment.status)}`} />
                      <div>
                        <p className="font-medium">{deployment.service_name}</p>
                        <p className="text-sm text-muted-foreground">
                          v{deployment.deployment_version} • {deployment.environment} • {deployment.deployment_strategy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={deployment.status === 'completed' ? 'default' : 'secondary'}>
                        {deployment.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {deployment.deployed_by_name}
                      </span>
                    </div>
                  </div>
                ))}
                {deployments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active deployments
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {deploymentStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deployment Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total:</span>
                    <span className="font-medium">{deploymentStats.totalDeployments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Successful:</span>
                    <span className="font-medium text-green-600">{deploymentStats.successfulDeployments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Failed:</span>
                    <span className="font-medium text-red-600">{deploymentStats.failedDeployments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rollbacks:</span>
                    <span className="font-medium text-yellow-600">{deploymentStats.rollbacks}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">By Environment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(deploymentStats.deploymentsByEnvironment).map(([env, count]) => (
                    <div key={env} className="flex justify-between">
                      <span className="text-sm capitalize">{env}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Duration:</span>
                    <span className="font-medium">{Math.round(deploymentStats.averageDuration / 60)}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate:</span>
                    <span className="font-medium">
                      {Math.round((deploymentStats.successfulDeployments / Math.max(deploymentStats.totalDeployments, 1)) * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={loadDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default PlatformArchitectureDashboard;
