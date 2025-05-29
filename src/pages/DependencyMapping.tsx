
import React from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DependencyMappingDashboard from "@/components/dependency-mapping/DependencyMappingDashboard";

const DependencyMapping = () => {
  return (
    <AuthenticatedLayout>
      <DependencyMappingDashboard />
    </AuthenticatedLayout>
  );
};

export default DependencyMapping;
