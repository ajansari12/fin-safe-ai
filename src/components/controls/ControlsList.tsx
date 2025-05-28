import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus } from "lucide-react";
import { Control } from "@/services/controls";

interface ControlsListProps {
  controls: Control[];
  onEdit: (control: Control) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  isLoading?: boolean;
}

const ControlsList: React.FC<ControlsListProps> = ({
  controls,
  onEdit,
  onDelete,
  onCreate,
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controls.map((control) => (
                <TableRow key={control.id}>
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(control)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(control.id)}
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
