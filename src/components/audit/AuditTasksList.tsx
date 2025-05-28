
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Calendar, User, Clock } from "lucide-react";
import { format, isAfter } from "date-fns";
import { AuditTask } from "@/services/audit-service";

interface AuditTasksListProps {
  tasks: AuditTask[];
  onUpdateTask: (task: AuditTask) => void;
}

const AuditTasksList: React.FC<AuditTasksListProps> = ({ tasks, onUpdateTask }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string, dueDate: string) => {
    const isOverdue = isAfter(new Date(), new Date(dueDate)) && status !== 'completed';
    
    if (isOverdue) return 'bg-red-100 text-red-800';
    
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsCompleted = async (task: AuditTask) => {
    try {
      const { auditService } = await import("@/services/audit-service");
      await auditService.updateAuditTask(task.id, {
        status: 'completed',
        completion_date: new Date().toISOString().split('T')[0]
      });
      onUpdateTask(task);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const isOverdue = isAfter(new Date(), new Date(task.due_date)) && task.status !== 'completed';
        
        return (
          <Card key={task.id} className={isOverdue ? 'border-red-200' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{task.task_title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(task.status, task.due_date)}>
                        {isOverdue ? 'OVERDUE' : task.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {task.status !== 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => markAsCompleted(task)}
                    >
                      Mark Complete
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => onUpdateTask(task)}>
                    Update
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {task.task_description && (
                  <p className="text-sm">{task.task_description}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Due:</span>
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                      {format(new Date(task.due_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Assigned:</span>
                    <span>{task.assigned_to_name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span>{format(new Date(task.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                  {task.completion_date && (
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Completed:</span>
                      <span>{format(new Date(task.completion_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>

                {task.progress_notes && (
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Progress Notes:</span>
                    <p className="mt-1">{task.progress_notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {tasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No audit tasks created yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditTasksList;
