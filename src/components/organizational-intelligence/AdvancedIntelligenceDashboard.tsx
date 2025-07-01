
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lightbulb,
  Settings,
  Activity
} from 'lucide-react';
import { enhancedOrganizationalIntelligenceService } from '@/services/enhanced-organizational-intelligence-service';
import type { 
  OrganizationalProfile,
  PredictiveInsight,
  IntelligentRecommendation,
  RiskPrediction,
  MaturityProgression
} from '@/types/organizational-intelligence';

interface AdvancedIntelligenceDashboardProps {
  profile: OrganizationalProfile;
}

const AdvancedIntelligenceDashboard: React.FC<AdvancedIntelligenceDashboardProps> = ({ profile }) => {
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [recommendations, setRecommendations] = useState<IntelligentRecommendation[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);
  const [maturityProgression, setMaturityProgression] = useState<MaturityProgression[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    loadIntelligenceData();
  }, [profile.id]);

  const loadIntelligenceData = async () => {
    try {
      setLoading(true);
      
      const [insights, recs, risks, maturity] = await Promise.all([
        enhancedOrganizationalIntelligenceService.generatePredictiveInsights(profile.id),
        enhancedOrganizationalIntelligenceService.generateIntelligentRecommendations(profile.id),
        enhancedOrganizationalIntelligenceService.predictRiskEvolution(profile.id),
        enhancedOrganizationalIntelligenceService.analyzeMaturityProgression(profile.id)
      ]);

      setPredictiveInsights(insights);
      setRecommendations(recs);
      setRiskPredictions(risks);
      setMaturityProgression(maturity);
    } catch (error) {
      console.error('Error loading intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk_trend': return TrendingUp;
      case 'compliance_gap': return AlertTriangle;
      case 'opportunity': return Target;
      case 'threat': return TrendingDown;
      default: return Brain;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
            <p>Generating AI intelligence...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intelligence Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Advanced AI Intelligence Dashboard
          </CardTitle>
          <p className="text-sm text-gray-600">
            AI-powered predictive analytics and intelligent recommendations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{predictiveInsights.length}</div>
              <div className="text-sm text-gray-600">Predictive Insights</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{recommendations.length}</div>
              <div className="text-sm text-gray-600">AI Recommendations</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{riskPredictions.length}</div>
              <div className="text-sm text-gray-600">Risk Predictions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((profile.profile_score || 0) * 1.2)}%
              </div>
              <div className="text-sm text-gray-600">AI Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="predictions">Risk Predictions</TabsTrigger>
          <TabsTrigger value="progression">Maturity Path</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {predictiveInsights.map((insight) => {
              const IconComponent = getInsightIcon(insight.type);
              return (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-blue-500" />
                        <div>
                          <CardTitle className="text-base">{insight.title}</CardTitle>
                          <p className="text-sm text-gray-600">{insight.timeframe.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact.toUpperCase()}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          {Math.round(insight.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4">{insight.description}</p>
                    
                    {insight.predicted_values.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Predicted Values</h4>
                        <div className="space-y-2">
                          {insight.predicted_values.map((value, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{new Date(value.date).toLocaleDateString()}</span>
                              <span className="font-medium">{value.value} {value.metric}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Factors</h4>
                      <div className="flex flex-wrap gap-2">
                        {insight.factors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <div>
                        <CardTitle className="text-base">{rec.title}</CardTitle>
                        <p className="text-sm text-gray-600">{rec.category.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(rec.priority)}`} />
                      <span className="text-sm font-medium">{rec.priority.toUpperCase()}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                  <p className="text-sm text-gray-600 mb-4 italic">{rec.rationale}</p>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Implementation Steps</h4>
                      <ul className="text-sm space-y-1">
                        {rec.implementation_steps.slice(0, 3).map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mt-0.5">
                              {index + 1}
                            </div>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Expected Outcomes</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{rec.estimated_effort.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-green-500" />
                          <span>{rec.expected_impact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {riskPredictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-500" />
                    {prediction.risk_category.replace('_', ' ').toUpperCase()} Risk Evolution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Risk Score</span>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold">{prediction.current_score}</div>
                        <Progress value={prediction.current_score} className="w-24" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-3">Predicted Evolution</h4>
                      <div className="space-y-2">
                        {prediction.predicted_scores.map((score, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{score.timeframe.replace('_', ' ')}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={score.score} className="w-20" />
                              <span className="text-sm font-medium w-8">{score.score}</span>
                              <span className="text-xs text-gray-500">
                                ({Math.round(score.confidence * 100)}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Risk Drivers</h4>
                      <div className="flex flex-wrap gap-2">
                        {prediction.key_drivers.map((driver, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {driver}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Mitigation Impact</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="font-medium text-red-600">High Investment</div>
                          <div>{prediction.mitigation_impact.high_investment} points</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <div className="font-medium text-yellow-600">Medium Investment</div>
                          <div>{prediction.mitigation_impact.medium_investment} points</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-medium text-green-600">Low Investment</div>
                          <div>{prediction.mitigation_impact.low_investment} points</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progression" className="space-y-4">
          <div className="grid gap-4">
            {maturityProgression.map((progression) => (
              <Card key={progression.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    {progression.dimension.replace('_', ' ').toUpperCase()} Maturity Path
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Current: <Badge variant="outline">{progression.current_level}</Badge></span>
                    <span>Target: <Badge variant="secondary">{progression.target_level}</Badge></span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-3">Progression Path</h4>
                      <div className="space-y-3">
                        {progression.progression_path.map((step, index) => (
                          <div key={index} className="border-l-4 border-blue-200 pl-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{step.level}</span>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    step.investment_required === 'high' ? 'border-red-300 text-red-600' :
                                    step.investment_required === 'medium' ? 'border-yellow-300 text-yellow-600' :
                                    'border-green-300 text-green-600'
                                  }`}
                                >
                                  {step.investment_required} investment
                                </Badge>
                                <span className="text-xs text-gray-500">{step.estimated_timeline}</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {step.requirements.join(' • ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Milestones</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {progression.key_milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{milestone}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Success Indicators</h4>
                      <div className="space-y-1">
                        {progression.success_indicators.map((indicator, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span>{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedIntelligenceDashboard;
