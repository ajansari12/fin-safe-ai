import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  getFrameworkById, 
  getStructuresByFrameworkId, 
  getRolesByFrameworkId,
  getPoliciesByFrameworkId,
  getFileUrl
} from "@/services/governance-service";
import { GovernanceFramework, GovernanceStructure, GovernanceRole, GovernancePolicy } from "@/pages/governance/types";
import { 
  Users, 
  UserCheck, 
  FileText, 
  Clock, 
  ExternalLink,
  PlusCircle, 
  Download, 
  Calendar,
  ArrowLeft,
  ClipboardCheck
} from "lucide-react";
import StructureForm from "@/components/governance/StructureForm";
import RoleForm from "@/components/governance/RoleForm";
import PolicyForm from "@/components/governance/PolicyForm";
import ChangeLogList from "@/components/governance/ChangeLogList";
import ReviewScheduleForm from "@/components/governance/ReviewScheduleForm";
import PolicyViewer from "@/components/governance/PolicyViewer";
import BatchPolicyReview from "@/components/governance/BatchPolicyReview";
import PolicyApprovalWorkflow from "@/components/governance/PolicyApprovalWorkflow";
import { format } from "date-fns";

export default function FrameworkDetail() {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("structure");
  const [framework, setFramework] = useState<GovernanceFramework | null>(null);
  const [structures, setStructures] = useState<GovernanceStructure[]>([]);
  const [roles, setRoles] = useState<GovernanceRole[]>([]);
  const [policies, setPolicies] = useState<GovernancePolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<GovernancePolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogContent, setDialogContent] = useState<{
    open: boolean;
    type: string;
    title: string;
    content: React.ReactNode;
  }>({
    open: false,
    type: "",
    title: "",
    content: null,
  });

  useEffect(() => {
    loadFrameworkData();
  }, [frameworkId]);

  async function loadFrameworkData() {
    if (!frameworkId) return;
    setIsLoading(true);
    
    try {
      const [frameworkData, structuresData, rolesData, policiesData] = await Promise.all([
        getFrameworkById(frameworkId),
        getStructuresByFrameworkId(frameworkId),
        getRolesByFrameworkId(frameworkId),
        getPoliciesByFrameworkId(frameworkId),
      ]);
      
      setFramework(frameworkData);
      setStructures(structuresData);
      setRoles(rolesData);
      setPolicies(policiesData);
    } catch (error) {
      console.error("Error loading framework data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function closeDialog() {
    setDialogContent({ ...dialogContent, open: false });
  }

  function openAddStructureDialog() {
    setDialogContent({
      open: true,
      type: "structure",
      title: "Add Governance Structure",
      content: (
        <StructureForm 
          frameworkId={frameworkId!} 
          onSuccess={(newStructure) => {
            setStructures((prev) => [...prev, newStructure]);
            closeDialog();
          }}
          onCancel={closeDialog}
        />
      ),
    });
  }

  function openAddRoleDialog() {
    setDialogContent({
      open: true,
      type: "role",
      title: "Add Accountability Role",
      content: (
        <RoleForm 
          frameworkId={frameworkId!} 
          onSuccess={(newRole) => {
            setRoles((prev) => [...prev, newRole]);
            closeDialog();
          }}
          onCancel={closeDialog}
        />
      ),
    });
  }

  function openAddPolicyDialog() {
    setDialogContent({
      open: true,
      type: "policy",
      title: "Add Governance Policy",
      content: (
        <PolicyForm 
          frameworkId={frameworkId!} 
          onSuccess={(newPolicy) => {
            setPolicies((prev) => [...prev, newPolicy]);
            closeDialog();
          }}
          onCancel={closeDialog}
        />
      ),
    });
  }

  function openBatchReviewDialog() {
    setDialogContent({
      open: true,
      type: "batch-review",
      title: "Batch Policy Review",
      content: (
        <BatchPolicyReview
          policies={policies.filter(p => p.status === 'active')}
          onCompleted={() => {
            closeDialog();
            loadFrameworkData();
          }}
        />
      ),
    });
  }

  function openSetReviewScheduleDialog(policy: GovernancePolicy) {
    setDialogContent({
      open: true,
      type: "review",
      title: `Set Review Schedule for ${policy.title}`,
      content: (
        <ReviewScheduleForm 
          policyId={policy.id} 
          onSuccess={() => {
            closeDialog();
            loadFrameworkData();
          }}
          onCancel={closeDialog}
        />
      ),
    });
  }
  
  function openPolicyViewerDialog(policy: GovernancePolicy) {
    setSelectedPolicy(policy);
    setDialogContent({
      open: true,
      type: "viewer",
      title: `View Policy: ${policy.title}`,
      content: (
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
                onApprovalChange={() => {
                  loadFrameworkData();
                }}
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
                    onSuccess={() => {
                      loadFrameworkData();
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ),
    });
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

        <Card>
          <CardHeader>
            <CardTitle>Framework Overview</CardTitle>
            <CardDescription>
              {framework.description || "No description provided"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <Users className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <div className="text-sm font-medium">Governance Structure</div>
                  <div className="text-2xl font-bold">{structures.length}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-green-100">
                  <UserCheck className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <div className="text-sm font-medium">Accountability Roles</div>
                  <div className="text-2xl font-bold">{roles.length}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-purple-100">
                  <FileText className="h-4 w-4 text-purple-700" />
                </div>
                <div>
                  <div className="text-sm font-medium">Governance Policies</div>
                  <div className="text-2xl font-bold">{policies.length}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-amber-100">
                  <Clock className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-2xl font-bold capitalize">{framework.status}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="structure">Governance Structure</TabsTrigger>
            <TabsTrigger value="roles">Accountability Roles</TabsTrigger>
            <TabsTrigger value="policies">Governance Policies</TabsTrigger>
            <TabsTrigger value="changelog">Change Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="structure" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Governance Structure</h2>
              <Button onClick={openAddStructureDialog} size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Structure
              </Button>
            </div>
            
            {structures.length === 0 ? (
              <div className="text-center p-8 border rounded border-dashed">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-1">No governance structure defined</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Define your governance structure, including committees and executive sponsors.
                </p>
                <Button onClick={openAddStructureDialog}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Governance Structure
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {structures.map((structure) => (
                  <Card key={structure.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{structure.name}</CardTitle>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                          {structure.type}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">
                        {structure.description || "No description provided"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="roles" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Accountability Roles</h2>
              <Button onClick={openAddRoleDialog} size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>
            
            {roles.length === 0 ? (
              <div className="text-center p-8 border rounded border-dashed">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-1">No accountability roles defined</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Define key roles and responsibilities for operational resilience governance.
                </p>
                <Button onClick={openAddRoleDialog}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Accountability Role
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {roles.map((role) => (
                  <Card key={role.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{role.title}</CardTitle>
                      {role.assigned_to && (
                        <CardDescription>Assigned to: {role.assigned_to}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {role.description && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Description</h4>
                          <p className="text-sm text-gray-700">{role.description}</p>
                        </div>
                      )}
                      {role.responsibilities && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Key Responsibilities</h4>
                          <p className="text-sm text-gray-700">{role.responsibilities}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="policies" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Governance Policies</h2>
              <div className="flex space-x-2">
                {policies.length > 0 && (
                  <Button onClick={openBatchReviewDialog} size="sm" variant="outline">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Batch Review
                  </Button>
                )}
                <Button onClick={openAddPolicyDialog} size="sm">
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
                <Button onClick={openAddPolicyDialog}>
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
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-green-100 text-green-800">
                          {policy.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-gray-700 mb-2">
                        {policy.description || "No description provided"}
                      </p>
                      
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
                            onClick={() => openPolicyViewerDialog(policy)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View Policy
                          </Button>
                          {policy.file_path && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownloadPolicy(policy)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openSetReviewScheduleDialog(policy)}
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Set Review Cycle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="changelog">
            <Card>
              <CardHeader>
                <CardTitle>Change Log</CardTitle>
                <CardDescription>
                  Track all changes made to this governance framework
                </CardDescription>
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
          // Reload data when dialog closes in case there were changes
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
