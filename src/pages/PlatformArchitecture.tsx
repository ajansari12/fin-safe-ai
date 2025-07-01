
import React from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import PlatformArchitectureDashboard from "@/components/platform/PlatformArchitectureDashboard";

const PlatformArchitecture: React.FC = () => {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Platform Architecture</h1>
          <p className="text-muted-foreground mt-2">
            Enterprise-grade microservices platform designed for the largest financial institutions
          </p>
        </div>
        <PlatformArchitectureDashboard />
      </div>
    </AuthenticatedLayout>
  );
};

export default PlatformArchitecture;
