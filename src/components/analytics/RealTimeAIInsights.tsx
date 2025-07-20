
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Zap, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { useEnhancedAIAnalytics } from '@/hooks/useEnhancedAIAnalytics';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface RealTimeAIInsightsProps {
  className?: string;
  maxInsights?: number;
  autoRefresh?: boolean;
}

export const RealTimeAIInsights: React.FC<RealTimeAIInsightsProps> = ({
  className,
  maxInsights = 5,
  autoRefresh = true
}) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { data, isLoading, isGenerating, generateAIInsights } = useEnhancedAIAnalytics();

  // Subscribe to real-time data changes that might trigger new insights
  useRealtimeSubscription({
    table: 'kri_logs',
    onInsert: () => {
      if (autoRefresh) {
        generateAIInsights('comprehensive');
        setLastUpdate(new Date());
      }
    },
    enabled: autoRefresh
  });

  useRealtimeSubscription({
    table: 'appetite_breach_logs',
    onInsert: () => {
      if (autoRefresh) {
        generateAIInsights('anomaly');
        setLastUpdate(new Date());
      }
    },
    enabled: autoRefresh
  });

  useRealtimeSubscription({
    table: 'incident_logs',
    onInsert: () => {
      if (autoRefresh) {
        generateAIInsights('predictive');
        setLastUpdate(new Date());
      }
    },
    enabled: autoRefresh
  });

  const recentInsights = data?.insights
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
    .slice(0, maxInsights) || [];

  const criticalInsights = recentInsights.filter(insight => 
    insight.severity === 'critical' || insight.severity === 'high'
  );

  const getInsightIcon = (type: string, severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    
    switch (type) {
      case 'predictive': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Brain className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-base">Real-Time AI Insights</CardTitle>
            {criticalInsights.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalInsights.length} Critical
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateAIInsights('comprehensive')}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentInsights.length > 0 ? (
          <div className="space-y-3">
            {recentInsights.map((insight) => (
              <div
                key={insight.id}
                className={`p-3 rounded-lg border ${
                  insight.severity === 'critical' 
                    ? 'bg-red-50 border-red-200' 
                    : insight.severity === 'high'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {getInsightIcon(insight.type, insight.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">
                        {insight.title}
                      </h4>
                      <Badge 
                        variant={insight.severity === 'critical' ? 'destructive' : 'outline'}
                        className="text-xs ml-2 flex-shrink-0"
                      >
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {insight.description}
                    </p>
                    {insight.actionable && (
                      <div className="flex items-center gap-1 mt-2">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-yellow-700">Action Required</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(insight.confidence * 100)}% confidence • 
                      {new Date(insight.generatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No recent AI insights available
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateAIInsights('comprehensive')}
              disabled={isGenerating}
              className="mt-2"
            >
              Generate Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeAIInsights;
