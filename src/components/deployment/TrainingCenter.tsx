
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Video, 
  Users, 
  Award, 
  Play,
  Clock,
  CheckCircle,
  BarChart3,
  FileText,
  MessageSquare
} from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  type: 'video' | 'interactive' | 'document';
  duration: string;
  role: string[];
  completion: number;
  status: 'available' | 'in-progress' | 'completed';
}

interface UserProgress {
  userId: string;
  name: string;
  role: string;
  completion: number;
  lastActivity: string;
  certificationsEarned: number;
}

const TrainingCenter: React.FC = () => {
  const [trainingModules] = useState<TrainingModule[]>([
    {
      id: '1',
      title: 'Platform Overview & Navigation',
      type: 'video',
      duration: '15 min',
      role: ['admin', 'manager', 'analyst'],
      completion: 89,
      status: 'available'
    },
    {
      id: '2',
      title: 'Risk Assessment Workflows',
      type: 'interactive',
      duration: '30 min',
      role: ['manager', 'analyst'],
      completion: 67,
      status: 'available'
    },
    {
      id: '3',
      title: 'Compliance Reporting',
      type: 'video',
      duration: '20 min',
      role: ['admin', 'manager'],
      completion: 45,
      status: 'available'
    },
    {
      id: '4',
      title: 'System Administration',
      type: 'document',
      duration: '45 min',
      role: ['admin'],
      completion: 23,
      status: 'available'
    }
  ]);

  const [userProgress] = useState<UserProgress[]>([
    {
      userId: '1',
      name: 'Sarah Johnson',
      role: 'Risk Manager',
      completion: 85,
      lastActivity: '2 hours ago',
      certificationsEarned: 3
    },
    {
      userId: '2',
      name: 'Mike Chen',
      role: 'Compliance Analyst',
      completion: 72,
      lastActivity: '1 day ago',
      certificationsEarned: 2
    },
    {
      userId: '3',
      name: 'Emily Rodriguez',
      role: 'System Admin',
      completion: 91,
      lastActivity: '30 minutes ago',
      certificationsEarned: 4
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'interactive': return <Play className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="modules" className="w-full">
        <TabsList>
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="progress">User Progress</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Training Modules
                  </CardTitle>
                  <CardDescription>
                    Role-based training materials and interactive tutorials
                  </CardDescription>
                </div>
                <Button>
                  <Video className="h-4 w-4 mr-2" />
                  Create Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {trainingModules.map((module) => (
                  <div key={module.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(module.type)}
                        <div>
                          <h3 className="font-medium">{module.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {module.duration}
                            <span>•</span>
                            <span>For: {module.role.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(module.status)}>
                          {module.completion}% completed
                        </Badge>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      </div>
                    </div>
                    
                    <Progress value={module.completion} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">4 new this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Learners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">89</div>
                <p className="text-sm text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avg. Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">78%</div>
                <p className="text-sm text-muted-foreground">Above target</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                User Progress Tracking
              </CardTitle>
              <CardDescription>
                Individual progress and completion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProgress.map((user) => (
                  <div key={user.userId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>
                          <Award className="h-3 w-3 mr-1" />
                          {user.certificationsEarned} certs
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Last active: {user.lastActivity}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{user.completion}%</span>
                      </div>
                      <Progress value={user.completion} />
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
                <FileText className="h-5 w-5" />
                Training Resources
              </CardTitle>
              <CardDescription>
                Documentation, guides, and best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Administrator Guides</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">System Configuration Guide</span>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">User Management Manual</span>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Security Best Practices</span>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">User Manuals</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Risk Assessment Guide</span>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Reporting Quick Reference</span>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Workflow Templates</span>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications & Assessments
              </CardTitle>
              <CardDescription>
                Track certifications and competency assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Platform Basics Certification</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Demonstrates basic platform navigation and core functionality
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge>67 earned</Badge>
                      <Button size="sm">Take Assessment</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Risk Management Expert</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Advanced risk assessment and management workflows
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge>23 earned</Badge>
                      <Button size="sm">Take Assessment</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Compliance Specialist</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Regulatory compliance and reporting expertise
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge>15 earned</Badge>
                      <Button size="sm">Take Assessment</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">System Administrator</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Platform administration and configuration
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge>8 earned</Badge>
                      <Button size="sm">Take Assessment</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingCenter;
