
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KRIDefinition } from "@/services/kri-definitions";
import { Control, getControls } from "@/services/controls";
import KRIBasicInfoSection from "./form-sections/KRIBasicInfoSection";
import KRIFrequencyStatusSection from "./form-sections/KRIFrequencyStatusSection";
import KRIThresholdSection from "./form-sections/KRIThresholdSection";

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
          <KRIBasicInfoSection
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
            controls={controls}
          />

          <KRIFrequencyStatusSection
            setValue={setValue}
            watch={watch}
          />

          <KRIThresholdSection
            register={register}
            errors={errors}
          />

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
