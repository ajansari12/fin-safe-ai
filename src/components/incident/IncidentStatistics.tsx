
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, Clock, CheckCircle, TrendingUp, Shield, Building2, Activity } from "lucide-react";
import { Incident } from "@/services/incident";

interface IncidentStatisticsProps {
  incidents: Incident[];
}

const IncidentStatistics: React.FC<IncidentStatisticsProps> = ({ incidents }) => {
  // Calculate statistics
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const inProgressIncidents = incidents.filter(i => i.status === 'in_progress').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
  const escalatedIncidents = incidents.filter(i => i.escalation_level > 0).length;
  
  // OSFI E-21 specific metrics
  const operationalRiskIncidents = incidents.filter(i => 
    ['internal_process', 'people_systems', 'technology_cyber'].includes(i.category || '')
  ).length;
  const criticalOperationsAffected = incidents.filter(i => 
    i.business_function_id && ['critical', 'high'].includes(i.severity)
  ).length;
  const disruptionToleranceBreaches = incidents.filter(i => {
    if (i.severity === 'critical') return true; // Assuming critical incidents breach tolerance
    return false;
  }).length;
  
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-9">
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Operational Risk</CardTitle>
          <Shield className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{operationalRiskIncidents}</div>
          <p className="text-xs text-muted-foreground">
            OSFI E-21 categories
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Ops</CardTitle>
          <Building2 className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{criticalOperationsAffected}</div>
          <p className="text-xs text-muted-foreground">
            Functions affected
          </p>
        </CardContent>
      </Card>

      <Card className={disruptionToleranceBreaches > 0 ? "bg-orange-50" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tolerance Breach</CardTitle>
          <Activity className={`h-4 w-4 ${disruptionToleranceBreaches > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${disruptionToleranceBreaches > 0 ? "text-orange-600" : ""}`}>
            {disruptionToleranceBreaches}
          </div>
          <p className="text-xs text-muted-foreground">
            Disruption tolerance
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentStatistics;
