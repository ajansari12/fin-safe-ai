
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Control, createControl, updateControl, deleteControl } from "@/services/controls";

export const useControlsOperations = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateControl = async (data: any): Promise<void> => {
    try {
      setIsSubmitting(true);
      await createControl(data);
      toast({
        title: "Success",
        description: "Control created successfully",
      });
    } catch (error) {
      console.error('Error creating control:', error);
      toast({
        title: "Error",
        description: "Failed to create control",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateControl = async (id: string, data: any): Promise<void> => {
    try {
      setIsSubmitting(true);
      await updateControl(id, data);
      toast({
        title: "Success",
        description: "Control updated successfully",
      });
    } catch (error) {
      console.error('Error updating control:', error);
      toast({
        title: "Error",
        description: "Failed to update control",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteControl = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this control?')) return;
    
    try {
      await deleteControl(id);
      toast({
        title: "Success",
        description: "Control deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting control:', error);
      toast({
        title: "Error",
        description: "Failed to delete control",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    handleCreateControl,
    handleUpdateControl,
    handleDeleteControl,
    isSubmitting
  };
};
