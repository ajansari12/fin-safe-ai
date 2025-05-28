
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModuleFilterProps {
  selectedModule: string;
  onModuleChange: (module: string) => void;
}

const ModuleFilter: React.FC<ModuleFilterProps> = ({
  selectedModule,
  onModuleChange
}) => {
  const modules = [
    { value: "all", label: "All Modules" },
    { value: "governance", label: "Governance" },
    { value: "incident", label: "Incident Management" },
    { value: "risk", label: "Risk Management" },
    { value: "third_party", label: "Third Party Risk" },
    { value: "business_continuity", label: "Business Continuity" },
    { value: "controls", label: "Controls & KRIs" },
    { value: "compliance", label: "Compliance" }
  ];

  return (
    <div className="w-48">
      <Select value={selectedModule} onValueChange={onModuleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by module" />
        </SelectTrigger>
        <SelectContent>
          {modules.map((module) => (
            <SelectItem key={module.value} value={module.value}>
              {module.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModuleFilter;
