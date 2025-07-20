
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  RefreshCw, 
  Lightbulb,
  BarChart3,
  Network,
  Zap
} from 'lucide-react';
import { useEnhancedAIAnalytics } from '@/hooks/useEnhancedAIAnalytics';
import { AsyncWrapper } from '@/components/common';

interface EnhancedAIAnalyticsDashboardProps {
  className?: string;
  timeRange?: string;
}

export const EnhancedAIAnalyticsDashboard: React.FC<EnhancedAIAnalyticsDashboardProps> = ({ 
  className, 
  timeRange = '30d' 
}) => {
  const [activeTab, setActiveTab] = useState('insights');
  const { data, isLoading, isGenerating, error, generateAIInsights, refresh } = useEnhancedAIAnalytics(timeRange);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'predictive': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'correlation': return <Network className="h-4 w-4 text-purple-500" />;
      case 'recommendation': return <Target className="h-4 w-4 text-green-500" />;
      default: return <BarChart3 className="h-4 w-4 text-orange-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AsyncWrapper loading={isLoading} error={error} retryAction={refresh}>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-500" />
                <div>
                  <CardTitle>AI-Powered Analytics Dashboard</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI insights and predictive analytics for risk management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIInsights('predictive')}
                  disabled={isGenerating}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Predictive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIInsights('anomaly')}
                  disabled={isGenerating}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Anomalies
                </Button>
                <Button
                  onClick={() => generateAIInsights('comprehensive')}
                  disabled={isGenerating}
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Generate Insights'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="predictive">Predictive</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="recommendations">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            {data?.insights && data.insights.length > 0 ? (
              <div className="grid gap-4">
                {data.insights.map((insight) => (
                  <Card key={insight.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(insight.severity)}>
                                {insight.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(insight.confidence * 100)}% confidence
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                          
                          {insight.recommendations && insight.recommendations.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">AI Recommendations:</h5>
                              <ul className="text-sm space-y-1">
                                {insight.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <Zap className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <span>Generated: {new Date(insight.generatedAt).toLocaleString()}</span>
                            <Badge variant="secondary" className="text-xs">
                              {insight.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No AI Insights Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate AI-powered insights to get intelligent analysis of your risk data.
                  </p>
                  <Button onClick={() => generateAIInsights('comprehensive')} disabled={isGenerating}>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate AI Insights
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="predictive" className="space-y-4">
            {data?.predictiveMetrics && data.predictiveMetrics.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {data.predictiveMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{metric.metric}</h4>
                        <Badge variant={metric.riskLevel === 'high' ? 'destructive' : 'outline'}>
                          {metric.riskLevel} risk
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Value:</span>
                          <span className="font-medium">{metric.currentValue.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Predicted Value:</span>
                          <span className="font-medium">{metric.predictedValue.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Trend:</span>
                          <div className="flex items-center gap-1">
                            {metric.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3 text-red-500" />
                            ) : metric.trend === 'down' ? (
                              <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />
                            ) : (
                              <div className="h-3 w-3 bg-gray-400 rounded-full" />
                            )}
                            <span className="capitalize">{metric.trend}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(metric.confidence * 100)}% confidence • {metric.timeframe}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Predictive Metrics Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate predictive analytics to forecast future risk trends.
                  </p>
                  <Button onClick={() => generateAIInsights('predictive')} disabled={isGenerating}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Predictions
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="correlations" className="space-y-4">
            {data?.correlations && data.correlations.length > 0 ? (
              <div className="space-y-4">
                {data.correlations.map((correlation, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">
                          {correlation.source} ↔ {correlation.target}
                        </h4>
                        <Badge variant={correlation.significance === 'high' ? 'default' : 'outline'}>
                          {correlation.significance} significance
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Correlation:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.abs(correlation.correlation) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {(correlation.correlation * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {correlation.description}
                        </p>
                        {correlation.implications && correlation.implications.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium mb-1">Implications:</h5>
                            <ul className="text-sm space-y-1">
                              {correlation.implications.map((implication, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Network className="h-3 w-3 text-purple-500 mt-1 flex-shrink-0" />
                                  {implication}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Correlations Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Analyze correlations between different risk factors and metrics.
                  </p>
                  <Button onClick={() => generateAIInsights('comprehensive')} disabled={isGenerating}>
                    <Network className="h-4 w-4 mr-2" />
                    Analyze Correlations
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            {data?.anomalies && data.anomalies.length > 0 ? (
              <div className="space-y-4">
                {data.anomalies.map((anomaly, index) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div className="flex-1">
                          <h4 className="font-medium">Anomaly Detected</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Unusual pattern detected in risk data requiring attention.
                          </p>
                        </div>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Anomalies Detected</h3>
                  <p className="text-muted-foreground mb-4">
                    AI-powered anomaly detection will identify unusual patterns in your data.
                  </p>
                  <Button onClick={() => generateAIInsights('anomaly')} disabled={isGenerating}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Detect Anomalies
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {data?.recommendations && data.recommendations.length > 0 ? (
              <div className="space-y-4">
                {data.recommendations.map((rec, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-green-500" />
                        <div className="flex-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rec.description}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Recommendations Available</h3>
                  <p className="text-muted-foreground mb-4">
                    AI will generate actionable recommendations based on your risk analysis.
                  </p>
                  <Button onClick={() => generateAIInsights('comprehensive')} disabled={isGenerating}>
                    <Target className="h-4 w-4 mr-2" />
                    Generate Recommendations
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AsyncWrapper>
  );
};

export default EnhancedAIAnalyticsDashboard;
