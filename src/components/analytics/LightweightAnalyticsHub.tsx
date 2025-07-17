import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import ExecutiveDashboard from '@/components/analytics/ExecutiveDashboard';
import OperationalDashboard from '@/components/analytics/OperationalDashboard';
import ControlsDashboard from '@/components/controls/ControlsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LightweightAnalyticsHub: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Hub</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for risk management and compliance
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              -3 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controls Health</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              +1.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +0.8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="executive" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="executive">Executive View</TabsTrigger>
          <TabsTrigger value="operational">Operational View</TabsTrigger>
          <TabsTrigger value="controls">Controls View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="executive" className="space-y-6">
          <ExecutiveDashboard />
        </TabsContent>
        
        <TabsContent value="operational" className="space-y-6">
          <OperationalDashboard />
        </TabsContent>
        
        <TabsContent value="controls" className="space-y-6">
          <ControlsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LightweightAnalyticsHub;