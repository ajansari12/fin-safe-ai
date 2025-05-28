
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, AlertTriangle, Clock, CheckCircle, FileDown } from "lucide-react";
import { Incident } from "@/services/incident-service";
import { format } from "date-fns";
import { generateIncidentReportPDF } from "@/services/incident-pdf-service";
import { toast } from "sonner";

interface IncidentsListProps {
  incidents: Incident[];
  onViewIncident: (incident: Incident) => void;
  isLoading?: boolean;
}

const IncidentsList: React.FC<IncidentsListProps> = ({ incidents, onViewIncident, isLoading }) => {
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading incidents...</div>
        </CardContent>
      </Card>
    );
  }

  if (incidents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>
            No incidents have been logged yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>
              Track and manage operational incidents and disruptions.
            </CardDescription>
          </div>
          {incidents.length > 0 && (
            <Button variant="outline" onClick={handleExportAll} className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Export All
            </Button>
          )}
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
              <TableHead>Impact</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell className="font-medium">
                  <div className="max-w-xs truncate">
                    {incident.title}
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
                  {incident.impact_rating ? (
                    <Badge variant={incident.impact_rating >= 7 ? 'destructive' : incident.impact_rating >= 4 ? 'default' : 'secondary'}>
                      {incident.impact_rating}/10
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(incident.reported_at), 'MMM dd, yyyy HH:mm')}
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default IncidentsList;
