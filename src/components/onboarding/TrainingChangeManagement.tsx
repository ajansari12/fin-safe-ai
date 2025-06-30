
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Calendar, 
  Users, 
  FileText,
  Award,
  TrendingUp,
  MessageSquare,
  CheckCircle
} from "lucide-react";

const TrainingChangeManagement = () => {
  const [selectedProgram, setSelectedProgram] = useState(null);

  const trainingPrograms = [
    {
      id: 1,
      title: "Risk Manager Certification",
      role: "Risk Management",
      duration: "8 hours",
      modules: 6,
      participants: 8,
      completed: 5,
      scheduled: "2024-07-15",
      status: "in_progress"
    },
    {
      id: 2,
      title: "Governance Framework Training",
      role: "Compliance",
      duration: "4 hours",
      modules: 4,
      participants: 12,
      completed: 12,
      scheduled: "2024-07-08",
      status: "completed"
    },
    {
      id: 3,
      title: "Incident Response Workshop",
      role: "Operations",
      duration: "6 hours",
      modules: 5,
      participants: 15,
      completed: 0,
      scheduled: "2024-07-22",
      status: "scheduled"
    },
    {
      id: 4,
      title: "Analytics & Reporting",
      role: "Analysts",
      duration: "3 hours",
      modules: 3,
      participants: 6,
      completed: 0,
      scheduled: "2024-07-25",
      status: "scheduled"
    }
  ];

  const changeReadiness = [
    {
      department: "Risk Management",
      readinessScore: 85,
      concerns: "Low",
      champions: 3,
      resistors: 1,
      interventions: ["One-on-one coaching"]
    },
    {
      department: "Operations",
      readinessScore: 70,
      concerns: "Medium",
      champions: 2,
      resistors: 3,
      interventions: ["Additional training", "Peer mentoring"]
    },
    {
      department: "Compliance",
      readinessScore: 92,
      concerns: "Low",
      champions: 4,
      resistors: 0,
      interventions: ["None required"]
    },
    {
      department: "IT",
      readinessScore: 78,
      concerns: "Medium",
      champions: 2,
      resistors: 2,
      interventions: ["Technical deep-dive sessions"]
    }
  ];

  const communicationTemplates = [
    {
      id: 1,
      name: "Executive Announcement",
      audience: "Senior Leadership",
      type: "Email",
      status: "sent",
      engagement: 95
    },
    {
      id: 2,
      name: "Department Rollout Plan",
      audience: "Department Heads",
      type: "Presentation",
      status: "scheduled",
      engagement: null
    },
    {
      id: 3,
      name: "User Quick Start Guide",
      audience: "End Users",
      type: "Document",
      status: "draft",
      engagement: null
    },
    {
      id: 4,
      name: "FAQ & Support",
      audience: "All Users",
      type: "Knowledge Base",
      status: "in_progress",
      engagement: null
    }
  ];

  const getReadinessColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress": return <Badge className="bg-blue-500">In Progress</Badge>;
      case "scheduled": return <Badge variant="secondary">Scheduled</Badge>;
      case "sent": return <Badge className="bg-green-500">Sent</Badge>;
      case "draft": return <Badge variant="outline">Draft</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="programs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="programs">Training Programs</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Tracking</TabsTrigger>
          <TabsTrigger value="readiness">Change Readiness</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Role-Based Training Programs
                </CardTitle>
                <CardDescription>
                  Customized training content for different user roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingPrograms.map((program) => (
                    <div key={program.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{program.title}</h4>
                          <p className="text-sm text-muted-foreground">{program.role}</p>
                        </div>
                        {getStatusBadge(program.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p className="text-muted-foreground">{program.duration}</p>
                        </div>
                        <div>
                          <span className="font-medium">Modules:</span>
                          <p className="text-muted-foreground">{program.modules} modules</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate</span>
                          <span>{program.completed}/{program.participants}</span>
                        </div>
                        <Progress 
                          value={(program.completed / program.participants) * 100} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Scheduled: {program.scheduled}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certification Management
                </CardTitle>
                <CardDescription>
                  Track progress and manage certification requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Risk Management Certification</span>
                      <Badge className="bg-green-500">5/8 Certified</Badge>
                    </div>
                    <Progress value={62.5} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      3 participants pending final assessment
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Governance Framework</span>
                      <Badge className="bg-green-500">12/12 Certified</Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      All participants successfully certified
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">System Administration</span>
                      <Badge variant="secondary">0/4 Certified</Badge>
                    </div>
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Training starts next week
                    </p>
                  </div>
                  
                  <Button className="w-full">
                    <Award className="h-4 w-4 mr-2" />
                    Generate Certificates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Training Schedule & Calendar Integration
              </CardTitle>
              <CardDescription>
                Coordinate training sessions with participant availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">This Week</h4>
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="text-sm font-medium">Risk Manager Deep Dive</div>
                      <div className="text-xs text-muted-foreground">July 15, 2:00 PM - 4:00 PM</div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">Module 4</Badge>
                        <Badge variant="outline" className="text-xs">8 attendees</Badge>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="text-sm font-medium">Q&A Session</div>
                      <div className="text-xs text-muted-foreground">July 17, 10:00 AM - 11:00 AM</div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">All Roles</Badge>
                        <Badge variant="outline" className="text-xs">24 attendees</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Next Week</h4>
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="text-sm font-medium">Incident Response Workshop</div>
                      <div className="text-xs text-muted-foreground">July 22, 9:00 AM - 3:00 PM</div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">Operations</Badge>
                        <Badge variant="outline" className="text-xs">15 attendees</Badge>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="text-sm font-medium">Analytics Training</div>
                      <div className="text-xs text-muted-foreground">July 25, 1:00 PM - 4:00 PM</div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">Analysts</Badge>
                        <Badge variant="outline" className="text-xs">6 attendees</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Upcoming</h4>
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="text-sm font-medium">Executive Overview</div>
                      <div className="text-xs text-muted-foreground">August 1, 11:00 AM - 12:00 PM</div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">Leadership</Badge>
                        <Badge variant="outline" className="text-xs">8 attendees</Badge>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="text-sm font-medium">Go-Live Readiness</div>
                      <div className="text-xs text-muted-foreground">August 10, 2:00 PM - 5:00 PM</div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">All Users</Badge>
                        <Badge variant="outline" className="text-xs">40 attendees</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                  <Button variant="outline">
                    Export Calendar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readiness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Change Readiness Assessment
              </CardTitle>
              <CardDescription>
                Monitor adoption readiness and identify intervention needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {changeReadiness.map((dept, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{dept.department}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getReadinessColor(dept.readinessScore)}`}>
                          {dept.readinessScore}%
                        </span>
                        <Badge variant={dept.concerns === "Low" ? "default" : "destructive"}>
                          {dept.concerns} Risk
                        </Badge>
                      </div>
                    </div>
                    
                    <Progress value={dept.readinessScore} className="h-3" />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-500">{dept.champions}</div>
                        <div className="text-muted-foreground">Change Champions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-500">{dept.resistors}</div>
                        <div className="text-muted-foreground">Resistors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{dept.champions + dept.resistors}</div>
                        <div className="text-muted-foreground">Total Assessed</div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Interventions:</span>
                      <div className="flex gap-1 mt-1">
                        {dept.interventions.map((intervention, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {intervention}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication Template Library
              </CardTitle>
              <CardDescription>
                Stakeholder-specific communication materials and engagement tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communicationTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.audience}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{template.type}</Badge>
                        {getStatusBadge(template.status)}
                      </div>
                    </div>
                    
                    {template.engagement && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Engagement Rate</span>
                          <span>{template.engagement}%</span>
                        </div>
                        <Progress value={template.engagement} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="h-3 w-3 mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingChangeManagement;
