
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, AlertTriangle, FileText, Plus } from "lucide-react";
import DraggableWidget from "./DraggableWidget";

interface OperationalStaffDashboardProps {
  settings: any;
}

const OperationalStaffDashboard: React.FC<OperationalStaffDashboardProps> = ({ settings }) => {
  const myTasks = [
    {
      id: "T001",
      title: "Complete monthly risk assessment",
      description: "Submit operational risk assessment for December",
      priority: "High",
      dueDate: "2024-01-15",
      category: "Assessment",
      progress: 75
    },
    {
      id: "T002", 
      title: "Update business continuity plan",
      description: "Review and update BCP for IT systems",
      priority: "Medium",
      dueDate: "2024-01-20",
      category: "Planning",
      progress: 30
    },
    {
      id: "T003",
      title: "Test backup procedures",
      description: "Conduct quarterly backup restoration test",
      priority: "Medium",
      dueDate: "2024-01-25",
      category: "Testing",
      progress: 0
    }
  ];

  const recentAlerts = [
    {
      id: "A001",
      type: "KRI Breach",
      message: "System downtime exceeded threshold",
      severity: "High",
      timestamp: "2 hours ago",
      status: "Active"
    },
    {
      id: "A002",
      type: "Control Failure",
      message: "Backup validation failed",
      severity: "Medium", 
      timestamp: "4 hours ago",
      status: "Investigating"
    },
    {
      id: "A003",
      type: "Incident",
      message: "Network connectivity issue reported",
      severity: "Low",
      timestamp: "6 hours ago",
      status: "Resolved"
    }
  ];

  const quickActions = [
    { icon: FileText, label: "Submit Incident Report", color: "bg-blue-500" },
    { icon: CheckSquare, label: "Complete Assessment", color: "bg-green-500" },
    { icon: AlertTriangle, label: "Log Risk Event", color: "bg-yellow-500" },
    { icon: Clock, label: "Schedule Test", color: "bg-purple-500" }
  ];

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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <DraggableWidget id="quick-actions">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:bg-muted/50"
                >
                  <div className={`p-2 rounded-full ${action.color} text-white`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-center">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </DraggableWidget>

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Tasks */}
        <DraggableWidget id="my-tasks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                My Tasks
                <Badge variant="outline">{myTasks.length} active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{task.id}</Badge>
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="secondary">{task.category}</Badge>
                        </div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Due: {task.dueDate}</span>
                      <span className="text-muted-foreground">Progress: {task.progress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm">
                        Update Progress
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </DraggableWidget>

        {/* Recent Alerts */}
        <DraggableWidget id="recent-alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{alert.type}</Badge>
                        <Badge 
                          variant={alert.status === "Active" ? "destructive" : "secondary"}
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp}
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <AlertTriangle className={`h-4 w-4 ${getSeverityColor(alert.severity)}`} />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {alert.status === "Active" && (
                        <Button size="sm">
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </DraggableWidget>
      </div>

      {/* Personal Dashboard */}
      <DraggableWidget id="personal-stats">
        <Card>
          <CardHeader>
            <CardTitle>My Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-green-500">18</div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
                <div className="text-xs text-muted-foreground">This month</div>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-blue-500">95%</div>
                <div className="text-sm text-muted-foreground">On-Time Rate</div>
                <div className="text-xs text-muted-foreground">Last 30 days</div>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-yellow-500">3</div>
                <div className="text-sm text-muted-foreground">Pending Items</div>
                <div className="text-xs text-muted-foreground">Require attention</div>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-purple-500">12</div>
                <div className="text-sm text-muted-foreground">Assessments</div>
                <div className="text-xs text-muted-foreground">This quarter</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DraggableWidget>
    </div>
  );
};

export default OperationalStaffDashboard;
