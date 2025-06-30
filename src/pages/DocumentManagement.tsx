
import React from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DocumentManagementDashboard from "@/components/documents/DocumentManagementDashboard";

const DocumentManagement: React.FC = () => {
  return (
    <AuthenticatedLayout>
      <DocumentManagementDashboard />
    </AuthenticatedLayout>
  );
};

export default DocumentManagement;
