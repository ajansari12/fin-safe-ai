
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  MessageSquare, 
  Star,
  BarChart3,
  Lightbulb,
  Target,
  Users,
  Calendar,
  CheckCircle,
  Clock
} from "lucide-react";

interface FeedbackItem {
  id: string;
  user: string;
  category: string;
  type: 'suggestion' | 'issue' | 'compliment';
  content: string;
  status: 'new' | 'reviewing' | 'planned' | 'implemented';
  votes: number;
  createdAt: string;
}

interface Enhancement {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'in-progress' | 'testing' | 'deployed';
  targetDate: string;
  requestedBy: number;
}

const ContinuousImprovement: React.FC = () => {
  const [feedbackItems] = useState<FeedbackItem[]>([
    {
      id: '1',
      user: 'Sarah Johnson',
      category: 'User Interface',
      type: 'suggestion',
      content: 'Add keyboard shortcuts for common actions to improve efficiency',
      status: 'planned',
      votes: 23,
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      user: 'Mike Chen',
      category: 'Reporting',
      type: 'suggestion',
      content: 'Include more detailed risk metrics in quarterly reports',
      status: 'reviewing',
      votes: 15,
      createdAt: '2024-01-12'
    },
    {
      id: '3',
      user: 'Emily Rodriguez',
      category: 'Performance',
      type: 'issue',
      content: 'Dashboard loads slowly with large datasets',
      status: 'implemented',
      votes: 8,
      createdAt: '2024-01-08'
    }
  ]);

  const [enhancements] = useState<Enhancement[]>([
    {
      id: '1',
      title: 'Advanced Dashboard Customization',
      description: 'Allow users to create custom dashboard layouts with drag-and-drop widgets',
      priority: 'high',
      status: 'in-progress',
      targetDate: '2024-02-15',
      requestedBy: 34
    },
    {
      id: '2',
      title: 'Mobile App Enhancement',
      description: 'Improve mobile responsiveness and add offline capabilities',
      priority: 'medium',
      status: 'planned',
      targetDate: '2024-03-01',
      requestedBy: 28
    },
    {
      id: '3',
      title: 'AI-Powered Risk Predictions',
      description: 'Implement machine learning for predictive risk analytics',
      priority: 'high',
      status: 'testing',
      targetDate: '2024-01-30',
      requestedBy: 45
    }
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'default';
      case 'issue': return 'destructive';
      case 'compliment': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': case 'deployed': return 'default';
      case 'planned': case 'in-progress': case 'testing': return 'secondary';
      case 'reviewing': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="feedback" className="w-full">
        <TabsList>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
          <TabsTrigger value="enhancements">Planned Enhancements</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
          <TabsTrigger value="roadmap">Product Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  +12 this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.6</div>
                <p className="text-xs text-muted-foreground">
                  Out of 5 stars
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Implemented</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">
                  Of suggestions reviewed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3d</div>
                <p className="text-xs text-muted-foreground">
                  Average response
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    User Feedback & Suggestions
                  </CardTitle>
                  <CardDescription>
                    Collect and analyze user feedback for continuous improvement
                  </CardDescription>
                </div>
                <Button>
                  Submit Feedback
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackItems.map((feedback) => (
                  <div key={feedback.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={getTypeColor(feedback.type)}>
                          {feedback.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {feedback.category} • by {feedback.user}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(feedback.status)}>
                          {feedback.status}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">{feedback.votes}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-2">{feedback.content}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted on {feedback.createdAt}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhancements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Planned Enhancements
              </CardTitle>
              <CardDescription>
                Feature development based on user feedback and needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancements.map((enhancement) => (
                  <div key={enhancement.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{enhancement.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(enhancement.priority)}>
                          {enhancement.priority}
                        </Badge>
                        <Badge variant={getStatusColor(enhancement.status)}>
                          {enhancement.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {enhancement.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Target: {enhancement.targetDate}</span>
                      <span>{enhancement.requestedBy} users requested</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Analytics
              </CardTitle>
              <CardDescription>
                Platform usage patterns and performance insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Feature Adoption</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Document Management</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Risk Assessment</span>
                        <span>73%</span>
                      </div>
                      <Progress value={73} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Compliance Reporting</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Analytics Dashboard</span>
                        <span>54%</span>
                      </div>
                      <Progress value={54} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Daily Active Users</span>
                      <span className="font-medium">234</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Session Duration</span>
                      <span className="font-medium">42 min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Page Load Time</span>
                      <span className="font-medium">1.2s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Rate</span>
                      <span className="font-medium">0.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Product Roadmap
              </CardTitle>
              <CardDescription>
                Planned features and improvements for the next quarters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Q1 2024
                  </h4>
                  <div className="space-y-2 ml-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Enhanced Dashboard Customization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Mobile App Improvements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Advanced Reporting Features</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Q2 2024
                  </h4>
                  <div className="space-y-2 ml-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">AI-Powered Risk Predictions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Integration with External Systems</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Advanced Security Features</span>
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

export default ContinuousImprovement;
