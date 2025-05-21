
import React from "react";
import RiskScoreChart from "@/components/dashboard/RiskScoreChart";

// Sample data for charts
const riskByCategory = [
  { name: "High Risk", value: 10, color: "#ef4444" },
  { name: "Medium Risk", value: 25, color: "#f59e0b" },
  { name: "Low Risk", value: 65, color: "#10b981" },
];

const riskByDomain = [
  { name: "Cyber", value: 15, color: "#6366f1" },
  { name: "Vendor", value: 25, color: "#8b5cf6" },
  { name: "Process", value: 35, color: "#ec4899" },
  { name: "People", value: 25, color: "#14b8a6" },
];

export default function RiskChartSection() {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <RiskScoreChart 
        data={riskByCategory} 
        title="Risks by Severity" 
        description="Distribution of risks by severity level"
      />
      <RiskScoreChart 
        data={riskByDomain} 
        title="Risks by Domain" 
        description="Distribution of risks across operational domains"
      />
    </div>
  );
}
