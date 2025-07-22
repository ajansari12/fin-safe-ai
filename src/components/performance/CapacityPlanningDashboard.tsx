import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Server, 
  Database, 
  Cpu, 
  HardDrive,
  Network,
  DollarSign,
  CalendarDays,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CapacityMetric {
  resource_type: string;
  current_utilization: number;
  projected_utilization: number;
  growth_rate: number;
  capacity_limit: number;
  time_to_capacity: number; // days
  cost_per_unit: number;
}

interface CapacityRecommendation {
  id: string;
  resource_type: string;
  recommendation_type: 'scale_up' | 'scale_out' | 'optimize' | 'migrate';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_cost: number;
  estimated_savings: number;
  implementation_effort: 'low' | 'medium' | 'high';
  expected_outcome: string;
}

interface CostProjection {
  scenario: string;
  monthly_cost: number;
  yearly_cost: number;
  resource_breakdown: Record<string, number>;
}

interface CapacityForecast {
  date: string;
  cpu_usage: number;
  memory_usage: number;
  storage_usage: number;
  network_usage: number;
  predicted_load: number;
}

interface CapacityPlanningDashboardProps {
  org_id: string;
}

const CapacityPlanningDashboard: React.FC<CapacityPlanningDashboardProps> = ({ org_id }) => {
  const [capacityMetrics, setCapacityMetrics] = useState<CapacityMetric[]>([]);
  const [recommendations, setRecommendations] = useState<CapacityRecommendation[]>([]);
  const [costProjections, setCostProjections] = useState<CostProjection[]>([]);
  const [forecastData, setForecastData] = useState<CapacityForecast[]>([]);
  const [timeHorizon, setTimeHorizon] = useState('6'); // months
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCapacityData();
  }, [org_id, timeHorizon]);

  const loadCapacityData = async () => {
    try {
      setLoading(true);
      
      // Load performance optimizations data from database
      const { data: optimizations, error } = await supabase
        .from('performance_optimizations')
        .select('*')
        .eq('org_id', org_id);

      if (error) throw error;

      // Generate mock capacity metrics
      const mockMetrics: CapacityMetric[] = [
        {
          resource_type: 'CPU',
          current_utilization: 68,
          projected_utilization: 85,
          growth_rate: 2.5,
          capacity_limit: 90,
          time_to_capacity: 120,
          cost_per_unit: 150
        },
        {
          resource_type: 'Memory',
          current_utilization: 72,
          projected_utilization: 88,
          growth_rate: 3.2,
          capacity_limit: 90,
          time_to_capacity: 95,
          cost_per_unit: 100
        },
        {
          resource_type: 'Storage',
          current_utilization: 45,
          projected_utilization: 65,
          growth_rate: 5.1,
          capacity_limit: 80,
          time_to_capacity: 180,
          cost_per_unit: 50
        },
        {
          resource_type: 'Network',
          current_utilization: 35,
          projected_utilization: 55,
          growth_rate: 4.2,
          capacity_limit: 85,
          time_to_capacity: 240,
          cost_per_unit: 200
        }
      ];

      setCapacityMetrics(mockMetrics);

      // Generate capacity recommendations
      const mockRecommendations: CapacityRecommendation[] = [
        {
          id: '1',
          resource_type: 'Memory',
          recommendation_type: 'scale_up',
          description: 'Upgrade memory from 32GB to 64GB to handle projected workload growth',
          priority: 'high',
          estimated_cost: 2400,
          estimated_savings: 0,
          implementation_effort: 'low',
          expected_outcome: 'Prevent memory bottlenecks and improve application performance by 25%'
        },
        {
          id: '2',
          resource_type: 'CPU',
          recommendation_type: 'scale_out',
          description: 'Add 2 additional CPU cores to distribute load more effectively',
          priority: 'medium',
          estimated_cost: 3600,
          estimated_savings: 0,
          implementation_effort: 'medium',
          expected_outcome: 'Reduce CPU bottlenecks and improve response times by 15%'
        },
        {
          id: '3',
          resource_type: 'Database',
          recommendation_type: 'optimize',
          description: 'Implement database query optimization and indexing improvements',
          priority: 'high',
          estimated_cost: 1200,
          estimated_savings: 800,
          implementation_effort: 'medium',
          expected_outcome: 'Reduce database load by 30% and improve query performance'
        },
        {
          id: '4',
          resource_type: 'Storage',
          recommendation_type: 'migrate',
          description: 'Migrate to SSD storage for better I/O performance',
          priority: 'medium',
          estimated_cost: 5000,
          estimated_savings: 0,
          implementation_effort: 'high',
          expected_outcome: 'Improve storage performance by 300% and reduce latency'
        }
      ];

      setRecommendations(mockRecommendations);

      // Generate cost projections
      const mockCostProjections: CostProjection[] = [
        {
          scenario: 'Current Growth',
          monthly_cost: 8500,
          yearly_cost: 102000,
          resource_breakdown: { cpu: 3000, memory: 2500, storage: 1500, network: 1500 }
        },
        {
          scenario: 'Optimized',
          monthly_cost: 7200,
          yearly_cost: 86400,
          resource_breakdown: { cpu: 2500, memory: 2000, storage: 1300, network: 1400 }
        },
        {
          scenario: 'Scaled',
          monthly_cost: 12000,
          yearly_cost: 144000,
          resource_breakdown: { cpu: 4500, memory: 3500, storage: 2000, network: 2000 }
        }
      ];

      setCostProjections(mockCostProjections);

      // Generate forecast data
      const generateForecastData = () => {
        const data: CapacityForecast[] = [];
        const months = parseInt(timeHorizon);
        
        for (let i = 0; i <= months; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() + i);
          
          data.push({
            date: date.toISOString().substring(0, 7), // YYYY-MM format
            cpu_usage: Math.min(68 + (i * 2.5), 100),
            memory_usage: Math.min(72 + (i * 3.2), 100),
            storage_usage: Math.min(45 + (i * 5.1), 100),
            network_usage: Math.min(35 + (i * 4.2), 100),
            predicted_load: Math.min(60 + (i * 3.5), 100)
          });
        }
        
        return data;
      };

      setForecastData(generateForecastData());

    } catch (error) {
      console.error('Failed to load capacity data:', error);
      toast({
        title: "Error",
        description: "Failed to load capacity planning data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case 'cpu': return <Cpu className="h-4 w-4" />;
      case 'memory': return <Server className="h-4 w-4" />;
      case 'storage': return <HardDrive className="h-4 w-4" />;
      case 'network': return <Network className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 80) return 'text-orange-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <BarChart3 className="h-8 w-8 animate-pulse" />
      </div>
    );
  }

  const criticalResources = capacityMetrics.filter(m => m.time_to_capacity < 90).length;
  const totalMonthlyCost = costProjections.find(p => p.scenario === 'Current Growth')?.monthly_cost || 0;
  const optimizedSavings = totalMonthlyCost - (costProjections.find(p => p.scenario === 'Optimized')?.monthly_cost || 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Capacity Planning</h3>
          <p className="text-muted-foreground">
            Resource forecasting and optimization recommendations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Forecast Period:</label>
          <Select value={timeHorizon} onValueChange={setTimeHorizon}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
              <SelectItem value="24">24 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Resources</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalResources}</div>
            <p className="text-xs text-muted-foreground">reaching capacity soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyCost)}</div>
            <p className="text-xs text-muted-foreground">current infrastructure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(optimizedSavings)}</div>
            <p className="text-xs text-muted-foreground">through optimization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">optimization opportunities</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resource Overview</TabsTrigger>
          <TabsTrigger value="forecast">Capacity Forecast</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {capacityMetrics.map((metric) => (
              <Card key={metric.resource_type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getResourceIcon(metric.resource_type)}
                    {metric.resource_type}
                  </CardTitle>
                  <CardDescription>
                    Current utilization and growth projections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Utilization</span>
                      <span className={getUtilizationColor(metric.current_utilization)}>
                        {metric.current_utilization}%
                      </span>
                    </div>
                    <Progress value={metric.current_utilization} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Projected ({timeHorizon} months)</span>
                      <span className={getUtilizationColor(metric.projected_utilization)}>
                        {metric.projected_utilization}%
                      </span>
                    </div>
                    <Progress value={metric.projected_utilization} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Growth Rate</span>
                      <div className="font-medium">+{metric.growth_rate}% monthly</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time to Capacity</span>
                      <div className="font-medium">{metric.time_to_capacity} days</div>
                    </div>
                  </div>

                  {metric.time_to_capacity < 90 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-800">
                        Approaching capacity limit - action required soon
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Capacity Forecast - {timeHorizon} Month Projection</CardTitle>
              <CardDescription>
                Predicted resource utilization based on current growth trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cpu_usage"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="CPU Usage"
                    />
                    <Area
                      type="monotone"
                      dataKey="memory_usage"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Memory Usage"
                    />
                    <Area
                      type="monotone"
                      dataKey="storage_usage"
                      stackId="3"
                      stroke="#ffc658"
                      fill="#ffc658"
                      name="Storage Usage"
                    />
                    <Area
                      type="monotone"
                      dataKey="network_usage"
                      stackId="4"
                      stroke="#ff7300"
                      fill="#ff7300"
                      name="Network Usage"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getResourceIcon(rec.resource_type)}
                        {rec.resource_type} - {rec.recommendation_type.replace('_', ' ').toUpperCase()}
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                    <Button size="sm">
                      Implement
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <h4 className="font-medium text-sm">Cost Impact</h4>
                      <div className="text-sm">
                        <div>Investment: {formatCurrency(rec.estimated_cost)}</div>
                        {rec.estimated_savings > 0 && (
                          <div className="text-green-600">
                            Savings: {formatCurrency(rec.estimated_savings)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Implementation</h4>
                      <Badge variant="outline">
                        {rec.implementation_effort} effort
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Expected Outcome</h4>
                      <p className="text-sm text-muted-foreground">
                        {rec.expected_outcome}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">ROI Timeline</h4>
                      <div className="text-sm">
                        {rec.estimated_savings > 0 
                          ? `${Math.round(rec.estimated_cost / rec.estimated_savings)} months`
                          : 'Performance improvement'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="costs">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost Projections</CardTitle>
                <CardDescription>
                  Compare costs across different scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costProjections.map((projection) => (
                    <div key={projection.scenario} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{projection.scenario}</h4>
                        <Badge variant={projection.scenario === 'Optimized' ? "default" : "outline"}>
                          {projection.scenario === 'Optimized' && 'Recommended'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Monthly</span>
                          <div className="font-medium">{formatCurrency(projection.monthly_cost)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Yearly</span>
                          <div className="font-medium">{formatCurrency(projection.yearly_cost)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Cost Breakdown</CardTitle>
                <CardDescription>
                  Current monthly costs by resource type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(costProjections[0]?.resource_breakdown || {}).map(([key, value]) => ({
                      resource: key.toUpperCase(),
                      cost: value
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="resource" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Cost']} />
                      <Bar dataKey="cost" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CapacityPlanningDashboard;