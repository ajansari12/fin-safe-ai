import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Lightbulb, CheckCircle, Clock, Star, TrendingUp } from 'lucide-react';
import { aiAnalyticsService, AIInsight } from '@/services/ai-analytics-service';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  id: string;
  category: 'kri_optimization' | 'control_improvement' | 'process_enhancement' | 'compliance' | 'resource_allocation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  implementationSteps: string[];
  expectedBenefit: string;
  timeframe: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  confidence: number;
  generatedAt: string;
}

const IntelligentRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadStoredRecommendations();
  }, []);

  const loadStoredRecommendations = async () => {
    try {
      const storedInsights = await aiAnalyticsService.getStoredInsights();
      const recommendationInsights = storedInsights.filter(insight => 
        insight.type === 'recommendation'
      );
      setRecommendations(recommendationInsights);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const result = await aiAnalyticsService.generateRecommendations();
      
      if (result.success) {
        setRecommendations(prev => [...result.insights, ...prev]);
        toast({
          title: "Recommendations Generated",
          description: `Generated ${result.insights.length} new recommendations`,
        });
      } else {
        toast({
          title: "Generation Error",
          description: result.error || "Failed to generate recommendations",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getPriorityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <Star className="h-4 w-4" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  // Mock categories for filtering
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'kri_optimization', label: 'KRI Optimization' },
    { value: 'control_improvement', label: 'Control Improvement' },
    { value: 'process_enhancement', label: 'Process Enhancement' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'resource_allocation', label: 'Resource Allocation' }
  ];

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type.includes(selectedCategory));

  const recommendationStats = {
    total: recommendations.length,
    critical: recommendations.filter(r => r.severity === 'critical').length,
    high: recommendations.filter(r => r.severity === 'high').length,
    medium: recommendations.filter(r => r.severity === 'medium').length,
    avgConfidence: recommendations.length > 0 
      ? Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length * 100)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Intelligent Recommendations</h2>
          <p className="text-muted-foreground">
            AI-powered suggestions for risk management optimization
          </p>
        </div>
        <Button 
          onClick={generateRecommendations} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate Recommendations
            </>
          )}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center">{recommendationStats.total}</div>
            <div className="text-sm text-muted-foreground text-center">Total Recommendations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center text-destructive">{recommendationStats.critical}</div>
            <div className="text-sm text-muted-foreground text-center">Critical Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center text-destructive">{recommendationStats.high}</div>
            <div className="text-sm text-muted-foreground text-center">High Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center text-warning">{recommendationStats.medium}</div>
            <div className="text-sm text-muted-foreground text-center">Medium Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center">{recommendationStats.avgConfidence}%</div>
            <div className="text-sm text-muted-foreground text-center">Avg Confidence</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="implementation">Implementation Guide</TabsTrigger>
          <TabsTrigger value="tracking">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {filteredRecommendations.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Lightbulb className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No recommendations available. Generate recommendations to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRecommendations.map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(recommendation.severity)}
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityColor(recommendation.severity)}>
                          {recommendation.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(recommendation.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{recommendation.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Confidence Score */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Recommendation Confidence</span>
                          <span>{Math.round(recommendation.confidence * 100)}%</span>
                        </div>
                        <Progress value={recommendation.confidence * 100} className="h-2" />
                      </div>

                      {/* Implementation Steps */}
                      {recommendation.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Implementation Steps:</h4>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            {recommendation.recommendations.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Expected Benefits */}
                      {recommendation.dataPoints.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Expected Benefits:</h4>
                          <div className="flex flex-wrap gap-2">
                            {recommendation.dataPoints.slice(0, 3).map((benefit, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {typeof benefit === 'object' ? Object.values(benefit)[0] : benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-xs text-muted-foreground">
                          Generated: {new Date(recommendation.generatedAt).toLocaleString()}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Clock className="mr-1 h-3 w-3" />
                            Schedule
                          </Button>
                          <Button variant="default" size="sm">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Implement
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Guidelines</CardTitle>
              <CardDescription>
                Best practices for implementing AI recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="font-medium">Prioritize</h3>
                    <p className="text-sm text-muted-foreground">Focus on high-impact, low-effort recommendations first</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">📊</div>
                    <h3 className="font-medium">Measure</h3>
                    <p className="text-sm text-muted-foreground">Track progress and measure improvement metrics</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">🔄</div>
                    <h3 className="font-medium">Iterate</h3>
                    <p className="text-sm text-muted-foreground">Continuously refine based on results and feedback</p>
                  </div>
                </div>

                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Pro Tip:</strong> Start with recommendations that have high confidence scores and align with your current strategic priorities. Consider the implementation effort and available resources before committing to complex changes.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Progress</CardTitle>
              <CardDescription>
                Track the progress of implemented recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-muted-foreground">
                  <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Progress tracking will be available once recommendations are implemented.</p>
                  <p className="text-sm mt-2">Implementation status and impact metrics will appear here.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentRecommendations;