
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Play, BarChart3, File } from "lucide-react";
import { createScenarioTest, updateScenarioTest, deleteScenarioTest, ScenarioTest } from "@/services/scenario-testing-service";
import EnhancedScenarioBuilder from "@/components/scenario-testing/EnhancedScenarioBuilder";
import ScenarioTestsList from "@/components/scenario-testing/ScenarioTestsList";
import ScenarioAnalyticsDashboard from "@/components/scenario-testing/ScenarioAnalyticsDashboard";
import GuidedTestExecution from "@/components/scenario-testing/GuidedTestExecution";
import ScenarioTemplateLibrary from "@/components/scenario-testing/ScenarioTemplateLibrary";

const ScenarioTesting = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isExecutionOpen, setIsExecutionOpen] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<ScenarioTest | null>(null);
  const [executingScenario, setExecutingScenario] = useState<ScenarioTest | null>(null);
  const [activeTab, setActiveTab] = useState("tests");

  const createMutation = useMutation({
    mutationFn: createScenarioTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarioTests'] });
      toast({
        title: "Success",
        description: "Scenario test created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create scenario test",
        variant: "destructive",
      });
      console.error('Create error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScenarioTest> }) => 
      updateScenarioTest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarioTests'] });
      queryClient.invalidateQueries({ queryKey: ['scenarioAnalytics'] });
      toast({
        title: "Success",
        description: "Scenario test updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update scenario test",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScenarioTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarioTests'] });
      queryClient.invalidateQueries({ queryKey: ['scenarioAnalytics'] });
      toast({
        title: "Success",
        description: "Scenario test deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete scenario test",
        variant: "destructive",
      });
      console.error('Delete error:', error);
    }
  });

  const handleSave = (data: Partial<ScenarioTest>) => {
    if (editingScenario) {
      updateMutation.mutate({ id: editingScenario.id, data });
    } else {
      createMutation.mutate(data as Omit<ScenarioTest, 'id' | 'org_id' | 'created_at' | 'updated_at'>);
    }
  };

  const handleComplete = (data: Partial<ScenarioTest>) => {
    if (editingScenario) {
      updateMutation.mutate({ 
        id: editingScenario.id, 
        data: { ...data, status: 'completed' }
      });
    } else {
      createMutation.mutate({ 
        ...data, 
        status: 'completed' 
      } as Omit<ScenarioTest, 'id' | 'org_id' | 'created_at' | 'updated_at'>);
    }
    setIsBuilderOpen(false);
    setEditingScenario(null);
  };

  const handleEdit = (scenario: ScenarioTest) => {
    setEditingScenario(scenario);
    setIsBuilderOpen(true);
  };

  const handleContinue = (scenario: ScenarioTest) => {
    setEditingScenario(scenario);
    setIsBuilderOpen(true);
  };

  const handleExecute = (scenario: ScenarioTest) => {
    setExecutingScenario(scenario);
    setIsExecutionOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const closeBuilder = () => {
    setIsBuilderOpen(false);
    setEditingScenario(null);
  };

  const closeExecution = () => {
    setIsExecutionOpen(false);
    setExecutingScenario(null);
    queryClient.invalidateQueries({ queryKey: ['scenarioTests'] });
    queryClient.invalidateQueries({ queryKey: ['scenarioAnalytics'] });
  };

  const startNewScenario = () => {
    setEditingScenario(null);
    setIsBuilderOpen(true);
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enhanced Scenario Testing</h1>
            <p className="text-muted-foreground">
              Design, execute, and analyze scenario tests with AI assistance and template library.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsTemplateLibraryOpen(true)}
            >
              <File className="h-4 w-4 mr-2" />
              Template Library
            </Button>
            <Button onClick={startNewScenario}>
              <Plus className="h-4 w-4 mr-2" />
              New Scenario Test
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <ScenarioTestsList
              onEdit={handleEdit}
              onDelete={handleDelete}
              onContinue={handleContinue}
              onExecute={handleExecute}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <ScenarioAnalyticsDashboard />
          </TabsContent>
        </Tabs>

        {/* Enhanced Scenario Builder Dialog */}
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingScenario ? 'Edit Scenario Test' : 'Create New Scenario Test'}
              </DialogTitle>
              <DialogDescription>
                Use templates, AI generation, or manual creation to build comprehensive scenario tests.
              </DialogDescription>
            </DialogHeader>
            
            <EnhancedScenarioBuilder
              scenario={editingScenario || undefined}
              onSave={handleSave}
              onComplete={handleComplete}
              onCancel={closeBuilder}
            />
          </DialogContent>
        </Dialog>

        {/* Template Library Dialog */}
        <Dialog open={isTemplateLibraryOpen} onOpenChange={setIsTemplateLibraryOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Scenario Template Library</DialogTitle>
              <DialogDescription>
                Browse and manage scenario templates for quick test creation.
              </DialogDescription>
            </DialogHeader>
            
            <ScenarioTemplateLibrary
              onUseTemplate={(template) => {
                setIsTemplateLibraryOpen(false);
                // Handle template usage - you can implement this based on needs
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Guided Test Execution Dialog */}
        <Dialog open={isExecutionOpen} onOpenChange={setIsExecutionOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Guided Test Execution</DialogTitle>
              <DialogDescription>
                Execute the scenario test with step-by-step guidance and real-time tracking.
              </DialogDescription>
            </DialogHeader>
            
            {executingScenario && (
              <GuidedTestExecution
                scenario={executingScenario}
                onComplete={closeExecution}
                onCancel={closeExecution}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
};

export default ScenarioTesting;
