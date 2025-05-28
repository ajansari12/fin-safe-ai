
import StructureForm from "@/components/governance/StructureForm";
import RoleForm from "@/components/governance/RoleForm";
import PolicyForm from "@/components/governance/PolicyForm";
import BatchPolicyReview from "@/components/governance/BatchPolicyReview";
import ReviewScheduleForm from "@/components/governance/ReviewScheduleForm";
import PolicyViewer from "@/components/governance/PolicyViewer";
import PolicyApprovalWorkflow from "@/components/governance/PolicyApprovalWorkflow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GovernanceStructure, GovernanceRole, GovernancePolicy } from "@/pages/governance/types";

interface DialogHandlersProps {
  frameworkId: string;
  policies: GovernancePolicy[];
  onSuccess: () => void;
  onCancel: () => void;
  onStructureSuccess: (structure: GovernanceStructure) => void;
  onRoleSuccess: (role: GovernanceRole) => void;
  onPolicySuccess: (policy: GovernancePolicy) => void;
}

export function createStructureDialog({ 
  frameworkId, 
  onStructureSuccess, 
  onCancel 
}: Pick<DialogHandlersProps, 'frameworkId' | 'onStructureSuccess' | 'onCancel'>) {
  return (
    <StructureForm 
      frameworkId={frameworkId} 
      onSuccess={onStructureSuccess}
      onCancel={onCancel}
    />
  );
}

export function createRoleDialog({ 
  frameworkId, 
  onRoleSuccess, 
  onCancel 
}: Pick<DialogHandlersProps, 'frameworkId' | 'onRoleSuccess' | 'onCancel'>) {
  return (
    <RoleForm 
      frameworkId={frameworkId} 
      onSuccess={onRoleSuccess}
      onCancel={onCancel}
    />
  );
}

export function createPolicyDialog({ 
  frameworkId, 
  onPolicySuccess, 
  onCancel 
}: Pick<DialogHandlersProps, 'frameworkId' | 'onPolicySuccess' | 'onCancel'>) {
  return (
    <PolicyForm 
      frameworkId={frameworkId} 
      onSuccess={onPolicySuccess}
      onCancel={onCancel}
    />
  );
}

export function createBatchReviewDialog({ 
  policies, 
  onSuccess 
}: Pick<DialogHandlersProps, 'policies' | 'onSuccess'>) {
  return (
    <BatchPolicyReview
      policies={policies.filter(p => p.status === 'active')}
      onCompleted={onSuccess}
    />
  );
}

export function createReviewScheduleDialog({ 
  policyId, 
  onSuccess, 
  onCancel 
}: { policyId: string; onSuccess: () => void; onCancel: () => void }) {
  return (
    <ReviewScheduleForm 
      policyId={policyId} 
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}

export function createPolicyViewerDialog({ 
  policy, 
  onSuccess 
}: { policy: GovernancePolicy; onSuccess: () => void }) {
  return (
    <div className="space-y-6">
      <PolicyViewer policy={policy} />
      
      <Tabs defaultValue="approval">
        <TabsList>
          <TabsTrigger value="approval">Approval Workflow</TabsTrigger>
          <TabsTrigger value="schedule">Review Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="approval">
          <PolicyApprovalWorkflow 
            policy={policy}
            onApprovalChange={onSuccess}
          />
        </TabsContent>
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Review Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewScheduleForm
                policyId={policy.id}
                onSuccess={onSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
