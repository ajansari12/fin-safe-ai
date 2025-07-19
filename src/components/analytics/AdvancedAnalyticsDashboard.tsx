import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Settings, Brain } from 'lucide-react';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import TrendAnalysisCard from './TrendAnalysisCard';
import PredictiveInsightsCard from './PredictiveInsightsCard';
import RiskCorrelationMatrix from './RiskCorrelationMatrix';
import PerformanceDashboard from './PerformanceDashboard';
import { AsyncWrapper } from '@/components/common';

const AdvancedAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const { data, isLoading, error, refresh } = useAdvancedAnalytics(timeRange);

  const handleExport = () => {
    if (!data) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      trends: data.trends,
      correlations: data.correlations,
      insights: data.insights,
      performanceMetrics: data.performanceMetrics,
      anomalies: data.anomalies
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advanced-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AsyncWrapper 
      loading={isLoading} 
      error={error}
      retryAction={refresh}
    >
      <div className="space-y-6">
        {/* Header with controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Advanced Analytics & Insights
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="90d">90 Days</SelectItem>
                    <SelectItem value="180d">6 Months</SelectItem>
                    <SelectItem value="365d">1 Year</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={!data}
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AI-powered insights and predictive analytics for risk management and control effectiveness.
              Data is analyzed across {timeRange.replace('d', ' days')} to identify trends, correlations, and opportunities.
            </p>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        {data && (
          <PerformanceDashboard 
            performanceMetrics={data.performanceMetrics}
            isLoading={isLoading}
          />
        )}

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Analysis */}
          <TrendAnalysisCard 
            trends={data?.trends || []}
            isLoading={isLoading}
          />

          {/* Risk Correlations */}
          <RiskCorrelationMatrix 
            correlations={data?.correlations || []}
            isLoading={isLoading}
          />
        </div>

        {/* Predictive Insights - Full Width */}
        <PredictiveInsightsCard 
          insights={data?.insights || []}
          isLoading={isLoading}
        />

        {/* Anomaly Detection */}
        {data?.anomalies && data.anomalies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Detected Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.anomalies.map((anomaly, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-lg bg-orange-50 border-orange-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        High Variance Detected
                      </span>
                      <span className="text-xs text-orange-600">
                        {anomaly.variance_percentage?.toFixed(1)}% variance
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Anomaly detected on {new Date(anomaly.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AsyncWrapper>
  );
};

export default AdvancedAnalyticsDashboard;