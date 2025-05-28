
import React from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BasicInfoSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  register,
  setValue,
  watch,
  errors
}) => {
  const watchedCriticality = watch('criticality');
  const watchedStatus = watch('status');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="vendor_name">Vendor Name *</Label>
        <Input
          id="vendor_name"
          {...register('vendor_name', { required: 'Vendor name is required' })}
          placeholder="Enter vendor name"
        />
        {errors.vendor_name && (
          <p className="text-sm text-destructive mt-1">
            {typeof errors.vendor_name.message === 'string' ? errors.vendor_name.message : 'Vendor name is required'}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="service_provided">Service Provided *</Label>
        <Input
          id="service_provided"
          {...register('service_provided', { required: 'Service description is required' })}
          placeholder="Describe the service provided"
        />
        {errors.service_provided && (
          <p className="text-sm text-destructive mt-1">
            {typeof errors.service_provided.message === 'string' ? errors.service_provided.message : 'Service description is required'}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="criticality">Criticality *</Label>
        <Select 
          value={watchedCriticality} 
          onValueChange={(value) => setValue('criticality', value as 'critical' | 'high' | 'medium' | 'low')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select criticality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select 
          value={watchedStatus} 
          onValueChange={(value) => setValue('status', value as 'active' | 'inactive' | 'under_review' | 'terminated')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BasicInfoSection;
