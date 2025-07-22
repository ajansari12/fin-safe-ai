import React from 'react';
import PerformanceMonitoringDashboard from '@/components/performance/PerformanceMonitoringDashboard';
import { useAuth } from '@/contexts/EnhancedAuthContext';

const PerformancePage: React.FC = () => {
  const { profile } = useAuth();

  if (!profile?.organization_id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <PerformanceMonitoringDashboard org_id={profile.organization_id} />
    </div>
  );
};

export default PerformancePage;