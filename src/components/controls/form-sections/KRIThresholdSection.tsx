
import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface KRIThresholdSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

const KRIThresholdSection: React.FC<KRIThresholdSectionProps> = ({
  register,
  errors
}) => {
  return (
    <>
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
    </>
  );
};

export default KRIThresholdSection;
