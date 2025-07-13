
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  Monitor, 
  Clock,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  Headphones,
  Zap,
  Shield,
  FileText,
  PlayCircle
} from "lucide-react";
import { GoLiveProcessDialog } from "@/components/dialogs/GoLiveProcessDialog";
import { SystemChecksDialog } from "@/components/dialogs/SystemChecksDialog";
import { AlertsManagementDialog } from "@/components/dialogs/AlertsManagementDialog";
import { SuccessReportDialog } from "@/components/dialogs/SuccessReportDialog";

interface SupportTicket {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo: string;
  createdAt: string;
  category: string;
}

interface SupportAgent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  activeTickets: number;
  specialization: string[];
}

const GoLiveSupport: React.FC = () => {
  // Dialog states for critical go-live actions
  const [goLiveDialogOpen, setGoLiveDialogOpen] = useState(false);
  const [systemChecksDialogOpen, setSystemChecksDialogOpen] = useState(false);
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [successReportDialogOpen, setSuccessReportDialogOpen] = useState(false);

  const [supportTickets] = useState<SupportTicket[]>([
    {
      id: 'T001',
      title: 'Unable to login after migration',
      priority: 'high',
      status: 'in-progress',
      assignedTo: 'Sarah Chen',
      createdAt: '2024-01-15 14:30',
      category: 'Authentication'
    },
    {
      id: 'T002',
      title: 'Performance issues with large datasets',
      priority: 'medium',
      status: 'open',
      assignedTo: 'Mike Johnson',
      createdAt: '2024-01-15 13:45',
      category: 'Performance'
    },
    {
      id: 'T003',
      title: 'Report generation failing',
      priority: 'critical',
      status: 'resolved',
      assignedTo: 'Emily Rodriguez',
      createdAt: '2024-01-15 12:15',
      category: 'Reporting'
    }
  ]);

  const [supportAgents] = useState<SupportAgent[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Senior Support Engineer',
      status: 'online',
      activeTickets: 3,
      specialization: ['Authentication', 'Security']
    },
    {
      id: '2',
      name: 'Mike Johnson',
      role: 'Technical Specialist',
      status: 'online',
      activeTickets: 2,
      specialization: ['Performance', 'Database']
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Support Manager',
      status: 'busy',
      activeTickets: 5,
      specialization: ['Reporting', 'Business Logic']
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'in-progress': return 'secondary';
      case 'open': return 'outline';
      default: return 'outline';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'busy': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Support Dashboard</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Management</TabsTrigger>
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  3 critical, 2 high priority
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12m</div>
                <p className="text-xs text-muted-foreground">
                  Within SLA target
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online Agents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">
                  24/7 coverage active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">
                  First contact resolution
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Support Team Status
                </CardTitle>
                <CardDescription>
                  Current availability of support agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supportAgents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getAgentStatusColor(agent.status)}`} />
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{agent.activeTickets} tickets</div>
                        <div className="text-xs text-muted-foreground">
                          {agent.specialization.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>
                  24/7 support channels during go-live
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Emergency Hotline</div>
                        <div className="text-sm text-muted-foreground">Critical issues only</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Technical Support</div>
                        <div className="text-sm text-muted-foreground">General assistance</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Live Chat</div>
                        <div className="text-sm text-muted-foreground">Instant messaging</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Go-Live Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Critical Go-Live Actions
              </CardTitle>
              <CardDescription>
                Essential actions for go-live process management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setGoLiveDialogOpen(true)}
                  className="flex items-center gap-2 h-auto p-4 flex-col"
                  size="lg"
                >
                  <Zap className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Initiate Go-Live</div>
                    <div className="text-xs opacity-80">Start deployment</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setSystemChecksDialogOpen(true)}
                  className="flex items-center gap-2 h-auto p-4 flex-col"
                  size="lg"
                >
                  <Shield className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Run All Checks</div>
                    <div className="text-xs opacity-80">System validation</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setAlertsDialogOpen(true)}
                  className="flex items-center gap-2 h-auto p-4 flex-col"
                  size="lg"
                >
                  <AlertCircle className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">View All Alerts</div>
                    <div className="text-xs opacity-80">Alert management</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setSuccessReportDialogOpen(true)}
                  className="flex items-center gap-2 h-auto p-4 flex-col"
                  size="lg"
                >
                  <FileText className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Generate Report</div>
                    <div className="text-xs opacity-80">Success metrics</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Support Tickets
                  </CardTitle>
                  <CardDescription>
                    Track and manage support requests
                  </CardDescription>
                </div>
                <Button>
                  Create Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{ticket.id}</Badge>
                        <h3 className="font-medium">{ticket.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Category: {ticket.category}</span>
                      <span>Assigned to: {ticket.assignedTo}</span>
                      <span>Created: {ticket.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Live Chat Support
              </CardTitle>
              <CardDescription>
                Real-time assistance during go-live
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chat-name">Your Name</Label>
                    <Input id="chat-name" placeholder="Enter your name" />
                  </div>
                  <div>
                    <Label htmlFor="chat-category">Issue Category</Label>
                    <Input id="chat-category" placeholder="Select category" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="chat-message">Message</Label>
                  <Textarea 
                    id="chat-message" 
                    placeholder="Describe your issue or question"
                    rows={4}
                  />
                </div>

                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Real-time System Monitoring
              </CardTitle>
              <CardDescription>
                Live performance metrics and issue detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">System Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Response Time</span>
                      <Badge>Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Performance</span>
                      <Badge>Good</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">User Sessions</span>
                      <Badge>145 active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Rate</span>
                      <Badge variant="destructive">0.1%</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Recent Alerts</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Database backup completed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>High memory usage detected</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Security scan passed</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Go-Live Action Dialogs */}
      <GoLiveProcessDialog 
        open={goLiveDialogOpen}
        onOpenChange={setGoLiveDialogOpen}
      />
      
      <SystemChecksDialog 
        open={systemChecksDialogOpen}
        onOpenChange={setSystemChecksDialogOpen}
      />
      
      <AlertsManagementDialog 
        open={alertsDialogOpen}
        onOpenChange={setAlertsDialogOpen}
        alerts={[]} // Mock alerts data
      />
      
      <SuccessReportDialog 
        open={successReportDialogOpen}
        onOpenChange={setSuccessReportDialogOpen}
      />
    </div>
  );
};

export default GoLiveSupport;
