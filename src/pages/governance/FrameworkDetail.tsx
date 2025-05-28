
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getFileUrl } from "@/services/governance-service";
import { GovernancePolicy } from "@/pages/governance/types";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useFrameworkData } from "@/hooks/useFrameworkData";
import { useFrameworkDialog } from "@/hooks/useFrameworkDialog";
import FrameworkOverview from "@/components/governance/FrameworkOverview";
import FrameworkStructuresTab from "@/components/governance/FrameworkStructuresTab";
import FrameworkRolesTab from "@/components/governance/FrameworkRolesTab";
import FrameworkPoliciesTab from "@/components/governance/FrameworkPoliciesTab";
import ChangeLogList from "@/components/governance/ChangeLogList";
import {
  createStructureDialog,
  createRoleDialog,
  createPolicyDialog,
  createBatchReviewDialog,
  createReviewScheduleDialog,
  createPolicyViewerDialog
} from "@/components/governance/FrameworkDialogHandlers";

export default function FrameworkDetail() {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("structure");
  
  const {
    framework,
    structures,
    setStructures,
    roles,
    setRoles,
    policies,
    setPolicies,
    isLoading,
    loadFrameworkData
  } = useFrameworkData(frameworkId);

  const { dialogContent, setDialogContent, closeDialog, openDialog } = useFrameworkDialog();

  function openAddStructureDialog() {
    openDialog(
      "structure",
      "Add Governance Structure",
      createStructureDialog({
        frameworkId: frameworkId!,
        onStructureSuccess: (newStructure) => {
          setStructures((prev) => [...prev, newStructure]);
          closeDialog();
        },
        onCancel: closeDialog
      })
    );
  }

  function openAddRoleDialog() {
    openDialog(
      "role",
      "Add Accountability Role",
      createRoleDialog({
        frameworkId: frameworkId!,
        onRoleSuccess: (newRole) => {
          setRoles((prev) => [...prev, newRole]);
          closeDialog();
        },
        onCancel: closeDialog
      })
    );
  }

  function openAddPolicyDialog() {
    openDialog(
      "policy",
      "Add Governance Policy",
      createPolicyDialog({
        frameworkId: frameworkId!,
        onPolicySuccess: (newPolicy) => {
          setPolicies((prev) => [...prev, newPolicy]);
          closeDialog();
        },
        onCancel: closeDialog
      })
    );
  }

  function openBatchReviewDialog() {
    openDialog(
      "batch-review",
      "Batch Policy Review",
      createBatchReviewDialog({
        policies,
        onSuccess: () => {
          closeDialog();
          loadFrameworkData();
        }
      })
    );
  }

  function openSetReviewScheduleDialog(policy: GovernancePolicy) {
    openDialog(
      "review",
      `Set Review Schedule for ${policy.title}`,
      createReviewScheduleDialog({
        policyId: policy.id,
        onSuccess: () => {
          closeDialog();
          loadFrameworkData();
        },
        onCancel: closeDialog
      })
    );
  }
  
  function openPolicyViewerDialog(policy: GovernancePolicy) {
    openDialog(
      "viewer",
      `View Policy: ${policy.title}`,
      createPolicyViewerDialog({
        policy,
        onSuccess: () => {
          loadFrameworkData();
        }
      })
    );
  }

  async function handleDownloadPolicy(policy: GovernancePolicy) {
    if (!policy.file_path) return;
    
    const url = await getFileUrl(policy.file_path);
    if (url) {
      window.open(url, '_blank');
    }
  }

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!framework) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Framework Not Found</h2>
          <p className="mb-4">The governance framework you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate('/governance-framework')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Frameworks
          </Button>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => navigate('/governance-framework')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{framework.title}</h1>
            <p className="text-muted-foreground">
              Version {framework.version} • Last updated {format(new Date(framework.updated_at), 'PPP')}
            </p>
          </div>
        </div>

        <FrameworkOverview 
          framework={framework}
          structures={structures}
          roles={roles}
          policies={policies}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="structure">Governance Structure</TabsTrigger>
            <TabsTrigger value="roles">Accountability Roles</TabsTrigger>
            <TabsTrigger value="policies">Governance Policies</TabsTrigger>
            <TabsTrigger value="changelog">Change Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="structure" className="space-y-4">
            <FrameworkStructuresTab 
              structures={structures}
              onAddStructure={openAddStructureDialog}
            />
          </TabsContent>
          
          <TabsContent value="roles" className="space-y-4">
            <FrameworkRolesTab 
              roles={roles}
              onAddRole={openAddRoleDialog}
            />
          </TabsContent>
          
          <TabsContent value="policies" className="space-y-4">
            <FrameworkPoliciesTab 
              policies={policies}
              onAddPolicy={openAddPolicyDialog}
              onBatchReview={openBatchReviewDialog}
              onViewPolicy={openPolicyViewerDialog}
              onDownloadPolicy={handleDownloadPolicy}
              onSetReviewSchedule={openSetReviewScheduleDialog}
            />
          </TabsContent>
          
          <TabsContent value="changelog">
            <Card>
              <CardHeader>
                <CardTitle>Change Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ChangeLogList frameworkId={frameworkId!} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog 
        open={dialogContent.open} 
        onOpenChange={(open) => {
          setDialogContent({ ...dialogContent, open });
          if (!open) loadFrameworkData();
        }}
      >
        <DialogContent className={dialogContent.type === 'viewer' ? 'max-w-4xl' : undefined}>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
          </DialogHeader>
          {dialogContent.content}
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}
