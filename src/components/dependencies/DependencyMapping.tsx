
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, AlertTriangle, Server, Users, Database, MapPin, Building } from "lucide-react";
import { getDependencies, createDependency, updateDependency, deleteDependency, type Dependency } from "@/services/dependencies-service";
import { type BusinessFunction } from "@/services/business-functions-service";
import DependencyForm from "./DependencyForm";

const DEPENDENCY_ICONS = {
  vendor: Building,
  system: Server,
  staff: Users,
  data: Database,
  location: MapPin
};

const CRITICALITY_COLORS = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'default',
  low: 'secondary'
} as const;

const STATUS_COLORS = {
  operational: 'default',
  degraded: 'secondary',
  failed: 'destructive',
  maintenance: 'outline'
} as const;

interface DependencyMappingProps {
  businessFunction: BusinessFunction;
}

const DependencyMapping: React.FC<DependencyMappingProps> = ({ businessFunction }) => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDependency, setEditingDependency] = useState<Dependency | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');

  const { data: dependencies = [], isLoading } = useQuery({
    queryKey: ['dependencies', businessFunction.id],
    queryFn: () => getDependencies(businessFunction.id)
  });

  const createMutation = useMutation({
    mutationFn: createDependency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependencies'] });
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Dependency added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add dependency",
        variant: "destructive",
      });
      console.error('Create error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateDependency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependencies'] });
      setEditingDependency(null);
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Dependency updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update dependency",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDependency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependencies'] });
      toast({
        title: "Success",
        description: "Dependency deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete dependency",
        variant: "destructive",
      });
      console.error('Delete error:', error);
    }
  });

  const handleFormSubmit = (data: any) => {
    if (editingDependency) {
      updateMutation.mutate({ id: editingDependency.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (dependency: Dependency) => {
    setEditingDependency(dependency);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDependency(null);
  };

  const getCriticalityBadge = (criticality: string) => {
    return (
      <Badge variant={CRITICALITY_COLORS[criticality as keyof typeof CRITICALITY_COLORS]}>
        {criticality}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}>
        {status}
      </Badge>
    );
  };

  const groupedDependencies = dependencies.reduce((acc, dep) => {
    if (!acc[dep.dependency_type]) {
      acc[dep.dependency_type] = [];
    }
    acc[dep.dependency_type].push(dep);
    return acc;
  }, {} as Record<string, Dependency[]>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Dependencies for {businessFunction.name}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'table' ? 'matrix' : 'table')}
            >
              {viewMode === 'table' ? 'Matrix View' : 'Table View'}
            </Button>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingDependency(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Dependency
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingDependency ? 'Edit' : 'Add'} Dependency
                  </DialogTitle>
                  <DialogDescription>
                    {editingDependency ? 'Update' : 'Add a new'} dependency for this business function.
                  </DialogDescription>
                </DialogHeader>
                <DependencyForm
                  dependency={editingDependency || undefined}
                  businessFunctionId={businessFunction.id}
                  onSubmit={handleFormSubmit}
                  onCancel={closeForm}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
        <CardDescription>
          Map and monitor dependencies that support this critical business function.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {viewMode === 'table' ? (
          <div className="space-y-6">
            {Object.keys(groupedDependencies).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No dependencies mapped yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Dependency
                </Button>
              </div>
            ) : (
              Object.entries(groupedDependencies).map(([type, deps]) => {
                const Icon = DEPENDENCY_ICONS[type as keyof typeof DEPENDENCY_ICONS];
                return (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <h3 className="text-lg font-semibold capitalize">{type} Dependencies</h3>
                      <Badge variant="outline">{deps.length}</Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Reference ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Criticality</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deps.map((dep) => (
                          <TableRow key={dep.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{dep.dependency_name}</div>
                                {dep.description && (
                                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                                    {dep.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{dep.dependency_id || '-'}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(dep.status)}
                                {dep.status === 'failed' && (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getCriticalityBadge(dep.criticality)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(dep)}
                                >
                                  <Edit className="h-3 w-3" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-3 w-3" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Dependency</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{dep.dependency_name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(dep.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium">
              <div>Dependency Type</div>
              <div>Count</div>
              <div>Operational</div>
              <div>Degraded</div>
              <div>Failed</div>
              <div>Maintenance</div>
            </div>
            {Object.entries(DEPENDENCY_ICONS).map(([type, Icon]) => {
              const typeDeps = groupedDependencies[type] || [];
              const statusCounts = typeDeps.reduce((acc, dep) => {
                acc[dep.status] = (acc[dep.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              return (
                <div key={type} className="grid grid-cols-6 gap-4 items-center p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="capitalize">{type}</span>
                  </div>
                  <div>{typeDeps.length}</div>
                  <div>{statusCounts.operational || 0}</div>
                  <div>{statusCounts.degraded || 0}</div>
                  <div className={statusCounts.failed ? 'text-red-600 font-semibold' : ''}>
                    {statusCounts.failed || 0}
                  </div>
                  <div>{statusCounts.maintenance || 0}</div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DependencyMapping;
