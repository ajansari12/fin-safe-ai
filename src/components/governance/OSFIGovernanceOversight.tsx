import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Clock, 
  FileText, 
  CheckCircle,
  Eye,
  TrendingUp,
  Settings
} from "lucide-react";

interface GovernanceMetric {
  id: string;
  title: string;
  value: number;
  target: number;
  status: 'on-track' | 'at-risk' | 'overdue';
  lastReview: string;
  nextReview: string;
}

interface BoardOversightItem {
  id: string;
  title: string;
  type: 'policy' | 'framework' | 'assessment' | 'report';
  status: 'approved' | 'pending' | 'under-review' | 'requires-action';
  dueDate: string;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
}

export default function OSFIGovernanceOversight() {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock data - in production, this would come from API
  const governanceMetrics: GovernanceMetric[] = [
    {
      id: "1",
      title: "Board Oversight Effectiveness",
      value: 92,
      target: 95,
      status: 'on-track',
      lastReview: "2024-06-15",
      nextReview: "2024-09-15"
    },
    {
      id: "2", 
      title: "Senior Management Accountability",
      value: 88,
      target: 90,
      status: 'at-risk',
      lastReview: "2024-06-01",
      nextReview: "2024-08-01"
    },
    {
      id: "3",
      title: "Three Lines of Defense Implementation",
      value: 95,
      target: 95,
      status: 'on-track',
      lastReview: "2024-06-20",
      nextReview: "2024-09-20"
    },
    {
      id: "4",
      title: "Independent Assurance Coverage",
      value: 78,
      target: 85,
      status: 'at-risk',
      lastReview: "2024-05-30",
      nextReview: "2024-08-30"
    }
  ];

  const boardOversightItems: BoardOversightItem[] = [
    {
      id: "1",
      title: "OSFI E-21 Compliance Assessment",
      type: 'assessment',
      status: 'pending',
      dueDate: "2024-08-15",
      assignedTo: "Chief Risk Officer",
      priority: 'high'
    },
    {
      id: "2",
      title: "Operational Resilience Framework Review",
      type: 'framework',
      status: 'under-review',
      dueDate: "2024-07-30",
      assignedTo: "Board Risk Committee",
      priority: 'high'
    },
    {
      id: "3",
      title: "Quarterly Operational Risk Report",
      type: 'report',
      status: 'approved',
      dueDate: "2024-07-15",
      assignedTo: "CRO",
      priority: 'medium'
    },
    {
      id: "4",
      title: "Critical Operations Impact Tolerance Policy",
      type: 'policy',
      status: 'requires-action',
      dueDate: "2024-08-01",
      assignedTo: "Senior Management",
      priority: 'high'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'at-risk':
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
      case 'requires-action':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OSFI E-21 Governance Oversight</h2>
          <p className="text-muted-foreground">
            Senior management oversight and board accountability for operational resilience
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            OSFI E-21 Compliant
          </Badge>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Regulatory Notice:</strong> This dashboard supports OSFI E-21 Principle 1 (Governance) requirements. 
          Data shown is for management oversight purposes only. This is not regulatory advice - consult OSFI directly for compliance guidance.
        </AlertDescription>
      </Alert>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="board-oversight" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Board Oversight
          </TabsTrigger>
          <TabsTrigger value="senior-mgmt" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Senior Management
          </TabsTrigger>
          <TabsTrigger value="assurance" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Independent Assurance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {governanceMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-2xl font-bold">
                      <span>{metric.value}%</span>
                      <span className="text-sm text-muted-foreground font-normal">
                        Target: {metric.target}%
                      </span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last Review: {metric.lastReview}</span>
                      <span>Next: {metric.nextReview}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="board-oversight" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Board Level Oversight Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {boardOversightItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPriorityIcon(item.priority)}
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Assigned to: {item.assignedTo} • Due: {item.dueDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('-', ' ')}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="senior-mgmt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Senior Management Accountability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>OSFI E-21 Requirement:</strong> Senior management must ensure effective operational risk management 
                    and resilience frameworks are in place, with clear accountability and regular reporting to the board.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="font-medium">Chief Risk Officer</div>
                      <div className="text-sm text-muted-foreground">
                        Operational Risk Framework Oversight
                      </div>
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        Compliant
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-4">
                      <div className="font-medium">Chief Operating Officer</div>
                      <div className="text-sm text-muted-foreground">
                        Critical Operations Management
                      </div>
                      <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                        Review Required
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assurance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Independent Assurance Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Three Lines of Defense:</strong> Independent assurance through internal audit, 
                    risk management, and operational controls as required by OSFI E-21.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">First Line: Operational Controls</div>
                      <div className="text-sm text-muted-foreground">Business units and operations</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">85% Coverage</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Second Line: Risk Management</div>
                      <div className="text-sm text-muted-foreground">Risk and compliance functions</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">92% Coverage</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Third Line: Internal Audit</div>
                      <div className="text-sm text-muted-foreground">Independent assurance and validation</div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">78% Coverage</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}