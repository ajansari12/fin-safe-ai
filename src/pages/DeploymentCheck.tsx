import React from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { DeploymentCheckDashboard } from '@/components/deployment/DeploymentCheckDashboard';

const DeploymentCheck = () => {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Deployment Check</h1>
            <p className="text-muted-foreground">
              Comprehensive production deployment readiness validation
            </p>
          </div>
        </div>
        
        <DeploymentCheckDashboard />
      </div>
    </AuthenticatedLayout>
  );
};

export default DeploymentCheck;