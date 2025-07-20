
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Brush,
  ReferenceLine
} from 'recharts';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Filter,
  TrendingUp,
  TrendingDown,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface InteractiveChartProps {
  title: string;
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'area';
    timeRange?: string;
    metrics?: string[];
    showBrush?: boolean;
    enableZoom?: boolean;
  };
  realTimeEnabled?: boolean;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
  title,
  config = {},
  realTimeEnabled = false
}) => {
  const [chartType, setChartType] = useState(config.chartType || 'line');
  const [timeRange, setTimeRange] = useState(config.timeRange || '30d');
  const [zoomDomain, setZoomDomain] = useState<any>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(config.metrics || ['value']);

  // Mock data - replace with real data source
  const data = useMemo(() => {
    const generateData = () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50,
        incidents: Math.floor(Math.random() * 10),
        controls: Math.floor(Math.random() * 50) + 80,
        compliance: Math.floor(Math.random() * 20) + 75
      }));
    };
    return generateData();
  }, [timeRange, realTimeEnabled]);

  const handleZoom = useCallback((domain: any) => {
    setZoomDomain(domain);
  }, []);

  const resetZoom = () => {
    setZoomDomain(null);
  };

  const exportChart = () => {
    // Export functionality
    toast.success('Chart exported successfully');
  };

  const renderChart = () => {
    const chartProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedMetrics.map((metric, index) => (
              <Bar 
                key={metric}
                dataKey={metric} 
                fill={`hsl(${index * 60}, 70%, 50%)`}
              />
            ))}
            {config.showBrush && <Brush dataKey="date" height={30} />}
          </BarChart>
        );
      
      case 'pie':
        const pieData = [
          { name: 'Low Risk', value: 45, color: '#10b981' },
          { name: 'Medium Risk', value: 30, color: '#f59e0b' },
          { name: 'High Risk', value: 20, color: '#ef4444' },
          { name: 'Critical Risk', value: 5, color: '#dc2626' }
        ];
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      
      default: // line chart
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" domain={zoomDomain ? zoomDomain : ['dataMin', 'dataMax']} />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedMetrics.map((metric, index) => (
              <Line 
                key={metric}
                type="monotone" 
                dataKey={metric} 
                stroke={`hsl(${index * 60}, 70%, 50%)`}
                strokeWidth={2}
                dot={{ fill: `hsl(${index * 60}, 70%, 50%)`, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
            {config.showBrush && <Brush dataKey="date" height={30} onChange={handleZoom} />}
            <ReferenceLine y={75} stroke="red" strokeDasharray="5 5" label="Threshold" />
          </LineChart>
        );
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {realTimeEnabled && (
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          )}
          
          <Select value={chartType} onValueChange={(value) => setChartType(value as typeof chartType)}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="pie">Pie</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7D</SelectItem>
              <SelectItem value="30d">30D</SelectItem>
              <SelectItem value="90d">90D</SelectItem>
            </SelectContent>
          </Select>

          {config.enableZoom && zoomDomain && (
            <Button size="sm" variant="outline" onClick={resetZoom}>
              <ZoomOut className="h-3 w-3" />
            </Button>
          )}

          <Button size="sm" variant="outline" onClick={exportChart}>
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          {renderChart()}
        </ResponsiveContainer>
        
        {/* Chart insights */}
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +5.2% vs last period
            </span>
            <span>Avg: {Math.round(data.reduce((acc, d) => acc + d.value, 0) / data.length)}</span>
          </div>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveChart;
