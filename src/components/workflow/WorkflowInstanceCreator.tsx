
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { WorkflowTemplate, WorkflowInstance } from "@/services/workflow-service";
import { toast } from "@/hooks/use-toast";

interface WorkflowInstanceCreatorProps {
  template: WorkflowTemplate;
  onSave: (instance: Omit<WorkflowInstance, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const users = [
  "John Smith", "Sarah Johnson", "Mike Davis", "Emily Brown", "David Wilson"
];

const WorkflowInstanceCreator: React.FC<WorkflowInstanceCreatorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [instance, setInstance] = useState({
    name: `${template.name} - ${format(new Date(), "MMM dd, yyyy")}`,
    owner_name: "",
    owner_id: "",
    status: 'draft' as const
  });

  const [stepAssignments, setStepAssignments] = useState<Record<string, { assigned_to?: string; assigned_to_name?: string; due_date?: Date }>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInstance = () => {
    const newErrors: Record<string, string> = {};
    
    if (!instance.name.trim()) {
      newErrors.name = "Instance name is required";
    }
    
    if (!instance.owner_name) {
      newErrors.owner = "Owner is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateInstance()) {
      const workflowInstance: Omit<WorkflowInstance, 'id' | 'created_at' | 'updated_at'> = {
        template_id: template.id!,
        org_id: template.org_id,
        name: instance.name,
        status: instance.status,
        owner_id: instance.owner_id,
        owner_name: instance.owner_name,
        created_by: instance.owner_id
      };

      onSave(workflowInstance);
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before creating the workflow instance",
        variant: "destructive"
      });
    }
  };

  const updateStepAssignment = (stepNumber: number, updates: Partial<{ assigned_to: string; assigned_to_name: string; due_date: Date }>) => {
    setStepAssignments(prev => ({
      ...prev,
      [stepNumber]: { ...prev[stepNumber], ...updates }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create Workflow Instance</h2>
          <p className="text-muted-foreground">
            Create a new workflow instance from the "{template.name}" template
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Create Instance
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instance Details</CardTitle>
          <CardDescription>
            Configure the basic information for this workflow instance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instanceName">Instance Name *</Label>
              <Input
                id="instanceName"
                value={instance.name}
                onChange={(e) => setInstance(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter instance name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="owner">Workflow Owner *</Label>
              <Select
                value={instance.owner_name}
                onValueChange={(value) => setInstance(prev => ({ 
                  ...prev, 
                  owner_name: value,
                  owner_id: `user_${value.toLowerCase().replace(' ', '_')}`
                }))}
              >
                <SelectTrigger className={errors.owner ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.owner && <p className="text-sm text-red-500">{errors.owner}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Template: {template.name}
            </Badge>
            <Badge variant="secondary">
              Module: {template.module}
            </Badge>
            <Badge variant="outline">
              {template.steps?.length || 0} Steps
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step Assignments</CardTitle>
          <CardDescription>
            Assign team members and due dates for each workflow step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {template.steps?.map((step, index) => (
              <Card key={step.step_number || index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">
                        Step {step.step_number}: {step.step_name}
                      </h4>
                      {step.step_description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.step_description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      Role: {step.assigned_role}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Select
                        value={stepAssignments[step.step_number]?.assigned_to_name || ""}
                        onValueChange={(value) => updateStepAssignment(step.step_number, { 
                          assigned_to_name: value,
                          assigned_to: `user_${value.toLowerCase().replace(' ', '_')}`
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user} value={user}>
                              {user}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {stepAssignments[step.step_number]?.due_date ? (
                              format(stepAssignments[step.step_number].due_date!, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={stepAssignments[step.step_number]?.due_date}
                            onSelect={(date) => updateStepAssignment(step.step_number, { due_date: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  {step.estimated_duration_hours && (
                    <div className="mt-3">
                      <Badge variant="secondary">
                        Estimated: {step.estimated_duration_hours}h
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))} 
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowInstanceCreator;
