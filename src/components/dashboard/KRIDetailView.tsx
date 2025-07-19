
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  BarChart3,
  Calendar,
  Activity,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';

interface KRIDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  kriName: string;
  kriData?: any;
}

const KRIDetailView: React.FC<KRIDetailViewProps> = ({
  isOpen,
  onClose,
  kriName,
  kriData
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6M');
  const [activeTab, setActiveTab] = useState('trends');

  // Mock historical data - would come from KRI service
  const historicalData = [
    { date: '2024-01', actual: 65, threshold: 70, warning: 80, critical: 90 },
    { date: '2024-02', actual: 72, threshold: 70, warning: 80, critical: 90 },
    { date: '2024-03', actual: 68, threshold: 70, warning: 80, critical: 90 },
    { date: '2024-04', actual: 85, threshold: 70, warning: 80, critical: 90 },
    { date: '2024-05', actual: 82, threshold: 70, warning: 80, critical: 90 },
    { date: '2024-06', actual: 75, threshold: 70, warning: 80, critical: 90 },
  ];

  const breachHistory = [
    { date: '2024-04-15', type: 'Critical', value: 95, duration: '2.5 hours', resolved: true },
    { date: '2024-04-22', type: 'Warning', value: 82, duration: '1.2 hours', resolved: true },
    { date: '2024-05-08', type: 'Warning', value: 85, duration: '3.1 hours', resolved: true },
  ];

  const correlatedKRIs = [
    { name: 'System Downtime', correlation: 0.78, trend: 'increasing' },
    { name: 'Error Rate', correlation: 0.65, trend: 'stable' },
    { name: 'Processing Volume', correlation: -0.42, trend: 'decreasing' },
  ];

  const predictiveInsights = [
    {
      insight: 'Based on current trends, expect threshold breach in next 2 weeks',
      confidence: 72,
      type: 'warning'
    },
    {
      insight: 'Correlation with system maintenance schedule indicates 30% higher values on Sundays',
      confidence: 89,
      type: 'info'
    },
    {
      insight: 'Implementing automated scaling could reduce average values by 15-20%',
      confidence: 65,
      type: 'recommendation'
    }
  ];

  const currentStatus = {
    value: 75,
    status: 'normal',
    trend: 'stable',
    lastUpdated: '2024-06-20 14:30:00',
    daysWithoutBreach: 15
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-500';
      case 'info': return 'border-blue-500';
      case 'recommendation': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {kriName} - Detailed Analysis
          </DialogTitle>
          <DialogDescription>
            Comprehensive KRI analysis with historical trends, breach predictions, and correlation insights
          </DialogDescription>
        </DialogHeader>

        {/* Current Status Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Value</p>
                  <p className={`text-2xl font-bold ${getStatusColor(currentStatus.status)}`}>
                    {currentStatus.value}
                  </p>
                </div>
                <Activity className={`h-8 w-8 ${getStatusColor(currentStatus.status)}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={
                    currentStatus.status === 'normal' ? 'default' :
                    currentStatus.status === 'warning' ? 'secondary' : 'destructive'
                  }>
                    {currentStatus.status.toUpperCase()}
                  </Badge>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Trend</p>
                  <div className="flex items-center">
                    {currentStatus.trend === 'increasing' ? (
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                    ) : currentStatus.trend === 'decreasing' ? (
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <div className="w-4 h-4 bg-gray-400 rounded-full mr-1" />
                    )}
                    <span className="text-sm font-medium">{currentStatus.trend}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Days w/o Breach</p>
                  <p className="text-2xl font-bold text-green-600">{currentStatus.daysWithoutBreach}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="breaches">Breach History</TabsTrigger>
              <TabsTrigger value="correlations">Correlations</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>
            
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="6M">6 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historical Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      
                      {/* Threshold zones */}
                      <Area 
                        type="monotone" 
                        dataKey="critical" 
                        stackId="1" 
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.1}
                        name="Critical Zone"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="warning" 
                        stackId="2" 
                        stroke="#f59e0b" 
                        fill="#f59e0b" 
                        fillOpacity={0.1}
                        name="Warning Zone"
                      />
                      
                      {/* Threshold lines */}
                      <ReferenceLine y={70} stroke="#10b981" strokeDasharray="2 2" label="Target" />
                      <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="2 2" label="Warning" />
                      <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="2 2" label="Critical" />
                      
                      {/* Actual values */}
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        name="Actual Values"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Average</span>
                    <span className="font-medium">74.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Minimum</span>
                    <span className="font-medium">65</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Maximum</span>
                    <span className="font-medium">85</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Volatility</span>
                    <span className="font-medium">12.3%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Threshold Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Time in Normal</span>
                    <span className="font-medium text-green-600">83%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time in Warning</span>
                    <span className="font-medium text-yellow-600">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time in Critical</span>
                    <span className="font-medium text-red-600">2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Improvement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Month-over-Month</span>
                    <span className="font-medium text-green-600">-8.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quarter-over-Quarter</span>
                    <span className="font-medium text-green-600">-12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Year-over-Year</span>
                    <span className="font-medium text-red-600">+3.1%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="breaches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Breach Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {breachHistory.map((breach, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={breach.type === 'Critical' ? 'destructive' : 'secondary'}>
                              {breach.type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{breach.date}</span>
                          </div>
                          <p className="text-sm mt-1">
                            Peak value: <span className="font-medium">{breach.value}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Duration: {breach.duration}</p>
                          <Badge variant={breach.resolved ? 'default' : 'destructive'} className="mt-1">
                            {breach.resolved ? 'Resolved' : 'Active'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Correlated KRIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {correlatedKRIs.map((kri, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{kri.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Correlation: {(kri.correlation * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{kri.trend}</Badge>
                        {kri.trend === 'increasing' ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : kri.trend === 'decreasing' ? (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-400 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Predictive Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveInsights.map((insight, index) => (
                    <div key={index} className={`border-l-4 ${getInsightColor(insight.type)} pl-4 py-2`}>
                      <p className="text-sm">{insight.insight}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline">
                          {insight.confidence}% confidence
                        </Badge>
                        <Badge variant={
                          insight.type === 'warning' ? 'destructive' :
                          insight.type === 'recommendation' ? 'default' : 'secondary'
                        }>
                          {insight.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Settings className="h-5 w-5 mt-0.5 text-blue-600" />
                    <div>
                      <p className="font-medium">Adjust Monitoring Frequency</p>
                      <p className="text-sm text-muted-foreground">
                        Increase monitoring to every 15 minutes during peak hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Review Threshold Settings</p>
                      <p className="text-sm text-muted-foreground">
                        Consider updating warning threshold from 80 to 75 based on recent patterns
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 mt-0.5 text-green-600" />
                    <div>
                      <p className="font-medium">Implement Predictive Alerting</p>
                      <p className="text-sm text-muted-foreground">
                        Set up ML-based early warning system for breach prediction
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default KRIDetailView;
