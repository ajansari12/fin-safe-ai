
import React, { useState, useEffect } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "@/services/controls";
import { getRiskAppetiteStatements } from "@/services/kri-definitions";

interface KRIBasicInfoSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
  controls: Control[];
}

interface RiskAppetiteStatement {
  id: string;
  title: string;
  status: string;
}

const KRIBasicInfoSection: React.FC<KRIBasicInfoSectionProps> = ({
  register,
  setValue,
  watch,
  errors,
  controls
}) => {
  const [riskAppetiteStatements, setRiskAppetiteStatements] = useState<RiskAppetiteStatement[]>([]);
  const watchedControlId = watch('control_id');
  const watchedRiskAppetiteId = watch('risk_appetite_statement_id');

  useEffect(() => {
    const loadRiskAppetiteStatements = async () => {
      try {
        const statements = await getRiskAppetiteStatements();
        setRiskAppetiteStatements(statements);
      } catch (error) {
        console.error('Error loading risk appetite statements:', error);
      }
    };

    loadRiskAppetiteStatements();
  }, []);

  return (
    <>
      <div>
        <Label htmlFor="name">KRI Name *</Label>
        <Input
          id="name"
          {...register('name', { required: 'KRI name is required' })}
          placeholder="Enter KRI name"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">
            {typeof errors.name.message === 'string' ? errors.name.message : 'KRI name is required'}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe this KRI"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="control_id">Associated Control</Label>
          <Select 
            value={watchedControlId} 
            onValueChange={(value) => setValue('control_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a control (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No control association</SelectItem>
              {controls.map((control) => (
                <SelectItem key={control.id} value={control.id}>
                  {control.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="risk_appetite_statement_id">Risk Appetite Statement</Label>
          <Select 
            value={watchedRiskAppetiteId} 
            onValueChange={(value) => setValue('risk_appetite_statement_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select risk appetite statement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No risk appetite link</SelectItem>
              {riskAppetiteStatements.map((statement) => (
                <SelectItem key={statement.id} value={statement.id}>
                  {statement.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default KRIBasicInfoSection;
