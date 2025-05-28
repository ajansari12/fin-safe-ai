
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { workflowService, WorkflowInstance } from "@/services/workflow-service";
import WorkflowList from "@/components/workflow/WorkflowList";
import ModuleFilter from "@/components/workflow/ModuleFilter";
import WorkflowStats from "@/components/workflow/WorkflowStats";

const WorkflowCenter = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Get org_id from user profile
  const [orgId, setOrgId] = useState<string>("");
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }
      
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('organization_id, full_name')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Error loading profile",
            description: "There was an error loading your profile data.",
            variant: "destructive"
          });
        } else if (profile?.organization_id) {
          setOrgId(profile.organization_id);
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
      loadWorkflows();
    }
  }, [orgId]);

  useEffect(() => {
    filterWorkflows();
  }, [workflows, selectedModule, activeTab]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflowInstances(orgId);
      setWorkflows(data);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: "Error loading workflows",
        description: "There was an error loading workflow data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWorkflows = () => {
    let filtered = workflows;

    // Filter by module
    if (selectedModule !== "all") {
      filtered = filtered.filter(workflow => 
        workflow.template?.module === selectedModule
      );
    }

    // Filter by status tab
    if (activeTab !== "all") {
      filtered = filtered.filter(workflow => workflow.status === activeTab);
    }

    setFilteredWorkflows(filtered);
  };

  const handleResumeWorkflow = async (workflow: WorkflowInstance) => {
    try {
      if (workflow.status === 'draft') {
        await workflowService.updateWorkflowInstanceStatus(workflow.id, 'in_progress');
        toast({
          title: "Workflow started",
          description: `${workflow.name} has been started successfully.`
        });
      } else {
        // In a real implementation, this would navigate to the workflow details page
        toast({
          title: "Resume workflow",
          description: `Resuming ${workflow.name}...`
        });
      }
      
      loadWorkflows();
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: "Error",
        description: "There was an error updating the workflow status.",
        variant: "destructive"
      });
    }
  };

  const handleCreateSampleOrganization = async () => {
    if (!user?.id) return;
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const sampleOrgId = crypto.randomUUID();
      
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
                You need to be associated with an organization to access workflow features.
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

  const activeWorkflows = workflows.filter(w => w.status === 'in_progress');
  const completedWorkflows = workflows.filter(w => w.status === 'completed');

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflow Center</h1>
            <p className="text-muted-foreground">
              Manage and track all your operational resilience workflows.
            </p>
          </div>
          <ModuleFilter 
            selectedModule={selectedModule}
            onModuleChange={setSelectedModule}
          />
        </div>

        <WorkflowStats workflows={filteredWorkflows} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Workflows</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <WorkflowList
              workflows={filteredWorkflows}
              title="All Workflows"
              description="Complete list of workflows across all modules and statuses."
              onResumeWorkflow={handleResumeWorkflow}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="draft" className="space-y-6">
            <WorkflowList
              workflows={filteredWorkflows}
              title="Draft Workflows"
              description="Workflows that have been created but not yet started."
              onResumeWorkflow={handleResumeWorkflow}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-6">
            <WorkflowList
              workflows={filteredWorkflows}
              title="Active Workflows"
              description="Workflows currently in progress that require attention."
              onResumeWorkflow={handleResumeWorkflow}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <WorkflowList
              workflows={filteredWorkflows}
              title="Completed Workflows"
              description="Successfully completed workflows and their outcomes."
              loading={loading}
            />
          </TabsContent>
        </Tabs>

        {workflows.length === 0 && !loading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                No Workflows Found
              </CardTitle>
              <CardDescription>
                You don't have any workflows yet. Workflows will appear here once they are created from other modules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Workflows are typically created from governance, incident management, audit, and other operational modules.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default WorkflowCenter;
