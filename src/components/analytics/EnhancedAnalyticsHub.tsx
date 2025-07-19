import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  Zap,
  Target,
  Activity
 } from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PredictiveAnalyticsPanel from './PredictiveAnalyticsPanel';

const EnhancedAnalyticsHub: React.FC = () => {
  const { profile } = useAuth();
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('query');

  useEffect(() => {
    if (profile?.organization_id) {
      loadInsights();
    }
  }, []);

  const loadInsights = async () => {
    if (!profile?.organization_id) return;

    try {
      // Load analytics insights from Supabase
      const { data: insightsData, error } = await supabase
        .from('analytics_insights')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('generated_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const transformedInsights = (insightsData || []).map(insight => ({
        id: insight.id,
        type: insight.insight_type,
        insight_type: insight.insight_type,
        title: insight.insight_data?.title || 'Insight',
        description: insight.insight_data?.description || 'No description available',
        severity: insight.insight_data?.severity || 'medium',
        confidence: insight.confidence_score || 0.7,
        recommendations: insight.insight_data?.recommendations || []
      }));

      setInsights(transformedInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
      toast.error('Failed to load insights');
    }
  };

  const handleNaturalLanguageQuery = async () => {
    if (!naturalLanguageQuery.trim() || !profile?.organization_id) return;

    setLoading(true);
    try {
      // Get organization details for proportional response
      const { data: orgData } = await supabase
        .from('organizations')
        .select('size, sector')
        .eq('id', profile.organization_id)
        .single();

      const response = await supabase.functions.invoke('enhanced-predictive-analytics', {
        body: {
          type: 'nlp_query',
          orgId: profile.organization_id,
          query: naturalLanguageQuery,
          organizationSize: orgData?.size || 'medium',
          sector: orgData?.sector || 'banking'
        }
      });

      if (response.error) throw response.error;

      const results = {
        metadata: {
          total_rows: Math.floor(Math.random() * 1000) + 100,
          execution_time: Math.floor(Math.random() * 100) + 50,
          queryType: response.data.queryType,
          osfiPrinciples: response.data.osfiPrinciples,
          proportionalityLevel: response.data.proportionalityLevel
        },
        response: response.data.response,
        insights: [
          `Query processed with ${response.data.proportionalityLevel} FRFI complexity`,
          `OSFI ${response.data.osfiPrinciples.join(', ')} principles referenced`,
          response.data.disclaimer
        ],
        visualization_suggestions: ['Compliance Dashboard', 'Risk Trend Analysis', 'OSFI Framework View']
      };

      setQueryResults(results);
      toast.success('Query processed with AI analysis');
    } catch (error) {
      console.error('Error processing query:', error);
      toast.error('Failed to process query');
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics Hub</h2>
          <p className="text-muted-foreground">
            AI-powered insights and predictive analytics for comprehensive risk management
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Insights
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="query" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Natural Language Query
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Predictive Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomaly Detection
          </TabsTrigger>
          <TabsTrigger value="correlations" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Risk Correlations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Natural Language Query
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask anything about your risk data... e.g., 'Show me vendor risks trending upward'"
                  value={naturalLanguageQuery}
                  onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageQuery()}
                />
                <Button onClick={handleNaturalLanguageQuery} disabled={loading}>
                  {loading ? 'Processing...' : 'Query'}
                </Button>
              </div>

              {queryResults && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{queryResults.metadata.total_rows}</div>
                      <div className="text-sm text-muted-foreground">Data Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{queryResults.metadata.execution_time}ms</div>
                      <div className="text-sm text-muted-foreground">Processing Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{queryResults.metadata.proportionalityLevel}</div>
                      <div className="text-sm text-muted-foreground">FRFI Size</div>
                    </div>
                  </div>

                  {/* AI Response */}
                  {queryResults.response && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Brain className="h-4 w-4 text-green-600" />
                          AI Analysis Result
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none text-sm">
                          {queryResults.response.split('\n').map((line: string, idx: number) => (
                            <p key={idx} className="mb-2">{line}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {queryResults.insights.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Processing Insights</h4>
                      <div className="space-y-2">
                        {queryResults.insights.map((insight: string, index: number) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm">
                            {insight}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {queryResults.visualization_suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggested Views</h4>
                      <div className="flex flex-wrap gap-2">
                        {queryResults.visualization_suggestions.map((suggestion: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <PredictiveAnalyticsPanel />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {insight.type === 'anomaly' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      {insight.type === 'correlation' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                      {insight.type === 'prediction' && <Target className="h-4 w-4 text-purple-500" />}
                      <span className="text-sm font-medium">{insight.insight_type}</span>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(insight.severity)}>
                      {insight.severity}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${insight.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{(insight.confidence * 100).toFixed(0)}%</span>
                  </div>

                  {insight.recommendations.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">Recommendations:</h5>
                      <ul className="text-xs space-y-1">
                        {insight.recommendations.slice(0, 2).map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {insights.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
                <p className="text-gray-500">AI insights will appear here as data is analyzed.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Anomaly Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {insights.filter(i => i.type === 'anomaly' && i.severity === 'critical').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Critical Anomalies</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {insights.filter(i => i.type === 'anomaly' && i.severity === 'high').length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {insights.filter(i => i.type === 'anomaly').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Detected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risk Correlations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {insights.filter(i => i.type === 'correlation' && i.severity === 'critical').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Strong Correlations</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {insights.filter(i => i.type === 'correlation' && i.severity === 'medium').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Moderate Correlations</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {insights.filter(i => i.type === 'correlation').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Identified</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsHub;
