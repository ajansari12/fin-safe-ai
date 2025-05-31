
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import IncidentStatistics from "@/components/incident/IncidentStatistics";
import IncidentForm from "@/components/incident/IncidentForm";
import IncidentsList from "@/components/incident/IncidentsList";
import IncidentDetailDialog from "@/components/incident/IncidentDetailDialog";
import { useIncidentSLAChecker } from "@/hooks/useIncidentSLAChecker";
import { useIncidentOperations } from "@/hooks/useIncidentOperations";
import { getIncidents, Incident } from "@/services/incident";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const MobileIncidentLog = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Check for quick log parameter
  useEffect(() => {
    if (searchParams.get('quick') === 'true') {
      setShowForm(true);
      // Remove the parameter from URL
      searchParams.delete('quick');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

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
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b z-40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Incident Log</h1>
            <p className="text-sm text-muted-foreground">
              Track operational incidents
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
            size="sm"
            className="flex items-center gap-2"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? 'Cancel' : 'Log'}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Statistics */}
        <IncidentStatistics incidents={incidents} />

        {/* Quick Form - Full screen on mobile when active */}
        {showForm && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Log New Incident</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <IncidentForm 
                onSubmit={handleCreateIncidentWithForm}
                isSubmitting={createMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Incidents List */}
        <IncidentsList 
          incidents={incidents}
          onViewIncident={handleViewIncident}
          isLoading={isLoading}
        />

        {/* Detail Dialog */}
        <IncidentDetailDialog
          incident={selectedIncident}
          open={!!selectedIncident}
          onOpenChange={(open) => !open && setSelectedIncident(null)}
        />
      </div>
    </div>
  );
};

export default MobileIncidentLog;
