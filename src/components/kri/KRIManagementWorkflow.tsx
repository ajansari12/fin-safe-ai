import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useKRIOperations } from '@/hooks/useKRIOperations';
import { Plus, Edit, Trash2, AlertTriangle, Settings, BarChart3, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserProfile } from '@/lib/supabase-utils';

interface KRIDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  measurement_frequency: string;
  target_value: number;
  warning_threshold: number;
  critical_threshold: number;
  unit: string;
  data_source: string;
  calculation_method: string;
  is_automated: boolean;
  traffic_light_status: 'green' | 'amber' | 'red';
  alert_config: {
    email_alerts: boolean;
    dashboard_alerts: boolean;
    escalation_levels: string[];
  };
  data_quality_score: number;
  created_at: string;
  updated_at: string;
}

interface KRIFormData {
  name: string;
  description: string;
  category: string;
  measurement_frequency: string;
  target_value: string;
  warning_threshold: string;
  critical_threshold: string;
  unit: string;
  data_source: string;
  calculation_method: string;
  is_automated: boolean;
}

const initialFormData: KRIFormData = {
  name: '',
  description: '',
  category: '',
  measurement_frequency: 'monthly',
  target_value: '',
  warning_threshold: '',
  critical_threshold: '',
  unit: '',
  data_source: '',
  calculation_method: '',
  is_automated: false
};

export const KRIManagementWorkflow: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKRI, setEditingKRI] = useState<KRIDefinition | null>(null);
  const [formData, setFormData] = useState<KRIFormData>(initialFormData);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { handleCreateKRI, handleUpdateKRI, handleDeleteKRI, isSubmitting } = useKRIOperations();

  // Fetch KRI definitions
  const { data: kriDefinitions, isLoading } = useQuery({
    queryKey: ['kriDefinitions'],
    queryFn: async () => {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('kri_definitions')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as KRIDefinition[];
    }
  });

  // Create KRI mutation
  const createKRIMutation = useMutation({
    mutationFn: async (data: KRIFormData) => {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const kriData = {
        ...data,
        org_id: profile.organization_id,
        target_value: parseFloat(data.target_value) || 0,
        warning_threshold: parseFloat(data.warning_threshold) || 0,
        critical_threshold: parseFloat(data.critical_threshold) || 0,
        alert_config: {
          email_alerts: true,
          dashboard_alerts: true,
          escalation_levels: []
        },
        data_quality_score: 100,
        traffic_light_status: 'green'
      };

      const { data: result, error } = await supabase
        .from('kri_definitions')
        .insert(kriData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kriDefinitions'] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "KRI created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create KRI: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update KRI mutation
  const updateKRIMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: KRIFormData }) => {
      const updateData = {
        ...data,
        target_value: parseFloat(data.target_value) || 0,
        warning_threshold: parseFloat(data.warning_threshold) || 0,
        critical_threshold: parseFloat(data.critical_threshold) || 0,
      };

      const { data: result, error } = await supabase
        .from('kri_definitions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kriDefinitions'] });
      setIsDialogOpen(false);
      setEditingKRI(null);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "KRI updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update KRI: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete KRI mutation
  const deleteKRIMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('kri_definitions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kriDefinitions'] });
      toast({
        title: "Success",
        description: "KRI deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete KRI: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingKRI) {
      updateKRIMutation.mutate({ id: editingKRI.id, data: formData });
    } else {
      createKRIMutation.mutate(formData);
    }
  };

  const handleEdit = (kri: KRIDefinition) => {
    setEditingKRI(kri);
    setFormData({
      name: kri.name,
      description: kri.description,
      category: kri.category,
      measurement_frequency: kri.measurement_frequency,
      target_value: kri.target_value.toString(),
      warning_threshold: kri.warning_threshold.toString(),
      critical_threshold: kri.critical_threshold.toString(),
      unit: kri.unit,
      data_source: kri.data_source || '',
      calculation_method: kri.calculation_method || '',
      is_automated: kri.is_automated
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this KRI? This action cannot be undone.')) {
      deleteKRIMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'green':
        return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
      case 'amber':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'red':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KRI Management</h2>
          <p className="text-muted-foreground">Create and manage Key Risk Indicators</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingKRI(null);
              setFormData(initialFormData);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add KRI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingKRI ? 'Edit KRI' : 'Create New KRI'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">KRI Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Operational Loss Events"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational Risk</SelectItem>
                      <SelectItem value="credit">Credit Risk</SelectItem>
                      <SelectItem value="market">Market Risk</SelectItem>
                      <SelectItem value="liquidity">Liquidity Risk</SelectItem>
                      <SelectItem value="compliance">Compliance Risk</SelectItem>
                      <SelectItem value="technology">Technology Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this KRI measures and its significance"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_value">Target Value *</Label>
                  <Input
                    id="target_value"
                    type="number"
                    step="0.01"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warning_threshold">Warning Threshold *</Label>
                  <Input
                    id="warning_threshold"
                    type="number"
                    step="0.01"
                    value={formData.warning_threshold}
                    onChange={(e) => setFormData({ ...formData, warning_threshold: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="critical_threshold">Critical Threshold *</Label>
                  <Input
                    id="critical_threshold"
                    type="number"
                    step="0.01"
                    value={formData.critical_threshold}
                    onChange={(e) => setFormData({ ...formData, critical_threshold: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., %, events, hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="measurement_frequency">Measurement Frequency</Label>
                  <Select value={formData.measurement_frequency} onValueChange={(value) => setFormData({ ...formData, measurement_frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_source">Data Source</Label>
                  <Input
                    id="data_source"
                    value={formData.data_source}
                    onChange={(e) => setFormData({ ...formData, data_source: e.target.value })}
                    placeholder="e.g., Core Banking System"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calculation_method">Calculation Method</Label>
                  <Input
                    id="calculation_method"
                    value={formData.calculation_method}
                    onChange={(e) => setFormData({ ...formData, calculation_method: e.target.value })}
                    placeholder="e.g., Sum of loss events / Total transactions"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || createKRIMutation.isPending || updateKRIMutation.isPending}>
                  {editingKRI ? 'Update KRI' : 'Create KRI'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KRI List */}
      <div className="grid grid-cols-1 gap-4">
        {kriDefinitions?.map((kri) => (
          <Card key={kri.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <CardTitle className="text-lg">{kri.name}</CardTitle>
                  {getStatusBadge(kri.traffic_light_status)}
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(kri)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(kri.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{kri.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thresholds</p>
                  <p className="text-sm">
                    Target: {kri.target_value}{kri.unit} | 
                    Warning: {kri.warning_threshold}{kri.unit} | 
                    Critical: {kri.critical_threshold}{kri.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Frequency & Quality</p>
                  <p className="text-sm">
                    {kri.measurement_frequency} | Quality: {kri.data_quality_score}%
                  </p>
                </div>
              </div>
              {kri.data_source && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Data Source: {kri.data_source}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {kriDefinitions?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No KRIs Defined</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first Key Risk Indicator to monitor important risk metrics.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First KRI
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};