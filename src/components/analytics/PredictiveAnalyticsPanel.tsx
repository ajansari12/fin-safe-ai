import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  AlertTriangle,
  Zap,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useDataAvailability, usePredictiveMetrics, useRealTimeAlerts } from '@/hooks/useAnalyticsQueries';
import { type PredictiveMetric, type RealTimeAlert } from '@/services/enhanced-analytics-service';
import PredictiveEmptyState from './PredictiveEmptyState';
import PredictiveAnalyticsSkeleton from './PredictiveAnalyticsSkeleton';
import PredictiveAnalyticsErrorBoundary from './PredictiveAnalyticsErrorBoundary';
import { toast } from 'sonner';

const PredictiveAnalyticsPanel: React.FC = () => {
  // Use React Query hooks for data fetching
  const { 
    data: dataAvailability, 
    isLoading: isCheckingData, 
    error: dataError,
    refetch: refetchDataAvailability 
  } = useDataAvailability();

  const isReadyForPredictive = dataAvailability?.readyForPredictive ?? false;

  const { 
    data: predictiveMetrics = [], 
    isLoading: isLoadingMetrics, 
    error: metricsError,
    refetch: refetchMetrics 
  } = usePredictiveMetrics(isReadyForPredictive);

  const { 
    data: realTimeAlerts = [], 
    isLoading: isLoadingAlerts, 
    error: alertsError,
    refetch: refetchAlerts 
  } = useRealTimeAlerts(isReadyForPredictive);

  const isLoading = isCheckingData || (isReadyForPredictive && (isLoadingMetrics || isLoadingAlerts));

  const handleRefresh = () => {
    refetchDataAvailability();
    if (isReadyForPredictive) {
      refetchMetrics();
      refetchAlerts();
    }
    toast.success('Data refreshed');
  };

  // Show error if there's a critical error
  if (dataError) {
    return (
      <PredictiveAnalyticsErrorBoundary>
        <div>Error loading data availability</div>
      </PredictiveAnalyticsErrorBoundary>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return `${diffDays}d ago`;
    }
  };

  // Generate trend data for visualization
  const generateTrendData = (metric: PredictiveMetric) => {
    const data = [];
    const today = new Date();
    
    // Historical points (simplified)
    for (let i = 30; i >= 0; i -= 5) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * metric.current_value * 0.2;
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, metric.current_value + variation),
        type: 'historical'
      });
    }
    
    // Prediction point
    data.push({
      date: metric.prediction_date,
      value: metric.predicted_value,
      type: 'predicted',
      confidence_min: metric.confidence_interval[0],
      confidence_max: metric.confidence_interval[1]
    });
    
    return data;
  };

  if (isLoading) {
    return <PredictiveAnalyticsSkeleton />;
  }

  // Show empty state if no data is available
  if (!isReadyForPredictive) {
    return <PredictiveEmptyState />;
  }

  return (
    <PredictiveAnalyticsErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Predictive Analytics & Real-Time Monitoring</h3>
            <p className="text-sm text-muted-foreground">
              Real-time data with automatic refresh
            </p>
          </div>
          <Button 
            onClick={handleRefresh}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-Time Alerts
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Trend Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          {predictiveMetrics.length > 0 ? (
            <div className="grid gap-4">
              {predictiveMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {metric.metric} Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current Value</span>
                          <span className="font-semibold">{metric.current_value}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Predicted Value</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{metric.predicted_value}</span>
                            {metric.predicted_value > metric.current_value ? (
                              <TrendingUp className="h-4 w-4 text-red-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Confidence Range</span>
                          <span className="text-sm">
                            {metric.confidence_interval[0]} - {metric.confidence_interval[1]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Prediction Date</span>
                          <span className="text-sm">{new Date(metric.prediction_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={generateTrendData(metric)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 10 }}
                              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip 
                              labelFormatter={(date) => new Date(date).toLocaleDateString()}
                              formatter={(value: any, name: string) => [
                                typeof value === 'number' ? value.toFixed(1) : value,
                                name === 'value' ? metric.metric : name
                              ]}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="hsl(var(--primary))" 
                              fill="hsl(var(--primary))" 
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Key Factors:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {metric.factors.map((factor, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No predictive metrics available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Continue collecting data to enable predictive analytics.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          {realTimeAlerts.length > 0 ? (
            <div className="space-y-3">
              {realTimeAlerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">{alert.type}</span>
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Source: {alert.source}</span>
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Acknowledge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No active alerts at this time.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All systems are operating within normal parameters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trend Analysis Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced trend analysis and pattern recognition features will be available in the next update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PredictiveAnalyticsErrorBoundary>
  );
};

export default PredictiveAnalyticsPanel;