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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  Settings,
  TestTube,
  FileText
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ControlDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  controlId: string | null;
  controlData?: any;
}

const ControlDetailView: React.FC<ControlDetailViewProps> = ({
  isOpen,
  onClose,
  controlId,
  controlData
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - would come from controls service
  const controlInfo = {
    name: 'Access Control Management',
    description: 'Manages user access permissions and authentication',
    owner: 'IT Security Team',
    effectiveness: 85,
    lastTested: '2024-06-15',
    nextTest: '2024-09-15',
    status: 'effective',
    riskLevel: 'high',
    controlType: 'preventive',
    frequency: 'continuous'
  };

  const effectivenessHistory = [
    { month: 'Jan', effectiveness: 78, tests: 12 },
    { month: 'Feb', effectiveness: 82, tests: 14 },
    { month: 'Mar', effectiveness: 85, tests: 13 },
    { month: 'Apr', effectiveness: 88, tests: 15 },
    { month: 'May', effectiveness: 85, tests: 16 },
    { month: 'Jun', effectiveness: 85, tests: 14 },
  ];

  const testResults = [
    { 
      date: '2024-06-15', 
      type: 'Automated', 
      result: 'Pass', 
      effectiveness: 85,
      deficiencies: 2,
      tester: 'System'
    },
    { 
      date: '2024-05-15', 
      type: 'Manual', 
      result: 'Pass', 
      effectiveness: 88,
      deficiencies: 1,
      tester: 'John Smith'
    },
    { 
      date: '2024-04-15', 
      type: 'Automated', 
      result: 'Fail', 
      effectiveness: 65,
      deficiencies: 5,
      tester: 'System'
    }
  ];

  const deficiencies = [
    {
      id: 'DEF-001',
      description: 'Password complexity requirements not enforced for service accounts',
      severity: 'medium',
      status: 'remediated',
      identifiedDate: '2024-04-15',
      resolvedDate: '2024-05-20'
    },
    {
      id: 'DEF-002',
      description: 'Inactive user accounts not disabled within policy timeframe',
      severity: 'low',
      status: 'in_progress',
      identifiedDate: '2024-06-01',
      resolvedDate: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'effective': return 'text-green-600';
      case 'needs_improvement': return 'text-yellow-600';
      case 'ineffective': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Control Details: {controlInfo.name}
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis of control effectiveness, testing history, and deficiency management
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Effectiveness</p>
                  <p className={`text-2xl font-bold ${getStatusColor(controlInfo.status)}`}>
                    {controlInfo.effectiveness}%
                  </p>
                </div>
                <CheckCircle className={`h-8 w-8 ${getStatusColor(controlInfo.status)}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={controlInfo.status === 'effective' ? 'default' : 'secondary'}>
                    {controlInfo.status.replace('_', ' ')}
                  </Badge>
                </div>
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Risk Level</p>
                  <Badge variant={controlInfo.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                    {controlInfo.riskLevel}
                  </Badge>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Next Test</p>
                  <p className="text-sm font-bold">{controlInfo.nextTest}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="testing">Testing History</TabsTrigger>
            <TabsTrigger value="deficiencies">Deficiencies</TabsTrigger>
            <TabsTrigger value="effectiveness">Effectiveness</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Control Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Owner</span>
                    <span className="font-medium">{controlInfo.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Type</span>
                    <Badge variant="outline">{controlInfo.controlType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Frequency</span>
                    <Badge variant="outline">{controlInfo.frequency}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Tested</span>
                    <span className="font-medium">{controlInfo.lastTested}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Effectiveness</span>
                      <span className="font-medium">{controlInfo.effectiveness}%</span>
                    </div>
                    <Progress value={controlInfo.effectiveness} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">18</p>
                      <p className="text-xs text-muted-foreground">Tests Passed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">2</p>
                      <p className="text-xs text-muted-foreground">Open Deficiencies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{controlInfo.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((test, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={test.result === 'Pass' ? 'default' : 'destructive'}>
                              {test.result}
                            </Badge>
                            <Badge variant="outline">{test.type}</Badge>
                            <span className="text-sm text-muted-foreground">{test.date}</span>
                          </div>
                          <p className="text-sm">Tester: {test.tester}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Effectiveness: <span className="font-medium">{test.effectiveness}%</span></p>
                          <p className="text-sm">Deficiencies: <span className="font-medium">{test.deficiencies}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deficiencies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Control Deficiencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deficiencies.map((deficiency, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{deficiency.id}</span>
                            <Badge variant={getSeverityColor(deficiency.severity)}>
                              {deficiency.severity}
                            </Badge>
                            <Badge variant={deficiency.status === 'remediated' ? 'default' : 'secondary'}>
                              {deficiency.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{deficiency.description}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Identified: {deficiency.identifiedDate}</span>
                        {deficiency.resolvedDate && (
                          <span>Resolved: {deficiency.resolvedDate}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="effectiveness" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Effectiveness Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={effectivenessHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="effectiveness" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ControlDetailView;