
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowUpRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { IncidentEscalation, Incident } from "@/services/incident-service";

interface IncidentEscalationsTabProps {
  incident: Incident;
  escalations: IncidentEscalation[] | undefined;
  onEscalate: (reason: string) => void;
  isEscalating: boolean;
}

const IncidentEscalationsTab: React.FC<IncidentEscalationsTabProps> = ({
  incident,
  escalations,
  onEscalate,
  isEscalating,
}) => {
  const { register, handleSubmit, reset } = useForm<{ reason: string }>();
  const [showEscalateForm, setShowEscalateForm] = useState(false);

  const handleEscalate = (data: { reason: string }) => {
    if (!data.reason.trim()) return;
    onEscalate(data.reason);
    reset();
    setShowEscalateForm(false);
  };

  const getEscalationTypeDisplay = (type: string) => {
    switch (type) {
      case 'response_sla_breach':
        return { label: 'Response Time SLA Breach', bg: 'bg-red-100', text: 'text-red-800' };
      case 'resolution_sla_breach':
        return { label: 'Resolution Time SLA Breach', bg: 'bg-red-100', text: 'text-red-800' };
      case 'manual':
        return { label: 'Manual Escalation', bg: 'bg-blue-100', text: 'text-blue-800' };
      default:
        return { label: type.replace('_', ' '), bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const canEscalate = incident.escalation_level < 3 && incident.status !== 'resolved' && incident.status !== 'closed';

  return (
    <div className="space-y-4">
      {canEscalate && (
        <div className="flex justify-end">
          {!showEscalateForm ? (
            <Button 
              variant="outline" 
              onClick={() => setShowEscalateForm(true)}
              className="flex items-center gap-1"
            >
              <ArrowUpRight className="h-4 w-4" />
              Escalate Incident
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              onClick={() => setShowEscalateForm(false)}
              size="sm"
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {showEscalateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Escalate Incident</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleEscalate)} className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for Escalation</Label>
                <Textarea 
                  {...register('reason', { required: true })} 
                  placeholder="Explain why this incident needs to be escalated..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isEscalating}>
                  {isEscalating ? 'Escalating...' : 'Escalate Now'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowEscalateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {(escalations?.length === 0 || !escalations) && !showEscalateForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No escalations for this incident yet.</p>
              {canEscalate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Incident will be automatically escalated if SLA is breached, or you can manually escalate it.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {escalations?.map((escalation) => {
        const typeDisplay = getEscalationTypeDisplay(escalation.escalation_type);
        
        return (
          <Card key={escalation.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full p-2 bg-amber-100">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">
                      Level {escalation.escalation_level} Escalation
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${typeDisplay.bg} ${typeDisplay.text}`}>
                      {typeDisplay.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(escalation.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-2">{escalation.escalation_reason}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {escalation.escalated_from_name && (
                      <div className="text-muted-foreground">
                        From: {escalation.escalated_from_name}
                      </div>
                    )}
                    {escalation.escalated_to_name && (
                      <div className="text-muted-foreground">
                        To: <span className="font-medium">{escalation.escalated_to_name}</span>
                      </div>
                    )}
                    {(!escalation.escalated_to_name && !escalation.acknowledged_at) && (
                      <Badge variant="outline" className="bg-yellow-50">Pending Assignment</Badge>
                    )}
                    {escalation.acknowledged_at && (
                      <Badge variant="outline" className="bg-green-50 text-green-800">
                        Acknowledged: {format(new Date(escalation.acknowledged_at), 'MMM dd, HH:mm')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default IncidentEscalationsTab;
