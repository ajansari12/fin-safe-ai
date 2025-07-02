import React, { Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { performanceMonitor, logBundleMetrics } from '@/lib/performance-utils';

// Lazy load the heavy analytics dashboard
const UnifiedAnalyticsDashboard = lazy(() => import('@/components/analytics/UnifiedAnalyticsDashboard'));

// Enhanced loading skeleton
const DashboardLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
      </div>
      <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
    </div>
    
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card rounded-lg border p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
    
    <div className="bg-card rounded-lg border p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-muted rounded w-1/4 mb-6"></div>
        <div className="h-80 bg-muted rounded"></div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, profile } = useAuth();

  // Monitor dashboard performance
  React.useEffect(() => {
    const endTiming = performanceMonitor.startTiming('dashboard_load');
    logBundleMetrics();
    
    return () => {
      endTiming();
    };
  }, []);

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
        
        <Suspense fallback={<DashboardLoadingSkeleton />}>
          <UnifiedAnalyticsDashboard />
        </Suspense>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;