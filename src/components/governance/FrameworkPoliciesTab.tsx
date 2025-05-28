
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GovernancePolicy } from "@/pages/governance/types";
import { 
  FileText, 
  Download, 
  Calendar, 
  PlusCircle, 
  ClipboardCheck, 
  UserCheck,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import PolicyAssignmentDialog from "./PolicyAssignmentDialog";
import PolicyReviewDialog from "./PolicyReviewDialog";

interface FrameworkPoliciesTabProps {
  policies: GovernancePolicy[];
  onAddPolicy: () => void;
  onBatchReview: () => void;
  onViewPolicy: (policy: GovernancePolicy) => void;
  onDownloadPolicy: (policy: GovernancePolicy) => void;
  onSetReviewSchedule: (policy: GovernancePolicy) => void;
  onRefresh?: () => void;
}

export default function FrameworkPoliciesTab({ 
  policies, 
  onAddPolicy, 
  onBatchReview, 
  onViewPolicy, 
  onDownloadPolicy, 
  onSetReviewSchedule,
  onRefresh
}: FrameworkPoliciesTabProps) {
  const [assignmentDialog, setAssignmentDialog] = useState<{
    open: boolean;
    policy: GovernancePolicy | null;
  }>({ open: false, policy: null });

  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    policy: GovernancePolicy | null;
  }>({ open: false, policy: null });

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      under_review: 'outline',
      approved: 'default',
      rejected: 'destructive',
      active: 'default',
      archived: 'secondary'
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  const handleAssignForReview = (policy: GovernancePolicy) => {
    setAssignmentDialog({ open: true, policy });
  };

  const handleReviewPolicy = (policy: GovernancePolicy) => {
    setReviewDialog({ open: true, policy });
  };

  const handleDialogSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Governance Policies</h2>
        <div className="flex space-x-2">
          {policies.length > 0 && (
            <Button onClick={onBatchReview} size="sm" variant="outline">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Batch Review
            </Button>
          )}
          <Button onClick={onAddPolicy} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Policy
          </Button>
        </div>
      </div>
      
      {policies.length === 0 ? (
        <div className="text-center p-8 border rounded border-dashed">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-1">No governance policies uploaded</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Upload governance policies, procedures, and guidelines.
          </p>
          <Button onClick={onAddPolicy}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Policy
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{policy.title}</CardTitle>
                    <CardDescription>Version {policy.version}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadge(policy.status)}>
                      {policy.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {policy.review_due_date && (
                      <Badge variant="outline" className="text-xs">
                        Due: {format(new Date(policy.review_due_date), 'MMM dd')}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-700 mb-2">
                  {policy.description || "No description provided"}
                </p>
                
                {policy.assigned_reviewer_name && (
                  <div className="text-xs text-blue-600 mb-2">
                    Assigned to: {policy.assigned_reviewer_name}
                  </div>
                )}
                
                {policy.file_path && (
                  <div className="text-xs text-gray-500 mb-3">
                    File: {policy.file_path.split('/').pop()}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewPolicy(policy)}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      View Policy
                    </Button>
                    {policy.file_path && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onDownloadPolicy(policy)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {policy.status === 'draft' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAssignForReview(policy)}
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Assign Review
                      </Button>
                    )}
                    
                    {policy.status === 'under_review' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReviewPolicy(policy)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSetReviewSchedule(policy)}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Set Review Cycle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Dialog */}
      {assignmentDialog.policy && (
        <PolicyAssignmentDialog
          policy={assignmentDialog.policy}
          open={assignmentDialog.open}
          onOpenChange={(open) => setAssignmentDialog({ open, policy: null })}
          onSuccess={handleDialogSuccess}
        />
      )}

      {/* Review Dialog */}
      {reviewDialog.policy && (
        <PolicyReviewDialog
          policy={reviewDialog.policy}
          open={reviewDialog.open}
          onOpenChange={(open) => setReviewDialog({ open, policy: null })}
          onSuccess={handleDialogSuccess}
        />
      )}
    </div>
  );
}
