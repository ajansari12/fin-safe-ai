import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, AlertTriangle, CheckSquare, FileText, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuditUploadForm from "@/components/audit/AuditUploadForm";
import AuditDocumentsList from "@/components/audit/AuditDocumentsList";
import ComplianceFindingsForm from "@/components/audit/ComplianceFindingsForm";
import ComplianceFindingsList from "@/components/audit/ComplianceFindingsList";
import AuditTaskForm from "@/components/audit/AuditTaskForm";
import AuditTasksList from "@/components/audit/AuditTasksList";
import AuditTrailExport from "@/components/audit/AuditTrailExport";
import { auditService, AuditUpload, ComplianceFinding, AuditTask } from "@/services/audit-service";
import { Button } from "@/components/ui/button";

const AuditAndCompliance = () => {
  const { user, profile } = useAuth();
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
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }
      
      console.log('Fetching profile for user:', user.id);
      
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('organization_id, full_name')
          .eq('id', user.id)
          .single();
        
        console.log('Profile data:', profile);
        console.log('Profile error:', error);
        
        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Error loading profile",
            description: "There was an error loading your profile data.",
            variant: "destructive"
          });
        } else if (profile?.organization_id) {
          console.log('Setting orgId to:', profile.organization_id);
          setOrgId(profile.organization_id);
        } else {
          console.log('No organization_id found in profile');
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast]);

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

  const handleCreateSampleOrganization = async () => {
    if (!user?.id) return;
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Create a sample organization ID
      const sampleOrgId = crypto.randomUUID();
      
      // Update the user's profile with the organization ID
      const { error } = await supabase
        .from('profiles')
        .update({ organization_id: sampleOrgId })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to set up organization. Please try again.",
          variant: "destructive"
        });
      } else {
        setOrgId(sampleOrgId);
        toast({
          title: "Organization set up",
          description: "Your organization has been configured successfully."
        });
      }
    } catch (error) {
      console.error('Error creating organization:', error);
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

  if (profileLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading organization data...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!orgId) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Building2 className="h-6 w-6" />
                Organization Setup Required
              </CardTitle>
              <CardDescription>
                You need to be associated with an organization to access audit and compliance features.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Current user: {profile?.full_name || user?.email}
              </p>
              <Button onClick={handleCreateSampleOrganization}>
                Set Up Organization
              </Button>
            </CardContent>
          </Card>
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
