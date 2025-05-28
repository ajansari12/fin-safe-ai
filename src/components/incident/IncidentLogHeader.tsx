
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface IncidentLogHeaderProps {
  showForm: boolean;
  onToggleForm: () => void;
}

const IncidentLogHeader: React.FC<IncidentLogHeaderProps> = ({ showForm, onToggleForm }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incident Log</h1>
        <p className="text-muted-foreground">
          Track and manage operational incidents and disruptions.
        </p>
      </div>
      <Button onClick={onToggleForm}>
        <Plus className="h-4 w-4 mr-2" />
        {showForm ? 'Cancel' : 'Log Incident'}
      </Button>
    </div>
  );
};

export default IncidentLogHeader;
