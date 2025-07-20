
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationAnalyticsDashboard } from '@/components/notifications/NotificationAnalyticsDashboard';
import { NotificationTemplateManager } from '@/components/notifications/NotificationTemplateManager';
import { NotificationHistory } from '@/components/notifications/NotificationHistory';
import { EscalationMonitoringDashboard } from '@/components/notifications/EscalationMonitoringDashboard';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export default function NotificationManagementPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Management</h1>
        <p className="text-muted-foreground">
          Comprehensive notification and alerting system management
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="escalations">Escalations</TabsTrigger>
          <TabsTrigger value="center">Notification Center</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <NotificationAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="templates">
          <NotificationTemplateManager />
        </TabsContent>

        <TabsContent value="history">
          <NotificationHistory />
        </TabsContent>

        <TabsContent value="escalations">
          <EscalationMonitoringDashboard />
        </TabsContent>

        <TabsContent value="center">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
