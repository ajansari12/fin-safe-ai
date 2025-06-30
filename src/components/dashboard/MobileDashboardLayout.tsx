
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, 
  AlertTriangle, 
  CheckSquare, 
  BarChart, 
  Settings, 
  Bell,
  Menu,
  X
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileDashboardLayoutProps {
  userRole: string;
  dashboardSettings: any;
  onSettingsChange: (settings: any) => void;
}

const MobileDashboardLayout: React.FC<MobileDashboardLayoutProps> = ({
  userRole,
  dashboardSettings,
  onSettingsChange
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);

  const quickStats = {
    executive: [
      { label: "Risk Score", value: "72", color: "text-yellow-500" },
      { label: "Compliance", value: "94%", color: "text-green-500" },
      { label: "Incidents", value: "2", color: "text-red-500" }
    ],
    manager: [
      { label: "Active Risks", value: "24", color: "text-yellow-500" },
      { label: "Overdue", value: "7", color: "text-red-500" },
      { label: "Controls", value: "156", color: "text-green-500" }
    ],
    analyst: [
      { label: "My Tasks", value: "8", color: "text-blue-500" },
      { label: "Alerts", value: "3", color: "text-yellow-500" },
      { label: "Completed", value: "18", color: "text-green-500" }
    ],
    auditor: [
      { label: "Active Audits", value: "8", color: "text-blue-500" },
      { label: "Findings", value: "23", color: "text-yellow-500" },
      { label: "Compliance", value: "94%", color: "text-green-500" }
    ]
  };

  const notifications = [
    { id: 1, type: "alert", message: "KRI threshold breached", time: "2h ago" },
    { id: 2, type: "task", message: "Risk assessment due", time: "4h ago" },
    { id: 3, type: "info", message: "System maintenance scheduled", time: "1d ago" }
  ];

  const currentStats = quickStats[userRole as keyof typeof quickStats] || quickStats.analyst;

  const NotificationPanel = () => (
    <div className="space-y-3">
      <h3 className="font-medium">Recent Notifications</h3>
      {notifications.map((notif) => (
        <div key={notif.id} className="flex items-start gap-3 p-3 border rounded">
          <div className={`p-1 rounded-full ${
            notif.type === "alert" ? "bg-red-100 text-red-500" :
            notif.type === "task" ? "bg-blue-100 text-blue-500" :
            "bg-gray-100 text-gray-500"
          }`}>
            {notif.type === "alert" ? <AlertTriangle className="h-3 w-3" /> :
             notif.type === "task" ? <CheckSquare className="h-3 w-3" /> :
             <Bell className="h-3 w-3" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{notif.message}</p>
            <p className="text-xs text-muted-foreground">{notif.time}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1 className="font-semibold text-lg">Dashboard</h1>
          <Badge variant="outline" className="text-xs">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
              {notifications.length}
            </Badge>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="space-y-4">
                <h3 className="font-medium">Dashboard Settings</h3>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {/* Open personalization */}}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize Layout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="bg-white border-b p-4">
          <NotificationPanel />
        </div>
      )}

      {/* Quick Stats */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {currentStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-3 text-center">
                <div className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="overview" className="text-xs">
              <Home className="h-3 w-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">
              <CheckSquare className="h-3 w-3 mr-1" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="charts" className="text-xs">
              <BarChart className="h-3 w-3 mr-1" />
              Charts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tasks Completed</span>
                  <Badge variant="secondary">5/8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alerts Resolved</span>
                  <Badge variant="secondary">3/6</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Risk Score</span>
                  <Badge variant="secondary">Medium</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="h-16 flex-col">
                    <CheckSquare className="h-4 w-4 mb-1" />
                    <span className="text-xs">New Task</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-16 flex-col">
                    <AlertTriangle className="h-4 w-4 mb-1" />
                    <span className="text-xs">Report Issue</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">My Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((task) => (
                  <div key={task} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <h4 className="text-sm font-medium">Task {task}</h4>
                      <p className="text-xs text-muted-foreground">Due: Jan {10 + task}, 2024</p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-2 p-2 border rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Mobile Chart View</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileDashboardLayout;
