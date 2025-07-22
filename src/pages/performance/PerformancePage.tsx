
import React from 'react';
import PerformanceMonitoringDashboard from '@/components/performance/PerformanceMonitoringDashboard';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAuth } from '@/contexts/EnhancedAuthContext';

const PerformancePage: React.FC = () => {
  const { profile } = useAuth();

  if (!profile?.organization_id) {
    return (
      <AuthenticatedLayout>
        <div>Loading...</div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6">
        <PerformanceMonitoringDashboard org_id={profile.organization_id} />
      </div>
    </AuthenticatedLayout>
  );
};

export default PerformancePage;
