import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface TaskAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TaskFormData {
  title: string;
  description: string;
  assignedTo: string;
  priority: string;
  dueDate: string;
}

export const TaskAssignmentDialog: React.FC<TaskAssignmentDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TaskFormData>();
  const { toast } = useToast();
  
  const watchedPriority = watch('priority');

  const mockUsers = [
    { id: '1', name: 'John Smith', role: 'Risk Analyst' },
    { id: '2', name: 'Sarah Connor', role: 'Compliance Manager' },
    { id: '3', name: 'Mike Johnson', role: 'IT Security Lead' },
    { id: '4', name: 'Lisa Brown', role: 'Operations Manager' }
  ];

  const handleFormSubmit = (data: TaskFormData) => {
    console.log('Task assignment data:', data);
    // TODO: Implement task assignment logic
    
    toast({
      title: "Task Assigned",
      description: `Task "${data.title}" has been assigned successfully.`,
    });
    
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g. Review Q4 risk assessment report"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignedTo">Assign To *</Label>
              <Select onValueChange={(value) => setValue('assignedTo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select onValueChange={(value) => setValue('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Provide task details, requirements, and any relevant context..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Assign Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};