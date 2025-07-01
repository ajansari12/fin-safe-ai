
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Server, 
  Cloud, 
  Zap, 
  Shield, 
  Activity, 
  Globe, 
  Database, 
  Cpu,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Network
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { microservicesRegistry } from "@/services/platform/microservices-registry";
import { intelligentCacheManager } from "@/services/platform/intelligent-cache-manager";
import { performanceMonitor } from "@/services/platform/performance-monitor";

interface PlatformMetrics {
  totalServices: number;
  healthyServices: number;
  averageResponseTime: number;
  totalRequests: number;
  errorRate: number;
  cacheHitRate: number;
  activeRegions: number;
  deployments: number;
}

const PlatformArchitectureDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalServices: 0,
    healthyServices: 0,
    averageResponseTime: 0,
    totalRequests: 0,
    errorRate: 0,
    cacheHitRate: 0,
    activeRegions: 0,
    deployments: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    loadPlatformMetrics();
    const interval = setInterval(loadPlatformMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPlatformMetrics = async () => {
    try {
      // Simulate loading platform metrics
      setMetrics({
        totalServices: 24,
        healthyServices: 23,
        averageResponseTime: 145,
        totalRequests: 1250000,
        errorRate: 0.0023,
        cacheHitRate: 0.94,
        activeRegions: 6,
        deployments: 12
      });
    } catch (error) {
      console.error('Error loading platform metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load platform metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoScale = async () => {
    try {
      await microservicesRegistry.evaluateScaling();
      toast({
        title: "Auto-scaling initiated",
        description: "Services are being scaled based on current demand"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate auto-scaling",
        variant: "destructive"
      });
    }
  };

  const handleCacheOptimization = async () => {
    try {
      await intelligentCacheManager.optimizeCacheConfiguration('default');
      toast({
        title: "Cache optimization completed",
        description: "Cache configuration has been optimized for better performance"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to optimize cache configuration",
        variant: "destructive"
      });
    }
  };

  const handlePerformanceAnalysis = async () => {
    try {
      const report = await performanceMonitor.generatePerformanceReport({
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date()
      });
      
      toast({
        title: "Performance analysis completed",
        description: "Detailed performance report has been generated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate performance analysis",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading platform metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Status Alert */}
      <Alert className="border-l-4 border-l-green-500">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>Platform Status:</strong> All systems operational ({metrics.healthyServices}/{metrics.totalServices} services healthy)
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAutoScale} size="sm" variant="outline">
                Auto-Scale Services
              </Button>
              <Button onClick={handleCacheOptimization} size="sm" variant="outline">
                Optimize Cache
              </Button>
              <Button onClick={handlePerformanceAnalysis} size="sm" variant="outline">
                Performance Analysis
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Platform Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Server className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.healthyServices} healthy, {metrics.totalServices - metrics.healthyServices} unhealthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average across all services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.totalRequests / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              Requests processed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.errorRate * 100).toFixed(3)}%</div>
            <p className="text-xs text-muted-foreground">
              Well below SLA threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.cacheHitRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Multi-tier caching performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Regions</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeRegions}</div>
            <p className="text-xs text-muted-foreground">
              Global deployment footprint
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <Cloud className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.deployments}</div>
            <p className="text-xs text-muted-foreground">
              Successful deployments today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <Cpu className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">Excellent</div>
              <Badge variant="outline" className="text-green-600 bg-green-50">
                99.97%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Overall system availability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Platform Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="microservices">Microservices</TabsTrigger>
          <TabsTrigger value="caching">Caching</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Architecture Overview</CardTitle>
                <CardDescription>High-level platform architecture status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Microservices Architecture</span>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Service Mesh</span>
                    <Badge variant="outline" className="text-blue-600">Optimized</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Gateway</span>
                    <Badge variant="outline" className="text-green-600">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Event-Driven Architecture</span>
                    <Badge variant="outline" className="text-purple-600">Processing</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Circuit Breakers</span>
                    <Badge variant="outline" className="text-orange-600">Monitoring</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>Real-time performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Response times optimized</p>
                      <p className="text-xs text-muted-foreground">Average 145ms across all services</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Auto-scaling active</p>
                      <p className="text-xs text-muted-foreground">3 services scaled in last hour</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Cache optimization completed</p>
                      <p className="text-xs text-muted-foreground">Hit rate improved to 94%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="microservices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Microservices Management</CardTitle>
              <CardDescription>Service registry, discovery, and health monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Auth Service</h4>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">4 instances running</p>
                    <p className="text-xs text-muted-foreground">v2.1.3 • us-east-1, eu-west-1</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Document Service</h4>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">6 instances running</p>
                    <p className="text-xs text-muted-foreground">v1.8.2 • global deployment</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Analytics Service</h4>
                      <Badge className="bg-yellow-100 text-yellow-800">Scaling</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">3→5 instances</p>
                    <p className="text-xs text-muted-foreground">v3.2.1 • high demand detected</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Caching</CardTitle>
              <CardDescription>Multi-tier caching performance and optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">L1</div>
                    <div className="text-sm font-medium">Memory Cache</div>
                    <div className="text-lg font-semibold">98.2%</div>
                    <div className="text-xs text-muted-foreground">Hit Rate</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">L2</div>
                    <div className="text-sm font-medium">Distributed Cache</div>
                    <div className="text-lg font-semibold">89.7%</div>
                    <div className="text-xs text-muted-foreground">Hit Rate</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">L3</div>
                    <div className="text-sm font-medium">Persistent Cache</div>
                    <div className="text-lg font-semibold">76.3%</div>
                    <div className="text-xs text-muted-foreground">Hit Rate</div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Cache Optimization Recommendations</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Increase TTL for document metadata cache (+15% hit rate projected)</li>
                    <li>• Enable compression for large analytics datasets (-30% memory usage)</li>
                    <li>• Add cache warming for frequently accessed reports</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring</CardTitle>
              <CardDescription>Real-time performance analytics and optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">System Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Response Time</span>
                      <span className="font-mono text-sm">145ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">P95 Response Time</span>
                      <span className="font-mono text-sm">287ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">P99 Response Time</span>
                      <span className="font-mono text-sm">445ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Throughput</span>
                      <span className="font-mono text-sm">2,847 req/s</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">User Experience</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Page Load Time</span>
                      <span className="font-mono text-sm">1.2s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Time to Interactive</span>
                      <span className="font-mono text-sm">1.8s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Largest Contentful Paint</span>
                      <span className="font-mono text-sm">1.4s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cumulative Layout Shift</span>
                      <span className="font-mono text-sm">0.03</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Deployment</CardTitle>
              <CardDescription>Multi-region deployment and disaster recovery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Active Regions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">US East (N. Virginia)</span>
                        <Badge className="bg-green-100 text-green-800">Primary</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">EU West (Ireland)</span>
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Asia Pacific (Tokyo)</span>
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">CA Central (Toronto)</span>
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Disaster Recovery</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">RTO (Recovery Time Objective)</span>
                        <span className="font-mono text-sm text-green-600">< 15 min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">RPO (Recovery Point Objective)</span>
                        <span className="font-mono text-sm text-green-600">< 5 min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last DR Test</span>
                        <span className="font-mono text-sm">2 days ago</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">DR Test Result</span>
                        <Badge className="bg-green-100 text-green-800">Passed</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Monitoring</CardTitle>
              <CardDescription>Comprehensive system monitoring and alerting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Active Monitors</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Application Performance Monitoring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Real User Monitoring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Synthetic Transactions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Infrastructure Monitoring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Security Monitoring</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Alert Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Active Alerts</span>
                        <Badge variant="outline">0</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Alerts Today</span>
                        <Badge variant="outline">3</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">MTTR (Mean Time to Resolution)</span>
                        <span className="font-mono text-sm">8.5 min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Alert Noise Ratio</span>
                        <span className="font-mono text-sm text-green-600">2.1%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformArchitectureDashboard;
