
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  Target, 
  Brain,
  Play,
  CheckCircle,
  Clock,
  Lightbulb,
  GraduationCap
} from "lucide-react";

const AdaptiveOnboardingFlows = () => {
  const [selectedFlow, setSelectedFlow] = useState(null);

  const onboardingPaths = [
    {
      id: 1,
      role: "Risk Manager",
      level: "Intermediate",
      duration: "8-10 days",
      modules: 12,
      participants: 87,
      completionRate: 85,
      description: "Comprehensive risk management workflow with advanced analytics focus",
      features: ["Risk Assessment Tools", "Compliance Reporting", "Analytics Dashboard", "Integration Setup"]
    },
    {
      id: 2,
      role: "Compliance Officer",
      level: "Advanced",
      duration: "6-8 days",
      modules: 15,
      participants: 64,
      completionRate: 92,
      description: "Regulatory compliance and audit preparation specialization",
      features: ["Regulatory Mapping", "Audit Trails", "Document Management", "Reporting Automation"]
    },
    {
      id: 3,
      role: "Operations Staff",
      level: "Beginner",
      duration: "5-7 days",
      modules: 8,
      participants: 156,
      completionRate: 78,
      description: "Essential operational workflows and day-to-day task management",
      features: ["Incident Logging", "Basic Reporting", "Task Management", "Communication Tools"]
    }
  ];

  const learningModules = [
    {
      id: 1,
      title: "Platform Navigation Basics",
      type: "Interactive Tutorial",
      duration: "15 min",
      status: "completed",
      competency: "Essential",
      description: "Learn to navigate the platform efficiently"
    },
    {
      id: 2,
      title: "Risk Assessment Workshop",
      type: "Hands-on Practice",
      duration: "45 min",
      status: "in_progress",
      competency: "Core",
      description: "Practice with real risk scenarios"
    },
    {
      id: 3,
      title: "Advanced Analytics Deep Dive",
      type: "Expert Session",
      duration: "60 min",
      status: "pending",
      competency: "Advanced",
      description: "Master complex analytical tools"
    }
  ];

  const assessmentResults = {
    overallScore: 87,
    strengths: ["Analytical Thinking", "Attention to Detail", "Process Understanding"],
    improvements: ["Advanced Reporting", "Integration Management", "Workflow Automation"],
    recommendations: [
      "Focus on advanced reporting modules first",
      "Schedule one-on-one session for integration setup",
      "Join the workflow automation masterclass"
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending": return <Target className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress": return <Badge className="bg-blue-500">In Progress</Badge>;
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="paths" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="paths">Role-Based Paths</TabsTrigger>
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="assessment">Competency Assessment</TabsTrigger>
          <TabsTrigger value="contextual">Contextual Help</TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Adaptive Onboarding Paths
              </CardTitle>
              <CardDescription>
                Personalized learning journeys based on role, experience, and learning preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {onboardingPaths.map((path) => (
                  <Card key={path.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{path.role}</CardTitle>
                          <Badge variant="outline">{path.level}</Badge>
                        </div>
                        <Badge className="bg-blue-500">{path.completionRate}% complete rate</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{path.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Duration:</span>
                          <br />
                          <span className="text-muted-foreground">{path.duration}</span>
                        </div>
                        <div>
                          <span className="font-medium">Modules:</span>
                          <br />
                          <span className="text-muted-foreground">{path.modules} modules</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Key Features:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {path.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-muted-foreground">
                          {path.participants} participants
                        </span>
                        <Button size="sm">Start Path</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Interactive Learning Modules
              </CardTitle>
              <CardDescription>
                Progressive disclosure modules with hands-on practice and real-world scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningModules.map((module) => (
                  <div key={module.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(module.status)}
                        <div>
                          <h4 className="font-medium">{module.title}</h4>
                          <p className="text-sm text-muted-foreground">{module.type} • {module.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={module.competency === "Essential" ? "default" : "secondary"}>
                          {module.competency}
                        </Badge>
                        {getStatusBadge(module.status)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant={module.status === "completed" ? "outline" : "default"}>
                        <Play className="h-4 w-4 mr-2" />
                        {module.status === "completed" ? "Review" : module.status === "in_progress" ? "Continue" : "Start"}
                      </Button>
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Resources
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Competency Assessment & Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered skill assessment with personalized learning recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500 mb-2">{assessmentResults.overallScore}/100</div>
                <p className="text-muted-foreground">Overall Competency Score</p>
                <Progress value={assessmentResults.overallScore} className="w-full mt-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-600">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessmentResults.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-orange-600">Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessmentResults.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessmentResults.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Create Personalized Learning Plan
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contextual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Just-in-Time Learning System
              </CardTitle>
              <CardDescription>
                Contextual help and learning resources delivered when and where you need them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Smart Help System</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Context-Aware Tooltips</p>
                          <p className="text-xs text-muted-foreground">Adaptive help based on current task</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Progressive Disclosure</p>
                          <p className="text-xs text-muted-foreground">Features revealed as skills develop</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Smart Suggestions</p>
                          <p className="text-xs text-muted-foreground">Proactive learning recommendations</p>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">Configure Help Preferences</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Learning Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Help Requests This Week</span>
                        <span className="text-sm font-medium">23</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Resolution Time</span>
                        <span className="text-sm font-medium">2.3 min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Self-Service Success Rate</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                    </div>
                    <Progress value={87} className="w-full" />
                    <Button variant="outline" className="w-full">View Detailed Analytics</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdaptiveOnboardingFlows;
