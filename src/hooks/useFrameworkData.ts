
import { useState, useEffect } from "react";
import { 
  getFrameworkById, 
  getStructuresByFrameworkId, 
  getRolesByFrameworkId,
  getPoliciesByFrameworkId
} from "@/services/governance-service";
import { GovernanceFramework, GovernanceStructure, GovernanceRole, GovernancePolicy } from "@/pages/governance/types";

export function useFrameworkData(frameworkId: string | undefined) {
  const [framework, setFramework] = useState<GovernanceFramework | null>(null);
  const [structures, setStructures] = useState<GovernanceStructure[]>([]);
  const [roles, setRoles] = useState<GovernanceRole[]>([]);
  const [policies, setPolicies] = useState<GovernancePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadFrameworkData() {
    if (!frameworkId) return;
    setIsLoading(true);
    
    try {
      const [frameworkData, structuresData, rolesData, policiesData] = await Promise.all([
        getFrameworkById(frameworkId),
        getStructuresByFrameworkId(frameworkId),
        getRolesByFrameworkId(frameworkId),
        getPoliciesByFrameworkId(frameworkId),
      ]);
      
      setFramework(frameworkData);
      setStructures(structuresData);
      setRoles(rolesData);
      setPolicies(policiesData);
    } catch (error) {
      console.error("Error loading framework data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFrameworkData();
  }, [frameworkId]);

  return {
    framework,
    structures,
    setStructures,
    roles,
    setRoles,
    policies,
    setPolicies,
    isLoading,
    loadFrameworkData
  };
}
