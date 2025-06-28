
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Play, BarChart3, File, Settings } from "lucide-react";
import ScenarioBuilder from "@/components/scenario-testing/ScenarioBuilder";
import ScenarioTestsList from "@/components/scenario-testing/ScenarioTestsList";
import ScenarioAnalyticsDashboard from "@/components/scenario-testing/ScenarioAnalyticsDashboard";
import ScenarioTemplateLibrary from "@/components/scenario-testing/ScenarioTemplateLibrary";
import TestExecutionCenter from "@/components/scenario-testing/TestExecutionCenter";
import { createScenarioTest, updateScenarioTest, deleteScenarioTest, ScenarioTest } from "@/services/scenario-testing-service";

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

  const handleSave = (data: Partial<ScenarioTest>) => {
    if (editingScenario) {
      // Update existing scenario
    } else {
      createMutation.mutate(data as Omit<ScenarioTest, 'id' | 'org_id' | 'created_at' | 'updated_at'>);
    }
    setIsBuilderOpen(false);
    setEditingScenario(null);
  };

  const handleExecute = (scenario: ScenarioTest) => {
    setExecutingScenario(scenario);
    setIsExecutionOpen(true);
  };

  const closeExecution = () => {
    setIsExecutionOpen(false);
    setExecutingScenario(null);
    queryClient.invalidateQueries({ queryKey: ['scenarioTests'] });
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scenario Testing</h1>
            <p className="text-muted-foreground">
              OSFI E-21 compliant scenario testing for operational resilience validation.
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
            <Button onClick={() => setIsBuilderOpen(true)}>
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
            <TabsTrigger value="execution" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Execution Center
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <ScenarioTestsList
              onEdit={(scenario) => {
                setEditingScenario(scenario);
                setIsBuilderOpen(true);
              }}
              onExecute={handleExecute}
            />
          </TabsContent>

          <TabsContent value="execution">
            <TestExecutionCenter />
          </TabsContent>

          <TabsContent value="analytics">
            <ScenarioAnalyticsDashboard />
          </TabsContent>
        </Tabs>

        {/* Scenario Builder Dialog */}
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingScenario ? 'Edit Scenario Test' : 'Create New Scenario Test'}
              </DialogTitle>
              <DialogDescription>
                Use templates or create custom scenario tests for operational resilience validation.
              </DialogDescription>
            </DialogHeader>
            
            <ScenarioBuilder
              scenario={editingScenario || undefined}
              onSave={handleSave}
              onCancel={() => {
                setIsBuilderOpen(false);
                setEditingScenario(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Template Library Dialog */}
        <Dialog open={isTemplateLibraryOpen} onOpenChange={setIsTemplateLibraryOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Scenario Template Library</DialogTitle>
              <DialogDescription>
                Browse pre-built scenario templates for common operational disruptions.
              </DialogDescription>
            </DialogHeader>
            
            <ScenarioTemplateLibrary
              onUseTemplate={(template) => {
                setIsTemplateLibraryOpen(false);
                setEditingScenario(template as any);
                setIsBuilderOpen(true);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Test Execution Dialog */}
        <Dialog open={isExecutionOpen} onOpenChange={setIsExecutionOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Test Execution</DialogTitle>
              <DialogDescription>
                Real-time monitoring and coordination during scenario test execution.
              </DialogDescription>
            </DialogHeader>
            
            {executingScenario && (
              <TestExecutionCenter
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
