import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { WorkflowStep, WorkflowTemplate } from "@/services/workflow-service";

interface WorkflowTemplateBuilderProps {
  template?: WorkflowTemplate;
  onSave: (template: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const modules = [
  { value: "governance", label: "Governance" },
  { value: "incident", label: "Incident Management" },
  { value: "audit", label: "Audit & Compliance" },
  { value: "risk", label: "Risk Management" },
  { value: "third_party", label: "Third Party Risk" },
  { value: "business_continuity", label: "Business Continuity" },
  { value: "controls", label: "Controls & KRIs" },
  { value: "compliance", label: "Compliance" }
];

const roles = [
  "Analyst", "Manager", "Director", "Executive", "Compliance Officer", 
  "Risk Manager", "Auditor", "IT Security", "Legal", "Operations"
];

const WorkflowTemplateBuilder: React.FC<WorkflowTemplateBuilderProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [workflowTemplate, setWorkflowTemplate] = useState<Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>>({
    name: template?.name || "",
    description: template?.description || "",
    module: template?.module || "",
    steps: template?.steps || [],
    org_id: template?.org_id || "",
    created_by: template?.created_by
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateTemplate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!workflowTemplate.name.trim()) {
      newErrors.name = "Template name is required";
    }
    
    if (!workflowTemplate.module) {
      newErrors.module = "Module selection is required";
    }
    
    if (workflowTemplate.steps.length === 0) {
      newErrors.steps = "At least one step is required";
    }
    
    workflowTemplate.steps.forEach((step, index) => {
      if (!step.step_name.trim()) {
        newErrors[`step_${index}_name`] = "Step name is required";
      }
      if (!step.assigned_role) {
        newErrors[`step_${index}_role`] = "Assigned role is required";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateTemplate()) {
      onSave(workflowTemplate);
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive"
      });
    }
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      step_number: workflowTemplate.steps.length + 1,
      step_name: "",
      step_description: "",
      assigned_role: "",
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setWorkflowTemplate(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeStep = (stepId: string) => {
    setWorkflowTemplate(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId).map((step, index) => ({
        ...step,
        step_number: index + 1
      }))
    }));
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflowTemplate(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const steps = [...workflowTemplate.steps];
    const [movedStep] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, movedStep);

    // Update step numbers
    const updatedSteps = steps.map((step, index) => ({
      ...step,
      step_number: index + 1
    }));

    setWorkflowTemplate(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {template ? 'Edit Workflow Template' : 'Create Workflow Template'}
          </h2>
          <p className="text-muted-foreground">
            Design reusable workflow templates for consistent process execution
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            Configure the basic information for this workflow template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={workflowTemplate.name}
                onChange={(e) => setWorkflowTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Policy Review Workflow"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="module">Module *</Label>
              <Select
                value={workflowTemplate.module}
                onValueChange={(value) => setWorkflowTemplate(prev => ({ ...prev, module: value }))}
              >
                <SelectTrigger className={errors.module ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.value} value={module.value}>
                      {module.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.module && <p className="text-sm text-red-500">{errors.module}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={workflowTemplate.description || ""}
              onChange={(e) => setWorkflowTemplate(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose and scope of this workflow template"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workflow Steps</CardTitle>
              <CardDescription>
                Define the sequence of steps in this workflow. Use the drag handles to reorder.
              </CardDescription>
            </div>
            <Button onClick={addStep}>
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workflowTemplate.steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No steps defined yet. Click "Add Step" to get started.</p>
              {errors.steps && <p className="text-sm text-red-500 mt-2">{errors.steps}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {workflowTemplate.steps.map((step, index) => (
                <Card key={step.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GripVertical className="h-4 w-4 cursor-move" />
                        <Badge variant="outline">
                          Step {step.step_number}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Step Name *</Label>
                            <Input
                              value={step.step_name}
                              onChange={(e) => updateStep(step.id, { step_name: e.target.value })}
                              placeholder="e.g., Initial Review"
                              className={errors[`step_${index}_name`] ? "border-red-500" : ""}
                            />
                            {errors[`step_${index}_name`] && (
                              <p className="text-sm text-red-500">{errors[`step_${index}_name`]}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Assigned Role *</Label>
                            <Select
                              value={step.assigned_role || ""}
                              onValueChange={(value) => updateStep(step.id, { assigned_role: value })}
                            >
                              <SelectTrigger className={errors[`step_${index}_role`] ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[`step_${index}_role`] && (
                              <p className="text-sm text-red-500">{errors[`step_${index}_role`]}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Step Description</Label>
                          <Textarea
                            value={step.step_description || ""}
                            onChange={(e) => updateStep(step.id, { step_description: e.target.value })}
                            placeholder="Describe what needs to be done in this step"
                            rows={2}
                          />
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowTemplateBuilder;
