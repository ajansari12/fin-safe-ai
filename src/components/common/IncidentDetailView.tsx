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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Clock, 
  User,
  MapPin,
  TrendingUp,
  FileText,
  CheckCircle,
  Calendar
} from 'lucide-react';

interface IncidentDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string | null;
  incidentData?: any;
}

const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({
  isOpen,
  onClose,
  incidentId,
  incidentData
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - would come from incidents service
  const incidentInfo = {
    id: 'INC-2024-001',
    title: 'Payment Processing System Outage',
    description: 'Critical payment processing system experienced unexpected downtime affecting customer transactions',
    severity: 'critical',
    status: 'resolved',
    category: 'operational',
    reportedDate: '2024-06-15 09:30:00',
    resolvedDate: '2024-06-15 14:20:00',
    reportedBy: 'Operations Team',
    assignedTo: 'IT Infrastructure Team',
    impact: 'high',
    rootCause: 'Database connection pool exhaustion',
    estimatedLoss: '$45,000'
  };

  const timeline = [
    { time: '09:30', event: 'Incident reported by monitoring system', type: 'detection' },
    { time: '09:35', event: 'Initial response team assembled', type: 'response' },
    { time: '10:15', event: 'Impact assessment completed', type: 'assessment' },
    { time: '11:00', event: 'Root cause identified', type: 'investigation' },
    { time: '12:30', event: 'Temporary workaround implemented', type: 'mitigation' },
    { time: '14:20', event: 'Permanent fix deployed and verified', type: 'resolution' },
    { time: '14:45', event: 'Systems fully operational', type: 'confirmation' }
  ];

  const impactAnalysis = {
    customersAffected: 1247,
    transactionsLost: 89,
    systemsAffected: ['Payment Gateway', 'Customer Portal', 'Mobile App'],
    businessUnits: ['Retail Banking', 'Commercial Banking'],
    downtime: '4h 50m',
    regulatoryNotification: 'Required'
  };

  const correctiveActions = [
    {
      action: 'Implement database connection monitoring',
      owner: 'Database Team',
      dueDate: '2024-07-15',
      status: 'in_progress',
      priority: 'high'
    },
    {
      action: 'Update incident response procedures',
      owner: 'Operations Team',
      dueDate: '2024-07-01',
      status: 'completed',
      priority: 'medium'
    },
    {
      action: 'Conduct post-incident review meeting',
      owner: 'Risk Management',
      dueDate: '2024-06-20',
      status: 'completed',
      priority: 'high'
    }
  ];

  const lessonsLearned = [
    'Database connection pool limits should be monitored continuously',
    'Automated failover procedures need improvement',
    'Communication protocols during incidents require enhancement',
    'Regular stress testing should include database connection scenarios'
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'in_progress': return 'secondary';
      case 'open': return 'destructive';
      default: return 'outline';
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'detection': return <AlertTriangle className="h-4 w-4" />;
      case 'response': return <User className="h-4 w-4" />;
      case 'resolution': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Incident Details: {incidentInfo.title}
          </DialogTitle>
          <DialogDescription>
            Comprehensive incident analysis, timeline, and corrective actions
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Severity</p>
                  <Badge variant={getSeverityColor(incidentInfo.severity)}>
                    {incidentInfo.severity}
                  </Badge>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={getStatusColor(incidentInfo.status)}>
                    {incidentInfo.status}
                  </Badge>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-lg font-bold">{impactAnalysis.downtime}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Estimated Loss</p>
                  <p className="text-lg font-bold text-red-600">{incidentInfo.estimatedLoss}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Incident Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Incident ID</span>
                    <span className="font-medium">{incidentInfo.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Category</span>
                    <Badge variant="outline">{incidentInfo.category}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Reported By</span>
                    <span className="font-medium">{incidentInfo.reportedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Assigned To</span>
                    <span className="font-medium">{incidentInfo.assignedTo}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Reported</span>
                    <span className="font-medium">{incidentInfo.reportedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Resolved</span>
                    <span className="font-medium">{incidentInfo.resolvedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Duration</span>
                    <span className="font-medium">{impactAnalysis.downtime}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{incidentInfo.description}</p>
                <div className="mt-4">
                  <p className="text-sm font-medium">Root Cause:</p>
                  <p className="text-sm text-muted-foreground">{incidentInfo.rootCause}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incident Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        {getTimelineIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{event.time}</span>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Business Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Customers Affected</span>
                    <span className="font-bold text-red-600">{impactAnalysis.customersAffected.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Transactions Lost</span>
                    <span className="font-bold text-red-600">{impactAnalysis.transactionsLost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Estimated Loss</span>
                    <span className="font-bold text-red-600">{incidentInfo.estimatedLoss}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Regulatory Notification</span>
                    <Badge variant="destructive">{impactAnalysis.regulatoryNotification}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Systems Affected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium mb-2">Systems:</p>
                      {impactAnalysis.systemsAffected.map((system, index) => (
                        <Badge key={index} variant="outline" className="mr-2 mb-1">
                          {system}
                        </Badge>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Business Units:</p>
                      {impactAnalysis.businessUnits.map((unit, index) => (
                        <Badge key={index} variant="secondary" className="mr-2 mb-1">
                          {unit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Corrective Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {correctiveActions.map((action, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium">{action.action}</p>
                          <p className="text-sm text-muted-foreground">Owner: {action.owner}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={getStatusColor(action.status)}>
                            {action.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant={action.priority === 'high' ? 'destructive' : 'outline'}>
                            {action.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Due: {action.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lessons Learned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lessonsLearned.map((lesson, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <p className="text-sm">{lesson}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preventive Measures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Technical Improvements</h4>
                    <p className="text-sm text-muted-foreground">
                      Implement proactive monitoring and automated scaling for database connections
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">Process Enhancements</h4>
                    <p className="text-sm text-muted-foreground">
                      Update incident response procedures and improve communication protocols
                    </p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium">Training & Awareness</h4>
                    <p className="text-sm text-muted-foreground">
                      Conduct team training on new monitoring tools and response procedures
                    </p>
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

export default IncidentDetailView;