
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Shield,
  RefreshCw,
  Lightbulb,
  ChevronRight,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { enhancedAIInsightsService, type GeneratedInsight } from '@/services/enhanced-ai-insights-service';
import { toast } from 'sonner';

interface EnhancedAIInsightsProps {
  className?: string;
}

export const EnhancedAIInsights: React.FC<EnhancedAIInsightsProps> = ({ className }) => {
  const { profile } = useAuth();
  const [insights, setInsights] = useState<GeneratedInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  React.useEffect(() => {
    if (profile?.organization_id) {
      loadExistingInsights();
    }
  }, [profile?.organization_id]);

  const loadExistingInsights = async () => {
    if (!profile?.organization_id) return;
    
    setIsLoading(true);
    try {
      const existingInsights = await enhancedAIInsightsService.getStoredInsights(profile.organization_id);
      setInsights(existingInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = async (analysisType: 'comprehensive' | 'compliance' | 'risk_trends' | 'controls' = 'comprehensive') => {
    if (!profile?.organization_id) {
      toast.error('Organization not found');
      return;
    }

    setIsGenerating(true);
    try {
      const newInsights = await enhancedAIInsightsService.generateContextualInsights({
        organizationId: profile.organization_id,
        analysisType,
        timeRange: {
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        }
      });

      setInsights(prev => [...newInsights, ...prev]);
      toast.success(`Generated ${newInsights.length} new insights`);
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'compliance': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'risk_trend': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'control_effectiveness': return <Target className="h-4 w-4 text-green-500" />;
      case 'operational_resilience': return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      case 'predictive_alert': return <Brain className="h-4 w-4 text-red-500" />;
      default: return <Lightbulb className="h-4 w-4 text-yellow-500" />;
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

  const filteredInsights = insights.filter(insight => {
    if (activeTab === 'all') return true;
    return insight.insight_type === activeTab;
  });

  const executeRecommendation = (recommendation: any) => {
    toast.info(`Action noted: ${recommendation.action}`, {
      description: `Priority: ${recommendation.priority} | Timeline: ${recommendation.timeline}`
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateInsights('compliance')}
              disabled={isGenerating}
            >
              <Shield className="h-4 w-4 mr-1" />
              Compliance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateInsights('risk_trends')}
              disabled={isGenerating}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Risk Trends
            </Button>
            <Button
              onClick={() => generateInsights()}
              disabled={isGenerating}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate Insights'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="risk_trend">Risk Trends</TabsTrigger>
            <TabsTrigger value="control_effectiveness">Controls</TabsTrigger>
            <TabsTrigger value="operational_resilience">Resilience</TabsTrigger>
            <TabsTrigger value="predictive_alert">Predictive</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredInsights.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-medium mb-2">No Insights Available</h4>
                <p className="text-muted-foreground mb-4">
                  Generate AI-powered insights to get personalized recommendations for your risk management program.
                </p>
                <Button onClick={() => generateInsights()} disabled={isGenerating}>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Your First Insights
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInsights.map((insight) => (
                  <Card key={insight.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.insight_type)}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{insight.insight_data.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(insight.insight_data.severity)}>
                                {insight.insight_data.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(insight.insight_data.confidence_score * 100)}% confidence
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {insight.insight_data.description}
                          </p>
                          
                          {insight.insight_data.actionable_items && insight.insight_data.actionable_items.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Key Actions:</h5>
                              <ul className="text-sm space-y-1">
                                {insight.insight_data.actionable_items.map((item, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {insight.insight_data.recommendations && insight.insight_data.recommendations.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Recommendations:</h5>
                              <div className="space-y-2">
                                {insight.insight_data.recommendations.map((rec, index) => (
                                  <Alert key={index} className="py-2">
                                    <AlertDescription className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <p className="font-medium text-sm">{rec.action}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Priority: {rec.priority} | Timeline: {rec.timeline}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => executeRecommendation(rec)}
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                    </AlertDescription>
                                  </Alert>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              Generated: {new Date(insight.generated_at).toLocaleDateString()}
                            </div>
                            <div className="flex gap-1">
                              {insight.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
