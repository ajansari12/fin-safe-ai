
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { AppetiteBreachLog } from "@/services/appetite-breach-service";
import BreachActionButtons from "./BreachActionButtons";

interface BreachAlertRowProps {
  breach: AppetiteBreachLog;
  onEscalate: (breachId: string, currentLevel: number) => void;
  onAcknowledge: (breachId: string) => void;
  onResolve: (breach: AppetiteBreachLog) => void;
}

const BreachAlertRow: React.FC<BreachAlertRowProps> = ({
  breach,
  onEscalate,
  onAcknowledge,
  onResolve,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'breach':
        return 'bg-orange-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'acknowledged':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'breach':
        return <TrendingUp className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <TableRow>
      <TableCell>
        {new Date(breach.breach_date).toLocaleDateString()}
      </TableCell>
      <TableCell>
        {(breach as any).risk_categories?.name || 'Unknown'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getSeverityIcon(breach.breach_severity)}
          <Badge className={getSeverityColor(breach.breach_severity)}>
            {breach.breach_severity.toUpperCase()}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        {breach.variance_percentage ? (
          <span className="font-mono text-red-600">
            +{breach.variance_percentage.toFixed(1)}%
          </span>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )}
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(breach.resolution_status)}>
          {breach.resolution_status.replace('_', ' ')}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          Level {breach.escalation_level}
        </Badge>
      </TableCell>
      <TableCell>
        <BreachActionButtons
          breach={breach}
          onEscalate={onEscalate}
          onAcknowledge={onAcknowledge}
          onResolve={onResolve}
        />
      </TableCell>
    </TableRow>
  );
};

export default BreachAlertRow;
