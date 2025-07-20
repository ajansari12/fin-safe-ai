import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Lightbulb, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react';

export const PerformanceInsights = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const performanceMetrics = [
    {
      category: 'Operational Excellence',
      score: 87.5,
      trend: 'up',
      change: '+5.2%',
      insights: [
        'Process automation has improved efficiency by 15%',
        'Response times have decreased significantly',
        'Employee satisfaction scores are trending upward'
      ]
    },
    {
      category: 'Risk Management',
      score: 92.3,
      trend: 'up',
      change: '+3.8%',
      insights: [
        'Early warning systems are performing well',
        'Risk detection accuracy has improved',
        'Incident response times are optimal'
      ]
    },
    {
      category: 'Compliance Efficiency',
      score: 89.7,
      trend: 'stable',
      change: '+1.2%',
      insights: [
        'Regulatory reporting is on schedule',
        'Audit findings have decreased',
        'Policy adherence rates are high'
      ]
    },
    {
      category: 'Technology Performance',
      score: 84.1,
      trend: 'down',
      change: '-2.1%',
      insights: [
        'System downtime has increased slightly',
        'Security patches need attention',
        'User experience metrics need improvement'
      ]
    }
  ];

  const aiInsights = [
    {
      id: 1,
      type: 'optimization',
      priority: 'high',
      title: 'Process Optimization Opportunity',
      description: 'AI analysis suggests consolidating risk assessment workflows could reduce processing time by 25%',
      impact: 'High efficiency gain',
      confidence: 94.2,
      recommendation: 'Implement automated workflow consolidation',
      estimatedSavings: '$45K annually'
    },
    {
      id: 2,
      type: 'prediction',
      priority: 'medium',
      title: 'Performance Trend Alert',
      description: 'Current trajectory suggests compliance scores may decrease by 3% next quarter without intervention',
      impact: 'Moderate risk increase',
      confidence: 87.6,
      recommendation: 'Enhance compliance training programs',
      estimatedSavings: 'Risk mitigation'
    },
    {
      id: 3,
      type: 'insight',
      priority: 'low',
      title: 'Benchmarking Insight',
      description: 'Your organization performs 12% better than industry average in incident response time',
      impact: 'Competitive advantage',
      confidence: 91.8,
      recommendation: 'Document and share best practices',
      estimatedSavings: 'Knowledge retention'
    }
  ];

  const performanceDrivers = [
    {
      driver: 'Process Automation',
      impact: 85.4,
      contribution: 'Positive',
      trend: 'improving',
      description: 'Automated workflows reducing manual effort'
    },
    {
      driver: 'Team Collaboration',
      impact: 78.9,
      contribution: 'Positive',
      trend: 'stable',
      description: 'Cross-functional teamwork effectiveness'
    },
    {
      driver: 'Technology Infrastructure',
      impact: 72.3,
      contribution: 'Neutral',
      trend: 'declining',
      description: 'System performance and reliability'
    },
    {
      driver: 'Data Quality',
      impact: 89.2,
      contribution: 'Positive',
      trend: 'improving',
      description: 'Accuracy and completeness of data'
    },
    {
      driver: 'Regulatory Changes',
      impact: 65.1,
      contribution: 'Negative',
      trend: 'stable',
      description: 'Impact of new regulatory requirements'
    }
  ];

  const benchmarkData = [
    {
      metric: 'Risk Response Time',
      yourScore: 92.5,
      industryAvg: 78.3,
      topQuartile: 95.2,
      performance: 'excellent'
    },
    {
      metric: 'Compliance Accuracy',
      yourScore: 89.7,
      industryAvg: 85.4,
      topQuartile: 94.1,
      performance: 'good'
    },
    {
      metric: 'Incident Resolution',
      yourScore: 87.2,
      industryAvg: 81.6,
      topQuartile: 92.8,
      performance: 'good'
    },
    {
      metric: 'Audit Readiness',
      yourScore: 84.9,
      industryAvg: 88.1,
      topQuartile: 96.3,
      performance: 'below-average'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'low': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'below-average': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI-Powered Performance Insights</span>
          </CardTitle>
          <CardDescription>
            Advanced analytics and recommendations for organizational performance optimization
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="drivers">Performance Drivers</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarking</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights */}
          <div className="space-y-4">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority} priority
                        </Badge>
                      </div>
                      <CardDescription>{insight.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">Confidence</div>
                      <div className="text-lg font-bold text-primary">{insight.confidence}%</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-semibold text-sm">Impact</h5>
                      <p className="text-sm text-muted-foreground">{insight.impact}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm">Recommendation</h5>
                      <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm">Estimated Value</h5>
                      <p className="text-sm text-muted-foreground">{insight.estimatedSavings}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Implement
                    </Button>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                    <Button variant="outline" size="sm">
                      Schedule Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{metric.category}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-blue-600'}>
                        {metric.change}
                      </Badge>
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <span className="font-semibold">{metric.score}%</span>
                    </div>
                    <Progress value={metric.score} className="h-3" />
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-semibold text-sm">Key Insights:</h5>
                    <ul className="space-y-1">
                      {metric.insights.map((insight, insightIndex) => (
                        <li key={insightIndex} className="flex items-start text-sm text-muted-foreground">
                          <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          {/* Performance Drivers */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Drivers Analysis</CardTitle>
              <CardDescription>Factors influencing organizational performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceDrivers.map((driver, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{driver.driver}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={driver.contribution === 'Positive' ? 'default' : driver.contribution === 'Negative' ? 'destructive' : 'secondary'}>
                          {driver.contribution}
                        </Badge>
                        {getTrendIcon(driver.trend)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{driver.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Impact Score</span>
                        <span className="font-semibold">{driver.impact}%</span>
                      </div>
                      <Progress value={driver.impact} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          {/* Benchmarking */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarking</CardTitle>
              <CardDescription>Compare your performance against industry standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {benchmarkData.map((benchmark, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{benchmark.metric}</h4>
                      <Badge className={getPerformanceColor(benchmark.performance).replace('text-', 'bg-').replace('dark:text-', 'dark:bg-') + '/10 ' + getPerformanceColor(benchmark.performance)}>
                        {benchmark.performance}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Your Score</span>
                        <span className="font-semibold">{benchmark.yourScore}%</span>
                      </div>
                      <Progress value={benchmark.yourScore} className="h-2" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Industry Average:</span>
                          <span>{benchmark.industryAvg}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Top Quartile:</span>
                          <span>{benchmark.topQuartile}%</span>
                        </div>
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