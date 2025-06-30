
import React, { useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Target, 
  Trophy, 
  BarChart3, 
  MessageSquare,
  BookOpen,
  Settings,
  Gamepad2,
  Brain,
  TrendingUp
} from "lucide-react";
import AdaptiveOnboardingFlows from "@/components/user-onboarding/AdaptiveOnboardingFlows";
import PersonalizationEngine from "@/components/user-onboarding/PersonalizationEngine";
import GamificationSystem from "@/components/user-onboarding/GamificationSystem";
import UserAnalytics from "@/components/user-onboarding/UserAnalytics";
import CollaborativeLearning from "@/components/user-onboarding/CollaborativeLearning";

const UserOnboarding = () => {
  const [activeTab, setActiveTab] = useState("flows");

  // Mock user onboarding data
  const onboardingStats = {
    totalUsers: 1247,
    activeOnboarding: 89,
    completionRate: 78,
    averageTime: 12,
    satisfactionScore: 4.6
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advanced User Onboarding System</h1>
            <p className="text-muted-foreground">
              Adaptive, personalized onboarding experiences that evolve with user needs
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-500">{onboardingStats.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
            <Progress value={onboardingStats.completionRate} className="w-32" />
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Onboarding</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.activeOnboarding}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time to Complete</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.averageTime} days</div>
              <p className="text-xs text-muted-foreground">
                Time to proficiency
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingStats.satisfactionScore}/5.0</div>
              <p className="text-xs text-muted-foreground">
                User feedback average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{onboardingStats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="flows" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Adaptive Flows
            </TabsTrigger>
            <TabsTrigger value="personalization" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Personalization
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Gamification
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Collaboration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flows" className="space-y-6">
            <AdaptiveOnboardingFlows />
          </TabsContent>

          <TabsContent value="personalization" className="space-y-6">
            <PersonalizationEngine />
          </TabsContent>

          <TabsContent value="gamification" className="space-y-6">
            <GamificationSystem />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <UserAnalytics />
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <CollaborativeLearning />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default UserOnboarding;
