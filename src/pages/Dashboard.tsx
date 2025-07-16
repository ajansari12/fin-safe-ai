import React, { Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { DashboardSkeleton } from '@/components/common/SkeletonLoaders';

// Lazy load the simplified analytics dashboard
const UnifiedAnalyticsDashboard = lazy(() => import('@/components/analytics/UnifiedAnalyticsDashboard'));

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
        
        <Suspense fallback={<DashboardSkeleton />}>
          <UnifiedAnalyticsDashboard />
        </Suspense>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;