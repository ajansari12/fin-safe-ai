import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, AlertTriangle, Target, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { aiAnalyticsService, AIInsight, AnalyticsResult } from '@/services/ai-analytics-service';
import { useToast } from '@/hooks/use-toast';

const PredictiveRiskDashboard: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyticsResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStoredInsights();
  }, []);

  const loadStoredInsights = async () => {
    try {
      const storedInsights = await aiAnalyticsService.getStoredInsights();
      const predictiveInsights = storedInsights.filter(insight => 
        insight.type === 'predictive_alert' || insight.type === 'predictive'
      );
      setInsights(predictiveInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const generatePredictiveAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await aiAnalyticsService.generatePredictiveAnalysis();
      setAnalysisResult(result);
      
      if (result.success) {
        setInsights(prev => [...result.insights, ...prev]);
        toast({
          title: "Predictive Analysis Complete",
          description: `Generated ${result.insights.length} new insights from ${result.dataPointsAnalyzed} data points`,
        });
      } else {
        toast({
          title: "Analysis Error",
          description: result.error || "Failed to generate predictive insights",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate predictive analysis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  // Mock data for trend visualization
  const trendData = [
    { month: 'Jan', riskScore: 65, predicted: 68 },
    { month: 'Feb', riskScore: 72, predicted: 75 },
    { month: 'Mar', riskScore: 68, predicted: 71 },
    { month: 'Apr', riskScore: 75, predicted: 78 },
    { month: 'May', riskScore: 71, predicted: 74 },
    { month: 'Jun', riskScore: 79, predicted: 82 },
  ];

  const confidenceData = insights.map((insight, index) => ({
    name: `Insight ${index + 1}`,
    confidence: Math.round(insight.confidence * 100),
    severity: insight.severity
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Predictive Risk Analytics</h2>
          <p className="text-muted-foreground">
            AI-powered risk forecasting and early warning system
          </p>
        </div>
        <Button 
          onClick={generatePredictiveAnalysis} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate Analysis
            </>
          )}
        </Button>
      </div>

      {/* Analysis Status */}
      {analysisResult && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            Latest analysis completed at {new Date(analysisResult.generatedAt).toLocaleString()}.
            Analyzed {analysisResult.dataPointsAnalyzed} data points and generated {analysisResult.insights.length} insights.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
          <TabsTrigger value="trends">Risk Trends</TabsTrigger>
          <TabsTrigger value="confidence">Confidence Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Brain className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No predictive insights available. Generate analysis to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(insight.severity)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSeverityColor(insight.severity)}>
                          {insight.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{insight.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Confidence Score */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Prediction Confidence</span>
                          <span>{Math.round(insight.confidence * 100)}%</span>
                        </div>
                        <Progress value={insight.confidence * 100} className="h-2" />
                      </div>

                      {/* Recommendations */}
                      {insight.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Recommended Actions:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Data Points */}
                      {insight.dataPoints.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Supporting Data:</h4>
                          <div className="flex flex-wrap gap-2">
                            {insight.dataPoints.slice(0, 3).map((point, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {typeof point === 'object' ? Object.keys(point)[0] : point}
                              </Badge>
                            ))}
                            {insight.dataPoints.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{insight.dataPoints.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Generated: {new Date(insight.generatedAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Score Trends & Predictions</CardTitle>
              <CardDescription>
                Historical risk scores with AI-generated predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="riskScore" 
                      stackId="1" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                      name="Historical Risk Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="hsl(var(--destructive))" 
                      strokeDasharray="5 5"
                      name="Predicted Risk Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Confidence Analysis</CardTitle>
              <CardDescription>
                Confidence levels for generated insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {confidenceData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-20 text-sm font-medium">{item.name}</div>
                    <div className="flex-1">
                      <Progress value={item.confidence} className="h-2" />
                    </div>
                    <div className="w-16 text-sm text-right">{item.confidence}%</div>
                    <Badge variant={getSeverityColor(item.severity)} className="w-16 justify-center">
                      {item.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveRiskDashboard;