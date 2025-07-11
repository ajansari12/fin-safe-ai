import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Zap,
  FileBarChart,
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AIInsight {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  impact_score: number;
  recommendation: string;
  osfi_principle: string;
  auto_generated: boolean;
  created_at: string;
}

interface PredictiveAlert {
  id: string;
  alert_type: string;
  predicted_event: string;
  probability: number;
  time_horizon: string;
  potential_impact: string;
  recommended_actions: string[];
  osfi_relevance: string;
}

const OSFIAdvancedAnalytics: React.FC = () => {
  const { data: aiInsights } = useQuery({
    queryKey: ['osfi-ai-insights'],
    queryFn: async () => {
      const mockData: AIInsight[] = [
        {
          id: '1',
          title: 'Operational Risk Trend Deterioration',
          category: 'Risk Assessment',
          priority: 'high',
          confidence: 0.87,
          impact_score: 8.5,
          recommendation: 'Increase monitoring frequency for operational risk indicators',
          osfi_principle: 'Principle 2',
          auto_generated: true,
          created_at: '2024-01-15'
        },
        {
          id: '2',
          title: 'Model Performance Anomaly Detected',
          category: 'Model Risk',
          priority: 'high',
          confidence: 0.92,
          impact_score: 9.2,
          recommendation: 'Immediate model recalibration required for credit risk model',
          osfi_principle: 'Principle 2',
          auto_generated: true,
          created_at: '2024-01-14'
        },
        {
          id: '3',
          title: 'Third Party Risk Concentration',
          category: 'Vendor Management',
          priority: 'medium',
          confidence: 0.78,
          impact_score: 6.8,
          recommendation: 'Diversify critical vendor dependencies',
          osfi_principle: 'Principle 7',
          auto_generated: true,
          created_at: '2024-01-13'
        },
        {
          id: '4',
          title: 'Data Quality Improvement Opportunity',
          category: 'Data Governance',
          priority: 'medium',
          confidence: 0.85,
          impact_score: 7.1,
          recommendation: 'Implement automated data validation rules',
          osfi_principle: 'Principle 4',
          auto_generated: true,
          created_at: '2024-01-12'
        }
      ];
      return mockData;
    }
  });

  const { data: predictiveAlerts } = useQuery({
    queryKey: ['osfi-predictive-alerts'],
    queryFn: async () => {
      const mockData: PredictiveAlert[] = [
        {
          id: '1',
          alert_type: 'Risk Threshold Breach',
          predicted_event: 'Operational loss exceeding risk appetite',
          probability: 0.73,
          time_horizon: '30 days',
          potential_impact: 'High - Risk appetite breach likely',
          recommended_actions: [
            'Review operational controls',
            'Increase monitoring frequency',
            'Prepare contingency plans'
          ],
          osfi_relevance: 'OSFI E-21 Principle 3 - Risk Appetite'
        },
        {
          id: '2',
          alert_type: 'Business Continuity Risk',
          predicted_event: 'Critical vendor service degradation',
          probability: 0.65,
          time_horizon: '14 days',
          potential_impact: 'Medium - Service availability at risk',
          recommended_actions: [
            'Activate backup vendor',
            'Test contingency procedures',
            'Notify stakeholders'
          ],
          osfi_relevance: 'OSFI E-21 Principle 6 & 7 - Business Continuity'
        }
      ];
      return mockData;
    }
  });

  // Mock compliance radar data
  const complianceRadarData = [
    { principle: 'P1 - Governance', current: 92, target: 95 },
    { principle: 'P2 - Framework', current: 88, target: 90 },
    { principle: 'P3 - Appetite', current: 78, target: 85 },
    { principle: 'P4 - Data Mgmt', current: 85, target: 90 },
    { principle: 'P5 - Data Gov', current: 90, target: 92 },
    { principle: 'P6 - BCP', current: 75, target: 85 },
    { principle: 'P7 - 3rd Party', current: 82, target: 88 }
  ];

  // Mock trend data
  const complianceTrendData = [
    { month: 'Jul', score: 82 },
    { month: 'Aug', score: 84 },
    { month: 'Sep', score: 83 },
    { month: 'Oct', score: 86 },
    { month: 'Nov', score: 85 },
    { month: 'Dec', score: 87 },
    { month: 'Jan', score: 85 }
  ];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <Target className="h-4 w-4 text-green-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'outline';
    }
  };

  const highPriorityInsights = aiInsights?.filter(insight => insight.priority === 'high') || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OSFI Advanced Analytics</h2>
          <p className="text-muted-foreground">
            AI-Powered Insights and Predictive Risk Analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Button size="sm">
            <FileBarChart className="h-4 w-4 mr-2" />
            Generate Insights
          </Button>
        </div>
      </div>

      {/* AI Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">AI Insights</p>
                <p className="text-2xl font-bold">{aiInsights?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{highPriorityInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Predictive Alerts</p>
                <p className="text-2xl font-bold">{predictiveAlerts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {aiInsights ? Math.round(aiInsights.reduce((sum, i) => sum + i.confidence, 0) / aiInsights.length * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              OSFI Compliance Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={complianceRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="principle" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Overall Compliance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={complianceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[70, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Compliance Score']} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights?.map((insight, index) => (
              <div key={insight.id} className={`border rounded-lg p-4 animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getPriorityIcon(insight.priority)}
                      <h3 className="font-semibold">{insight.title}</h3>
                      <Badge variant="outline">{insight.osfi_principle}</Badge>
                      <Badge variant={getPriorityVariant(insight.priority)}>
                        {insight.priority} priority
                      </Badge>
                      {insight.auto_generated && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          <Brain className="h-3 w-3 mr-1" />
                          AI Generated
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{insight.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Confidence</p>
                        <p className="font-medium">{Math.round(insight.confidence * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Impact Score</p>
                        <p className="font-medium">{insight.impact_score}/10</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">Recommendation:</p>
                      <p className="text-sm text-blue-800">{insight.recommendation}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button size="sm">
                      Implement
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Predictive Risk Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictiveAlerts?.map((alert, index) => (
              <div key={alert.id} className={`border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 animate-fade-in`} style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-orange-900">{alert.alert_type}</h3>
                      <Badge variant="secondary">
                        {Math.round(alert.probability * 100)}% probability
                      </Badge>
                      <Badge variant="outline">
                        {alert.time_horizon}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-orange-900">Predicted Event:</p>
                        <p className="text-sm text-orange-800">{alert.predicted_event}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-orange-900">Potential Impact:</p>
                        <p className="text-sm text-orange-800">{alert.potential_impact}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-orange-900">Recommended Actions:</p>
                        <ul className="text-sm text-orange-800 list-disc list-inside space-y-1">
                          {alert.recommended_actions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="border-t border-orange-200 pt-2">
                        <p className="text-xs text-orange-700">
                          <span className="font-medium">OSFI Relevance:</span> {alert.osfi_relevance}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      Dismiss
                    </Button>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      Take Action
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Analytics Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <div className="text-center">
                <p className="font-medium">Generate New Insights</p>
                <p className="text-xs text-muted-foreground">Run AI analysis on latest data</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <p className="font-medium">Trend Analysis</p>
                <p className="text-xs text-muted-foreground">Identify emerging risk patterns</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <FileBarChart className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <p className="font-medium">Executive Summary</p>
                <p className="text-xs text-muted-foreground">Create board-ready report</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSFIAdvancedAnalytics;