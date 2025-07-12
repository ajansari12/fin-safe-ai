import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Link, Archive } from "lucide-react";
import { getBusinessFunctions, createBusinessFunction, updateBusinessFunction, deleteBusinessFunction, type BusinessFunction, type BusinessFunctionInput } from "@/services/business-functions-service";

const CRITICALITY_LEVELS = [
  { value: 'critical', label: 'Critical', color: 'destructive' },
  { value: 'high', label: 'High', color: 'destructive' },
  { value: 'medium', label: 'Medium', color: 'default' },
  { value: 'low', label: 'Low', color: 'secondary' }
] as const;

const CATEGORIES = [
  'Finance',
  'Operations',
  'Technology',
  'Human Resources',
  'Customer Service',
  'Legal & Compliance',
  'Marketing',
  'Supply Chain'
] as const;

const BusinessFunctionForm = ({ 
  businessFunction, 
  onSubmit, 
  onCancel 
}: { 
  businessFunction?: BusinessFunction;
  onSubmit: (data: BusinessFunctionInput) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<BusinessFunctionInput>({
    name: businessFunction?.name || '',
    description: businessFunction?.description || '',
    owner: businessFunction?.owner || '',
    criticality: businessFunction?.criticality || 'medium',
    category: businessFunction?.category || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.criticality) {
      newErrors.criticality = 'Criticality level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Payment Processing"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the business function's purpose and scope"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner">Owner</Label>
        <Input
          id="owner"
          value={formData.owner}
          onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
          placeholder="e.g., John Smith, Finance Team"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="criticality">Criticality Level *</Label>
        <Select value={formData.criticality} onValueChange={(value) => setFormData({ ...formData, criticality: value })}>
          <SelectTrigger className={errors.criticality ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select criticality level" />
          </SelectTrigger>
          <SelectContent>
            {CRITICALITY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.criticality && <p className="text-sm text-red-500">{errors.criticality}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category || ''} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {businessFunction ? 'Update' : 'Create'} Function
        </Button>
      </div>
    </form>
  );
};

const BusinessFunctions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState<BusinessFunction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriticality, setFilterCriticality] = useState<string>('all');

  const { data: businessFunctions = [], isLoading } = useQuery({
    queryKey: ['businessFunctions'],
    queryFn: getBusinessFunctions,
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: createBusinessFunction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessFunctions'] });
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Business function created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create business function",
        variant: "destructive",
      });
      console.error('Create error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BusinessFunctionInput> }) => 
      updateBusinessFunction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessFunctions'] });
      setEditingFunction(null);
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Business function updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update business function",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBusinessFunction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessFunctions'] });
      toast({
        title: "Success",
        description: "Business function deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete business function",
        variant: "destructive",
      });
      console.error('Delete error:', error);
    }
  });

  const filteredFunctions = businessFunctions.filter(func => {
    const matchesSearch = func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         func.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         func.owner?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCriticality = filterCriticality === 'all' || func.criticality === filterCriticality;
    return matchesSearch && matchesCriticality;
  });

  const getCriticalityBadge = (criticality: string) => {
    const level = CRITICALITY_LEVELS.find(l => l.value === criticality);
    return (
      <Badge variant={level?.color as any || 'default'}>
        {level?.label || criticality}
      </Badge>
    );
  };

  const handleFormSubmit = (data: BusinessFunctionInput) => {
    if (editingFunction) {
      updateMutation.mutate({ id: editingFunction.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (businessFunction: BusinessFunction) => {
    setEditingFunction(businessFunction);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingFunction(null);
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Functions</h1>
            <p className="text-muted-foreground">
              Map and manage your organization's critical business functions and services.
            </p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingFunction(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Function
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingFunction ? 'Edit' : 'Create'} Business Function
                </DialogTitle>
                <DialogDescription>
                  {editingFunction ? 'Update' : 'Add a new'} critical business function for your organization.
                </DialogDescription>
              </DialogHeader>
              <BusinessFunctionForm
                businessFunction={editingFunction || undefined}
                onSubmit={handleFormSubmit}
                onCancel={closeForm}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Functions</CardTitle>
            <CardDescription>
              Manage your critical business functions and their configurations.
            </CardDescription>
            
            <div className="flex gap-4 pt-4">
              <div className="flex-1">
                <Input
                  placeholder="Search functions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterCriticality} onValueChange={setFilterCriticality}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by criticality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Criticalities</SelectItem>
                  {CRITICALITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredFunctions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm || filterCriticality !== 'all' ? 'No functions match your filters.' : 'No business functions defined yet.'}
                </p>
                {!searchTerm && filterCriticality === 'all' && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsFormOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Function
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Criticality</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFunctions.map((func) => (
                    <TableRow key={func.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{func.name}</div>
                          {func.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {func.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {func.category && (
                          <Badge variant="outline">{func.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{func.owner || '-'}</div>
                      </TableCell>
                      <TableCell>
                        {getCriticalityBadge(func.criticality)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/impact-tolerances?function=${func.id}`}>
                              <Link className="h-3 w-3" />
                              <span className="sr-only">Impact Tolerances</span>
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/dependencies?function=${func.id}`}>
                              <Link className="h-3 w-3" />
                              <span className="sr-only">Dependencies</span>
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/third-party-risk?function=${func.id}`}>
                              <Link className="h-3 w-3" />
                              <span className="sr-only">Third-Party Support</span>
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(func)}
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
                                <AlertDialogTitle>Delete Business Function</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{func.name}"? This action cannot be undone and will also remove associated impact tolerances and dependencies.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(func.id)}
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
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Critical Functions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessFunctions.filter(f => f.criticality === 'critical').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Functions requiring immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessFunctions.filter(f => f.criticality === 'high').length}
              </div>
              <p className="text-xs text-muted-foreground">
                High impact functions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Functions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessFunctions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                All defined business functions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default BusinessFunctions;
