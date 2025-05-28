
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import IncidentLogHeader from "@/components/incident/IncidentLogHeader";
import IncidentStatistics from "@/components/incident/IncidentStatistics";
import IncidentForm from "@/components/incident/IncidentForm";
import IncidentsList from "@/components/incident/IncidentsList";
import IncidentDetailDialog from "@/components/incident/IncidentDetailDialog";
import { useIncidentSLAChecker } from "@/hooks/useIncidentSLAChecker";
import { useIncidentOperations } from "@/hooks/useIncidentOperations";
import { 
  getIncidents,
  Incident 
} from "@/services/incident";

const IncidentLog = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Use custom hooks
  useIncidentSLAChecker();
  const { createMutation, handleCreateIncident } = useIncidentOperations();

  // Fetch incidents
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: getIncidents
  });

  const handleCreateIncidentWithForm = async (data: any) => {
    await handleCreateIncident(data);
    setShowForm(false);
  };

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
  };

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
            onSubmit={handleCreateIncidentWithForm}
            isSubmitting={createMutation.isPending}
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
