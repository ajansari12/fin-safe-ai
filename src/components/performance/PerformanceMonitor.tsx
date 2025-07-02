import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Database, 
  Wifi, 
  HardDrive, 
  Cpu,
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; severity: string }>>([]);

  // Simulate real-time performance data
  useEffect(() => {
    const generateMetrics = (): PerformanceMetric[] => [
      {
        id: 'response-time',
        name: 'Response Time',
        value: Math.random() * 500 + 100,
        unit: 'ms',
        threshold: 300,
        status: Math.random() > 0.7 ? 'warning' : 'good',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: <Zap className="h-4 w-4" />
      },
      {
        id: 'throughput',
        name: 'Throughput',
        value: Math.random() * 100 + 50,
        unit: 'req/s',
        threshold: 80,
        status: Math.random() > 0.8 ? 'critical' : 'good',
        trend: 'stable',
        icon: <Activity className="h-4 w-4" />
      },
      {
        id: 'cpu',
        name: 'CPU Usage',
        value: Math.random() * 100,
        unit: '%',
        threshold: 80,
        status: Math.random() > 0.6 ? 'warning' : 'good',
        trend: 'up',
        icon: <Cpu className="h-4 w-4" />
      },
      {
        id: 'memory',
        name: 'Memory Usage',
        value: Math.random() * 100,
        unit: '%',
        threshold: 85,
        status: 'good',
        trend: 'down',
        icon: <MemoryStick className="h-4 w-4" />
      },
      {
        id: 'database',
        name: 'DB Connections',
        value: Math.floor(Math.random() * 50 + 10),
        unit: 'active',
        threshold: 40,
        status: 'good',
        trend: 'stable',
        icon: <Database className="h-4 w-4" />
      },
      {
        id: 'network',
        name: 'Network Latency',
        value: Math.random() * 100 + 20,
        unit: 'ms',
        threshold: 80,
        status: 'good',
        trend: 'down',
        icon: <Wifi className="h-4 w-4" />
      }
    ];

    const updateData = () => {
      if (!isMonitoring) return;

      const newMetrics = generateMetrics();
      setMetrics(newMetrics);

      // Add new performance data point
      const now = new Date();
      const newDataPoint: PerformanceData = {
        timestamp: now.toLocaleTimeString(),
        responseTime: newMetrics[0].value,
        throughput: newMetrics[1].value,
        errorRate: Math.random() * 5,
        cpuUsage: newMetrics[2].value,
        memoryUsage: newMetrics[3].value
      };

      setPerformanceData(prev => {
        const updated = [...prev, newDataPoint];
        return updated.slice(-20); // Keep last 20 data points
      });

      // Check for alerts
      const newAlerts = newMetrics
        .filter(metric => metric.status === 'critical' || metric.status === 'warning')
        .map(metric => ({
          id: metric.id,
          message: `${metric.name} is ${metric.status === 'critical' ? 'critical' : 'elevated'}: ${metric.value.toFixed(1)}${metric.unit}`,
          severity: metric.status
        }));

      setAlerts(newAlerts);
    };

    updateData();
    const interval = setInterval(updateData, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />;
      default: return <div className="h-3 w-3 rounded-full bg-gray-400" />;
    }
  };

  const calculateHealthScore = () => {
    const goodMetrics = metrics.filter(m => m.status === 'good').length;
    return Math.round((goodMetrics / metrics.length) * 100) || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">
            Real-time system performance and health monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            className={`${calculateHealthScore() >= 80 ? 'bg-green-500' : calculateHealthScore() >= 60 ? 'bg-orange-500' : 'bg-red-500'}`}
          >
            Health: {calculateHealthScore()}%
          </Badge>
          <Button 
            variant={isMonitoring ? "destructive" : "default"}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'Stop' : 'Start'} Monitoring
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert key={alert.id} className={getStatusColor(alert.severity)}>
              {getStatusIcon(alert.severity)}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className={`border-l-4 ${
            metric.status === 'critical' ? 'border-l-red-500' :
            metric.status === 'warning' ? 'border-l-orange-500' : 'border-l-green-500'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className="flex items-center gap-2">
                {metric.icon}
                {getTrendIcon(metric.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}{metric.unit}
              </div>
              <div className="mt-2">
                <Progress 
                  value={metric.unit === '%' ? metric.value : (metric.value / metric.threshold) * 100} 
                  className="h-2"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Threshold: {metric.threshold}{metric.unit}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
            <CardDescription>Real-time response time monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
            <CardDescription>CPU and memory usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="cpuUsage" 
                  stackId="1"
                  stroke="hsl(var(--destructive))" 
                  fill="hsl(var(--destructive) / 0.3)"
                />
                <Area 
                  type="monotone" 
                  dataKey="memoryUsage" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.3)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status Overview</CardTitle>
          <CardDescription>Comprehensive system health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="font-medium">System Status</span>
              </div>
              <Badge className="bg-green-500">Operational</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Database</span>
              </div>
              <Badge className="bg-green-500">Connected</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Storage</span>
              </div>
              <Badge variant="outline">78% Used</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;