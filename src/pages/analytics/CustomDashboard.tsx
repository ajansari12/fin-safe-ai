import React from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import CustomDashboardBuilder from "@/components/analytics/CustomDashboardBuilder";

const CustomDashboard: React.FC = () => {
  return (
    <AuthenticatedLayout>
      <CustomDashboardBuilder />
    </AuthenticatedLayout>
  );
};

export default CustomDashboard;