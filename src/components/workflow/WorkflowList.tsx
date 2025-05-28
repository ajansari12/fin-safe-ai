
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, CheckSquare, Clock, User } from "lucide-react";
import { WorkflowInstance } from "@/services/workflow-service";

interface WorkflowListProps {
  workflows: WorkflowInstance[];
  title: string;
  description: string;
  onResumeWorkflow?: (workflow: WorkflowInstance) => void;
  loading?: boolean;
}

const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  title,
  description,
  onResumeWorkflow,
  loading
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading workflows...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {workflows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No workflows found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow Name</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-medium">{workflow.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {workflow.template?.module || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(workflow.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(workflow.status)}
                      {workflow.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {workflow.owner_name || 'Unassigned'}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(workflow.started_at)}</TableCell>
                  <TableCell>{formatDate(workflow.completed_at)}</TableCell>
                  <TableCell>
                    {workflow.status === 'in_progress' && onResumeWorkflow && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResumeWorkflow(workflow)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Resume
                      </Button>
                    )}
                    {workflow.status === 'draft' && onResumeWorkflow && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResumeWorkflow(workflow)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowList;
