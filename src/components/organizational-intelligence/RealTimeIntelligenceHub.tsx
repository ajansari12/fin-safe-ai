
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Brain,
  Zap,
  Eye,
  BarChart3
} from 'lucide-react';
import { aiOrganizationalIntelligenceIntegration } from '@/services/ai-organizational-intelligence-integration';
import type { IntelligenceDashboardData, PredictiveInsight } from '@/types/organizational-intelligence';
import { toast } from 'sonner';

interface RealTimeIntelligenceHubProps {
  orgId: string;
  profileId?: string;
}

const RealTimeIntelligenceHub: React.FC<RealTimeIntelligenceHubProps> = ({ orgId, profileId }) => {
  const [dashboardData, setDashboardData] = useState<IntelligenceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadIntelligenceData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadIntelligenceData();
    }, 30000);

    return () => clearInterval(interval);
  }, [orgId]);

  const loadIntelligenceData = async () => {
    try {
      if (!orgId) return;
      
      const data = await aiOrganizationalIntelligenceIntegration.getIntelligenceDashboardData(orgId);
      setDashboardData(data);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error loading intelligence data:', error);
      toast.error('Failed to load intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: 'improving' | 'stable' | 'deteriorating') => {
    switch (direction) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'deteriorating': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk_trend': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'compliance_gap': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'opportunity': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'threat': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Brain className="h-4 w-4 text-blue-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-muted-foreground">Loading real-time intelligence...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Intelligence Data Available</h3>
          <p className="text-muted-foreground mb-4">Complete your organizational profile to unlock real-time intelligence.</p>
          <Button onClick={loadIntelligenceData}>
            Refresh Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-Time Intelligence Hub</h2>
          <p className="text-muted-foreground">
            Live organizational intelligence and predictive analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Updated {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button size="sm" variant="outline" onClick={loadIntelligenceData}>
            <Eye className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.profile_health_score}/100</div>
            <div className="flex items-center gap-2 mt-1">
              {getTrendIcon(dashboardData.risk_trend_direction)}
              <span className="text-xs text-muted-foreground">
                Overall {dashboardData.risk_trend_direction}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.key_insights.length}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.key_insights.filter(i => i.impact === 'high' || i.impact === 'critical').length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.priority_recommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              Priority actions available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.automation_status.rules_active}</div>
            <p className="text-xs text-muted-foreground">
              Active automation rules
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Live Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="maturity">Maturity Tracking</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {dashboardData.key_insights.map((insight, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getImpactColor(insight.impact) as any}>
                        {insight.impact}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Timeframe: {insight.timeframe.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>Factors: {insight.factors.length}</span>
                    <span>•</span>
                    <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {dashboardData.priority_recommendations.map((rec, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                    <Badge variant={rec.priority === 'critical' ? 'destructive' : 'default'}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Expected Impact:</span> {rec.expected_impact}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Timeline:</span> {rec.estimated_effort.replace('_', ' ')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Category:</span> {rec.category.replace('_', ' ')}
                    </div>
                  </div>
                  <Button size="sm" className="mt-3">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maturity" className="space-y-4">
          <div className="space-y-4">
            {dashboardData.maturity_trajectory.map((trajectory, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base capitalize">
                    {trajectory.dimension.replace('_', ' ')} Maturity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Current Score</span>
                      <span className="font-medium">{trajectory.current_score}/100</span>
                    </div>
                    <Progress value={trajectory.current_score} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Projected Score</span>
                      <span className="font-medium">{trajectory.projected_score}/100</span>
                    </div>
                    <Progress value={trajectory.projected_score} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Improvement Rate</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="font-medium text-green-600">
                          +{trajectory.improvement_rate}% monthly
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData.automation_status.rules_active}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Rules</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.automation_status.actions_executed}
                  </div>
                  <p className="text-sm text-muted-foreground">Actions Executed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.automation_status.efficiency_gained}%
                  </div>
                  <p className="text-sm text-muted-foreground">Efficiency Gained</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeIntelligenceHub;
