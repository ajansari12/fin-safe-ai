
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

interface RealTimeMetricCardProps {
  title: string;
  config: {
    value?: number;
    threshold?: number;
    trend?: 'up' | 'down' | 'stable';
    status?: 'normal' | 'warning' | 'critical';
    unit?: string;
    target?: number;
  };
  realTimeEnabled?: boolean;
}

const RealTimeMetricCard: React.FC<RealTimeMetricCardProps> = ({
  title,
  config = {},
  realTimeEnabled = false
}) => {
  const [currentValue, setCurrentValue] = useState(config.value || 0);
  const [trend, setTrend] = useState(config.trend || 'stable');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      // Simulate real-time data updates
      const variation = (Math.random() - 0.5) * 10;
      const newValue = Math.max(0, Math.min(100, currentValue + variation));
      
      setCurrentValue(newValue);
      setTrend(variation > 2 ? 'up' : variation < -2 ? 'down' : 'stable');
      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, [realTimeEnabled, currentValue]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const getTrendIcon = (trendDirection: string) => {
    switch (trendDirection) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const status = currentValue > (config.threshold || 80) ? 'critical' : 
                 currentValue > (config.threshold || 80) * 0.8 ? 'warning' : 'normal';
  
  const StatusIcon = getStatusIcon(status);
  const TrendIcon = getTrendIcon(trend);
  const progressValue = config.target ? (currentValue / config.target) * 100 : currentValue;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {realTimeEnabled && (
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          )}
          <StatusIcon className={`h-4 w-4 ${getStatusColor(status)}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main Value */}
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold">
              {currentValue.toFixed(1)}
            </span>
            {config.unit && (
              <span className="text-sm text-muted-foreground">{config.unit}</span>
            )}
            <div className="flex items-center space-x-1">
              <TrendIcon className={`h-3 w-3 ${
                trend === 'up' ? 'text-green-500' : 
                trend === 'down' ? 'text-red-500' : 
                'text-gray-500'
              }`} />
              <span className={`text-xs ${
                trend === 'up' ? 'text-green-500' : 
                trend === 'down' ? 'text-red-500' : 
                'text-gray-500'
              }`}>
                {trend === 'stable' ? 'Stable' : 
                 trend === 'up' ? '+2.3%' : '-1.8%'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-muted-foreground">
                {progressValue.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={progressValue} 
              className={`h-2 ${
                status === 'critical' ? 'bg-red-100' :
                status === 'warning' ? 'bg-yellow-100' : 
                'bg-green-100'
              }`}
            />
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={
                status === 'critical' ? 'destructive' :
                status === 'warning' ? 'secondary' : 
                'default'
              }
              className="text-xs"
            >
              {status.toUpperCase()}
            </Badge>
            
            {config.threshold && (
              <span className="text-xs text-muted-foreground">
                Threshold: {config.threshold}{config.unit}
              </span>
            )}
          </div>

          {/* Last Update */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
            {config.target && (
              <span>Target: {config.target}{config.unit}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeMetricCard;
