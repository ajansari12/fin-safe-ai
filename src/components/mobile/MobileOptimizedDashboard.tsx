import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Menu,
  Bell,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

const MobileOptimizedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metrics: MetricCard[] = [
    {
      title: 'Active Incidents',
      value: 3,
      change: '+1',
      status: 'warning',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      title: 'KRI Breaches',
      value: 2,
      change: '-1',
      status: 'good',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: 'Compliance Score',
      value: '94%',
      change: '+2%',
      status: 'good',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      title: 'Pending Tasks',
      value: 8,
      change: '+3',
      status: 'warning',
      icon: <Clock className="h-4 w-4" />
    }
  ];

  const recentAlerts: Alert[] = [
    {
      id: '1',
      title: 'Critical System Incident',
      description: 'Payment processing system experiencing delays',
      severity: 'critical',
      timestamp: '2 min ago'
    },
    {
      id: '2',
      title: 'KRI Threshold Breach',
      description: 'Transaction volume KRI exceeded warning threshold',
      severity: 'high',
      timestamp: '15 min ago'
    },
    {
      id: '3',
      title: 'Audit Finding',
      description: 'New compliance finding requires attention',
      severity: 'medium',
      timestamp: '1 hour ago'
    }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const MobileSidebar = () => (
    <div className="space-y-4">
      <div className="px-4 py-2">
        <h2 className="text-lg font-semibold">Menu</h2>
      </div>
      <nav className="space-y-2">
        {[
          { id: 'overview', label: 'Overview', icon: <CheckCircle className="h-4 w-4" /> },
          { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="h-4 w-4" /> },
          { id: 'controls', label: 'Controls', icon: <TrendingUp className="h-4 w-4" /> },
          { id: 'compliance', label: 'Compliance', icon: <Clock className="h-4 w-4" /> }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <MobileSidebar />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-full ${getStatusColor(metric.status)}`}>
                  {metric.icon}
                </div>
                {metric.change && (
                  <Badge variant="secondary" className="text-xs">
                    {metric.change}
                  </Badge>
                )}
              </div>
              <div className="mt-2">
                <div className="text-lg font-bold">{metric.value}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {metric.title}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="incidents" className="text-xs">Incidents</TabsTrigger>
            <TabsTrigger value="controls" className="text-xs">Controls</TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {recentAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 p-2 rounded-lg border">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{alert.title}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {alert.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {alert.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Active Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').map((incident) => (
                    <div key={incident.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{incident.timestamp}</span>
                      </div>
                      <h3 className="font-medium text-sm">{incident.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{incident.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Control Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Effective Controls</span>
                    <Badge variant="secondary">85%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Tests Due</span>
                    <Badge variant="outline">12</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Failed Tests</span>
                    <Badge variant="destructive">3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Overall Score</span>
                    <Badge className="bg-green-500">94%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Policy Reviews Due</span>
                    <Badge variant="outline">5</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Audit Findings</span>
                    <Badge variant="secondary">8</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileOptimizedDashboard;