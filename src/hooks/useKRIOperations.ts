
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { KRIDefinition, createKRIDefinition } from "@/services/kri-definitions";

export const useKRIOperations = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateKRI = async (data: any): Promise<void> => {
    try {
      setIsSubmitting(true);
      await createKRIDefinition(data);
      toast({
        title: "Success",
        description: "KRI created successfully",
      });
    } catch (error) {
      console.error('Error creating KRI:', error);
      toast({
        title: "Error",
        description: "Failed to create KRI",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateKRI = async (kri: KRIDefinition, data: any): Promise<void> => {
    try {
      setIsSubmitting(true);
      // Update functionality would go here
      toast({
        title: "Info",
        description: "KRI update functionality coming soon",
      });
    } catch (error) {
      console.error('Error updating KRI:', error);
      toast({
        title: "Error",
        description: "Failed to update KRI",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKRI = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this KRI?')) return;
    
    toast({
      title: "Info",
      description: "KRI deletion functionality coming soon",
    });
  };

  return {
    handleCreateKRI,
    handleUpdateKRI,
    handleDeleteKRI,
    isSubmitting
  };
};
