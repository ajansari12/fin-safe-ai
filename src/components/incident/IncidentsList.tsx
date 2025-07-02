
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, AlertTriangle, Clock, CheckCircle, FileDown, ArrowUpRight } from "lucide-react";
import { Incident } from "@/services/incident";
import { format, formatDistanceToNow, isAfter, addHours } from "date-fns";
import { generateIncidentReportPDF } from "@/services/incident-pdf-service";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AsyncWrapper, TableLoading } from "@/components/common";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface IncidentsListProps {
  incidents: Incident[];
  onViewIncident: (incident: Incident) => void;
  isLoading?: boolean;
  error?: Error | null;
}

const IncidentsList: React.FC<IncidentsListProps> = ({ incidents, onViewIncident, isLoading, error }) => {
  const { handleError } = useErrorHandler();
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCategory = (category?: string) => {
    if (!category) return 'Uncategorized';
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getSLAStatus = (incident: Incident) => {
    const reportedAt = new Date(incident.reported_at);
    const now = new Date();
    
    if (incident.status === 'resolved' || incident.status === 'closed') {
      return { status: 'completed', label: 'Completed' };
    }
    
    const responseDeadline = incident.max_response_time_hours ? 
      addHours(reportedAt, incident.max_response_time_hours) : 
      addHours(reportedAt, 24);

    const resolutionDeadline = incident.max_resolution_time_hours ? 
      addHours(reportedAt, incident.max_resolution_time_hours) : 
      addHours(reportedAt, 72);
    
    // First check if response SLA is breached
    if (!incident.first_response_at && isAfter(now, responseDeadline)) {
      return { status: 'breached', label: 'Response SLA Breached' };
    }
    
    // Then check if resolution SLA is breached
    if (isAfter(now, resolutionDeadline)) {
      return { status: 'breached', label: 'Resolution SLA Breached' };
    }
    
    // Calculate which deadline is closer
    const deadlineToCheck = !incident.first_response_at ? responseDeadline : resolutionDeadline;
    const hoursUntilDeadline = Math.floor((deadlineToCheck.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursUntilDeadline <= 2) {
      return { status: 'warning', label: `SLA Due in ${hoursUntilDeadline}h` };
    }
    
    return { status: 'ok', label: 'In SLA' };
  };

  const handleExportIncident = async (incident: Incident) => {
    try {
      await generateIncidentReportPDF(incident);
      toast.success("Incident report exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export incident report");
    }
  };

  const handleExportAll = async () => {
    try {
      // Export multiple incidents as separate PDFs
      for (const incident of incidents.slice(0, 5)) { // Limit to first 5 to avoid overwhelming
        await generateIncidentReportPDF(incident);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay between exports
      }
      toast.success(`Exported ${Math.min(incidents.length, 5)} incident reports`);
    } catch (error) {
      console.error("Bulk export failed:", error);
      toast.error("Failed to export incident reports");
    }
  };

  return (
    <AsyncWrapper
      loading={isLoading}
      error={error}
      loadingComponent={
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Loading incident data...</CardDescription>
          </CardHeader>
          <CardContent>
            <TableLoading />
          </CardContent>
        </Card>
      }
    >
      {incidents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>
              No incidents have been logged yet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Incidents</CardTitle>
                <CardDescription>
                  Track and manage operational incidents and disruptions.
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleExportAll} className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Export All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => {
                  const slaStatus = getSLAStatus(incident);
                  
                  return (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-xs truncate flex items-center gap-1">
                          {incident.title}
                          {incident.escalation_level > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Escalated to Level {incident.escalation_level}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatCategory(incident.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(incident.severity)}>
                          {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(incident.status)}
                          <Badge variant={getStatusColor(incident.status)}>
                            {incident.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          switch(slaStatus.status) {
                            case 'breached':
                              return (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {slaStatus.label}
                                </Badge>
                              );
                            case 'warning':
                              return (
                                <Badge variant="outline" className="bg-amber-50 text-amber-800 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {slaStatus.label}
                                </Badge>
                              );
                            case 'completed':
                              return (
                                <Badge variant="outline" className="bg-green-50 text-green-800 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {slaStatus.label}
                                </Badge>
                              );
                            default:
                              return (
                                <Badge variant="outline" className="bg-blue-50 text-blue-800">
                                  {slaStatus.label}
                                </Badge>
                              );
                          }
                        })()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {formatDistanceToNow(new Date(incident.reported_at), { addSuffix: true })}
                            </TooltipTrigger>
                            <TooltipContent>
                              {format(new Date(incident.reported_at), 'MMM dd, yyyy HH:mm')}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewIncident(incident)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportIncident(incident)}
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AsyncWrapper>
  );
};

export default IncidentsList;
