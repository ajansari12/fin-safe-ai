import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Search, Lightbulb, BarChart3, AlertTriangle } from 'lucide-react';
import PredictiveRiskDashboard from './PredictiveRiskDashboard';
import AnomalyDetectionDashboard from './AnomalyDetectionDashboard';
import IntelligentRecommendations from './IntelligentRecommendations';

const AIAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for overview metrics
  const overviewMetrics = {
    predictiveInsights: 12,
    anomaliesDetected: 4,
    recommendations: 8,
    avgConfidence: 87,
    lastAnalysisTime: new Date().toLocaleString()
  };

  const recentActivity = [
    {
      type: 'predictive',
      title: 'KRI Breach Prediction',
      description: 'Operational Loss KRI predicted to breach warning threshold in 5 days',
      severity: 'high',
      confidence: 0.92,
      time: '2 hours ago'
    },
    {
      type: 'anomaly',
      title: 'Transaction Volume Anomaly',
      description: 'Unusual spike in high-value transactions detected',
      severity: 'medium',
      confidence: 0.84,
      time: '4 hours ago'
    },
    {
      type: 'recommendation',
      title: 'Control Enhancement',
      description: 'Recommendation to strengthen transaction monitoring controls',
      severity: 'medium',
      confidence: 0.78,
      time: '6 hours ago'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'predictive': return <TrendingUp className="h-4 w-4" />;
      case 'anomaly': return <Search className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Analytics Center</h1>
          <p className="text-muted-foreground">
            Advanced AI-powered risk analytics and intelligent insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <Badge variant="outline" className="bg-primary/10">
            AI Powered
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Predictive</span>
          </TabsTrigger>
          <TabsTrigger value="anomaly" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Anomaly Detection</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4" />
            <span>Recommendations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div className="text-sm font-medium text-muted-foreground">Predictive Insights</div>
                </div>
                <div className="text-2xl font-bold">{overviewMetrics.predictiveInsights}</div>
                <p className="text-xs text-muted-foreground">Active predictions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <div className="text-sm font-medium text-muted-foreground">Anomalies Detected</div>
                </div>
                <div className="text-2xl font-bold text-destructive">{overviewMetrics.anomaliesDetected}</div>
                <p className="text-xs text-muted-foreground">Requiring attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-warning" />
                  <div className="text-sm font-medium text-muted-foreground">Recommendations</div>
                </div>
                <div className="text-2xl font-bold text-warning">{overviewMetrics.recommendations}</div>
                <p className="text-xs text-muted-foreground">Implementation ready</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <div className="text-sm font-medium text-muted-foreground">Avg Confidence</div>
                </div>
                <div className="text-2xl font-bold">{overviewMetrics.avgConfidence}%</div>
                <p className="text-xs text-muted-foreground">AI model accuracy</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Activity</CardTitle>
              <CardDescription>
                Latest insights and discoveries from AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium">{activity.title}</h4>
                        <Badge variant={getSeverityColor(activity.severity)} className="text-xs">
                          {activity.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(activity.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>AI Capabilities</CardTitle>
              <CardDescription>
                Explore advanced AI analytics features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab('predictive')}
                >
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium">Predictive Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Forecast future risks and identify early warning signals
                  </p>
                </div>
                
                <div 
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab('anomaly')}
                >
                  <Search className="h-8 w-8 text-destructive mb-2" />
                  <h3 className="font-medium">Anomaly Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    Detect unusual patterns and statistical outliers
                  </p>
                </div>
                
                <div 
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab('recommendations')}
                >
                  <Lightbulb className="h-8 w-8 text-warning mb-2" />
                  <h3 className="font-medium">Smart Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Get intelligent suggestions for risk optimization
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveRiskDashboard />
        </TabsContent>

        <TabsContent value="anomaly">
          <AnomalyDetectionDashboard />
        </TabsContent>

        <TabsContent value="recommendations">
          <IntelligentRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalyticsDashboard;