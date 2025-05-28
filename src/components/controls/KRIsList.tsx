
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus, TrendingUp } from "lucide-react";
import { KRIDefinition } from "@/services/controls-service";

interface KRIsListProps {
  kris: KRIDefinition[];
  onEdit: (kri: KRIDefinition) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onViewLogs: (kriId: string) => void;
  isLoading?: boolean;
}

const KRIsList: React.FC<KRIsListProps> = ({
  kris,
  onEdit,
  onDelete,
  onCreate,
  onViewLogs,
  isLoading = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Risk Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading KRIs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Key Risk Indicators ({kris.length})</CardTitle>
        <Button onClick={onCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add KRI
        </Button>
      </CardHeader>
      <CardContent>
        {kris.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No KRIs found</p>
            <Button onClick={onCreate}>Create your first KRI</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Thresholds</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kris.map((kri) => (
                <TableRow key={kri.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{kri.name}</div>
                      {kri.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {kri.description.length > 80 
                            ? `${kri.description.substring(0, 80)}...` 
                            : kri.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {kri.measurement_frequency ? (
                      <Badge variant="outline">{kri.measurement_frequency}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {kri.target_value && (
                        <div className="text-sm">Target: {kri.target_value}</div>
                      )}
                      {kri.warning_threshold && (
                        <div className="text-sm text-yellow-600">Warning: {kri.warning_threshold}</div>
                      )}
                      {kri.critical_threshold && (
                        <div className="text-sm text-red-600">Critical: {kri.critical_threshold}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(kri.status)}>
                      {kri.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewLogs(kri.id)}
                        title="View measurement logs"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(kri)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(kri.id)}
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

export default KRIsList;
