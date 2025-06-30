
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, AlertTriangle, Settings, List, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { workflowService, WorkflowInstance, WorkflowTemplate } from "@/services/workflow-service";
import WorkflowList from "@/components/workflow/WorkflowList";
import ModuleFilter from "@/components/workflow/ModuleFilter";
import WorkflowStats from "@/components/workflow/WorkflowStats";
import WorkflowTemplateBuilder from "@/components/workflow/WorkflowTemplateBuilder";
import WorkflowTemplatesList from "@/components/workflow/WorkflowTemplatesList";
import WorkflowInstanceCreator from "@/components/workflow/WorkflowInstanceCreator";
import WorkflowProgressTracker from "@/components/workflow/WorkflowProgressTracker";
import DragDropTemplateBuilder from "@/components/workflow/DragDropTemplateBuilder";
import WorkflowHistory from "@/components/workflow/WorkflowHistory";

const WorkflowCenter = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState("all");
  const [activeTab, setActiveTab] = useState("instances");

  // Dialog states
  const [isTemplateBuilderOpen, setIsTemplateBuilderOpen] = useState(false);
  const [isInstanceCreatorOpen, setIsInstanceCreatorOpen] = useState(false);
  const [isProgressTrackerOpen, setIsProgressTrackerOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);

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
      loadTemplates();
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

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const data = await workflowService.getWorkflowTemplates(orgId);
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error loading templates",
        description: "There was an error loading template data.",
        variant: "destructive"
      });
    } finally {
      setTemplatesLoading(false);
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

    // Filter by status tab (only for instances tab)
    if (activeTab !== "instances" && activeTab !== "templates") {
      filtered = filtered.filter(workflow => workflow.status === activeTab);
    }

    setFilteredWorkflows(filtered);
  };

  // Template operations
  const handleSaveTemplate = async (templateData: Omit<WorkflowTemplate, 'id'>) => {
    try {
      const completeTemplateData = {
        ...templateData,
        description: templateData.description || "",
        org_id: orgId,
        created_by: user?.id
      };

      if (editingTemplate) {
        await workflowService.updateWorkflowTemplate(editingTemplate.id, completeTemplateData);
        toast({
          title: "Template updated",
          description: "Workflow template has been updated successfully."
        });
      } else {
        await workflowService.createWorkflowTemplate(completeTemplateData);
        toast({
          title: "Template created",
          description: "Workflow template has been created successfully."
        });
      }
      
      loadTemplates();
      setIsTemplateBuilderOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "There was an error saving the template.",
        variant: "destructive"
      });
    }
  };

  const handleEditTemplate = (template: WorkflowTemplate) => {
    setEditingTemplate(template);
    setIsTemplateBuilderOpen(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await workflowService.deleteWorkflowTemplate(id);
      toast({
        title: "Template deleted",
        description: "Workflow template has been deleted successfully."
      });
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "There was an error deleting the template.",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateTemplate = async (template: WorkflowTemplate) => {
    try {
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        org_id: orgId,
        created_by: user?.id
      };
      delete (duplicatedTemplate as any).id;
      delete (duplicatedTemplate as any).created_at;
      delete (duplicatedTemplate as any).updated_at;
      
      await workflowService.createWorkflowTemplate(duplicatedTemplate);
      toast({
        title: "Template duplicated",
        description: "Workflow template has been duplicated successfully."
      });
      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "There was an error duplicating the template.",
        variant: "destructive"
      });
    }
  };

  const handleCreateInstance = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsInstanceCreatorOpen(true);
  };

  // Instance operations
  const handleSaveInstance = async (instanceData: Omit<WorkflowInstance, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await workflowService.createWorkflowInstance(instanceData);
      toast({
        title: "Workflow created",
        description: "Workflow instance has been created successfully."
      });
      
      loadWorkflows();
      setIsInstanceCreatorOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error creating instance:', error);
      toast({
        title: "Error",
        description: "There was an error creating the workflow instance.",
        variant: "destructive"
      });
    }
  };

  const handleResumeWorkflow = async (workflow: WorkflowInstance) => {
    try {
      if (workflow.status === 'draft') {
        await workflowService.updateWorkflowInstanceStatus(workflow.id, 'in_progress');
        toast({
          title: "Workflow started",
          description: `${workflow.name} has been started successfully.`
        });
        loadWorkflows();
      } else {
        setSelectedWorkflow(workflow);
        setIsProgressTrackerOpen(true);
      }
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: "Error",
        description: "There was an error updating the workflow status.",
        variant: "destructive"
      });
    }
  };

  // Step operations
  const handleStepComplete = async (stepId: string) => {
    try {
      await workflowService.completeWorkflowStep(stepId);
      toast({
        title: "Step completed",
        description: "Workflow step has been marked as completed."
      });
      loadWorkflows();
    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: "Error",
        description: "There was an error completing the step.",
        variant: "destructive"
      });
    }
  };

  const handleStepUpdate = async (stepId: string, updates: any) => {
    try {
      await workflowService.updateWorkflowStep(stepId, updates);
      toast({
        title: "Step updated",
        description: "Workflow step has been updated successfully."
      });
      loadWorkflows();
    } catch (error) {
      console.error('Error updating step:', error);
      toast({
        title: "Error",
        description: "There was an error updating the step.",
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

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflow Center</h1>
            <p className="text-muted-foreground">
              Manage workflow templates and track operational processes across all modules.
            </p>
          </div>
          <ModuleFilter 
            selectedModule={selectedModule}
            onModuleChange={setSelectedModule}
          />
        </div>

        <WorkflowStats workflows={filteredWorkflows} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="instances" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Instances
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instances" className="space-y-6">
            <WorkflowList
              workflows={filteredWorkflows}
              title="All Workflow Instances"
              description="Complete list of workflow instances across all modules and statuses."
              onResumeWorkflow={handleResumeWorkflow}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <WorkflowTemplatesList
              templates={templates}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onDuplicate={handleDuplicateTemplate}
              onCreateInstance={handleCreateInstance}
              onCreateNew={() => {
                setEditingTemplate(null);
                setIsTemplateBuilderOpen(true);
              }}
              loading={templatesLoading}
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

          <TabsContent value="history" className="space-y-6">
            <WorkflowHistory
              workflows={workflows}
              onViewWorkflow={(workflow) => {
                setSelectedWorkflow(workflow);
                setIsProgressTrackerOpen(true);
              }}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Analytics</CardTitle>
                <CardDescription>
                  Analytics and insights for workflow performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {workflows.length === 0 && templates.length === 0 && !loading && !templatesLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                No Workflows Found
              </CardTitle>
              <CardDescription>
                Get started by creating your first workflow template.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsTemplateBuilderOpen(true)}>
                Create Your First Template
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Template Builder Dialog - Updated to use DragDropTemplateBuilder */}
        <Dialog open={isTemplateBuilderOpen} onOpenChange={setIsTemplateBuilderOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Workflow Template' : 'Create Workflow Template'}
              </DialogTitle>
              <DialogDescription>
                Design reusable workflow templates with drag & drop functionality for consistent process execution.
              </DialogDescription>
            </DialogHeader>
            
            <DragDropTemplateBuilder
              template={editingTemplate || undefined}
              onSave={handleSaveTemplate}
              onCancel={() => {
                setIsTemplateBuilderOpen(false);
                setEditingTemplate(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Instance Creator Dialog */}
        <Dialog open={isInstanceCreatorOpen} onOpenChange={setIsInstanceCreatorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Workflow Instance</DialogTitle>
              <DialogDescription>
                Create a new workflow instance from a template with customized assignments and schedules.
              </DialogDescription>
            </DialogHeader>
            
            {selectedTemplate && (
              <WorkflowInstanceCreator
                template={selectedTemplate}
                onSave={handleSaveInstance}
                onCancel={() => {
                  setIsInstanceCreatorOpen(false);
                  setSelectedTemplate(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Progress Tracker Dialog */}
        <Dialog open={isProgressTrackerOpen} onOpenChange={setIsProgressTrackerOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Workflow Progress</DialogTitle>
              <DialogDescription>
                Track and manage workflow progress with step-by-step execution.
              </DialogDescription>
            </DialogHeader>
            
            {selectedWorkflow && (
              <WorkflowProgressTracker
                workflow={selectedWorkflow}
                onStepComplete={handleStepComplete}
                onStepUpdate={handleStepUpdate}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
};

export default WorkflowCenter;
