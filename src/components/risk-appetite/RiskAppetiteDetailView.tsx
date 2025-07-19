
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  FileText,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getRiskAppetiteStatementById } from '@/services/risk-management-service';
import { RiskAppetiteComplete } from '@/pages/risk-management/types';
import { format } from 'date-fns';

const RiskAppetiteDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [statement, setStatement] = useState<RiskAppetiteComplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadStatement = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getRiskAppetiteStatementById(id);
        setStatement(data);
      } catch (error) {
        console.error('Error loading risk appetite statement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatement();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Statement Not Found</h2>
          <Button onClick={() => navigate('/app/risk-appetite')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Risk Appetite
          </Button>
        </div>
      </div>
    );
  }

  // Mock data for visualization - would come from real data
  const trendData = [
    { date: '2024-01', actual: 65, threshold: 70, tolerance: 85 },
    { date: '2024-02', actual: 72, threshold: 70, tolerance: 85 },
    { date: '2024-03', actual: 68, threshold: 70, tolerance: 85 },
    { date: '2024-04', actual: 75, threshold: 70, tolerance: 85 },
    { date: '2024-05', actual: 82, threshold: 70, tolerance: 85 },
    { date: '2024-06', actual: 78, threshold: 70, tolerance: 85 },
  ];

  const riskPostureData = statement.thresholds?.map((threshold, index) => ({
    category: threshold.category?.name || `Category ${index + 1}`,
    current: Math.floor(Math.random() * 100),
    target: Math.floor(Math.random() * 80),
    tolerance: threshold.tolerance_level === 'low' ? 30 : threshold.tolerance_level === 'medium' ? 60 : 90
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/app/risk-appetite')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{statement.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={statement.status === 'active' ? 'default' : 'secondary'}>
                {statement.status}
              </Badge>
              <Badge variant="outline">Version {statement.version}</Badge>
              <span className="text-sm text-muted-foreground">
                Updated {format(new Date(statement.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Risk Posture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Within Appetite</div>
                <p className="text-xs text-muted-foreground">
                  85% of thresholds within target
                </p>
                <Progress value={85} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Breaches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">2</div>
                <p className="text-xs text-muted-foreground">
                  <AlertTriangle className="inline h-3 w-3 mr-1" />
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-2xl font-bold text-green-600">Improving</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  +5% vs last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {statement.description && (
            <Card>
              <CardHeader>
                <CardTitle>Statement Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{statement.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Risk Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Categories Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskPostureData.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={category.current > category.tolerance ? 'destructive' : 'default'}>
                          {category.current}%
                        </Badge>
                        {category.current > category.tolerance ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={category.current} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-6">
          <div className="grid gap-4">
            {statement.thresholds?.map((threshold, index) => (
              <Card key={threshold.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {threshold.category?.name || `Threshold ${index + 1}`}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {threshold.category?.description}
                      </p>
                    </div>
                    <Badge variant={
                      threshold.tolerance_level === 'low' ? 'destructive' :
                      threshold.tolerance_level === 'medium' ? 'default' : 'secondary'
                    }>
                      {threshold.tolerance_level} tolerance
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Risk Appetite Statement</h4>
                      <p className="text-sm text-muted-foreground">
                        {'No statement defined'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">KRIs ({threshold.kris?.length || 0})</h4>
                      <div className="space-y-1">
                        {threshold.kris?.slice(0, 3).map((kri) => (
                          <div key={kri.id} className="text-sm flex justify-between">
                            <span>{kri.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {kri.measurement_frequency}
                            </Badge>
                          </div>
                        ))}
                        {(threshold.kris?.length || 0) > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{(threshold.kris?.length || 0) - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No thresholds defined</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Appetite Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="tolerance" 
                      stackId="1" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.1}
                      name="Tolerance Level"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="threshold" 
                      stackId="2" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.2}
                      name="Appetite Threshold"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Actual Performance"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Breach History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">This Month</span>
                    <Badge variant="destructive">2 breaches</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Month</span>
                    <Badge variant="outline">1 breach</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">3 Months Ago</span>
                    <Badge variant="outline">0 breaches</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Time in Appetite</span>
                    <span className="font-medium">89%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Breach Resolution Time</span>
                    <span className="font-medium">2.3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Statement Effectiveness</span>
                    <span className="font-medium">High</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-blue-900">Key Insight</h4>
                  <p className="text-sm text-muted-foreground">
                    Operational risk metrics are trending above appetite thresholds, primarily driven by 
                    increased third-party dependencies and technology incidents.
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-orange-900">Risk Alert</h4>
                  <p className="text-sm text-muted-foreground">
                    Credit risk appetite may be breached in the next quarter based on current lending 
                    growth patterns and economic indicators.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-green-900">Recommendation</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider updating operational risk thresholds to reflect the current business environment 
                    and enhanced third-party oversight capabilities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparative Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Comparative analysis with industry benchmarks will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskAppetiteDetailView;
