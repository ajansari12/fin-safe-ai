import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import IncidentForm from "@/components/incident/IncidentForm";
import IncidentsList from "@/components/incident/IncidentsList";
import IncidentDetailDialog from "@/components/incident/IncidentDetailDialog";
import { 
  getIncidents, 
  createIncident, 
  checkSLABreaches,
  Incident, 
  CreateIncidentData 
} from "@/services/incident";

const IncidentLog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Fetch incidents
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: getIncidents
  });

  // Create incident mutation
  const createMutation = useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setShowForm(false);
      toast({
        title: "Incident Created",
        description: "The incident has been successfully logged.",
      });
    },
    onError: (error) => {
      console.error('Error creating incident:', error);
      toast({
        title: "Error",
        description: "Failed to create incident. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Check for SLA breaches periodically
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

  const handleCreateIncident = async (data: CreateIncidentData) => {
    await createMutation.mutateAsync(data);
  };

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  // Calculate statistics
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const inProgressIncidents = incidents.filter(i => i.status === 'in_progress').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
  const escalatedIncidents = incidents.filter(i => i.escalation_level > 0).length;
  
  // SLA breaches
  const slaBreaches = incidents.filter(incident => {
    if (incident.status === 'resolved' || incident.status === 'closed') {
      return false;
    }
    
    const reportedAt = new Date(incident.reported_at);
    const now = new Date();
    
    // Response SLA breach
    if (!incident.first_response_at && 
        ((now.getTime() - reportedAt.getTime()) / (1000 * 60 * 60)) > (incident.max_response_time_hours || 24)) {
      return true;
    }
    
    // Resolution SLA breach
    if (((now.getTime() - reportedAt.getTime()) / (1000 * 60 * 60)) > (incident.max_resolution_time_hours || 72)) {
      return true;
    }
    
    return false;
  }).length;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Incident Log</h1>
            <p className="text-muted-foreground">
              Track and manage operational incidents and disruptions.
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Log Incident'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIncidents}</div>
              <p className="text-xs text-muted-foreground">
                All time incidents
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{openIncidents}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{inProgressIncidents}</div>
              <p className="text-xs text-muted-foreground">
                Being worked on
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{resolvedIncidents}</div>
              <p className="text-xs text-muted-foreground">
                Completed incidents
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{criticalIncidents}</div>
              <p className="text-xs text-muted-foreground">
                High priority
              </p>
            </CardContent>
          </Card>
          
          <Card className={slaBreaches > 0 ? "bg-red-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${slaBreaches > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${slaBreaches > 0 ? "text-red-600" : ""}`}>
                {slaBreaches}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {escalatedIncidents > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-800">
                    {escalatedIncidents} Escalated
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Incident Form */}
        {showForm && (
          <IncidentForm 
            onSubmit={handleCreateIncident}
            isSubmitting={createMutation.isPending}
          />
        )}

        {/* Incidents List */}
        <IncidentsList 
          incidents={incidents}
          onViewIncident={handleViewIncident}
          isLoading={isLoading}
        />

        {/* Incident Detail Dialog */}
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
