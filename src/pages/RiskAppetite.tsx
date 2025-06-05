
import React from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import UnifiedRiskAppetite from "@/components/risk-appetite/UnifiedRiskAppetite";

const RiskAppetite = () => {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <UnifiedRiskAppetite />
      </div>
    </AuthenticatedLayout>
  );
};

export default RiskAppetite;
