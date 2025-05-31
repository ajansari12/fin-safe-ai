
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertTriangle, Target, RefreshCw } from 'lucide-react';
import { analyticsInsightsService, type AnalyticsInsight } from '@/services/analytics-insights-service';
import { useToast } from '@/hooks/use-toast';

const AIInsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsInsightsService.getInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
      toast({
        title: "Error loading insights",
        description: "Failed to load AI insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewInsights = async () => {
    setIsGenerating(true);
    try {
      const newInsights = await analyticsInsightsService.generatePredictiveInsights();
      
      // Save generated insights to database
      for (const insight of newInsights) {
        await analyticsInsightsService.createInsight(insight);
      }
      
      await loadInsights();
      toast({
        title: "Insights generated",
        description: `Generated ${newInsights.length} new AI insights.`
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error generating insights",
        description: "Failed to generate new insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'prediction': return <Target className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Generated Insights
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Generated Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateNewInsights}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights available yet.</p>
            <p className="text-sm">Click refresh to generate AI insights from your data.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.insight_type)}
                    <h4 className="font-semibold">{insight.insight_data.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(insight.insight_data.severity)}>
                      {insight.insight_data.severity || 'info'}
                    </Badge>
                    <Badge variant="outline">
                      {insight.confidence_score}% confidence
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {insight.insight_data.description}
                </p>
                
                {insight.insight_data.actionable_items && insight.insight_data.actionable_items.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Recommended Actions:</h5>
                    <ul className="text-sm space-y-1">
                      {insight.insight_data.actionable_items.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {insight.tags && (
                  <div className="flex flex-wrap gap-1">
                    {insight.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
