import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { type KRI, type KRIDataPoint } from '@/hooks/useKRI';

interface KRIMetricsProps {
  kris: KRI[];
  dataPoints: KRIDataPoint[];
}

export const KRIMetrics: React.FC<KRIMetricsProps> = ({ kris, dataPoints }) => {
  const metrics = useMemo(() => {
    // Category distribution
    const categoryDistribution = kris.reduce((acc, kri) => {
      acc[kri.category] = (acc[kri.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status distribution
    const statusDistribution = kris.reduce((acc, kri) => {
      const status = kri.current_value !== undefined 
        ? kri.current_value >= kri.critical_threshold 
          ? 'critical'
          : kri.current_value >= kri.warning_threshold 
          ? 'warning' 
          : 'normal'
        : 'no_data';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Frequency distribution
    const frequencyDistribution = kris.reduce((acc, kri) => {
      acc[kri.frequency] = (acc[kri.frequency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDataPoints = dataPoints.filter(dp => 
      new Date(dp.record_date) >= thirtyDaysAgo
    );

    // Daily activity trend
    const dailyActivity = recentDataPoints.reduce((acc, dp) => {
      const date = new Date(dp.record_date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dailyActivityChart = Object.entries(dailyActivity)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString(),
        count
      }));

    return {
      categoryDistribution,
      statusDistribution,
      frequencyDistribution,
      dailyActivityChart,
      totalDataPoints: dataPoints.length,
      recentDataPoints: recentDataPoints.length
    };
  }, [kris, dataPoints]);

  const COLORS = {
    operational: '#8884d8',
    financial: '#82ca9d',
    compliance: '#ffc658',
    strategic: '#ff7c7c',
    critical: '#ff4444',
    warning: '#ffaa00',
    normal: '#00dd00',
    no_data: '#cccccc'
  };

  const categoryData = Object.entries(metrics.categoryDistribution).map(([category, count]) => ({
    name: category,
    value: count,
    color: COLORS[category as keyof typeof COLORS] || '#8884d8'
  }));

  const statusData = Object.entries(metrics.statusDistribution).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count,
    color: COLORS[status as keyof typeof COLORS] || '#8884d8'
  }));

  const frequencyData = Object.entries(metrics.frequencyDistribution).map(([frequency, count]) => ({
    frequency,
    count
  }));

  const getTrendData = () => {
    const trends = kris.reduce((acc, kri) => {
      acc[kri.trend] = (acc[kri.trend] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Improving', value: trends.improving || 0, icon: TrendingDown, color: '#00dd00' },
      { name: 'Stable', value: trends.stable || 0, icon: Activity, color: '#0088dd' },
      { name: 'Deteriorating', value: trends.deteriorating || 0, icon: TrendingUp, color: '#ff4444' }
    ];
  };

  const trendData = getTrendData();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total KRIs</span>
            </div>
            <p className="text-2xl font-bold mt-1">{kris.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Data Points</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.totalDataPoints}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Recent Activity</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.recentDataPoints}</p>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Avg per KRI</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {kris.length > 0 ? Math.round(metrics.totalDataPoints / kris.length) : 0}
            </p>
            <p className="text-xs text-muted-foreground">Data points</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>KRI Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>KRI Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendData.map((trend) => {
                const IconComponent = trend.icon;
                return (
                  <div key={trend.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5" style={{ color: trend.color }} />
                      <span className="font-medium">{trend.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{trend.value}</span>
                      <Badge variant="outline" className="text-xs">
                        {kris.length > 0 ? Math.round((trend.value / kris.length) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Frequency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Measurement Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="frequency" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      {metrics.dailyActivityChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily KRI Data Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.dailyActivityChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* KRI Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>KRI Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kris.slice(0, 8).map((kri) => {
              const kriDataCount = dataPoints.filter(dp => dp.kri_id === kri.id).length;
              const status = kri.current_value !== undefined 
                ? kri.current_value >= kri.critical_threshold 
                  ? 'critical'
                  : kri.current_value >= kri.warning_threshold 
                  ? 'warning' 
                  : 'normal'
                : 'no_data';

              return (
                <div key={kri.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm truncate">{kri.name}</h4>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: COLORS[status as keyof typeof COLORS] + '20',
                        borderColor: COLORS[status as keyof typeof COLORS],
                        color: COLORS[status as keyof typeof COLORS]
                      }}
                    >
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Current: {kri.current_value || 'No data'}</p>
                    <p>Data points: {kriDataCount}</p>
                    <p>Trend: {kri.trend}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};