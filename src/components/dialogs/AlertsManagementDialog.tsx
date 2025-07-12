import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, ArrowUp } from "lucide-react";
import { ActiveAlert } from "@/services/operational-dashboard-service";

interface AlertsManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alerts: ActiveAlert[];
}

export const AlertsManagementDialog: React.FC<AlertsManagementDialogProps> = ({
  open,
  onOpenChange,
  alerts
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleAcknowledge = (alertId: string) => {
    console.log('Acknowledging alert:', alertId);
    // TODO: Implement alert acknowledgment
  };

  const handleEscalate = (alertId: string) => {
    console.log('Escalating alert:', alertId);
    // TODO: Implement alert escalation
  };

  const handleResolve = (alertId: string) => {
    console.log('Resolving alert:', alertId);
    // TODO: Implement alert resolution
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Alerts Management</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active alerts found
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5 text-orange-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{alert.type}</h3>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEscalate(alert.id)}
                    >
                      <ArrowUp className="h-4 w-4 mr-1" />
                      Escalate
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};