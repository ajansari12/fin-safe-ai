
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { createIncident, CreateIncidentData } from "@/services/incident";

export const useIncidentOperations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast({
        title: "Incident Created",
        description: "The incident has been successfully logged.",
      });
    },
    onError: (error) => {
      console.error('Error creating incident:', error);
      toast({
        title: "Error",
        description: "Failed to create incident. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateIncident = async (data: CreateIncidentData) => {
    await createMutation.mutateAsync(data);
  };

  return {
    createMutation,
    handleCreateIncident
  };
};
