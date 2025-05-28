
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Incident, IncidentResponse, UpdateIncidentData } from "@/services/incident-service";
import IncidentDetailsTab from "./tabs/IncidentDetailsTab";
import IncidentResponsesTab from "./tabs/IncidentResponsesTab";
import IncidentRCATab from "./tabs/IncidentRCATab";
import IncidentAlertsTab from "./tabs/IncidentAlertsTab";

interface IncidentDetailTabsProps {
  incident: Incident;
  responses: IncidentResponse[] | undefined;
  onUpdate: (data: UpdateIncidentData) => void;
  onAddResponse: (data: { content: string; type: string }) => void;
  onSendAlert: (email: string, message: string) => void;
  isUpdating: boolean;
  isAddingResponse: boolean;
  isSendingAlert: boolean;
}

const IncidentDetailTabs: React.FC<IncidentDetailTabsProps> = ({
  incident,
  responses,
  onUpdate,
  onAddResponse,
  onSendAlert,
  isUpdating,
  isAddingResponse,
  isSendingAlert,
}) => {
  const [activeTab, setActiveTab] = useState("details");

  const handleSaveRCA = (content: string) => {
    onAddResponse({ content, type: 'rca' });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="responses">Responses</TabsTrigger>
        <TabsTrigger value="rca">RCA</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
      </TabsList>

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
    </Tabs>
  );
};

export default IncidentDetailTabs;
