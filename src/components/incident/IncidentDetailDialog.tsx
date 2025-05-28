
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { 
  Incident, 
  updateIncident, 
  getIncidentResponses,
  getIncidentEscalations,
  createIncidentResponse, 
  sendAlert,
  escalateIncident,
  UpdateIncidentData 
} from "@/services/incident";
import IncidentDetailTabs from "./IncidentDetailTabs";

interface IncidentDetailDialogProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IncidentDetailDialog: React.FC<IncidentDetailDialogProps> = ({
  incident,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch incident responses
  const { data: responses } = useQuery({
    queryKey: ['incident-responses', incident?.id],
    queryFn: () => incident ? getIncidentResponses(incident.id) : Promise.resolve([]),
    enabled: !!incident?.id && open
  });

  // Fetch incident escalations
  const { data: escalations } = useQuery({
    queryKey: ['incident-escalations', incident?.id],
    queryFn: () => incident ? getIncidentEscalations(incident.id) : Promise.resolve([]),
    enabled: !!incident?.id && open
  });

  // Update incident mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateIncidentData }) => 
      updateIncident(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident-responses'] });
      toast({
        title: "Incident Updated",
        description: "The incident has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating incident:', error);
      toast({
        title: "Error",
        description: "Failed to update incident. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add response mutation
  const responseMutation = useMutation({
    mutationFn: createIncidentResponse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident-responses'] });
      queryClient.invalidateQueries({ queryKey: ['incident-metrics'] });
      toast({
        title: "Response Added",
        description: "Your response has been added to the incident.",
      });
    },
    onError: (error) => {
      console.error('Error adding response:', error);
      toast({
        title: "Error",
        description: "Failed to add response. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Escalate incident mutation
  const escalateMutation = useMutation({
    mutationFn: ({ incidentId, reason }: { incidentId: string; reason: string }) => 
      escalateIncident(incidentId, reason, 'manual'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident-escalations'] });
      toast({
        title: "Incident Escalated",
        description: "The incident has been escalated to the next level.",
      });
    },
    onError: (error) => {
      console.error('Error escalating incident:', error);
      toast({
        title: "Error",
        description: "Failed to escalate incident. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Send alert mutation
  const alertMutation = useMutation({
    mutationFn: ({ incidentId, email, message }: { incidentId: string; email: string; message: string }) =>
      sendAlert(incidentId, email, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident-responses'] });
      toast({
        title: "Alert Sent",
        description: "Alert has been sent to the assignee.",
      });
    },
    onError: (error) => {
      console.error('Error sending alert:', error);
      toast({
        title: "Error",
        description: "Failed to send alert. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!incident) return null;

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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(incident.status)}
            {incident.title}
            {incident.escalation_level > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                Escalated L{incident.escalation_level}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Incident ID: {incident.id.slice(0, 8)} • Reported {format(new Date(incident.reported_at), 'MMM dd, yyyy HH:mm')}
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDetailDialog;
