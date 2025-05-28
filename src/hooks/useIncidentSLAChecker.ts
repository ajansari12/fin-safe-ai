
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { checkSLABreaches } from "@/services/incident";

export const useIncidentSLAChecker = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check for SLA breaches immediately on page load
    const checkBreaches = async () => {
      try {
        await checkSLABreaches();
        queryClient.invalidateQueries({ queryKey: ['incidents'] });
      } catch (error) {
        console.error('Error checking SLA breaches:', error);
      }
    };
    
    checkBreaches();
    
    // Then check every 5 minutes
    const interval = setInterval(checkBreaches, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [queryClient]);
};
