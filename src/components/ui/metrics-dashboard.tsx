import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';

interface MetricData {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'good' | 'warning' | 'critical';
  target?: number;
  description?: string;
}

interface MetricsDashboardProps {
  title?: string;
  metrics: MetricData[];
  compact?: boolean;
  showTrends?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  title = "Performance Metrics",
  metrics,
  compact = false,
  showTrends = true,
  autoRefresh = false,
  refreshInterval = 5000
}) => {
  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${Math.round(value)}${unit}`;
    if (unit === 'ms') return `${Math.round(value)}${unit}`;
    if (unit === 'MB') return `${(value / 1024 / 1024).toFixed(1)}${unit}`;
    if (unit === 'ops/s') return `${Math.round(value)}${unit}`;
    return `${value}${unit}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': 
        return <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Good</Badge>;
      case 'warning': 
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case 'critical': 
        return <Badge className="bg-red-100 text-red-800 text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>;
      default: 
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateProgress = (metric: MetricData) => {
    if (!metric.target) return null;
    return Math.min((metric.value / metric.target) * 100, 100);
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{title}</CardTitle>
            {autoRefresh && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3 w-3 animate-pulse" />
                Live
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric) => (
              <div key={metric.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{metric.name}</span>
                  {getStatusBadge(metric.status)}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm">{formatValue(metric.value, metric.unit)}</span>
                  {showTrends && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className="text-xs text-muted-foreground">
                        {metric.trendValue > 0 ? '+' : ''}{metric.trendValue}%
                      </span>
                    </div>
                  )}
                </div>
                {metric.target && (
                  <Progress 
                    value={calculateProgress(metric) || 0} 
                    className="h-1"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {autoRefresh && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Auto-refresh every {refreshInterval / 1000}s</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                {getStatusBadge(metric.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">{formatValue(metric.value, metric.unit)}</span>
                  {showTrends && (
                    <div className="flex items-center gap-1 mb-1">
                      {getTrendIcon(metric.trend)}
                      <span className="text-sm text-muted-foreground">
                        {metric.trendValue > 0 ? '+' : ''}{metric.trendValue}%
                      </span>
                    </div>
                  )}
                </div>
                
                {metric.target && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress to target</span>
                      <span>{formatValue(metric.target, metric.unit)}</span>
                    </div>
                    <Progress 
                      value={calculateProgress(metric) || 0} 
                      className="h-2"
                    />
                  </div>
                )}
                
                {metric.description && (
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};