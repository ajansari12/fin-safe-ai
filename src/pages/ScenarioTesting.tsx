
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { createScenarioTest, updateScenarioTest, deleteScenarioTest, ScenarioTest } from "@/services/scenario-testing-service";
import ScenarioBuilder from "@/components/scenario-testing/ScenarioBuilder";
import ScenarioTestsList from "@/components/scenario-testing/ScenarioTestsList";

const ScenarioTesting = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<ScenarioTest | null>(null);

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

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const closeBuilder = () => {
    setIsBuilderOpen(false);
    setEditingScenario(null);
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
            <h1 className="text-3xl font-bold tracking-tight">Scenario Testing</h1>
            <p className="text-muted-foreground">
              Design and run scenario tests to evaluate operational resilience.
            </p>
          </div>
          
          <Button onClick={startNewScenario}>
            <Plus className="h-4 w-4 mr-2" />
            New Scenario Test
          </Button>
        </div>

        <ScenarioTestsList
          onEdit={handleEdit}
          onDelete={handleDelete}
          onContinue={handleContinue}
        />

        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingScenario ? 'Edit Scenario Test' : 'Create New Scenario Test'}
              </DialogTitle>
              <DialogDescription>
                Use the step-by-step builder to create comprehensive scenario tests.
              </DialogDescription>
            </DialogHeader>
            
            <ScenarioBuilder
              scenario={editingScenario || undefined}
              onSave={handleSave}
              onComplete={handleComplete}
              onCancel={closeBuilder}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
};

export default ScenarioTesting;
