
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  updateIncident, 
  createIncidentResponse, 
  sendAlert,
  escalateIncident,
  UpdateIncidentData 
} from "@/services/incident";

export const useIncidentDetailDialogMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return {
    updateMutation,
    responseMutation,
    escalateMutation,
    alertMutation
  };
};
