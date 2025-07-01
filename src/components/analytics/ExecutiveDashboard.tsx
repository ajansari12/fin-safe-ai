
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Users, 
  DollarSign,
  Activity,
  Target
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ExecutiveDashboard: React.FC = () => {
  // Mock data for executive KPIs
  const kpiData = [
    {
      title: 'Overall Risk Score',
      value: '7.2',
      change: '-0.3',
      trend: 'down',
      status: 'improving',
      icon: Shield
    },
    {
      title: 'Operational Resilience',
      value: '92%',
      change: '+2%',
      trend: 'up',
      status: 'good',
      icon: Activity
    },
    {
      title: 'Critical Incidents',
      value: '3',
      change: '-2',
      trend: 'down',
      status: 'improving',
      icon: AlertTriangle
    },
    {
      title: 'Vendor Risk Exposure',
      value: '$2.4M',
      change: '+$0.1M',
      trend: 'up',
      status: 'attention',
      icon: DollarSign
    }
  ];

  const riskTrendData = [
    { month: 'Jan', score: 8.1, incidents: 5, controls: 85 },
    { month: 'Feb', score: 7.8, incidents: 4, controls: 87 },
    { month: 'Mar', score: 7.5, incidents: 6, controls: 89 },
    { month: 'Apr', score: 7.3, incidents: 3, controls: 91 },
    { month: 'May', score: 7.0, incidents: 4, controls: 93 },
    { month: 'Jun', score: 7.2, incidents: 3, controls: 92 }
  ];

  const riskDistribution = [
    { name: 'Operational', value: 35, color: '#8884d8' },
    { name: 'Cyber', value: 25, color: '#82ca9d' },
    { name: 'Third Party', value: 20, color: '#ffc658' },
    { name: 'Compliance', value: 15, color: '#ff7300' },
    { name: 'Strategic', value: 5, color: '#00ff88' }
  ];

  const businessImpact = [
    { department: 'Trading', high: 2, medium: 5, low: 8 },
    { department: 'Lending', high: 1, medium: 3, low: 12 },
    { department: 'Operations', high: 3, medium: 7, low: 6 },
    { department: 'Technology', high: 4, medium: 8, low: 4 },
    { department: 'Compliance', high: 1, medium: 2, low: 9 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'improving': return 'text-blue-600';
      case 'attention': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      {/* Executive KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = getTrendIcon(kpi.trend);
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendIcon className={`h-3 w-3 ${getStatusColor(kpi.status)}`} />
                  <span className={getStatusColor(kpi.status)}>{kpi.change}</span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risk Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Trend Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Key risk metrics over the past 6 months
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Risk Score"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Critical Incidents"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="controls" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  name="Control Effectiveness %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {riskDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Impact by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Impact by Business Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={businessImpact}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="high" stackId="a" fill="#ef4444" name="High Risk" />
                  <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium Risk" />
                  <Bar dataKey="low" stackId="a" fill="#10b981" name="Low Risk" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Reduced critical incidents by 40%
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Improved control effectiveness to 92%
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Enhanced vendor risk monitoring
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Areas of Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                Technology risk assessment gaps
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                Third-party dependency mapping
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                Scenario testing coverage
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Immediate Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Review high-risk vendor contracts
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Update business continuity plans
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Conduct cybersecurity assessment
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
