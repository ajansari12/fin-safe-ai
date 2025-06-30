
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Clock, CheckCircle, TrendingUp } from "lucide-react";
import DraggableWidget from "./DraggableWidget";

interface RiskManagerDashboardProps {
  settings: any;
}

const RiskManagerDashboard: React.FC<RiskManagerDashboardProps> = ({ settings }) => {
  const riskMetrics = [
    {
      title: "Active Risk Items",
      value: "24",
      change: "+3",
      status: "warning",
      description: "Risks requiring attention"
    },
    {
      title: "Overdue Assessments", 
      value: "7",
      change: "-2",
      status: "error",
      description: "Risk assessments past due"
    },
    {
      title: "Controls Tested",
      value: "156",
      change: "+12",
      status: "success", 
      description: "This quarter"
    },
    {
      title: "KRI Breaches",
      value: "3",
      change: "0",
      status: "warning",
      description: "This month"
    }
  ];

  const riskRegister = [
    {
      id: "R001",
      category: "Operational",
      description: "Third-party service disruption",
      likelihood: "Medium",
      impact: "High",
      priority: "High",
      owner: "John Smith",
      dueDate: "2024-01-15",
      status: "In Progress"
    },
    {
      id: "R002", 
      category: "Cyber",
      description: "Data breach vulnerability",
      likelihood: "Low",
      impact: "Very High",
      priority: "Medium",
      owner: "Sarah Johnson", 
      dueDate: "2024-01-20",
      status: "Assessment Required"
    },
    {
      id: "R003",
      category: "Compliance",
      description: "Regulatory reporting gap",
      likelihood: "Medium",
      impact: "Medium", 
      priority: "Medium",
      owner: "Mike Davis",
      dueDate: "2024-01-10",
      status: "Overdue"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Manager Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {riskMetrics.map((metric, index) => (
          <DraggableWidget key={`risk-metric-${index}`} id={`risk-metric-${index}`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <AlertCircle className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{metric.change} from last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          </DraggableWidget>
        ))}
      </div>

      {/* Risk Register */}
      <DraggableWidget id="risk-register">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Active Risk Register
              <Badge variant="outline">{riskRegister.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskRegister.map((risk) => (
                <div key={risk.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{risk.id}</Badge>
                        <Badge variant={getPriorityColor(risk.priority)}>
                          {risk.priority} Priority
                        </Badge>
                        <Badge variant="secondary">{risk.category}</Badge>
                      </div>
                      <h4 className="font-medium">{risk.description}</h4>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Due: {risk.dueDate}</div>
                      <div>Owner: {risk.owner}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Likelihood:</span>
                      <div className="font-medium">{risk.likelihood}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Impact:</span>
                      <div className="font-medium">{risk.impact}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="font-medium">{risk.status}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Risk Assessment Progress</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DraggableWidget>

      {/* Action Items */}
      <div className="grid gap-6 md:grid-cols-2">
        <DraggableWidget id="pending-actions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Update risk assessment R001</h4>
                    <p className="text-sm text-muted-foreground">Due: Jan 15, 2024</p>
                  </div>
                  <Badge variant="destructive">Urgent</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Review control effectiveness</h4>
                    <p className="text-sm text-muted-foreground">Due: Jan 20, 2024</p>
                  </div>
                  <Badge variant="secondary">Medium</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Validate KRI thresholds</h4>
                    <p className="text-sm text-muted-foreground">Due: Jan 25, 2024</p>
                  </div>
                  <Badge variant="outline">Low</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </DraggableWidget>

        <DraggableWidget id="recent-activities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Risk R005 resolved</h4>
                    <p className="text-sm text-muted-foreground">
                      Completed by Sarah Johnson • 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-medium">KRI threshold breached</h4>
                    <p className="text-sm text-muted-foreground">
                      System disruption KRI • 4 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Control test completed</h4>
                    <p className="text-sm text-muted-foreground">
                      Access control testing • 6 hours ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </DraggableWidget>
      </div>
    </div>
  );
};

export default RiskManagerDashboard;
