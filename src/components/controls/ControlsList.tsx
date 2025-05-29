
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus, TestTube, Calendar, History } from "lucide-react";
import { Control } from "@/services/controls";
import { format } from "date-fns";

interface ControlsListProps {
  controls: Control[];
  onEdit: (control: Control) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onTest: (control: Control) => void;
  onViewTests: (control: Control) => void;
  isLoading?: boolean;
}

const ControlsList: React.FC<ControlsListProps> = ({
  controls,
  onEdit,
  onDelete,
  onCreate,
  onTest,
  onViewTests,
  isLoading = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'under_review':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-red-100 text-red-800';
      case 'weekly':
        return 'bg-orange-100 text-orange-800';
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'quarterly':
        return 'bg-purple-100 text-purple-800';
      case 'annually':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isTestOverdue = (control: Control) => {
    if (!control.next_test_due_date) return false;
    return new Date(control.next_test_due_date) < new Date();
  };

  const getTestStatusBadge = (control: Control) => {
    if (!control.next_test_due_date) {
      return <Badge variant="outline">No tests scheduled</Badge>;
    }
    
    if (isTestOverdue(control)) {
      return <Badge className="bg-red-500 text-white">Overdue</Badge>;
    }
    
    const daysDiff = Math.ceil((new Date(control.next_test_due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) {
      return <Badge className="bg-yellow-500 text-white">Due Soon</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">On Track</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading controls...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Controls ({controls.length})</CardTitle>
        <Button onClick={onCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Control
        </Button>
      </CardHeader>
      <CardContent>
        {controls.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No controls found</p>
            <Button onClick={onCreate}>Create your first control</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Test Status</TableHead>
                <TableHead>Effectiveness</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controls.map((control) => (
                <TableRow key={control.id} className={isTestOverdue(control) ? "bg-red-50" : ""}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{control.title}</div>
                      {control.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {control.description.length > 100 
                            ? `${control.description.substring(0, 100)}...` 
                            : control.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{control.owner}</TableCell>
                  <TableCell>{control.scope}</TableCell>
                  <TableCell>
                    <Badge className={getFrequencyColor(control.frequency)}>
                      {control.frequency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(control.status)}>
                      {control.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getTestStatusBadge(control)}
                      {control.next_test_due_date && (
                        <div className="text-xs text-muted-foreground">
                          Due: {format(new Date(control.next_test_due_date), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {control.effectiveness_score ? (
                      <div className="flex items-center">
                        <span className="text-sm">{control.effectiveness_score}/5</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(control.effectiveness_score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not tested</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(control)}
                        title="Edit control"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTest(control)}
                        title="Test control"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewTests(control)}
                        title="View test history"
                        className="text-green-600 hover:text-green-700"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(control.id)}
                        title="Delete control"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default ControlsList;
