
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ModuleFilterProps {
  selectedModule: string;
  onModuleChange: (module: string) => void;
}

const ModuleFilter: React.FC<ModuleFilterProps> = ({ selectedModule, onModuleChange }) => {
  const modules = [
    { value: "all", label: "All Modules" },
    { value: "risk_management", label: "Risk Management" },
    { value: "compliance", label: "Compliance" },
    { value: "audit", label: "Audit" },
    { value: "incident_management", label: "Incident Management" },
    { value: "business_continuity", label: "Business Continuity" },
    { value: "third_party", label: "Third Party Risk" },
    { value: "governance", label: "Governance" },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Filter by Module:</span>
      <Select value={selectedModule} onValueChange={onModuleChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select module" />
        </SelectTrigger>
        <SelectContent>
          {modules.map((module) => (
            <SelectItem key={module.value} value={module.value}>
              <div className="flex items-center gap-2">
                {module.label}
                {module.value !== "all" && (
                  <Badge variant="outline" className="text-xs">
                    Module
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModuleFilter;
