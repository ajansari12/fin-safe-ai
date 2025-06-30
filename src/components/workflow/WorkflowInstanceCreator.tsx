
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X, User, Clock } from "lucide-react";
import { format, addHours } from "date-fns";
import { WorkflowTemplate, WorkflowInstance } from "@/services/workflow-service";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WorkflowInstanceCreatorProps {
  template: WorkflowTemplate;
  onSave: (instance: Omit<WorkflowInstance, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

interface StepAssignment {
  step_number: number;
  step_name: string;
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: Date;
}

const WorkflowInstanceCreator: React.FC<WorkflowInstanceCreatorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const [instanceName, setInstanceName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [stepAssignments, setStepAssignments] = useState<StepAssignment[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; full_name: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize step assignments from template
    const assignments: StepAssignment[] = template.steps.map((step, index) => ({
      step_number: step.step_number || index + 1,
      step_name: step.step_name,
      due_date: addHours(startDate, 24 + (index * 24))
    }));
    setStepAssignments(assignments);
  }, [template.steps, startDate]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .not('full_name', 'is', null)
        .order('full_name');

      if (error) {
        console.error('Error loading users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const updateStepAssignment = (stepNumber: number, updates: Partial<StepAssignment>) => {
    setStepAssignments(prev => 
      prev.map(assignment => 
        assignment.step_number === stepNumber 
          ? { ...assignment, ...updates }
          : assignment
      )
    );
  };

  const handleUserAssignment = (stepNumber: number, userId: string) => {
    const user = users.find(u => u.id === userId);
    updateStepAssignment(stepNumber, {
      assigned_to: userId,
      assigned_to_name: user?.full_name || ""
    });
  };

  const handleSave = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Validation Error",
        description: "Instance name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get current user's org_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, id, full_name')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User organization not found');
      }

      const instanceData: Omit<WorkflowInstance, 'id' | 'created_at' | 'updated_at'> = {
        template_id: template.id,
        org_id: profile.organization_id,
        name: instanceName,
        status: 'draft',
        priority: 'medium',
        owner_id: profile.id,
        owner_name: ownerName || profile.full_name || '',
        created_by: profile.id
      };

      onSave(instanceData);
    } catch (error) {
      console.error('Error creating instance:', error);
      toast({
        title: "Error",
        description: "Failed to create workflow instance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create Workflow Instance</h2>
          <p className="text-muted-foreground">
            Create a new instance from: {template.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Instance'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instance Details</CardTitle>
          <CardDescription>
            Configure the details for this workflow instance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instanceName">Instance Name *</Label>
              <Input
                id="instanceName"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="e.g., Q4 2024 Policy Review"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ownerName">Workflow Owner</Label>
              <Input
                id="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Owner name (optional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step Assignments & Schedule</CardTitle>
          <CardDescription>
            Assign users to each step and configure due dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stepAssignments.map((assignment) => (
              <Card key={assignment.step_number} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Badge variant="outline">
                      Step {assignment.step_number}
                    </Badge>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="font-medium">{assignment.step_name}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Assigned To
                          </Label>
                          <Select
                            value={assignment.assigned_to || ""}
                            onValueChange={(value) => handleUserAssignment(assignment.step_number, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Due Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {assignment.due_date ? 
                                  format(assignment.due_date, "PPP") : 
                                  <span>Pick a date</span>
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={assignment.due_date}
                                onSelect={(date) => updateStepAssignment(assignment.step_number, {
                                  due_date: date
                                })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
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
