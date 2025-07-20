import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Target, Settings, Plus } from 'lucide-react';
import { performanceOptimizedQueryService } from '@/services/performance-optimized-query-service';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface KRIMetric {
  id: string;
  name: string;
  currentValue: number;
  threshold: number;
  warningThreshold: number;
  criticalThreshold: number;
  status: 'green' | 'amber' | 'red';
  trend: 'increasing' | 'decreasing' | 'stable';
  lastUpdated: string;
  unit: string;
  dataQuality: number;
  breachCount: number;
}

const mockKRIData: KRIMetric[] = [
  {
    id: '1',
    name: 'Operational Loss Events',
    currentValue: 8,
    threshold: 10,
    warningThreshold: 8,
    criticalThreshold: 12,
    status: 'amber',
    trend: 'increasing',
    lastUpdated: '2024-01-15T10:30:00Z',
    unit: 'events',
    dataQuality: 95,
    breachCount: 2
  },
  {
    id: '2',
    name: 'System Downtime',
    currentValue: 2.5,
    threshold: 5.0,
    warningThreshold: 4.0,
    criticalThreshold: 6.0,
    status: 'green',
    trend: 'stable',
    lastUpdated: '2024-01-15T09:15:00Z',
    unit: 'hours',
    dataQuality: 98,
    breachCount: 0
  },
  {
    id: '3',
    name: 'Credit Default Rate',
    currentValue: 3.2,
    threshold: 2.0,
    warningThreshold: 2.5,
    criticalThreshold: 3.5,
    status: 'red',
    trend: 'increasing',
    lastUpdated: '2024-01-15T08:45:00Z',
    unit: '%',
    dataQuality: 92,
    breachCount: 5
  }
];

const chartConfig = {
  value: {
    label: "KRI Value",
    color: "hsl(var(--chart-1))",
  },
  threshold: {
    label: "Threshold",
    color: "hsl(var(--chart-2))",
  }
};

export const EnhancedKRIDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  
  const { data: kriSummary, isLoading } = useQuery({
    queryKey: ['kriSummary'],
    queryFn: () => performanceOptimizedQueryService.getKRISummary()
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'amber': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const summaryStats = [
    { label: 'Total KRIs', value: kriSummary?.uniqueKRIs || mockKRIData.length, icon: Activity },
    { label: 'Breached Today', value: mockKRIData.filter(k => k.status === 'red').length, icon: AlertTriangle },
    { label: 'At Warning', value: mockKRIData.filter(k => k.status === 'amber').length, icon: Target },
    { label: 'Avg Data Quality', value: `${Math.round(mockKRIData.reduce((acc, k) => acc + k.dataQuality, 0) / mockKRIData.length)}%`, icon: Settings }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KRI Management Dashboard</h2>
          <p className="text-muted-foreground">Monitor key risk indicators and threshold breaches</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add KRI
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KRI Status Cards */}
            <Card>
              <CardHeader>
                <CardTitle>KRI Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockKRIData.map((kri) => (
                    <div key={kri.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          kri.status === 'green' ? 'bg-green-500' : 
                          kri.status === 'amber' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium">{kri.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {kri.currentValue}{kri.unit} / {kri.threshold}{kri.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(kri.trend)}
                        <Badge className={getStatusColor(kri.status)}>
                          {kri.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Traffic Light Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Traffic Light</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="space-y-2">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        mockKRIData.some(k => k.status === 'red') ? 'bg-red-500' : 'bg-red-200'
                      }`}>
                        <span className="text-white font-bold">
                          {mockKRIData.filter(k => k.status === 'red').length}
                        </span>
                      </div>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        mockKRIData.some(k => k.status === 'amber') ? 'bg-yellow-500' : 'bg-yellow-200'
                      }`}>
                        <span className="text-white font-bold">
                          {mockKRIData.filter(k => k.status === 'amber').length}
                        </span>
                      </div>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        mockKRIData.some(k => k.status === 'green') ? 'bg-green-500' : 'bg-green-200'
                      }`}>
                        <span className="text-white font-bold">
                          {mockKRIData.filter(k => k.status === 'green').length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Overall Risk Status: 
                      <span className={`ml-1 font-medium ${
                        mockKRIData.some(k => k.status === 'red') ? 'text-red-600' :
                        mockKRIData.some(k => k.status === 'amber') ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {mockKRIData.some(k => k.status === 'red') ? 'HIGH' :
                         mockKRIData.some(k => k.status === 'amber') ? 'MEDIUM' : 'LOW'}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Active Breach Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockKRIData.filter(kri => kri.status !== 'green').map((kri) => (
                  <div key={kri.id} className="flex items-center justify-between p-4 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">{kri.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {kri.currentValue}{kri.unit} | Threshold: {kri.threshold}{kri.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last breach: {new Date(kri.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {((kri.currentValue / kri.threshold) * 100).toFixed(0)}% of threshold
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {kri.breachCount} breaches this month
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KRI Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { date: '2024-01-01', value: 5, threshold: 10 },
                    { date: '2024-01-05', value: 7, threshold: 10 },
                    { date: '2024-01-10', value: 8, threshold: 10 },
                    { date: '2024-01-15', value: 12, threshold: 10 }
                  ]}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="threshold"
                      stroke="var(--color-threshold)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockKRIData.map((kri) => (
                  <div key={kri.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{kri.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(kri.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${kri.dataQuality}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{kri.dataQuality}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};