import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createControlTest, updateControlTest, deleteControlTest, CreateControlTestData, ControlTest } from "@/services/control-tests";
import { logger } from "@/lib/logger";

export const useControlTestOperations = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateControlTest = async (data: CreateControlTestData): Promise<void> => {
    try {
      setIsSubmitting(true);
      await createControlTest(data);
      toast({
        title: "Success",
        description: "Control test recorded successfully",
      });
    } catch (error) {
      logger.error('Error creating control test', { 
        component: 'useControlTestOperations',
        module: 'control-tests',
        metadata: { controlId: data.control_id }
      }, error as Error);
      toast({
        title: "Error",
        description: "Failed to record control test",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateControlTest = async (id: string, data: Partial<ControlTest>): Promise<void> => {
    try {
      setIsSubmitting(true);
      await updateControlTest(id, data);
      toast({
        title: "Success",
        description: "Control test updated successfully",
      });
    } catch (error) {
      logger.error('Error updating control test', { 
        component: 'useControlTestOperations',
        module: 'control-tests',
        metadata: { testId: id }
      }, error as Error);
      toast({
        title: "Error",
        description: "Failed to update control test",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteControlTest = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this control test?')) return;
    
    try {
      await deleteControlTest(id);
      toast({
        title: "Success",
        description: "Control test deleted successfully",
      });
    } catch (error) {
      logger.error('Error deleting control test', { 
        component: 'useControlTestOperations',
        module: 'control-tests',
        metadata: { testId: id }
      }, error as Error);
      toast({
        title: "Error",
        description: "Failed to delete control test",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    handleCreateControlTest,
    handleUpdateControlTest,
    handleDeleteControlTest,
    isSubmitting
  };
};