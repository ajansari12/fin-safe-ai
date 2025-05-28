
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Dependency, type DependencyInput } from "@/services/dependencies-service";

const DEPENDENCY_TYPES = [
  { value: 'vendor', label: 'Vendor' },
  { value: 'system', label: 'System' },
  { value: 'staff', label: 'Staff' },
  { value: 'data', label: 'Data' },
  { value: 'location', label: 'Location' }
] as const;

const CRITICALITY_LEVELS = [
  { value: 'critical', label: 'Critical', color: 'destructive' },
  { value: 'high', label: 'High', color: 'destructive' },
  { value: 'medium', label: 'Medium', color: 'default' },
  { value: 'low', label: 'Low', color: 'secondary' }
] as const;

const STATUS_OPTIONS = [
  { value: 'operational', label: 'Operational' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'failed', label: 'Failed' },
  { value: 'maintenance', label: 'Maintenance' }
] as const;

interface DependencyFormProps {
  dependency?: Dependency;
  businessFunctionId: string;
  onSubmit: (data: DependencyInput) => void;
  onCancel: () => void;
}

const DependencyForm: React.FC<DependencyFormProps> = ({
  dependency,
  businessFunctionId,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<DependencyInput>({
    business_function_id: businessFunctionId,
    dependency_type: dependency?.dependency_type || 'system',
    dependency_name: dependency?.dependency_name || '',
    dependency_id: dependency?.dependency_id || '',
    criticality: dependency?.criticality || 'medium',
    description: dependency?.description || '',
    status: dependency?.status || 'operational'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.dependency_name.trim()) {
      newErrors.dependency_name = 'Dependency name is required';
    }
    
    if (!formData.dependency_type) {
      newErrors.dependency_type = 'Dependency type is required';
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
        <Label htmlFor="dependency_name">Dependency Name *</Label>
        <Input
          id="dependency_name"
          value={formData.dependency_name}
          onChange={(e) => setFormData({ ...formData, dependency_name: e.target.value })}
          placeholder="e.g., AWS EC2, John Smith, Customer Database"
          className={errors.dependency_name ? 'border-red-500' : ''}
        />
        {errors.dependency_name && <p className="text-sm text-red-500">{errors.dependency_name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dependency_type">Dependency Type *</Label>
        <Select value={formData.dependency_type} onValueChange={(value: any) => setFormData({ ...formData, dependency_type: value })}>
          <SelectTrigger className={errors.dependency_type ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select dependency type" />
          </SelectTrigger>
          <SelectContent>
            {DEPENDENCY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.dependency_type && <p className="text-sm text-red-500">{errors.dependency_type}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dependency_id">External Reference ID</Label>
        <Input
          id="dependency_id"
          value={formData.dependency_id}
          onChange={(e) => setFormData({ ...formData, dependency_id: e.target.value })}
          placeholder="e.g., vendor ID, system ID"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="criticality">Criticality Level *</Label>
        <Select value={formData.criticality} onValueChange={(value: any) => setFormData({ ...formData, criticality: value })}>
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
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the dependency and its role"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {dependency ? 'Update' : 'Add'} Dependency
        </Button>
      </div>
    </form>
  );
};

export default DependencyForm;
