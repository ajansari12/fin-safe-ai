
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, Users, FileText, CheckCircle, Bell, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ToleranceBreach {
  id: string;
  operationName: string;
  breachType: 'rto' | 'rpo' | 'service_level' | 'multiple';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'in_progress' | 'resolved';
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  currentImpact: string;
  estimatedDuration: number;
  responseTeam: string[];
  escalationLevel: number;
  actionsTaken: string[];
  nextActions: string[];
}

interface ResponseTeam {
  id: string;
  name: string;
  role: string;
  contact: string;
  escalationOrder: number;
}

const BreachManagement = () => {
  const [activeBreaches, setActiveBreaches] = useState<ToleranceBreach[]>([
    {
      id: '1',
      operationName: 'ATM Network',
      breachType: 'multiple',
      severity: 'critical',
      status: 'in_progress',
      detectedAt: '2024-01-20T14:20:00Z',
      acknowledgedAt: '2024-01-20T14:22:00Z',
      currentImpact: 'ATM services unavailable in Metro region, affecting 150,000+ customers',
      estimatedDuration: 240,
      responseTeam: ['ops-manager', 'tech-lead', 'comms-lead'],
      escalationLevel: 2,
      actionsTaken: [
        'Incident response team activated',
        'Backup systems engaged',
        'Customer communications initiated',
        'Vendor support engaged'
      ],
      nextActions: [
        'Complete network diagnostics',
        'Implement temporary workaround',
        'Prepare detailed impact assessment'
      ]
    },
    {
      id: '2',
      operationName: 'Online Banking Portal',
      breachType: 'service_level',
      severity: 'medium',
      status: 'acknowledged',
      detectedAt: '2024-01-20T13:45:00Z',
      acknowledgedAt: '2024-01-20T13:50:00Z',
      currentImpact: 'Reduced performance affecting login times',
      estimatedDuration: 120,
      responseTeam: ['tech-lead'],
      escalationLevel: 1,
      actionsTaken: [
        'Performance monitoring increased',
        'Initial diagnostics completed'
      ],
      nextActions: [
        'Apply performance optimization',
        'Monitor system recovery'
      ]
    }
  ]);

  const [responseTeams] = useState<ResponseTeam[]>([
    { id: 'ops-manager', name: 'Sarah Johnson', role: 'Operations Manager', contact: '+1-416-555-0101', escalationOrder: 1 },
    { id: 'tech-lead', name: 'Michael Chen', role: 'Technical Lead', contact: '+1-416-555-0102', escalationOrder: 2 },
    { id: 'comms-lead', name: 'Emma Wilson', role: 'Communications Lead', contact: '+1-416-555-0103', escalationOrder: 3 },
    { id: 'exec-director', name: 'Robert Taylor', role: 'Executive Director', contact: '+1-416-555-0104', escalationOrder: 4 }
  ]);

  const [selectedBreach, setSelectedBreach] = useState<ToleranceBreach | null>(null);
  const [newAction, setNewAction] = useState('');
  const { toast } = useToast();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBreachTypeLabel = (type: string) => {
    switch (type) {
      case 'rto': return 'RTO Breach';
      case 'rpo': return 'RPO Breach';
      case 'service_level': return 'Service Level Breach';
      case 'multiple': return 'Multiple Breaches';
      default: return type;
    }
  };

  const handleStatusUpdate = (breachId: string, newStatus: string) => {
    setActiveBreaches(prev => prev.map(breach => 
      breach.id === breachId 
        ? { 
            ...breach, 
            status: newStatus as any,
            acknowledgedAt: newStatus === 'acknowledged' ? new Date().toISOString() : breach.acknowledgedAt,
            resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : breach.resolvedAt
          }
        : breach
    ));
    
    toast({
      title: "Status Updated",
      description: `Breach status updated to ${newStatus}`
    });
  };

  const handleAddAction = (breachId: string) => {
    if (!newAction.trim()) return;
    
    setActiveBreaches(prev => prev.map(breach => 
      breach.id === breachId 
        ? { ...breach, actionsTaken: [...breach.actionsTaken, newAction] }
        : breach
    ));
    
    setNewAction('');
    toast({
      title: "Action Added",
      description: "Response action has been logged"
    });
  };

  const handleEscalate = (breachId: string) => {
    setActiveBreaches(prev => prev.map(breach => 
      breach.id === breachId 
        ? { ...breach, escalationLevel: breach.escalationLevel + 1 }
        : breach
    ));
    
    toast({
      title: "Breach Escalated",
      description: "Tolerance breach has been escalated to next level"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Breach Management</h2>
        <p className="text-muted-foreground">
          Manage tolerance breaches with automated workflows and escalation procedures
        </p>
      </div>

      <Tabs defaultValue="active-breaches" className="w-full">
        <TabsList>
          <TabsTrigger value="active-breaches">Active Breaches</TabsTrigger>
          <TabsTrigger value="response-teams">Response Teams</TabsTrigger>
          <TabsTrigger value="action-templates">Action Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active-breaches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Tolerance Breaches</h3>
            <Badge variant="outline" className="text-red-600">
              {activeBreaches.filter(b => b.status !== 'resolved').length} Active
            </Badge>
          </div>

          <div className="grid gap-4">
            {activeBreaches.map((breach) => (
              <Card key={breach.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        {breach.operationName}
                        <Badge className={getSeverityColor(breach.severity)}>
                          {breach.severity}
                        </Badge>
                        <Badge className={getStatusColor(breach.status)}>
                          {breach.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {getBreachTypeLabel(breach.breachType)} • Detected: {new Date(breach.detectedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select value={breach.status} onValueChange={(value) => handleStatusUpdate(breach.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="acknowledged">Acknowledged</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => handleEscalate(breach.id)}>
                        Escalate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Current Impact</h4>
                      <p className="text-sm text-muted-foreground">{breach.currentImpact}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Estimated Duration</p>
                          <p className="text-sm text-muted-foreground">{breach.estimatedDuration} minutes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium">Escalation Level</p>
                          <p className="text-sm text-muted-foreground">Level {breach.escalationLevel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Response Team</p>
                          <p className="text-sm text-muted-foreground">{breach.responseTeam.length} members</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Actions Taken</h4>
                      <ul className="space-y-1">
                        {breach.actionsTaken.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Next Actions</h4>
                      <ul className="space-y-1">
                        {breach.nextActions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new action..."
                        value={newAction}
                        onChange={(e) => setNewAction(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAction(breach.id)}
                      />
                      <Button onClick={() => handleAddAction(breach.id)}>
                        Add Action
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="response-teams" className="space-y-4">
          <h3 className="text-lg font-semibold">Response Teams</h3>
          <div className="grid gap-4">
            {responseTeams.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{member.contact}</span>
                        </div>
                        <Badge variant="outline">
                          Escalation Level {member.escalationOrder}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="action-templates" className="space-y-4">
          <h3 className="text-lg font-semibold">Action Plan Templates</h3>
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>RTO Breach Response</CardTitle>
                <CardDescription>Standard response plan for Recovery Time Objective breaches</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Activate incident response team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Engage backup systems and procedures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Notify stakeholders and customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Implement temporary workarounds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Document impact and recovery actions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Level Breach Response</CardTitle>
                <CardDescription>Response plan for service level degradation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Increase monitoring frequency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Perform system diagnostics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Apply performance optimizations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Scale resources if needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Monitor recovery progress</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BreachManagement;
