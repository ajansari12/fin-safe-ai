
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedAnalyticsDashboard from '@/components/analytics/UnifiedAnalyticsDashboard';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const Dashboard = () => {
  const { user, profile } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || user?.email}
            </p>
          </div>
        </div>
        
        <UnifiedAnalyticsDashboard />
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
