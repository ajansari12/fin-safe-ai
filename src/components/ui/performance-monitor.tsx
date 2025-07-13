import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Activity, 
  Clock, 
  Zap, 
  Wifi, 
  HardDrive,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';

interface PerformanceMonitorProps {
  metrics: {
    progress: number;
    duration?: number;
    currentStep?: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
  };
  realTimeMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
    operationsPerSecond: number;
  };
  insights?: Array<{
    type: 'warning' | 'info' | 'error';
    message: string;
    recommendation: string;
  }>;
  showDetailedMetrics?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  metrics,
  realTimeMetrics,
  insights = [],
  showDetailedMetrics = true
}) => {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const getStatusIcon = () => {
    switch (metrics.status) {
      case 'running':
        return <Activity className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (metrics.status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
    }
  };

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-4">
      {/* Main Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            Operation Progress
            <Badge variant="outline" className={getStatusColor()}>
              {metrics.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{metrics.currentStep || 'Processing...'}</span>
              <span>{Math.round(metrics.progress)}%</span>
            </div>
            <Progress value={metrics.progress} className="h-2" />
          </div>
          
          {metrics.duration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Duration: {formatDuration(metrics.duration)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      {showDetailedMetrics && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <HardDrive className="h-3 w-3" />
                        <span>Memory</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={realTimeMetrics.memoryUsage} className="h-1 flex-1" />
                        <span className={`text-xs ${getMetricColor(realTimeMetrics.memoryUsage, { warning: 70, critical: 90 })}`}>
                          {Math.round(realTimeMetrics.memoryUsage)}%
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Memory usage of the current operation
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Wifi className="h-3 w-3" />
                        <span>Network</span>
                      </div>
                      <div className="text-xs">
                        <span className={getMetricColor(realTimeMetrics.networkLatency, { warning: 1000, critical: 3000 })}>
                          {Math.round(realTimeMetrics.networkLatency)}ms
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Network latency to server
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Zap className="h-3 w-3" />
                        <span>Throughput</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">
                          {Math.round(realTimeMetrics.operationsPerSecond)} ops/s
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Operations processed per second
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 rounded-lg border bg-card/50">
                <div className="flex items-start gap-2">
                  {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                  {insight.type === 'info' && <Info className="h-4 w-4 text-blue-500 mt-0.5" />}
                  {insight.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{insight.message}</p>
                    <p className="text-xs text-muted-foreground">{insight.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};