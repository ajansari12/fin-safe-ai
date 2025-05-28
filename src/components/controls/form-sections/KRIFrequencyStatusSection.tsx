
import React from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface KRIFrequencyStatusSectionProps {
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

const KRIFrequencyStatusSection: React.FC<KRIFrequencyStatusSectionProps> = ({
  setValue,
  watch
}) => {
  const watchedMeasurementFrequency = watch('measurement_frequency');
  const watchedStatus = watch('status');

  return (
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
  );
};

export default KRIFrequencyStatusSection;
