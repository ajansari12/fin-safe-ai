import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  Filter, 
  Download,
  Maximize2,
  Share2,
  RefreshCw
} from 'lucide-react';

export const DataVisualization = () => {
  const [selectedDashboard, setSelectedDashboard] = useState('risk-overview');
  const [timeRange, setTimeRange] = useState('30-days');

  const dashboards = [
    {
      id: 'risk-overview',
      name: 'Risk Overview Dashboard',
      description: 'Comprehensive risk metrics and trends',
      widgets: 8,
      lastUpdated: '2 minutes ago'
    },
    {
      id: 'compliance-metrics',
      name: 'Compliance Metrics',
      description: 'Regulatory compliance status and trends',
      widgets: 6,
      lastUpdated: '5 minutes ago'
    },
    {
      id: 'performance-analytics',
      name: 'Performance Analytics',
      description: 'Operational performance indicators',
      widgets: 10,
      lastUpdated: '1 minute ago'
    },
    {
      id: 'predictive-insights',
      name: 'Predictive Insights',
      description: 'AI-powered forecasts and predictions',
      widgets: 7,
      lastUpdated: '3 minutes ago'
    }
  ];

  const widgets = [
    {
      id: 1,
      title: 'Risk Score Trend',
      type: 'line-chart',
      description: 'Risk score evolution over time',
      data: 'Real-time data',
      size: 'large'
    },
    {
      id: 2,
      title: 'Risk Distribution',
      type: 'pie-chart',
      description: 'Risk categories breakdown',
      data: 'Live feed',
      size: 'medium'
    },
    {
      id: 3,
      title: 'Compliance Status',
      type: 'bar-chart',
      description: 'Compliance metrics by category',
      data: 'Updated hourly',
      size: 'medium'
    },
    {
      id: 4,
      title: 'Performance Indicators',
      type: 'metric-grid',
      description: 'Key performance metrics',
      data: 'Real-time',
      size: 'small'
    },
    {
      id: 5,
      title: 'Incident Timeline',
      type: 'timeline',
      description: 'Recent incidents and events',
      data: 'Live updates',
      size: 'large'
    },
    {
      id: 6,
      title: 'Predictive Analysis',
      type: 'forecast-chart',
      description: 'AI-powered predictions',
      data: 'ML models',
      size: 'medium'
    }
  ];

  const visualizationOptions = [
    {
      category: 'Chart Types',
      options: [
        { name: 'Line Charts', icon: LineChart, description: 'Trend analysis over time' },
        { name: 'Bar Charts', icon: BarChart3, description: 'Categorical comparisons' },
        { name: 'Pie Charts', icon: PieChart, description: 'Distribution analysis' },
        { name: 'Scatter Plots', icon: TrendingUp, description: 'Correlation analysis' }
      ]
    },
    {
      category: 'Advanced Visualizations',
      options: [
        { name: 'Heat Maps', icon: BarChart3, description: 'Risk intensity mapping' },
        { name: 'Network Diagrams', icon: LineChart, description: 'Relationship visualization' },
        { name: 'Sankey Diagrams', icon: TrendingUp, description: 'Flow analysis' },
        { name: 'Tree Maps', icon: PieChart, description: 'Hierarchical data' }
      ]
    }
  ];

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'line-chart': return <LineChart className="w-4 h-4" />;
      case 'bar-chart': return <BarChart3 className="w-4 h-4" />;
      case 'pie-chart': return <PieChart className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getWidgetSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'medium': return 'col-span-2 row-span-1';
      case 'large': return 'col-span-3 row-span-2';
      default: return 'col-span-2 row-span-1';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Interactive Data Visualization</span>
              </CardTitle>
              <CardDescription>
                Dynamic dashboards and advanced data visualization tools
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select dashboard" />
                </SelectTrigger>
                <SelectContent>
                  {dashboards.map((dashboard) => (
                    <SelectItem key={dashboard.id} value={dashboard.id}>
                      {dashboard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24-hours">24 Hours</SelectItem>
                  <SelectItem value="7-days">7 Days</SelectItem>
                  <SelectItem value="30-days">30 Days</SelectItem>
                  <SelectItem value="90-days">90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard View</TabsTrigger>
          <TabsTrigger value="builder">Visualization Builder</TabsTrigger>
          <TabsTrigger value="gallery">Chart Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {dashboards
              .filter(d => d.id === selectedDashboard)
              .map((dashboard) => (
                <Card key={dashboard.id} className="md:col-span-4">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{dashboard.name}</h3>
                        <p className="text-sm text-muted-foreground">{dashboard.description}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{dashboard.widgets} widgets</span>
                        <span>•</span>
                        <span>Updated {dashboard.lastUpdated}</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-300">
                          Live
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Widget Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[200px]">
            {widgets.map((widget) => (
              <Card 
                key={widget.id} 
                className={`${getWidgetSizeClass(widget.size)} hover:shadow-md transition-shadow`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      {getWidgetIcon(widget.type)}
                      <span>{widget.title}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Maximize2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs">{widget.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                    <div className="text-center">
                      {getWidgetIcon(widget.type)}
                      <p className="text-xs text-muted-foreground mt-2">{widget.data}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          {/* Visualization Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Visualization Builder</CardTitle>
              <CardDescription>Create custom charts and dashboards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Data Source</h4>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="risk-data">Risk Assessment Data</SelectItem>
                      <SelectItem value="compliance-data">Compliance Metrics</SelectItem>
                      <SelectItem value="performance-data">Performance Data</SelectItem>
                      <SelectItem value="incident-data">Incident Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Chart Type</h4>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="scatter">Scatter Plot</SelectItem>
                      <SelectItem value="heatmap">Heat Map</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Time Period</h4>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real-time">Real-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Chart
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          {/* Chart Gallery */}
          {visualizationOptions.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle>{category.category}</CardTitle>
                <CardDescription>Available visualization options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.options.map((option, optionIndex) => (
                    <Card key={optionIndex} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <option.icon className="w-4 h-4" />
                          <span>{option.name}</span>
                        </CardTitle>
                        <CardDescription className="text-xs">{option.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center">
                          <option.icon className="w-8 h-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};