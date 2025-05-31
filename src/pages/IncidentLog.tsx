
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import IncidentLogHeader from "@/components/incident/IncidentLogHeader";
import IncidentStatistics from "@/components/incident/IncidentStatistics";
import IncidentForm from "@/components/incident/IncidentForm";
import IncidentsList from "@/components/incident/IncidentsList";
import IncidentDetailDialog from "@/components/incident/IncidentDetailDialog";
import MobileIncidentLog from "@/components/incident/MobileIncidentLog";
import { useIncidentSLAChecker } from "@/hooks/useIncidentSLAChecker";
import { useIncidentOperations } from "@/hooks/useIncidentOperations";
import { validatedIncidentService, Incident } from "@/services/incident/validated-incident-service";
import { useIsMobile } from "@/hooks/use-mobile";

const IncidentLog = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const isMobile = useIsMobile();

  // Use custom hooks
  useIncidentSLAChecker();

  // Fetch incidents using validated service
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => validatedIncidentService.getIncidents()
  });

  const handleCreateIncident = async (data: any) => {
    await validatedIncidentService.createIncident(data);
    setShowForm(false);
  };

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  // Show mobile version on mobile devices
  if (isMobile) {
    return (
      <AuthenticatedLayout>
        <MobileIncidentLog />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <IncidentLogHeader 
          showForm={showForm}
          onToggleForm={() => setShowForm(!showForm)}
        />

        <IncidentStatistics incidents={incidents} />

        {showForm && (
          <IncidentForm 
            onSubmit={handleCreateIncident}
            isSubmitting={false}
          />
        )}

        <IncidentsList 
          incidents={incidents}
          onViewIncident={handleViewIncident}
          isLoading={isLoading}
        />

        <IncidentDetailDialog
          incident={selectedIncident}
          open={!!selectedIncident}
          onOpenChange={(open) => !open && setSelectedIncident(null)}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default IncidentLog;
