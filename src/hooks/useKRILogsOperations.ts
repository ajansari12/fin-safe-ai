
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createKRILog } from "@/services/kri-logs";

export const useKRILogsOperations = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateKRILog = async (data: any): Promise<void> => {
    try {
      setIsSubmitting(true);
      await createKRILog(data);
      toast({
        title: "Success",
        description: "KRI measurement logged successfully",
      });
    } catch (error) {
      console.error('Error logging KRI measurement:', error);
      toast({
        title: "Error",
        description: "Failed to log KRI measurement",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleCreateKRILog,
    isSubmitting
  };
};
