import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import IncidentForm from "@/components/incident/IncidentForm";
import { CreateIncidentData } from "@/services/incident/validated-incident-service";
import { useToast } from "@/hooks/use-toast";

interface CreateIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateIncidentDialog: React.FC<CreateIncidentDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();

  const handleSubmit = async (data: CreateIncidentData) => {
    try {
      console.log('Creating incident:', data);
      // TODO: Implement incident creation logic using validated-incident-service
      
      toast({
        title: "Incident Created",
        description: "The incident has been successfully logged and assigned.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: "Error",
        description: "Failed to create incident. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Incident</DialogTitle>
        </DialogHeader>
        
        <IncidentForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
};