
import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkflowInstance } from '@/services/workflow-service';
import VirtualTable from '@/components/ui/virtual-table';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface OptimizedWorkflowListProps {
  workflows: WorkflowInstance[];
  title: string;
  description: string;
  onResumeWorkflow?: (workflow: WorkflowInstance) => void;
  loading?: boolean;
}

const OptimizedWorkflowList: React.FC<OptimizedWorkflowListProps> = memo(({
  workflows,
  title,
  description,
  onResumeWorkflow,
  loading
}) => {
  const { getAverageRenderTime } = usePerformanceMonitor('OptimizedWorkflowList');

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Workflow Name',
      width: 300,
      render: (workflow: WorkflowInstance) => (
        <div className="flex items-center gap-2">
          {workflow.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
          {workflow.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-600" />}
          {workflow.status === 'draft' && <AlertCircle className="h-4 w-4 text-gray-600" />}
          <span className="font-medium">{workflow.name}</span>
        </div>
      )
    },
    {
      key: 'template',
      header: 'Template',
      width: 200,
      render: (workflow: WorkflowInstance) => workflow.template?.name || 'Unknown'
    },
    {
      key: 'status',
      header: 'Status',
      width: 120,
      render: (workflow: WorkflowInstance) => (
        <Badge variant={
          workflow.status === 'completed' ? 'default' :
          workflow.status === 'in_progress' ? 'secondary' :
          'outline'
        }>
          {workflow.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      width: 100,
      render: (workflow: WorkflowInstance) => (
        <Badge variant={
          workflow.priority === 'critical' ? 'destructive' :
          workflow.priority === 'high' ? 'secondary' :
          'outline'
        }>
          {workflow.priority}
        </Badge>
      )
    },
    {
      key: 'owner',
      header: 'Owner',
      width: 150,
      render: (workflow: WorkflowInstance) => workflow.owner_name || 'Unassigned'
    },
    {
      key: 'created',
      header: 'Created',
      width: 120,
      render: (workflow: WorkflowInstance) => format(new Date(workflow.created_at), 'MMM d, yyyy')
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 100,
      render: (workflow: WorkflowInstance) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onResumeWorkflow?.(workflow)}
        >
          <Play className="h-3 w-3 mr-1" />
          {workflow.status === 'draft' ? 'Start' : 'View'}
        </Button>
      )
    }
  ], [onResumeWorkflow]);

  const memoizedWorkflows = useMemo(() => workflows, [workflows]);

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
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm text-muted-foreground">
            {workflows.length} workflows • Avg render: {getAverageRenderTime().toFixed(2)}ms
          </span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {workflows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No workflows found.</p>
          </div>
        ) : (
          <VirtualTable
            data={memoizedWorkflows}
            columns={columns}
            height={400}
            rowHeight={60}
            onRowClick={onResumeWorkflow}
          />
        )}
      </CardContent>
    </Card>
  );
});

OptimizedWorkflowList.displayName = 'OptimizedWorkflowList';

export default OptimizedWorkflowList;
