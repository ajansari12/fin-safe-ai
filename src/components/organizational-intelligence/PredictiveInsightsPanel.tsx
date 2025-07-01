
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Brain,
  Clock,
  BarChart3,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { predictiveIntelligenceService } from '@/services/predictive-intelligence-service';
import { PredictiveInsight, IntelligentRecommendation } from '@/types/organizational-intelligence';

interface PredictiveInsightsPanelProps {
  orgId: string;
  profileId: string;
}

const PredictiveInsightsPanel: React.FC<PredictiveInsightsPanelProps> = ({ 
  orgId, 
  profileId 
}) => {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [recommendations, setRecommendations] = useState<IntelligentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<PredictiveInsight | null>(null);

  useEffect(() => {
    loadPredictiveData();
  }, [profileId]);

  const loadPredictiveData = async () => {
    setLoading(true);
    try {
      const [insightsData, recommendationsData] = await Promise.all([
        predictiveIntelligenceService.generatePredictiveInsights(profileId),
        predictiveIntelligenceService.generateIntelligentRecommendations(profileId, [])
      ]);

      setInsights(insightsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error loading predictive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk_trend': return TrendingUp;
      case 'compliance_gap': return AlertTriangle;
      case 'opportunity': return Lightbulb;
      case 'threat': return Target;
      default: return BarChart3;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'risk_trend': return 'text-blue-500';
      case 'compliance_gap': return 'text-red-500';
      case 'opportunity': return 'text-green-500';
      case 'threat': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Predictive Intelligence</h2>
            <p className="text-muted-foreground">
              AI-powered insights and recommendations for your organization
            </p>
          </div>
        </div>
        <Button onClick={loadPredictiveData} variant="outline">
          <Brain className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Key Insights Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((insight) => {
          const IconComponent = getInsightIcon(insight.type);
          
          return (
            <Card 
              key={insight.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedInsight?.id === insight.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedInsight(insight)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <IconComponent className={`h-6 w-6 ${getInsightColor(insight.type)} mt-0.5`} />
                    <div className="flex-1">
                      <CardTitle className="text-base leading-tight">
                        {insight.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact} impact
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {insight.timeframe.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Confidence Level</span>
                    <span className="font-medium">{Math.round(insight.confidence * 100)}%</span>
                  </div>
                  <Progress value={insight.confidence * 100} className="h-2" />
                </div>

                {insight.predicted_values.length > 0 && (
                  <div className="text-sm">
                    <div className="font-medium mb-1">Trend Prediction</div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {insight.predicted_values[0].value < insight.predicted_values[insight.predicted_values.length - 1].value ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      )}
                      <span>
                        {insight.predicted_values[0].value} → {insight.predicted_values[insight.predicted_values.length - 1].value}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Insight View */}
      {selectedInsight && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Detailed Analysis: {selectedInsight.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Key Factors</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {selectedInsight.factors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Predicted Timeline</h4>
                <div className="space-y-2">
                  {selectedInsight.predicted_values.map((value, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(value.date).toLocaleDateString()}
                      </span>
                      <span className="font-medium">
                        {value.value} {value.metric.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intelligent Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Intelligent Recommendations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-generated recommendations based on your insights and organizational profile
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((recommendation) => (
              <div key={recommendation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{recommendation.title}</h4>
                      <Badge className={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2 text-sm">
                  <div>
                    <span className="font-medium">Expected Impact:</span>
                    <p className="text-muted-foreground mt-1">{recommendation.expected_impact}</p>
                  </div>
                  <div>
                    <span className="font-medium">Timeline:</span>
                    <p className="text-muted-foreground mt-1">
                      {recommendation.estimated_effort.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="outline">{recommendation.category.replace('_', ' ')}</Badge>
                  <Button size="sm" variant="outline">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveInsightsPanel;
