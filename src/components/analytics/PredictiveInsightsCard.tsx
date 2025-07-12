import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  Clock,
  TrendingUp,
  Brain
} from 'lucide-react';
import { PredictiveInsight } from '@/hooks/useAdvancedAnalytics';

interface PredictiveInsightsCardProps {
  insights: PredictiveInsight[];
  isLoading?: boolean;
}

const PredictiveInsightsCard = ({ insights, isLoading }: PredictiveInsightsCardProps) => {
  const getInsightIcon = (type: PredictiveInsight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'opportunity':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'recommendation':
        return <Target className="h-4 w-4 text-green-500" />;
    }
  };

  const getInsightColor = (type: PredictiveInsight['type']) => {
    switch (type) {
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'opportunity':
        return 'border-blue-200 bg-blue-50';
      case 'recommendation':
        return 'border-green-200 bg-green-50';
    }
  };

  const getImpactColor = (impact: PredictiveInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Predictive Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Predictive Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <Alert key={index} className={getInsightColor(insight.type)}>
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                      <Badge className={getConfidenceColor(insight.confidence)}>
                        {Math.round(insight.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <AlertDescription className="text-sm">
                    {insight.description}
                  </AlertDescription>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{insight.timeframe}</span>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
          
          {insights.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No predictive insights available</p>
              <p className="text-xs">Insights will appear as more data becomes available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveInsightsCard;