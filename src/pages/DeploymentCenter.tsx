
import React from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DeploymentDashboard from "@/components/deployment/DeploymentDashboard";

const DeploymentCenter: React.FC = () => {
  return (
    <AuthenticatedLayout>
      <DeploymentDashboard />
    </AuthenticatedLayout>
  );
};

export default DeploymentCenter;
