
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Incident, IncidentResponse, IncidentEscalation, UpdateIncidentData } from "@/services/incident";
import IncidentDetailsTab from "./tabs/IncidentDetailsTab";
import IncidentResponsesTab from "./tabs/IncidentResponsesTab";
import IncidentRCATab from "./tabs/IncidentRCATab";
import IncidentAlertsTab from "./tabs/IncidentAlertsTab";
import IncidentEscalationsTab from "./tabs/IncidentEscalationsTab";

interface IncidentTabContentProps {
  incident: Incident;
  responses: IncidentResponse[] | undefined;
  escalations: IncidentEscalation[] | undefined;
  onUpdate: (data: UpdateIncidentData) => void;
  onAddResponse: (data: { content: string; type: string }) => void;
  onSendAlert: (email: string, message: string) => void;
  onEscalate: (reason: string) => void;
  handleSaveRCA: (content: string) => void;
  isUpdating: boolean;
  isAddingResponse: boolean;
  isSendingAlert: boolean;
  isEscalating: boolean;
}

const IncidentTabContent: React.FC<IncidentTabContentProps> = ({
  incident,
  responses,
  escalations,
  onUpdate,
  onAddResponse,
  onSendAlert,
  onEscalate,
  handleSaveRCA,
  isUpdating,
  isAddingResponse,
  isSendingAlert,
  isEscalating,
}) => {
  return (
    <>
      <TabsContent value="details">
        <IncidentDetailsTab
          incident={incident}
          onUpdate={onUpdate}
          isUpdating={isUpdating}
        />
      </TabsContent>

      <TabsContent value="responses">
        <IncidentResponsesTab
          responses={responses}
          onAddResponse={onAddResponse}
          isSubmitting={isAddingResponse}
        />
      </TabsContent>

      <TabsContent value="escalations">
        <IncidentEscalationsTab
          incident={incident}
          escalations={escalations}
          onEscalate={onEscalate}
          isEscalating={isEscalating}
        />
      </TabsContent>

      <TabsContent value="rca">
        <IncidentRCATab
          onSaveRCA={handleSaveRCA}
          isSubmitting={isAddingResponse}
        />
      </TabsContent>

      <TabsContent value="alerts">
        <IncidentAlertsTab
          onSendAlert={onSendAlert}
          isSubmitting={isSendingAlert}
        />
      </TabsContent>
    </>
  );
};

export default IncidentTabContent;
