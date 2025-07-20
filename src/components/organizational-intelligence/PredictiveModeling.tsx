import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  AlertTriangle, 
  Clock, 
  BarChart3,
  Zap,
  CheckCircle
} from 'lucide-react';

export const PredictiveModeling = () => {
  const [selectedModel, setSelectedModel] = useState('risk-prediction');
  const [timeHorizon, setTimeHorizon] = useState('3-months');

  const models = [
    {
      id: 'risk-prediction',
      name: 'Risk Prediction Model',
      accuracy: 94.7,
      description: 'Predicts operational and financial risk scenarios',
      status: 'active',
      lastTrained: '2 hours ago'
    },
    {
      id: 'compliance-forecast',
      name: 'Compliance Forecasting',
      accuracy: 91.3,
      description: 'Forecasts compliance gaps and regulatory changes',
      status: 'active',
      lastTrained: '4 hours ago'
    },
    {
      id: 'performance-prediction',
      name: 'Performance Prediction',
      accuracy: 88.9,
      description: 'Predicts operational performance metrics',
      status: 'training',
      lastTrained: '1 day ago'
    },
    {
      id: 'market-analysis',
      name: 'Market Analysis Model',
      accuracy: 86.2,
      description: 'Analyzes market trends and their impact',
      status: 'active',
      lastTrained: '6 hours ago'
    }
  ];

  const predictions = [
    {
      category: 'Risk Indicators',
      timeline: '30 days',
      predictions: [
        {
          metric: 'Operational Risk Score',
          current: 85.2,
          predicted: 78.6,
          confidence: 94.5,
          trend: 'improving',
          impact: 'medium'
        },
        {
          metric: 'Compliance Rating',
          current: 92.1,
          predicted: 94.7,
          confidence: 91.2,
          trend: 'improving',
          impact: 'low'
        },
        {
          metric: 'Security Posture',
          current: 88.9,
          predicted: 85.3,
          confidence: 87.8,
          trend: 'declining',
          impact: 'high'
        }
      ]
    },
    {
      category: 'Performance Metrics',
      timeline: '90 days',
      predictions: [
        {
          metric: 'System Efficiency',
          current: 91.4,
          predicted: 95.2,
          confidence: 89.6,
          trend: 'improving',
          impact: 'medium'
        },
        {
          metric: 'User Satisfaction',
          current: 87.3,
          predicted: 89.8,
          confidence: 92.1,
          trend: 'improving',
          impact: 'low'
        }
      ]
    }
  ];

  const scenarioAnalysis = [
    {
      scenario: 'Market Volatility Increase',
      probability: 68.4,
      impact: 'High',
      timeframe: '2-3 months',
      recommendations: [
        'Increase risk monitoring frequency',
        'Review hedging strategies',
        'Prepare contingency plans'
      ]
    },
    {
      scenario: 'Regulatory Changes',
      probability: 45.7,
      impact: 'Medium',
      timeframe: '6-12 months',
      recommendations: [
        'Monitor regulatory announcements',
        'Update compliance frameworks',
        'Train compliance teams'
      ]
    },
    {
      scenario: 'Technology Disruption',
      probability: 32.1,
      impact: 'High',
      timeframe: '12-18 months',
      recommendations: [
        'Invest in emerging technologies',
        'Develop innovation partnerships',
        'Update technology roadmap'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'training': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'inactive': return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 dark:text-green-400';
      case 'declining': return 'text-red-600 dark:text-red-400';
      case 'stable': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'low': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Predictive Modeling Engine</span>
              </CardTitle>
              <CardDescription>
                AI-powered predictive analytics and scenario modeling
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="1-year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="models">Model Status</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          {/* Predictions */}
          {predictions.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category.category}</span>
                  <Badge variant="outline">{category.timeline} forecast</Badge>
                </CardTitle>
                <CardDescription>Predicted changes in key metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.predictions.map((prediction, predictionIndex) => (
                  <div key={predictionIndex} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{prediction.metric}</h4>
                      <Badge className={getImpactColor(prediction.impact)}>
                        {prediction.impact} impact
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current</p>
                        <p className="text-lg font-semibold">{prediction.current}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Predicted</p>
                        <p className={`text-lg font-semibold ${getTrendColor(prediction.trend)}`}>
                          {prediction.predicted}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Confidence</p>
                        <p className="text-lg font-semibold">{prediction.confidence}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Confidence Level</span>
                        <span>{prediction.confidence}%</span>
                      </div>
                      <Progress value={prediction.confidence} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {/* Model Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge className={getStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                  </div>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="font-semibold">{model.accuracy}%</span>
                    </div>
                    <Progress value={model.accuracy} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last trained:</span>
                    <span>{model.lastTrained}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Zap className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Scenario Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Analysis & Risk Forecasting</CardTitle>
              <CardDescription>Potential future scenarios and their implications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scenarioAnalysis.map((scenario, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{scenario.scenario}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={getImpactColor(scenario.impact.toLowerCase())}>
                        {scenario.impact} Impact
                      </Badge>
                      <Badge variant="outline">{scenario.timeframe}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Probability</span>
                      <span className="font-semibold">{scenario.probability}%</span>
                    </div>
                    <Progress value={scenario.probability} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Recommended Actions:</h5>
                    <ul className="space-y-1">
                      {scenario.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};