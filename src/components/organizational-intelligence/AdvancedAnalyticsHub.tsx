
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp,
  Target,
  Users,
  Calendar,
  Download,
  Share2,
  Filter,
  RefreshCw,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  period: string;
}

interface ExecutiveInsight {
  id: string;
  title: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  data_points: string[];
  created_at: string;
}

interface AdvancedAnalyticsHubProps {
  orgId: string;
}

const AdvancedAnalyticsHub: React.FC<AdvancedAnalyticsHubProps> = ({ orgId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [insights, setInsights] = useState<ExecutiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [orgId, selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock advanced analytics data
      const mockMetrics: AnalyticsMetric[] = [
        {
          id: '1',
          name: 'Risk Maturity Index',
          value: 87.5,
          change: 5.2,
          trend: 'up',
          category: 'Risk Management',
          period: selectedPeriod
        },
        {
          id: '2',
          name: 'Compliance Effectiveness',
          value: 94.2,
          change: 2.1,
          trend: 'up',
          category: 'Compliance',
          period: selectedPeriod
        },
        {
          id: '3',
          name: 'Operational Resilience Score',
          value: 82.3,
          change: -1.5,
          trend: 'down',
          category: 'Operations',
          period: selectedPeriod
        },
        {
          id: '4',
          name: 'Automation Efficiency',
          value: 76.8,
          change: 8.7,
          trend: 'up',
          category: 'Automation',
          period: selectedPeriod
        }
      ];

      const mockInsights: ExecutiveInsight[] = [
        {
          id: '1',
          title: 'Risk Appetite Optimization Opportunity',
          summary: 'Analysis indicates potential for 15% improvement in risk-adjusted returns through appetite recalibration.',
          impact: 'high',
          recommendation: 'Consider increasing risk appetite for growth initiatives while maintaining core stability metrics.',
          data_points: ['Historical performance data', 'Peer benchmark analysis', 'Regulatory guidelines'],
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Workflow Automation Success',
          summary: 'Automated workflows have reduced processing time by 40% and improved accuracy by 25%.',
          impact: 'medium',
          recommendation: 'Expand automation to additional high-volume processes identified in the analysis.',
          data_points: ['Process timing metrics', 'Error rate analysis', 'Resource utilization'],
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Compliance Framework Enhancement',
          summary: 'New regulatory requirements present opportunity to streamline existing frameworks.',
          impact: 'medium',
          recommendation: 'Consolidate overlapping requirements and implement unified monitoring approach.',
          data_points: ['Regulatory mapping', 'Framework overlap analysis', 'Resource allocation'],
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      setMetrics(mockMetrics);
      setInsights(mockInsights);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <BarChart3 className="h-8 w-8 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics Hub</h2>
            <p className="text-muted-foreground">
              Strategic insights and executive reporting for organizational intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={() => loadAnalyticsData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Executive Insights</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {metric.name}
                    </span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{metric.value}%</div>
                    <div className={`text-sm font-medium ${
                      metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change >= 0 ? '+' : ''}{metric.change}%
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    vs previous {selectedPeriod}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analytics Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Risk Portfolio Analysis</h3>
                  <p>Interactive risk distribution visualization</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <LineChart className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Trend Analysis</h3>
                  <p>Multi-dimensional performance trending</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(insight.created_at)}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">{insight.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommendation</h4>
                    <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Supporting Data</h4>
                    <div className="flex flex-wrap gap-2">
                      {insight.data_points.map((point, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Period Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Advanced Trend Analytics</h3>
                <p className="max-w-md mx-auto">
                  Comprehensive trend analysis across multiple time periods and organizational dimensions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Comparative Analysis</h3>
                <p className="max-w-md mx-auto">
                  Compare your organization's performance against industry standards and peer organizations
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Executive Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Comprehensive executive summary with key metrics and insights
                </p>
                <div className="flex gap-2">
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Board Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Board-level strategic insights and risk posture analysis
                </p>
                <div className="flex gap-2">
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regulatory Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Compliance status and regulatory alignment assessment
                </p>
                <div className="flex gap-2">
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operational Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Detailed operational metrics and performance analysis
                </p>
                <div className="flex gap-2">
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsHub;
