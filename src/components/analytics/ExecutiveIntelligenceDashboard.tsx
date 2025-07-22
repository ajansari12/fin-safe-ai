
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users,
  FileText,
  Clock,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Download
} from 'lucide-react';
import { advancedAnalyticsEngine, type ExecutiveBrief, type PredictiveInsight } from '@/services/ai/advanced-analytics-engine';
import { toast } from 'sonner';

const ExecutiveIntelligenceDashboard: React.FC = () => {
  const [executiveBrief, setExecutiveBrief] = useState<ExecutiveBrief | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBriefType, setSelectedBriefType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    loadExecutiveBrief();
    loadPredictiveInsights();
  }, [selectedBriefType]);

  const loadExecutiveBrief = async () => {
    setIsLoading(true);
    try {
      const brief = await advancedAnalyticsEngine.generateExecutiveBrief(selectedBriefType);
      setExecutiveBrief(brief);
    } catch (error) {
      console.error('Error loading executive brief:', error);
      toast.error('Failed to load executive brief');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPredictiveInsights = async () => {
    try {
      const insights = await advancedAnalyticsEngine.generatePredictiveInsights({
        analysisType: 'predictive',
        dataSource: ['kri_data', 'incident_data', 'control_data', 'risk_appetite_data'],
        timeRange: {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        parameters: {
          confidenceThreshold: 0.7,
          timeHorizon: 30
        },
        outputFormat: 'json'
      });
      setPredictiveInsights(insights);
    } catch (error) {
      console.error('Error loading predictive insights:', error);
      toast.error('Failed to load predictive insights');
    }
  };

  const handleNaturalLanguageQuery = async () => {
    if (!naturalLanguageQuery.trim()) return;

    setIsLoading(true);
    try {
      const result = await advancedAnalyticsEngine.performNaturalLanguageQuery(naturalLanguageQuery);
      setQueryResult(result);
    } catch (error) {
      console.error('Error processing query:', error);
      toast.error('Failed to process natural language query');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Executive Intelligence Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered insights and strategic intelligence for senior leadership
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadExecutiveBrief}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="executive-brief" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="executive-brief">Executive Brief</TabsTrigger>
          <TabsTrigger value="predictive-insights">Predictive Insights</TabsTrigger>
          <TabsTrigger value="natural-language">AI Query</TabsTrigger>
          <TabsTrigger value="strategic-recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="executive-brief">
          <div className="space-y-6">
            {/* Brief Type Selector */}
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                <Button
                  key={type}
                  variant={selectedBriefType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBriefType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>

            {executiveBrief && (
              <>
                {/* Executive Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed">{executiveBrief.executive_summary}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Generated: {new Date(executiveBrief.generated_at).toLocaleString()}
                      </span>
                      <span>Brief Type: {executiveBrief.brief_type}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Key Strategic Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {executiveBrief.key_insights.map((insight, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <div className="flex gap-2">
                              <Badge variant={getSeverityColor(insight.impact_level)}>
                                {insight.impact_level}
                              </Badge>
                              <Badge variant="outline">
                                {Math.round(insight.confidence * 100)}% confidence
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                          <div className="text-xs text-muted-foreground">
                            Source: {insight.data_source} | Category: {insight.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Critical Risk Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {executiveBrief.risk_alerts.map((alert, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold">{alert.risk_type}</h4>
                            <div className="flex gap-2">
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              {alert.escalation_required && (
                                <Badge variant="destructive">Escalation Required</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm mb-3">{alert.description}</p>
                          <div className="bg-muted p-3 rounded mb-3">
                            <p className="text-sm"><strong>Impact:</strong> {alert.impact_estimate}</p>
                            <p className="text-sm"><strong>Probability:</strong> {Math.round(alert.probability * 100)}%</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">Recommended Actions:</h5>
                            <ul className="text-sm space-y-1">
                              {alert.recommended_actions.map((action, actionIndex) => (
                                <li key={actionIndex} className="flex items-start gap-2">
                                  <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="predictive-insights">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Predictive Risk Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {predictiveInsights.map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold capitalize">
                            {insight.insight_type.replace('_', ' ')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {insight.time_horizon} day forecast
                          </p>
                        </div>
                        <Badge variant="outline">
                          {Math.round(insight.confidence_score * 100)}% confidence
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Analysis Summary</h4>
                        <p className="text-sm leading-relaxed">{insight.narrative_summary}</p>
                      </div>

                      {insight.actionable_recommendations.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {insight.actionable_recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Generated: {new Date(insight.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="natural-language">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Natural Language Query Interface
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask anything about your risk data... (e.g., 'What are the trending KRI breaches this month?')"
                      value={naturalLanguageQuery}
                      onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageQuery()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleNaturalLanguageQuery}
                      disabled={isLoading || !naturalLanguageQuery.trim()}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze
                    </Button>
                  </div>

                  {queryResult && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Query Interpretation</h4>
                        <p className="text-sm text-muted-foreground">{queryResult.interpretation}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Analysis Results</h4>
                        <p className="text-sm leading-relaxed">{queryResult.narrative_explanation}</p>
                      </div>

                      {queryResult.follow_up_questions && queryResult.follow_up_questions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Suggested Follow-up Questions</h4>
                          <div className="flex flex-wrap gap-2">
                            {queryResult.follow_up_questions.map((question: string, index: number) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => setNaturalLanguageQuery(question)}
                              >
                                {question}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategic-recommendations">
          <div className="space-y-6">
            {executiveBrief && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Strategic Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {executiveBrief.recommendations.map((recommendation) => (
                      <div key={recommendation.recommendation_id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{recommendation.title}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {recommendation.category} • {recommendation.implementation_effort} effort
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(recommendation.priority)}>
                              {recommendation.priority}
                            </Badge>
                            {recommendation.approval_required && (
                              <Badge variant="outline">Approval Required</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-sm mb-4 leading-relaxed">{recommendation.description}</p>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Expected Impact</h4>
                            <p className="text-sm text-muted-foreground">{recommendation.expected_impact}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-2">Timeline</h4>
                            <p className="text-sm text-muted-foreground">{recommendation.timeline}</p>
                          </div>
                        </div>

                        {recommendation.dependencies.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Dependencies</h4>
                            <ul className="text-sm space-y-1">
                              {recommendation.dependencies.map((dep, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <ChevronRight className="h-3 w-3" />
                                  {dep}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveIntelligenceDashboard;
