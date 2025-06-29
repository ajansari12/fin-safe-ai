import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Shield, AlertTriangle, Target, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ToleranceDefinition {
  id: string;
  operationName: string;
  classification: 'critical' | 'high' | 'medium' | 'low';
  rto: number; // Recovery Time Objective in minutes
  rpo: number; // Recovery Point Objective in minutes
  serviceLevel: number; // Service level degradation threshold %
  customerImpact: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe';
  financialThreshold: number; // Financial impact threshold in CAD
  description: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  lastUpdated: string;
}

interface FormData {
  operationName: string;
  classification: 'critical' | 'high' | 'medium' | 'low';
  rto: number;
  rpo: number;
  serviceLevel: number;
  customerImpact: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe';
  financialThreshold: number;
  description: string;
}

const ToleranceDefinitions = () => {
  const [tolerances, setTolerances] = useState<ToleranceDefinition[]>([
    {
      id: '1',
      operationName: 'Core Banking System',
      classification: 'critical',
      rto: 60,
      rpo: 15,
      serviceLevel: 95,
      customerImpact: 'severe',
      financialThreshold: 1000000,
      description: 'Primary banking transaction processing system',
      status: 'active',
      createdAt: '2024-01-15',
      lastUpdated: '2024-01-20'
    },
    {
      id: '2',
      operationName: 'Online Banking Portal',
      classification: 'high',
      rto: 120,
      rpo: 30,
      serviceLevel: 90,
      customerImpact: 'significant',
      financialThreshold: 500000,
      description: 'Customer-facing online banking platform',
      status: 'active',
      createdAt: '2024-01-10',
      lastUpdated: '2024-01-18'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingTolerance, setEditingTolerance] = useState<ToleranceDefinition | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    operationName: '',
    classification: 'medium',
    rto: 240,
    rpo: 60,
    serviceLevel: 85,
    customerImpact: 'moderate',
    financialThreshold: 100000,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTolerance) {
      setTolerances(prev => prev.map(t => 
        t.id === editingTolerance.id 
          ? { ...t, ...formData, lastUpdated: new Date().toISOString().split('T')[0] }
          : t
      ));
      toast({
        title: "Tolerance Updated",
        description: "Tolerance definition has been updated successfully."
      });
    } else {
      const newTolerance: ToleranceDefinition = {
        id: Date.now().toString(),
        ...formData,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setTolerances(prev => [...prev, newTolerance]);
      toast({
        title: "Tolerance Created",
        description: "New tolerance definition has been created successfully."
      });
    }
    
    setShowForm(false);
    setEditingTolerance(null);
    setFormData({
      operationName: '',
      classification: 'medium',
      rto: 240,
      rpo: 60,
      serviceLevel: 85,
      customerImpact: 'moderate',
      financialThreshold: 100000,
      description: ''
    });
  };

  const handleEdit = (tolerance: ToleranceDefinition) => {
    setEditingTolerance(tolerance);
    setFormData({
      operationName: tolerance.operationName,
      classification: tolerance.classification,
      rto: tolerance.rto,
      rpo: tolerance.rpo,
      serviceLevel: tolerance.serviceLevel,
      customerImpact: tolerance.customerImpact,
      financialThreshold: tolerance.financialThreshold,
      description: tolerance.description
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setTolerances(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Tolerance Deleted",
      description: "Tolerance definition has been deleted successfully."
    });
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'severe': return 'bg-red-100 text-red-800';
      case 'significant': return 'bg-orange-100 text-orange-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'minimal': return 'bg-blue-100 text-blue-800';
      case 'none': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tolerance Definitions</h2>
          <p className="text-muted-foreground">Define tolerance levels for critical operations</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Tolerance Definition
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTolerance ? 'Edit' : 'Add'} Tolerance Definition</CardTitle>
            <CardDescription>
              Define acceptable disruption levels for critical operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operationName">Operation Name</Label>
                  <Input
                    id="operationName"
                    value={formData.operationName}
                    onChange={(e) => setFormData(prev => ({ ...prev, operationName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="classification">Classification</Label>
                  <Select value={formData.classification} onValueChange={(value: 'critical' | 'high' | 'medium' | 'low') => setFormData(prev => ({ ...prev, classification: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rto">RTO (Recovery Time - minutes)</Label>
                  <Input
                    id="rto"
                    type="number"
                    value={formData.rto}
                    onChange={(e) => setFormData(prev => ({ ...prev, rto: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rpo">RPO (Recovery Point - minutes)</Label>
                  <Input
                    id="rpo"
                    type="number"
                    value={formData.rpo}
                    onChange={(e) => setFormData(prev => ({ ...prev, rpo: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="serviceLevel">Service Level Threshold (%)</Label>
                  <Input
                    id="serviceLevel"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.serviceLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceLevel: parseInt(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerImpact">Customer Impact Level</Label>
                  <Select value={formData.customerImpact} onValueChange={(value: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe') => setFormData(prev => ({ ...prev, customerImpact: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="significant">Significant</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="financialThreshold">Financial Impact Threshold (CAD)</Label>
                  <Input
                    id="financialThreshold"
                    type="number"
                    value={formData.financialThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, financialThreshold: parseInt(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingTolerance ? 'Update' : 'Create'} Tolerance</Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingTolerance(null);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {tolerances.map((tolerance) => (
          <Card key={tolerance.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {tolerance.operationName}
                    <Badge className={getClassificationColor(tolerance.classification)}>
                      {tolerance.classification}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{tolerance.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(tolerance)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(tolerance.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">RTO</p>
                    <p className="text-sm text-muted-foreground">{tolerance.rto} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">RPO</p>
                    <p className="text-sm text-muted-foreground">{tolerance.rpo} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Service Level</p>
                    <p className="text-sm text-muted-foreground">{tolerance.serviceLevel}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Customer Impact</p>
                  <Badge className={getImpactColor(tolerance.customerImpact)}>
                    {tolerance.customerImpact}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm">
                  <span className="font-medium">Financial Threshold:</span> ${tolerance.financialThreshold.toLocaleString()} CAD
                </p>
                <p className="text-sm text-muted-foreground">
                  Last updated: {tolerance.lastUpdated}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ToleranceDefinitions;
