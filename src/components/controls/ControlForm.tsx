import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Control } from "@/services/controls";

interface ControlFormProps {
  control?: Control;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ControlForm: React.FC<ControlFormProps> = ({
  control,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: control || {
      title: '',
      description: '',
      scope: '',
      frequency: '',
      owner: '',
      status: 'active' as const
    }
  });

  const watchedFrequency = watch('frequency');
  const watchedStatus = watch('status');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{control ? 'Edit Control' : 'Create New Control'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Control Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter control title"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {typeof errors.title.message === 'string' ? errors.title.message : 'Title is required'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="owner">Control Owner *</Label>
              <Input
                id="owner"
                {...register('owner', { required: 'Owner is required' })}
                placeholder="Enter control owner"
              />
              {errors.owner && (
                <p className="text-sm text-destructive mt-1">
                  {typeof errors.owner.message === 'string' ? errors.owner.message : 'Owner is required'}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scope">Scope *</Label>
              <Input
                id="scope"
                {...register('scope', { required: 'Scope is required' })}
                placeholder="Enter control scope"
              />
              {errors.scope && (
                <p className="text-sm text-destructive mt-1">
                  {typeof errors.scope.message === 'string' ? errors.scope.message : 'Scope is required'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="frequency">Frequency *</Label>
              <Select 
                value={watchedFrequency} 
                onValueChange={(value) => setValue('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={watchedStatus} 
              onValueChange={(value) => setValue('status', value as 'active' | 'inactive' | 'under_review')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter control description"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : control ? 'Update Control' : 'Create Control'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ControlForm;
