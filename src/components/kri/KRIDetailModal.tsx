
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Target, 
  Calendar,
  BarChart3,
  Activity,
  Shield,
  Clock,
  FileText
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface KRIDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kri: any | null;
}

const KRIDetailModal: React.FC<KRIDetailModalProps> = ({
  isOpen,
  onClose,
  kri
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!kri) return null;

  // Mock data for demonstration
  const historicalData = [
    { date: '2024-01', value: 45, threshold: 50 },
    { date: '2024-02', value: 52, threshold: 50 },
    { date: '2024-03', value: 48, threshold: 50 },
    { date: '2024-04', value: 55, threshold: 50 },
    { date: '2024-05', value: 62, threshold: 50 },
    { date: '2024-06', value: 58, threshold: 50 },
    { date: '2024-07', value: 67, threshold: 50 }
  ];

  const breachHistory = [
    { date: '2024-07-15', level: 'Critical', value: 67, threshold: 65, status: 'Open' },
    { date: '2024-06-22', level: 'Warning', value: 58, threshold: 55, status: 'Resolved' },
    { date: '2024-04-10', level: 'Warning', value: 55, threshold: 50, status: 'Resolved' }
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend?.toLowerCase()) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'deteriorating': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                {kri?.name || 'KRI Details'}
              </DialogTitle>
              <DialogDescription>
                Key Risk Indicator Analysis and Monitoring
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(kri?.status)}>
                {kri?.status || 'Active'}
              </Badge>
              {getTrendIcon(kri?.trend)}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            <TabsTrigger value="breaches">Breaches</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-red-600">67</div>
                    <div className="text-sm text-muted-foreground">Current Value</div>
                    <Progress value={75} className="h-2" />
                    <div className="text-xs text-muted-foreground">75% of critical threshold</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Warning:</span>
                    <span className="font-medium text-yellow-600">55</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Critical:</span>
                    <span className="font-medium text-red-600">65</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">Daily</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">2 hours ago</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data Quality:</span>
                    <Badge variant="outline">High</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {kri?.description || 'This KRI monitors operational performance and risk exposure across key business functions. It provides early warning signals for potential operational disruptions and helps maintain service level agreements.'}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Control Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium">{kri?.owner || 'Risk Manager'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium capitalize">{kri?.category || 'Operational'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data Source:</span>
                    <span className="font-medium">{kri?.dataSource || 'System Logs'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Breach Count (30d):</span>
                    <span className="font-medium text-red-600">2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Resolution Time:</span>
                    <span className="font-medium">4.2 hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Effectiveness Score:</span>
                    <span className="font-medium">85%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historical Trend Analysis</CardTitle>
                <CardDescription>
                  KRI performance over the last 7 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="threshold" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">+12%</div>
                    <div className="text-sm text-muted-foreground">7-day change</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">+5%</div>
                    <div className="text-sm text-muted-foreground">30-day change</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">-3%</div>
                    <div className="text-sm text-muted-foreground">90-day change</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="thresholds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Threshold Configuration</CardTitle>
                <CardDescription>
                  Current threshold settings and breach levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Normal Range</div>
                        <div className="text-sm text-muted-foreground">0 - 55</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Optimal</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Warning Range</div>
                        <div className="text-sm text-muted-foreground">55 - 65</div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Monitor</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Critical Range</div>
                        <div className="text-sm text-muted-foreground">65+</div>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Action Required</Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Current Status</h4>
                  <div className="flex items-center justify-between">
                    <span>Current Value: 67</span>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                  <Progress value={75} className="mt-2 h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current value is 2 points above critical threshold
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breaches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Breach History</CardTitle>
                <CardDescription>
                  Recent threshold breaches and their resolution status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {breachHistory.map((breach, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          breach.level === 'Critical' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <div className="font-medium">{breach.level} Breach</div>
                          <div className="text-sm text-muted-foreground">
                            {breach.date} • Value: {breach.value} (Threshold: {breach.threshold})
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={breach.status === 'Open' ? 'destructive' : 'outline'}>
                          {breach.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Related Controls</CardTitle>
                <CardDescription>
                  Controls associated with this KRI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'System Monitoring Control', effectiveness: 92, status: 'Active', lastTest: '2024-07-10' },
                    { name: 'Incident Response Control', effectiveness: 88, status: 'Active', lastTest: '2024-07-05' },
                    { name: 'Performance Baseline Control', effectiveness: 85, status: 'Active', lastTest: '2024-07-01' }
                  ].map((control, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{control.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Last tested: {control.lastTest}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{control.effectiveness}%</div>
                          <div className="text-xs text-muted-foreground">Effectiveness</div>
                        </div>
                        <Badge variant="outline">{control.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            Edit KRI
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KRIDetailModal;
