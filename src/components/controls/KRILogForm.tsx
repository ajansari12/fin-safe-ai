
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KRILog } from "@/services/kri-logs";

interface KRILogFormProps {
  kriId: string;
  kriName: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const KRILogForm: React.FC<KRILogFormProps> = ({
  kriId,
  kriName,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      kri_id: kriId,
      measurement_date: new Date().toISOString().split('T')[0],
      actual_value: '',
      threshold_breached: 'none',
      notes: ''
    }
  });

  const watchedThresholdBreached = watch('threshold_breached');

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      actual_value: parseFloat(data.actual_value),
      threshold_breached: data.threshold_breached === 'none' ? '' : data.threshold_breached
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log KRI Measurement - {kriName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="measurement_date">Measurement Date *</Label>
              <Input
                id="measurement_date"
                type="date"
                {...register('measurement_date', { required: 'Date is required' })}
              />
              {errors.measurement_date && (
                <p className="text-sm text-destructive mt-1">
                  {typeof errors.measurement_date.message === 'string' ? errors.measurement_date.message : 'Date is required'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="actual_value">Actual Value *</Label>
              <Input
                id="actual_value"
                type="number"
                step="0.01"
                {...register('actual_value', { required: 'Value is required' })}
                placeholder="Enter measured value"
              />
              {errors.actual_value && (
                <p className="text-sm text-destructive mt-1">
                  {typeof errors.actual_value.message === 'string' ? errors.actual_value.message : 'Value is required'}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="threshold_breached">Threshold Status</Label>
            <Select 
              value={watchedThresholdBreached} 
              onValueChange={(value) => setValue('threshold_breached', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select threshold status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No breach</SelectItem>
                <SelectItem value="warning">Warning threshold breached</SelectItem>
                <SelectItem value="critical">Critical threshold breached</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this measurement"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Log Measurement'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default KRILogForm;
