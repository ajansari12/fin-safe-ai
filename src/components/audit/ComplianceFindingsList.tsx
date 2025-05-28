
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, User, Building } from "lucide-react";
import { format } from "date-fns";
import { ComplianceFinding } from "@/services/audit-service";

interface ComplianceFindingsListProps {
  findings: ComplianceFinding[];
  onCreateTask: (findingId: string) => void;
  onUpdateFinding: (finding: ComplianceFinding) => void;
}

const ComplianceFindingsList: React.FC<ComplianceFindingsListProps> = ({ 
  findings, 
  onCreateTask,
  onUpdateFinding 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-4">
      {findings.map((finding) => (
        <Card key={finding.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">{finding.finding_title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getSeverityColor(finding.severity)}>
                      {finding.severity.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(finding.status)}>
                      {finding.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {finding.finding_reference}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onCreateTask(finding.id)}>
                  Create Task
                </Button>
                <Button variant="outline" size="sm" onClick={() => onUpdateFinding(finding)}>
                  Update
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm">{finding.finding_description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Module:</span>
                  <span className="capitalize">{finding.module_affected.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(new Date(finding.created_at), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created by:</span>
                  <span>{finding.created_by_name}</span>
                </div>
                {finding.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Due:</span>
                    <span>{format(new Date(finding.due_date), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>

              {finding.assigned_to_name && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Assigned to:</span>
                  <span className="ml-1">{finding.assigned_to_name}</span>
                </div>
              )}

              {finding.regulator_comments && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Regulator Comments:</span>
                  <p className="mt-1">{finding.regulator_comments}</p>
                </div>
              )}

              {finding.internal_response && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Internal Response:</span>
                  <p className="mt-1">{finding.internal_response}</p>
                </div>
              )}

              {finding.corrective_actions && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Corrective Actions:</span>
                  <p className="mt-1">{finding.corrective_actions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {findings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No compliance findings recorded yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComplianceFindingsList;
