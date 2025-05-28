
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Incident, IncidentResponse, IncidentEscalation, UpdateIncidentData } from "@/services/incident";
import IncidentDetailsTab from "./tabs/IncidentDetailsTab";
import IncidentResponsesTab from "./tabs/IncidentResponsesTab";
import IncidentRCATab from "./tabs/IncidentRCATab";
import IncidentAlertsTab from "./tabs/IncidentAlertsTab";
import IncidentEscalationsTab from "./tabs/IncidentEscalationsTab";
import IncidentSLAMetrics from "./IncidentSLAMetrics";

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
  const [activeTab, setActiveTab] = useState("details");

  const handleSaveRCA = (content: string) => {
    onAddResponse({ content, type: 'rca' });
  };

  return (
    <div className="space-y-4">
      <IncidentSLAMetrics incident={incident} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
      </Tabs>
    </div>
  );
};

export default IncidentDetailTabs;
