import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Calendar, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

export const TrendAnalysis = () => {
  const [selectedMetric, setSelectedMetric] = useState('risk-trends');
  const [timeRange, setTimeRange] = useState('12-months');

  const trendCategories = [
    {
      id: 'risk-trends',
      name: 'Risk Trends',
      description: 'Risk metric evolution and patterns',
      metrics: 8
    },
    {
      id: 'compliance-trends',
      name: 'Compliance Trends',
      description: 'Regulatory compliance patterns',
      metrics: 6
    },
    {
      id: 'performance-trends',
      name: 'Performance Trends',
      description: 'Operational performance evolution',
      metrics: 10
    },
    {
      id: 'market-trends',
      name: 'Market Trends',
      description: 'External market influences',
      metrics: 5
    }
  ];

  const trendData = [
    {
      metric: 'Overall Risk Score',
      current: 87.3,
      previous: 82.1,
      change: 5.2,
      trend: 'improving',
      velocity: 'accelerating',
      forecast: 'continued improvement',
      confidence: 92.4,
      keyDrivers: ['Process automation', 'Enhanced monitoring', 'Staff training']
    },
    {
      metric: 'Compliance Rating',
      current: 94.7,
      previous: 91.2,
      change: 3.5,
      trend: 'improving',
      velocity: 'steady',
      forecast: 'stable growth',
      confidence: 89.1,
      keyDrivers: ['Regulatory updates', 'Policy improvements', 'Audit preparations']
    },
    {
      metric: 'Incident Response Time',
      current: 23.5,
      previous: 28.9,
      change: -5.4,
      trend: 'improving',
      velocity: 'accelerating',
      forecast: 'continued reduction',
      confidence: 94.8,
      keyDrivers: ['Automated alerts', 'Team training', 'Process optimization']
    },
    {
      metric: 'Security Posture',
      current: 91.2,
      previous: 93.6,
      change: -2.4,
      trend: 'declining',
      velocity: 'steady',
      forecast: 'requires attention',
      confidence: 87.3,
      keyDrivers: ['New threats', 'System updates needed', 'Policy gaps']
    }
  ];

  const patternAnalysis = [
    {
      pattern: 'Seasonal Risk Variation',
      description: 'Risk scores typically increase 15% during Q4 due to year-end activities',
      strength: 'Strong',
      frequency: 'Annual',
      nextOccurrence: 'Q4 2024',
      recommendation: 'Increase monitoring resources in Q4'
    },
    {
      pattern: 'Monthly Compliance Cycle',
      description: 'Compliance scores dip by 8% mid-month, recover by month-end',
      strength: 'Moderate',
      frequency: 'Monthly',
      nextOccurrence: 'Next 2 weeks',
      recommendation: 'Implement mid-month compliance checkpoints'
    },
    {
      pattern: 'Weekend Incident Spike',
      description: 'Security incidents increase 40% on weekends due to reduced monitoring',
      strength: 'Strong',
      frequency: 'Weekly',
      nextOccurrence: 'This weekend',
      recommendation: 'Enhance weekend monitoring coverage'
    }
  ];

  const forecastData = [
    {
      metric: 'Risk Score Projection',
      timeframe: '6 months',
      currentLevel: 87.3,
      projectedLevel: 91.8,
      confidence: 88.5,
      factors: ['Continued process improvements', 'Staff development', 'Technology upgrades']
    },
    {
      metric: 'Compliance Target',
      timeframe: '3 months',
      currentLevel: 94.7,
      projectedLevel: 96.2,
      confidence: 91.2,
      factors: ['Regulatory alignment', 'Policy updates', 'Training completion']
    },
    {
      metric: 'Incident Rate Reduction',
      timeframe: '12 months',
      currentLevel: 2.3,
      projectedLevel: 1.8,
      confidence: 85.7,
      factors: ['Prevention measures', 'Early detection', 'Response optimization']
    }
  ];

  const anomalies = [
    {
      date: '2024-01-10',
      metric: 'System Performance',
      type: 'Spike',
      severity: 'Medium',
      description: 'Unusual 25% improvement in response times',
      status: 'Investigating',
      likelyReason: 'Infrastructure optimization'
    },
    {
      date: '2024-01-08',
      metric: 'Compliance Score',
      type: 'Drop',
      severity: 'Low',
      description: 'Temporary 5% decrease in compliance rating',
      status: 'Resolved',
      likelyReason: 'Data processing delay'
    },
    {
      date: '2024-01-05',
      metric: 'Risk Indicators',
      type: 'Anomaly',
      severity: 'High',
      description: 'Unexpected correlation between metrics',
      status: 'Under Review',
      likelyReason: 'External market factors'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 dark:text-green-400';
      case 'declining': return 'text-red-600 dark:text-red-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'Low': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'Investigating': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'Under Review': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Advanced Trend Analysis</span>
              </CardTitle>
              <CardDescription>
                AI-powered trend detection, pattern recognition, and forecasting
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select metric category" />
                </SelectTrigger>
                <SelectContent>
                  {trendCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="12-months">12 Months</SelectItem>
                  <SelectItem value="24-months">24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Trend Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trendData.map((trend, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{trend.metric}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getTrendColor(trend.trend).replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}/10 ${getTrendColor(trend.trend)}`}>
                    {trend.change > 0 ? '+' : ''}{trend.change}%
                  </Badge>
                  {getTrendIcon(trend.trend)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-xl font-bold">{trend.current}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Previous</p>
                  <p className="text-xl font-bold">{trend.previous}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Forecast Confidence</span>
                  <span className="font-semibold">{trend.confidence}%</span>
                </div>
                <Progress value={trend.confidence} className="h-2" />
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Key Drivers:</h5>
                <ul className="space-y-1">
                  {trend.keyDrivers.map((driver, driverIndex) => (
                    <li key={driverIndex} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Velocity:</span>
                  <span className="ml-1 font-semibold">{trend.velocity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Forecast:</span>
                  <span className="ml-1 font-semibold">{trend.forecast}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pattern Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern Recognition & Cycles</CardTitle>
          <CardDescription>Identified patterns and recurring trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patternAnalysis.map((pattern, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{pattern.pattern}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{pattern.strength}</Badge>
                    <Badge variant="outline">{pattern.frequency}</Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">{pattern.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Next Occurrence:</span>
                    <span className="ml-2 font-semibold">{pattern.nextOccurrence}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recommendation:</span>
                    <span className="ml-2 font-semibold">{pattern.recommendation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecasting */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Forecasting</CardTitle>
          <CardDescription>AI-powered projections and predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecastData.map((forecast, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{forecast.metric}</h4>
                  <Badge variant="outline">{forecast.timeframe} outlook</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-lg font-bold">{forecast.currentLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Projected</p>
                    <p className="text-lg font-bold text-primary">{forecast.projectedLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-lg font-bold">{forecast.confidence}%</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h5 className="font-semibold text-sm">Key Factors:</h5>
                  <p className="text-sm text-muted-foreground">{forecast.factors.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <Card>
        <CardHeader>
          <CardTitle>Anomaly Detection</CardTitle>
          <CardDescription>Unusual patterns and outliers requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {anomalies.map((anomaly, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <h4 className="font-semibold">{anomaly.metric} - {anomaly.type}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(anomaly.severity)}>
                      {anomaly.severity}
                    </Badge>
                    <Badge className={getStatusColor(anomaly.status)}>
                      {anomaly.status}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <span className="ml-2 font-semibold">{anomaly.date}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Likely Reason:</span>
                    <span className="ml-2 font-semibold">{anomaly.likelyReason}</span>
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