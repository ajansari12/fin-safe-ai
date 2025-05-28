
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, AlertTriangle, CheckSquare, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuditUploadForm from "@/components/audit/AuditUploadForm";
import AuditDocumentsList from "@/components/audit/AuditDocumentsList";
import ComplianceFindingsForm from "@/components/audit/ComplianceFindingsForm";
import ComplianceFindingsList from "@/components/audit/ComplianceFindingsList";
import AuditTaskForm from "@/components/audit/AuditTaskForm";
import AuditTasksList from "@/components/audit/AuditTasksList";
import AuditTrailExport from "@/components/audit/AuditTrailExport";
import { auditService, AuditUpload, ComplianceFinding, AuditTask } from "@/services/audit-service";

const AuditAndCompliance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("documents");
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedUploadId, setSelectedUploadId] = useState<string>("");
  const [selectedFindingId, setSelectedFindingId] = useState<string>("");

  // Data states
  const [documents, setDocuments] = useState<AuditUpload[]>([]);
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);
  const [tasks, setTasks] = useState<AuditTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Get org_id from user profile
  const [orgId, setOrgId] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.organization_id) {
        setOrgId(profile.organization_id);
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [documentsData, findingsData, tasksData] = await Promise.all([
        auditService.getAuditUploads(orgId),
        auditService.getComplianceFindings(orgId),
        auditService.getAuditTasks(orgId)
      ]);
      
      setDocuments(documentsData);
      setFindings(findingsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: "There was an error loading the audit data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    loadData();
    toast({
      title: "Upload successful",
      description: "Document uploaded successfully."
    });
  };

  const handleCreateFinding = (uploadId: string) => {
    setSelectedUploadId(uploadId);
    setShowFindingForm(true);
    setActiveTab("findings");
  };

  const handleFindingSuccess = () => {
    setShowFindingForm(false);
    setSelectedUploadId("");
    loadData();
  };

  const handleCreateTask = (findingId: string) => {
    setSelectedFindingId(findingId);
    setShowTaskForm(true);
    setActiveTab("tasks");
  };

  const handleTaskSuccess = () => {
    setShowTaskForm(false);
    setSelectedFindingId("");
    loadData();
  };

  const handleUpdateFinding = (finding: ComplianceFinding) => {
    // This would open an edit modal - for now just log
    console.log('Update finding:', finding);
  };

  const handleUpdateTask = (task: AuditTask) => {
    // This would open an edit modal - for now just reload data
    loadData();
  };

  if (!orgId) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading organization data...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit & Compliance</h1>
          <p className="text-muted-foreground">
            Track regulatory compliance and manage audit activities.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="findings" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Findings
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <AuditUploadForm orgId={orgId} onUploadSuccess={handleUploadSuccess} />
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Audit Documents</CardTitle>
                    <CardDescription>
                      Uploaded audit documents and their review status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">Loading documents...</div>
                    ) : (
                      <AuditDocumentsList 
                        documents={documents} 
                        onCreateFinding={handleCreateFinding} 
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="findings" className="space-y-6">
            {showFindingForm ? (
              <ComplianceFindingsForm
                orgId={orgId}
                auditUploadId={selectedUploadId}
                onSuccess={handleFindingSuccess}
                onCancel={() => {
                  setShowFindingForm(false);
                  setSelectedUploadId("");
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Findings</CardTitle>
                  <CardDescription>
                    Track audit findings and regulatory compliance issues.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading findings...</div>
                  ) : (
                    <ComplianceFindingsList 
                      findings={findings}
                      onCreateTask={handleCreateTask}
                      onUpdateFinding={handleUpdateFinding}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            {showTaskForm ? (
              <AuditTaskForm
                orgId={orgId}
                findingId={selectedFindingId}
                onSuccess={handleTaskSuccess}
                onCancel={() => {
                  setShowTaskForm(false);
                  setSelectedFindingId("");
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Audit Tasks</CardTitle>
                  <CardDescription>
                    Track corrective actions and deadlines for audit findings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading tasks...</div>
                  ) : (
                    <AuditTasksList 
                      tasks={tasks}
                      onUpdateTask={handleUpdateTask}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <AuditTrailExport orgId={orgId} />
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Dashboard</CardTitle>
                  <CardDescription>
                    Monitor compliance with OSFI E-21, B-10, and B-13 guidelines.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{findings.filter(f => f.status === 'completed').length}</div>
                      <div className="text-sm text-muted-foreground">Resolved Findings</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{findings.filter(f => f.status === 'open').length}</div>
                      <div className="text-sm text-muted-foreground">Open Findings</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'completed').length}</div>
                      <div className="text-sm text-muted-foreground">Completed Tasks</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'completed').length}</div>
                      <div className="text-sm text-muted-foreground">Overdue Tasks</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default AuditAndCompliance;
