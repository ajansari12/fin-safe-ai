
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Layout, 
  Bell, 
  Brain,
  Palette,
  Monitor,
  Smartphone,
  BarChart3,
  Menu,
  Star,
  Eye
} from "lucide-react";

const PersonalizationEngine = () => {
  const [notifications, setNotifications] = useState({
    riskAlerts: true,
    weeklyReports: true,
    systemUpdates: false,
    trainingReminders: true
  });

  const dashboardWidgets = [
    { id: 1, name: "Risk Overview", enabled: true, position: 1, usage: 95 },
    { id: 2, name: "Recent Incidents", enabled: true, position: 2, usage: 87 },
    { id: 3, name: "Compliance Status", enabled: false, position: 3, usage: 45 },
    { id: 4, name: "KRI Trends", enabled: true, position: 4, usage: 78 },
    { id: 5, name: "Task Manager", enabled: true, position: 5, usage: 92 },
    { id: 6, name: "Analytics Summary", enabled: false, position: 6, usage: 34 }
  ];

  const userPreferences = {
    theme: "Auto",
    language: "English",
    timezone: "EST",
    dashboardLayout: "Grid",
    navigationStyle: "Sidebar",
    dataRefreshRate: "Real-time"
  };

  const behaviorInsights = [
    {
      category: "Most Used Features",
      insights: [
        "Risk Assessment Tools (45% of time)",
        "Incident Management (28% of time)", 
        "Reporting Dashboard (15% of time)",
        "Document Management (12% of time)"
      ]
    },
    {
      category: "Usage Patterns", 
      insights: [
        "Peak activity: Monday 9-11 AM",
        "Preferred workflow: Start with dashboard review",
        "Frequent task switching between risk and incidents",
        "Heavy mobile usage during weekends"
      ]
    },
    {
      category: "Learning Preferences",
      insights: [
        "Prefers video tutorials over text guides",
        "Completes training in 15-minute sessions",
        "High engagement with interactive content",
        "Learns best with real-world examples"
      ]
    }
  ];

  const recommendations = [
    {
      type: "Interface Optimization",
      title: "Customize Dashboard Layout", 
      description: "Based on your usage, consider moving Risk Assessment to the top-left position",
      impact: "High",
      effort: "Low"
    },
    {
      type: "Workflow Enhancement",
      title: "Enable Quick Actions Menu",
      description: "Add frequently used incident management actions to your quick access toolbar",
      impact: "Medium", 
      effort: "Low"
    },
    {
      type: "Mobile Optimization",
      title: "Install Mobile App",
      description: "Your weekend usage suggests you'd benefit from our mobile application",
      impact: "High",
      effort: "Medium"
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard Customization</TabsTrigger>
          <TabsTrigger value="preferences">User Preferences</TabsTrigger>
          <TabsTrigger value="insights">Behavior Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Customizable Dashboard Layout
              </CardTitle>
              <CardDescription>
                Drag and drop widgets to create your personalized workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Available Widgets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardWidgets.map((widget) => (
                        <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Switch 
                              checked={widget.enabled}
                              onCheckedChange={() => {}}
                            />
                            <div>
                              <p className="text-sm font-medium">{widget.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Usage: {widget.usage}% | Position: {widget.position}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={widget.usage > 70 ? "default" : "secondary"}>
                              {widget.usage > 70 ? "High Use" : "Low Use"}
                            </Badge>
                            <Menu className="h-4 w-4 text-muted-foreground cursor-grab" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4">Apply Layout Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Layout Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[300px]">
                      {dashboardWidgets.filter(w => w.enabled).map((widget) => (
                        <div key={widget.id} className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center justify-center text-sm">
                          {widget.name}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Monitor className="h-4 w-4 mr-2" />
                        Desktop View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Smartphone className="h-4 w-4 mr-2" />
                        Mobile View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Interface Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">Theme</span>
                      <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
                    </div>
                    <Badge>{userPreferences.theme}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">Navigation Style</span>
                      <p className="text-xs text-muted-foreground">Sidebar or top navigation</p>
                    </div>
                    <Badge>{userPreferences.navigationStyle}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">Dashboard Layout</span>
                      <p className="text-xs text-muted-foreground">Grid or list view</p>
                    </div>
                    <Badge>{userPreferences.dashboardLayout}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">Data Refresh</span>
                      <p className="text-xs text-muted-foreground">How often to update data</p>
                    </div>
                    <Badge>{userPreferences.dataRefreshRate}</Badge>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Palette className="h-4 w-4 mr-2" />
                  Customize Interface
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">Risk Alerts</span>
                      <p className="text-xs text-muted-foreground">Critical risk threshold breaches</p>
                    </div>
                    <Switch 
                      checked={notifications.riskAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, riskAlerts: checked}))}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">Weekly Reports</span>
                      <p className="text-xs text-muted-foreground">Automated summary reports</p>
                    </div>
                    <Switch 
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, weeklyReports: checked}))}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">System Updates</span>
                      <p className="text-xs text-muted-foreground">New features and maintenance</p>
                    </div>
                    <Switch 
                      checked={notifications.systemUpdates}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, systemUpdates: checked}))}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">Training Reminders</span>
                      <p className="text-xs text-muted-foreground">Learning and certification alerts</p>
                    </div>
                    <Switch 
                      checked={notifications.trainingReminders}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, trainingReminders: checked}))}
                    />
                  </div>
                </div>
                
                <Button className="w-full">Save Notification Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Behavioral Analytics & Insights
              </CardTitle>
              <CardDescription>
                Machine learning-powered analysis of your platform usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {behaviorInsights.map((category, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.insights.map((insight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Eye className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Usage Analytics Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">2.4 hrs</div>
                      <div className="text-sm text-muted-foreground">Daily Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">89%</div>
                      <div className="text-sm text-muted-foreground">Feature Adoption</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">156</div>
                      <div className="text-sm text-muted-foreground">Actions/Day</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">12</div>
                      <div className="text-sm text-muted-foreground">Help Requests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to optimize your platform experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={rec.impact === "High" ? "default" : "secondary"}>
                          {rec.impact} Impact
                        </Badge>
                        <Badge variant="outline">{rec.effort} Effort</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                    
                    <div className="flex gap-2">
                      <Button size="sm">Apply Recommendation</Button>
                      <Button variant="outline" size="sm">Learn More</Button>
                      <Button variant="outline" size="sm">Dismiss</Button>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Recommendation Effectiveness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Applied Recommendations</span>
                      <span className="text-sm font-medium">23 of 31</span>
                    </div>
                    <Progress value={74} className="w-full" />
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Avg. productivity increase: +18%</span>
                      <span>User satisfaction: 4.7/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizationEngine;
