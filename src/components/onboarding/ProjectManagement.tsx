
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  AlertTriangle, 
  MessageSquare,
  Gantt,
  Clock,
  CheckCircle,
  TrendingUp
} from "lucide-react";

const ProjectManagement = () => {
  const [selectedTask, setSelectedTask] = useState(null);

  const projectTasks = [
    {
      id: 1,
      name: "System Architecture Review",
      phase: "Planning",
      assignee: "Michael Chen",
      startDate: "2024-07-01",
      endDate: "2024-07-10",
      progress: 100,
      status: "completed",
      dependencies: [],
      critical: true
    },
    {
      id: 2,
      name: "Data Mapping Design",
      phase: "Design",
      assignee: "Sarah Johnson",
      startDate: "2024-07-08",
      endDate: "2024-07-20",
      progress: 75,
      status: "in_progress",
      dependencies: [1],
      critical: true
    },
    {
      id: 3,
      name: "Security Configuration",
      phase: "Configuration",
      assignee: "David Kim",
      startDate: "2024-07-15",
      endDate: "2024-07-25",
      progress: 30,
      status: "in_progress",
      dependencies: [1],
      critical: false
    },
    {
      id: 4,
      name: "User Training Development",
      phase: "Training",
      assignee: "Lisa Rodriguez",
      startDate: "2024-07-20",
      endDate: "2024-08-05",
      progress: 0,
      status: "pending",
      dependencies: [2],
      critical: false
    }
  ];

  const resourceAllocation = [
    { name: "Michael Chen", role: "IT Director", allocation: 60, capacity: 80 },
    { name: "Sarah Johnson", role: "Risk Manager", allocation: 75, capacity: 70 },
    { name: "David Kim", role: "Security Analyst", allocation: 40, capacity: 100 },
    { name: "Lisa Rodriguez", role: "Training Coordinator", allocation: 20, capacity: 90 }
  ];

  const projectRisks = [
    {
      id: 1,
      title: "Legacy System Integration Complexity",
      severity: "High",
      probability: "Medium",
      impact: "Data migration delays",
      mitigation: "Additional testing cycles planned",
      owner: "Michael Chen"
    },
    {
      id: 2,
      title: "Stakeholder Availability",
      severity: "Medium",
      probability: "High",
      impact: "Training schedule delays",
      mitigation: "Flexible training schedule with recordings",
      owner: "Lisa Rodriguez"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "pending": return "bg-gray-400";
      case "blocked": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Project Timeline</TabsTrigger>
          <TabsTrigger value="resources">Resource Allocation</TabsTrigger>
          <TabsTrigger value="risks">Risk & Issues</TabsTrigger>
          <TabsTrigger value="communication">Communication Hub</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gantt className="h-5 w-5" />
                Project Timeline & Dependencies
              </CardTitle>
              <CardDescription>
                Critical path analysis and task dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                  <div className="col-span-3">Task</div>
                  <div className="col-span-2">Assignee</div>
                  <div className="col-span-2">Duration</div>
                  <div className="col-span-3">Progress</div>
                  <div className="col-span-2">Status</div>
                </div>

                {/* Timeline Rows */}
                {projectTasks.map((task) => (
                  <div key={task.id} className="grid grid-cols-12 gap-2 items-center py-2 border-b">
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        {task.critical && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                        <span className="font-medium text-sm">{task.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{task.phase}</span>
                    </div>
                    
                    <div className="col-span-2">
                      <span className="text-sm">{task.assignee}</span>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="text-xs">
                        <div>{task.startDate}</div>
                        <div>{task.endDate}</div>
                      </div>
                    </div>
                    
                    <div className="col-span-3">
                      <div className="space-y-1">
                        <Progress value={task.progress} className="h-2" />
                        <span className="text-xs">{task.progress}%</span>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Resource Allocation & Capacity
              </CardTitle>
              <CardDescription>
                Team capacity management and workload distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {resourceAllocation.map((resource, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{resource.name}</h4>
                        <p className="text-sm text-muted-foreground">{resource.role}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{resource.allocation}% allocated</span>
                        <div className="text-xs text-muted-foreground">
                          {resource.capacity}% capacity available
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Progress 
                        value={(resource.allocation / resource.capacity) * 100} 
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current Allocation</span>
                        <span className={
                          resource.allocation > resource.capacity ? "text-red-500" : "text-green-500"
                        }>
                          {resource.allocation > resource.capacity ? "Over-allocated" : "Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk & Issue Management
              </CardTitle>
              <CardDescription>
                Track and manage project risks with mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectRisks.map((risk) => (
                  <div key={risk.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{risk.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant={getSeverityVariant(risk.severity)}>
                          {risk.severity}
                        </Badge>
                        <Badge variant="outline">
                          {risk.probability} Probability
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Impact:</span>
                        <p className="text-muted-foreground">{risk.impact}</p>
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span>
                        <p className="text-muted-foreground">{risk.owner}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Mitigation:</span>
                      <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Add New Risk/Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication Dashboard
                </CardTitle>
                <CardDescription>
                  Stakeholder-specific updates and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Executive Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      Project is 65% complete and on track for August 15th go-live. 
                      Key milestone: Data migration testing completed successfully.
                    </p>
                    <Button variant="outline" size="sm">
                      Generate Full Report
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Team Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Weekly standup scheduled for Friday 2 PM EST. 
                      Review migration results and UAT planning.
                    </p>
                    <Button variant="outline" size="sm">
                      View Meeting Notes
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Regulatory Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Compliance review scheduled for validation of 
                      regulatory reporting capabilities.
                    </p>
                    <Button variant="outline" size="sm">
                      Schedule Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Schedule Performance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm">85%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Budget Utilization</span>
                    <div className="flex items-center gap-2">
                      <Progress value={70} className="w-20 h-2" />
                      <span className="text-sm">70%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quality Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20 h-2" />
                      <span className="text-sm">92%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Stakeholder Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <Progress value={88} className="w-20 h-2" />
                      <span className="text-sm">88%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectManagement;
