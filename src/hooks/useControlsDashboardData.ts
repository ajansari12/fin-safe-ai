
import { useState, useEffect } from "react";
import { Control, getControls } from "@/services/controls";
import { KRIDefinition, getKRIDefinitions } from "@/services/kri-definitions";
import { getKRIBreachesData } from "@/services/kri-analytics-service";

export const useControlsDashboardData = () => {
  const [controls, setControls] = useState<Control[]>([]);
  const [kris, setKris] = useState<KRIDefinition[]>([]);
  const [breachesData, setBreachesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [controlsData, krisData, breaches] = await Promise.all([
          getControls(),
          getKRIDefinitions(),
          getKRIBreachesData()
        ]);
        
        setControls(controlsData);
        setKris(krisData);
        setBreachesData(breaches);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const controlsByStatus = controls.reduce((acc, control) => {
    acc[control.status] = (acc[control.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const controlsByFrequency = controls.reduce((acc, control) => {
    acc[control.frequency] = (acc[control.frequency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeControls = controls.filter(c => c.status === 'active').length;
  const activeKris = kris.filter(k => k.status === 'active').length;
  const controlCoverage = controls.length > 0 ? (activeControls / controls.length) * 100 : 0;

  return {
    controls,
    kris,
    breachesData,
    isLoading,
    controlsByStatus,
    controlsByFrequency,
    activeControls,
    activeKris,
    controlCoverage
  };
};
