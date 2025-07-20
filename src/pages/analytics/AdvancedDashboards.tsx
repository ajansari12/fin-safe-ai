
import React from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import EnhancedDashboardBuilder from "@/components/analytics/EnhancedDashboardBuilder";

const AdvancedDashboards: React.FC = () => {
  return (
    <AuthenticatedLayout>
      <EnhancedDashboardBuilder />
    </AuthenticatedLayout>
  );
};

export default AdvancedDashboards;
