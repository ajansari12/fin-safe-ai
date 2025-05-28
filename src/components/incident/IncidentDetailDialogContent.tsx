
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Incident, 
  getIncidentResponses,
  getIncidentEscalations,
  UpdateIncidentData 
} from "@/services/incident";
import IncidentDetailTabs from "./IncidentDetailTabs";
import { useIncidentDetailDialogMutations } from "@/hooks/useIncidentDetailDialogMutations";

interface IncidentDetailDialogContentProps {
  incident: Incident;
  open: boolean;
}

const IncidentDetailDialogContent: React.FC<IncidentDetailDialogContentProps> = ({
  incident,
  open,
}) => {
  const { updateMutation, responseMutation, escalateMutation, alertMutation } = useIncidentDetailDialogMutations();

  // Fetch incident responses
  const { data: responses } = useQuery({
    queryKey: ['incident-responses', incident.id],
    queryFn: () => getIncidentResponses(incident.id),
    enabled: !!incident.id && open
  });

  // Fetch incident escalations
  const { data: escalations } = useQuery({
    queryKey: ['incident-escalations', incident.id],
    queryFn: () => getIncidentEscalations(incident.id),
    enabled: !!incident.id && open
  });

  const handleUpdate = async (updates: UpdateIncidentData) => {
    updateMutation.mutate({ id: incident.id, updates });
  };

  const handleAddResponse = async (data: { content: string; type: string }) => {
    if (!data.content.trim()) return;

    responseMutation.mutate({
      incident_id: incident.id,
      response_type: data.type,
      response_content: data.content
    });
  };

  const handleSendAlert = async (email: string, message: string) => {
    if (!email || !message.trim()) return;

    alertMutation.mutate({
      incidentId: incident.id,
      email: email,
      message: message
    });
  };

  const handleEscalate = async (reason: string) => {
    if (!reason.trim()) return;

    escalateMutation.mutate({
      incidentId: incident.id,
      reason: reason
    });
  };

  return (
    <IncidentDetailTabs
      incident={incident}
      responses={responses}
      escalations={escalations}
      onUpdate={handleUpdate}
      onAddResponse={handleAddResponse}
      onSendAlert={handleSendAlert}
      onEscalate={handleEscalate}
      isUpdating={updateMutation.isPending}
      isAddingResponse={responseMutation.isPending}
      isSendingAlert={alertMutation.isPending}
      isEscalating={escalateMutation.isPending}
    />
  );
};

export default IncidentDetailDialogContent;
