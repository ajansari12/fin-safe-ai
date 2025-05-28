
import React from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "@/services/controls";

interface KRIBasicInfoSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
  controls: Control[];
}

const KRIBasicInfoSection: React.FC<KRIBasicInfoSectionProps> = ({
  register,
  setValue,
  watch,
  errors,
  controls
}) => {
  const watchedControlId = watch('control_id');

  return (
    <>
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

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter KRI description"
          rows={3}
        />
      </div>
    </>
  );
};

export default KRIBasicInfoSection;
