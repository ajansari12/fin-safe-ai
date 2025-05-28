
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Control, getControls } from "@/services/controls";
import { KRIDefinition, getKRIDefinitions } from "@/services/kri-definitions";
import { KRILog, getKRILogs } from "@/services/kri-logs";

export const useControlsAndKRIData = () => {
  const { toast } = useToast();
  const [controls, setControls] = useState<Control[]>([]);
  const [kris, setKris] = useState<KRIDefinition[]>([]);
  const [kriLogs, setKriLogs] = useState<KRILog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadControls = async () => {
    try {
      setIsLoading(true);
      const data = await getControls();
      setControls(data);
    } catch (error) {
      console.error('Error loading controls:', error);
      toast({
        title: "Error",
        description: "Failed to load controls",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadKRIs = async () => {
    try {
      setIsLoading(true);
      const data = await getKRIDefinitions();
      setKris(data);
    } catch (error) {
      console.error('Error loading KRIs:', error);
      toast({
        title: "Error",
        description: "Failed to load KRIs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadKRILogs = async (kriId: string) => {
    try {
      setIsLoading(true);
      const data = await getKRILogs(kriId);
      setKriLogs(data);
    } catch (error) {
      console.error('Error loading KRI logs:', error);
      toast({
        title: "Error",
        description: "Failed to load KRI logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadControls();
    loadKRIs();
  }, []);

  return {
    controls,
    kris,
    kriLogs,
    isLoading,
    loadControls,
    loadKRIs,
    loadKRILogs
  };
};
