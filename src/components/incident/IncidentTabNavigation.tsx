
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncidentEscalation } from "@/services/incident";

interface IncidentTabNavigationProps {
  escalations: IncidentEscalation[] | undefined;
}

const IncidentTabNavigation: React.FC<IncidentTabNavigationProps> = ({
  escalations,
}) => {
  return (
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger value="details">Details</TabsTrigger>
      <TabsTrigger value="responses">Responses</TabsTrigger>
      <TabsTrigger value="escalations" className="relative">
        Escalations
        {(escalations && escalations.length > 0) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {escalations.length}
          </span>
        )}
      </TabsTrigger>
      <TabsTrigger value="rca">RCA</TabsTrigger>
      <TabsTrigger value="alerts">Alerts</TabsTrigger>
    </TabsList>
  );
};

export default IncidentTabNavigation;
