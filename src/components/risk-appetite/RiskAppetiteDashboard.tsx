
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getRiskAppetiteStatements, getRiskCategories } from '@/services/risk-management-service';
import { getKRIDefinitions } from '@/services/kri-definitions';
import { useAuth } from '@/contexts/AuthContext';
import { RiskAppetiteStatement, RiskCategory } from '@/pages/risk-management/types';
import { KRIDefinition } from '@/services/kri-definitions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface RiskMetric {
  category: string;
  appetiteLevel: 'low' | 'medium' | 'high';
  actualLevel: number;
  variance: number;
  status: 'within' | 'warning' | 'breach';
  kriCount: number;
  trend: 'up' | 'down' | 'stable';
}

const RiskAppetiteDashboard = () => {
  const { profile } = useAuth();
  const [statements, setStatements] = useState<RiskAppetiteStatement[]>([]);
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [kris, setKris] = useState<KRIDefinition[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!profile?.organization_id) return;
      
      setIsLoading(true);
      try {
        const [statementsData, categoriesData, krisData] = await Promise.all([
          getRiskAppetiteStatements(profile.organization_id),
          getRiskCategories(),
          getKRIDefinitions()
        ]);
        
        setStatements(statementsData);
        setCategories(categoriesData);
        setKris(krisData);
        
        // Generate mock risk metrics for demonstration
        const metrics: RiskMetric[] = categoriesData.map(category => {
          const categoryKris = krisData.filter(kri => 
            kri.risk_appetite_statement_id && 
            statementsData.some(s => s.id === kri.risk_appetite_statement_id)
          );
          
          const actualLevel = Math.random() * 100;
          const appetiteLevel = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high';
          const appetiteThreshold = appetiteLevel === 'low' ? 30 : appetiteLevel === 'medium' ? 60 : 90;
          const variance = actualLevel - appetiteThreshold;
          
          return {
            category: category.name,
            appetiteLevel,
            actualLevel,
            variance,
            status: variance > 20 ? 'breach' : variance > 10 ? 'warning' : 'within',
            kriCount: categoryKris.length,
            trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
          };
        });
        
        setRiskMetrics(metrics);
      } catch (error) {
        console.error('Error loading risk appetite data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [profile?.organization_id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'within': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'breach': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'within': return 'default';
      case 'warning': return 'secondary';
      case 'breach': return 'destructive';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const chartData = riskMetrics.map(metric => ({
    name: metric.category.substring(0, 10),
    appetite: metric.appetiteLevel === 'low' ? 30 : metric.appetiteLevel === 'medium' ? 60 : 90,
    actual: metric.actualLevel,
    variance: metric.variance
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const withinAppetite = riskMetrics.filter(m => m.status === 'within').length;
  const warnings = riskMetrics.filter(m => m.status === 'warning').length;
  const breaches = riskMetrics.filter(m => m.status === 'breach').length;
  const totalKris = riskMetrics.reduce((sum, m) => sum + m.kriCount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Within Appetite</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withinAppetite}</div>
            <p className="text-xs text-muted-foreground">
              Risk categories within tolerance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warnings}</div>
            <p className="text-xs text-muted-foreground">
              Categories approaching limits
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Breaches</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{breaches}</div>
            <p className="text-xs text-muted-foreground">
              Categories exceeding appetite
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total KRIs</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKris}</div>
            <p className="text-xs text-muted-foreground">
              Key risk indicators monitored
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Appetite vs Actual Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Appetite vs Actual Levels</CardTitle>
            <CardDescription>
              Comparison of risk appetite thresholds and current risk levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="appetite" fill="#8884d8" name="Risk Appetite" />
                <Bar dataKey="actual" fill="#82ca9d" name="Actual Risk" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Variance Trend</CardTitle>
            <CardDescription>
              Variance between appetite and actual risk over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="variance" stroke="#ff7300" name="Variance" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Categories Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Categories Status</CardTitle>
          <CardDescription>
            Detailed view of each risk category's appetite and current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{metric.category}</h4>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <Badge variant={getStatusBadgeVariant(metric.status)}>
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Appetite</p>
                    <p className="font-medium capitalize">{metric.appetiteLevel}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Actual</p>
                    <p className="font-medium">{metric.actualLevel.toFixed(1)}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Variance</p>
                    <p className={`font-medium ${metric.variance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {metric.variance > 0 ? '+' : ''}{metric.variance.toFixed(1)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">KRIs</p>
                    <p className="font-medium">{metric.kriCount}</p>
                  </div>
                  
                  <div className="w-24">
                    <Progress 
                      value={Math.min(metric.actualLevel, 100)} 
                      className={`h-2 ${getStatusColor(metric.status)}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAppetiteDashboard;
