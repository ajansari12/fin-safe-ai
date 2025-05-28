
import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditTaskFormProps {
  orgId: string;
  findingId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  task_title: string;
  task_description: string;
  assigned_to_name: string;
  priority: string;
  due_date: string;
}

const AuditTaskForm: React.FC<AuditTaskFormProps> = ({
  orgId,
  findingId,
  onSuccess,
  onCancel
}) => {
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<FormData>();
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    try {
      const { auditService } = await import("@/services/audit-service");
      
      // Get current user for created_by fields
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      await auditService.createAuditTask({
        org_id: orgId,
        finding_id: findingId || null,
        task_title: data.task_title,
        task_description: data.task_description || null,
        assigned_to: null,
        assigned_to_name: data.assigned_to_name || null,
        priority: data.priority,
        due_date: data.due_date,
        completion_date: null,
        status: 'pending',
        progress_notes: null,
        created_by: user?.id || null,
        created_by_name: profile?.full_name || 'Unknown User'
      });

      toast({
        title: "Task created successfully",
        description: "Audit task has been created and assigned."
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: "There was an error creating the audit task. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Create Audit Task
        </CardTitle>
        <CardDescription>
          Create a task to track corrective actions and deadlines.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="task_title">Task Title</Label>
            <Input
              {...register("task_title", { required: true })}
              placeholder="Enter task title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="task_description">Task Description</Label>
            <Textarea
              {...register("task_description")}
              placeholder="Detailed description of the task..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="assigned_to_name">Assigned To</Label>
              <Input
                {...register("assigned_to_name")}
                placeholder="Person responsible"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={(value) => setValue("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                {...register("due_date", { required: true })}
                type="date"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuditTaskForm;
