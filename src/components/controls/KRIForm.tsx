
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KRIDefinition, Control, getControls } from "@/services/controls-service";

interface KRIFormProps {
  kri?: KRIDefinition;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const KRIForm: React.FC<KRIFormProps> = ({
  kri,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [controls, setControls] = useState<Control[]>([]);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: kri || {
      name: '',
      description: '',
      control_id: '',
      threshold_id: '',
      measurement_frequency: '',
      warning_threshold: '',
      critical_threshold: '',
      target_value: '',
      status: 'active' as const
    }
  });

  const watchedControlId = watch('control_id');
  const watchedMeasurementFrequency = watch('measurement_frequency');
  const watchedStatus = watch('status');

  useEffect(() => {
    const loadControls = async () => {
      try {
        const controlsData = await getControls();
        setControls(controlsData);
      } catch (error) {
        console.error('Error loading controls:', error);
      }
    };

    loadControls();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{kri ? 'Edit KRI' : 'Create New KRI'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">KRI Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Enter KRI name"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {typeof errors.name.message === 'string' ? errors.name.message : 'Name is required'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="control_id">Associated Control</Label>
              <Select 
                value={watchedControlId} 
                onValueChange={(value) => setValue('control_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select control (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {controls.map((control) => (
                    <SelectItem key={control.id} value={control.id}>
                      {control.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="measurement_frequency">Measurement Frequency</Label>
              <Select 
                value={watchedMeasurementFrequency} 
                onValueChange={(value) => setValue('measurement_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={watchedStatus} 
                onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="target_value">Target Value</Label>
              <Input
                id="target_value"
                {...register('target_value')}
                placeholder="e.g., 95%"
              />
            </div>

            <div>
              <Label htmlFor="warning_threshold">Warning Threshold</Label>
              <Input
                id="warning_threshold"
                {...register('warning_threshold')}
                placeholder="e.g., 90%"
              />
            </div>

            <div>
              <Label htmlFor="critical_threshold">Critical Threshold</Label>
              <Input
                id="critical_threshold"
                {...register('critical_threshold')}
                placeholder="e.g., 85%"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="threshold_id">Threshold ID *</Label>
            <Input
              id="threshold_id"
              {...register('threshold_id', { required: 'Threshold ID is required' })}
              placeholder="Enter threshold identifier"
            />
            {errors.threshold_id && (
              <p className="text-sm text-destructive mt-1">
                {typeof errors.threshold_id.message === 'string' ? errors.threshold_id.message : 'Threshold ID is required'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter KRI description"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : kri ? 'Update KRI' : 'Create KRI'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default KRIForm;
