
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Activity
} from "lucide-react";

const OnboardingDashboard = () => {
  const metrics = {
    totalTasks: 156,
    completedTasks: 89,
    inProgressTasks: 23,
    overdueeTasks: 7,
    totalStakeholders: 24,
    trainedUsers: 18,
    daysToGoLive: 45,
    migratedDataSets: 12
  };

  const recentActivities = [
    {
      id: 1,
      type: "milestone",
      description: "Discovery phase completed",
      timestamp: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      type: "task",
      description: "Data mapping for core banking system",
      timestamp: "4 hours ago",
      status: "in_progress"
    },
    {
      id: 3,
      type: "issue",
      description: "API connectivity issue with legacy system",
      timestamp: "1 day ago",
      status: "blocked"
    },
    {
      id: 4,
      type: "training",
      description: "Risk manager training session scheduled",
      timestamp: "2 days ago",
      status: "scheduled"
    }
  ];

  const upcomingMilestones = [
    {
      id: 1,
      name: "Data Migration Testing",
      dueDate: "2024-07-15",
      status: "upcoming",
      progress: 65
    },
    {
      id: 2,
      name: "User Acceptance Testing",
      dueDate: "2024-07-22",
      status: "upcoming",
      progress: 30
    },
    {
      id: 3,
      name: "Go-Live Preparation",
      dueDate: "2024-08-01",
      status: "upcoming",
      progress: 10
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "milestone": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "task": return <Clock className="h-4 w-4 text-blue-500" />;
      case "issue": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "training": return <Users className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completedTasks}/{metrics.totalTasks}</div>
            <Progress value={(metrics.completedTasks / metrics.totalTasks) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((metrics.completedTasks / metrics.totalTasks) * 100)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stakeholder Training</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trainedUsers}/{metrics.totalStakeholders}</div>
            <Progress value={(metrics.trainedUsers / metrics.totalStakeholders) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((metrics.trainedUsers / metrics.totalStakeholders) * 100)}% trained
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days to Go-Live</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.daysToGoLive}</div>
            <p className="text-xs text-muted-foreground">
              Target: August 15, 2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics.overdueeTasks}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and progress on implementation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                  <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Milestones</CardTitle>
            <CardDescription>Key deliverables and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMilestones.map((milestone) => (
                <div key={milestone.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{milestone.name}</h4>
                    <span className="text-xs text-muted-foreground">{milestone.dueDate}</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{milestone.progress}% complete</span>
                    <Badge variant="outline">{milestone.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and next steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Generate Status Report
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Schedule Stakeholder Meeting
            </Button>
            <Button variant="outline" className="justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Review Critical Issues
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Progress Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingDashboard;
