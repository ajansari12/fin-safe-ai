
import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { Incident, IncidentResponse, IncidentEscalation, UpdateIncidentData } from "@/services/incident";
import { useIncidentDetailTabs } from "@/hooks/useIncidentDetailTabs";
import IncidentSLAMetricsWrapper from "./IncidentSLAMetricsWrapper";
import IncidentTabNavigation from "./IncidentTabNavigation";
import IncidentTabContent from "./IncidentTabContent";

interface IncidentDetailTabsProps {
  incident: Incident;
  responses: IncidentResponse[] | undefined;
  escalations: IncidentEscalation[] | undefined;
  onUpdate: (data: UpdateIncidentData) => void;
  onAddResponse: (data: { content: string; type: string }) => void;
  onSendAlert: (email: string, message: string) => void;
  onEscalate: (reason: string) => void;
  isUpdating: boolean;
  isAddingResponse: boolean;
  isSendingAlert: boolean;
  isEscalating: boolean;
}

const IncidentDetailTabs: React.FC<IncidentDetailTabsProps> = ({
  incident,
  responses,
  escalations,
  onUpdate,
  onAddResponse,
  onSendAlert,
  onEscalate,
  isUpdating,
  isAddingResponse,
  isSendingAlert,
  isEscalating,
}) => {
  const { activeTab, setActiveTab, handleSaveRCA } = useIncidentDetailTabs({
    onUpdate,
    onAddResponse,
    isAddingResponse,
  });

  return (
    <div className="space-y-4">
      <IncidentSLAMetricsWrapper incident={incident} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <IncidentTabNavigation escalations={escalations} />

        <IncidentTabContent
          incident={incident}
          responses={responses}
          escalations={escalations}
          onUpdate={onUpdate}
          onAddResponse={onAddResponse}
          onSendAlert={onSendAlert}
          onEscalate={onEscalate}
          handleSaveRCA={handleSaveRCA}
          isUpdating={isUpdating}
          isAddingResponse={isAddingResponse}
          isSendingAlert={isSendingAlert}
          isEscalating={isEscalating}
        />
      </Tabs>
    </div>
  );
};

export default IncidentDetailTabs;
