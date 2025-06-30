
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Search, Filter, Eye, Download, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { WorkflowInstance } from "@/services/workflow-service";

interface WorkflowHistoryProps {
  workflows: WorkflowInstance[];
  onViewWorkflow: (workflow: WorkflowInstance) => void;
  loading?: boolean;
}

const WorkflowHistory: React.FC<WorkflowHistoryProps> = ({
  workflows,
  onViewWorkflow,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowInstance[]>([]);

  useEffect(() => {
    let filtered = workflows.filter(workflow => workflow.status === 'completed');

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(workflow =>
        workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.template?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (workflow.owner_name && workflow.owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply module filter
    if (moduleFilter !== "all") {
      filtered = filtered.filter(workflow => workflow.template?.module === moduleFilter);
    }

    setFilteredWorkflows(filtered);
  }, [workflows, searchTerm, statusFilter, moduleFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateDuration = (workflow: WorkflowInstance) => {
    if (!workflow.started_at || !workflow.completed_at) return 'N/A';
    
    const start = new Date(workflow.started_at);
    const end = new Date(workflow.completed_at);
    const diffInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
  };

  const getCompletionRate = (workflow: WorkflowInstance) => {
    if (!workflow.steps || workflow.steps.length === 0) return 100;
    
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / workflow.steps.length) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow History</CardTitle>
          <CardDescription>Loading completed workflows...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading workflow history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workflow History</CardTitle>
            <CardDescription>
              View and analyze completed workflow instances
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-48">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="governance">Governance</SelectItem>
                <SelectItem value="incident">Incident Management</SelectItem>
                <SelectItem value="audit">Audit & Compliance</SelectItem>
                <SelectItem value="risk">Risk Management</SelectItem>
                <SelectItem value="third_party">Third Party Risk</SelectItem>
                <SelectItem value="business_continuity">Business Continuity</SelectItem>
                <SelectItem value="controls">Controls & KRIs</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredWorkflows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {workflows.filter(w => w.status === 'completed').length === 0 ? (
              <p>No completed workflows found.</p>
            ) : (
              <p>No workflows match your search criteria.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(workflow.status)}
                      <span className="font-medium">{workflow.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{workflow.template?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {workflow.template?.module || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{workflow.owner_name || 'Unassigned'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${getCompletionRate(workflow)}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {getCompletionRate(workflow)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{calculateDuration(workflow)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {workflow.completed_at ? 
                        format(new Date(workflow.completed_at), 'MMM d, yyyy') : 
                        'N/A'
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {workflow.completed_at ?
                        formatDistanceToNow(new Date(workflow.completed_at), { addSuffix: true }) :
                        ''
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewWorkflow(workflow)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
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

export default WorkflowHistory;
