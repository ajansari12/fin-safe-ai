import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GovernancePolicy, PolicyApproval, PolicyReviewStatus } from "@/pages/governance/types";
import { createPolicyApproval, createPolicyReview, getPolicyApprovalsByPolicyId, getPolicyReviewsByPolicyId } from "@/services/governance-service";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { CheckCircle2, XCircle, UserCheck, PenTool } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';
import { toast } from "sonner";

interface PolicyApprovalWorkflowProps {
  policy: GovernancePolicy;
  onApprovalChange?: () => void;
}

export default function PolicyApprovalWorkflow({ policy, onApprovalChange }: PolicyApprovalWorkflowProps) {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<PolicyReviewStatus[]>([]);
  const [approvals, setApprovals] = useState<PolicyApproval[]>([]);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [comments, setComments] = useState('');
  const [sigCanvas, setSigCanvas] = useState<SignatureCanvas | null>(null);
  
  const refreshData = async () => {
    if (!policy.id) return;
    
    setIsLoading(true);
    try {
      const [reviewsData, approvalsData] = await Promise.all([
        getPolicyReviewsByPolicyId(policy.id),
        getPolicyApprovalsByPolicyId(policy.id),
      ]);
      
      setReviews(reviewsData);
      setApprovals(approvalsData);
    } catch (error) {
      console.error("Error loading policy approval data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fix: Use useEffect instead of useState for initialization
  useEffect(() => {
    refreshData();
  }, [policy.id]); // Add policy.id as a dependency
  
  const handleOpenReviewDialog = (status: 'approved' | 'rejected') => {
    setReviewStatus(status);
    setComments('');
    setReviewDialogOpen(true);
  };
  
  const handleSubmitReview = async () => {
    if (!profile?.id || !policy.id) return;
    
    try {
      await createPolicyReview({
        policy_id: policy.id,
        reviewer_id: profile.id,
        reviewer_name: profile.full_name || 'Unknown reviewer',
        status: reviewStatus,
        comments: comments || null
      });
      
      setReviewDialogOpen(false);
      toast.success(`Policy ${reviewStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
      refreshData();
      if (onApprovalChange) onApprovalChange();
    } catch (error) {
      console.error("Error submitting policy review:", error);
      toast.error("Failed to submit policy review");
    }
  };
  
  const handleSubmitSignature = async () => {
    if (!profile?.id || !policy.id || !sigCanvas) return;
    
    try {
      // Get signature as a data URL
      const signatureDataUrl = sigCanvas.toDataURL('image/png');
      
      await createPolicyApproval({
        policy_id: policy.id,
        approver_id: profile.id,
        approver_name: profile.full_name || 'Unknown approver',
        approval_date: new Date().toISOString(),
        signature: signatureDataUrl
      });
      
      setSignatureDialogOpen(false);
      toast.success("Policy signed successfully");
      refreshData();
      if (onApprovalChange) onApprovalChange();
    } catch (error) {
      console.error("Error signing policy:", error);
      toast.error("Failed to sign policy");
    }
  };
  
  // Check if current user has already reviewed/approved
  const hasReviewed = profile?.id && reviews.some(r => r.reviewer_id === profile.id);
  const hasSigned = profile?.id && approvals.some(a => a.approver_id === profile.id);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Policy Reviews</CardTitle>
          <CardDescription>
            Team reviews of this policy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center p-4 border rounded border-dashed">
              <p className="text-gray-500">No reviews submitted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review.id} className="p-3 border rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{review.reviewer_name}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(review.created_at), 'PPP')}
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      review.status === 'approved' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {review.status === 'approved' ? (
                        <><CheckCircle2 className="h-4 w-4" /> <span>Approved</span></>
                      ) : (
                        <><XCircle className="h-4 w-4" /> <span>Rejected</span></>
                      )}
                    </div>
                  </div>
                  {review.comments && (
                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                      {review.comments}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {!hasReviewed && (
          <CardFooter className="justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => handleOpenReviewDialog('rejected')}
              className="border-red-200 hover:bg-red-50 text-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOpenReviewDialog('approved')}
              className="border-green-200 hover:bg-green-50 text-green-600"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Policy Signatures</CardTitle>
          <CardDescription>
            Official approvals with electronic signatures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center p-4 border rounded border-dashed">
              <p className="text-gray-500">No signatures submitted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approvals.map(approval => (
                <div key={approval.id} className="p-3 border rounded">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{approval.approver_name}</div>
                      <div className="text-xs text-gray-500">
                        Signed on {format(new Date(approval.approval_date), 'PPP')}
                      </div>
                    </div>
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </div>
                  {approval.signature && (
                    <div className="bg-gray-50 p-2 rounded flex justify-center">
                      <img 
                        src={approval.signature} 
                        alt="Signature" 
                        className="max-h-16"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {!hasSigned && (
          <CardFooter className="justify-end">
            <Button onClick={() => setSignatureDialogOpen(true)}>
              <PenTool className="h-4 w-4 mr-2" />
              Sign Policy
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewStatus === 'approved' ? 'Approve' : 'Reject'} Policy
            </DialogTitle>
            <DialogDescription>
              Submit your {reviewStatus === 'approved' ? 'approval' : 'rejection'} for "{policy.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Comments {reviewStatus === 'rejected' && <span className="text-red-500">*</span>}
              </label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter your comments or feedback about this policy"
                className="resize-none"
                rows={4}
              />
              {reviewStatus === 'rejected' && !comments && (
                <p className="text-sm text-red-500 mt-1">
                  Comments are required when rejecting a policy
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={reviewStatus === 'rejected' && !comments}
              variant={reviewStatus === 'approved' ? 'default' : 'destructive'}
            >
              Submit {reviewStatus === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Policy</DialogTitle>
            <DialogDescription>
              Please provide your electronic signature to approve "{policy.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded p-2 bg-white">
              <div className="border-b border-dashed border-gray-300 mb-2 text-center text-xs text-gray-400">
                Sign below
              </div>
              <div className="h-40 w-full bg-gray-50">
                <SignatureCanvas
                  penColor="black"
                  canvasProps={{ className: 'sigCanvas w-full h-full' }}
                  ref={(ref) => setSigCanvas(ref)}
                />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => sigCanvas?.clear()}
              className="text-sm"
            >
              Clear Signature
            </Button>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSignatureDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitSignature}
              disabled={!sigCanvas || sigCanvas.isEmpty()}
            >
              Submit Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
