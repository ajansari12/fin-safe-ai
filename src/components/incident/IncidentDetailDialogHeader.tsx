
import React from "react";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Incident } from "@/services/incident";

interface IncidentDetailDialogHeaderProps {
  incident: Incident;
}

const IncidentDetailDialogHeader: React.FC<IncidentDetailDialogHeaderProps> = ({ incident }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        {getStatusIcon(incident.status)}
        {incident.title}
        {incident.escalation_level > 0 && (
          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
            Escalated L{incident.escalation_level}
          </span>
        )}
      </DialogTitle>
      <DialogDescription>
        Incident ID: {incident.id.slice(0, 8)} • Reported {format(new Date(incident.reported_at), 'MMM dd, yyyy HH:mm')}
      </DialogDescription>
    </DialogHeader>
  );
};

export default IncidentDetailDialogHeader;
