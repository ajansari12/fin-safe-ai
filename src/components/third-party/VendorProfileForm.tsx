
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorProfile } from "@/services/third-party-service";
import BasicInfoSection from "./form-sections/BasicInfoSection";
import ContactInfoSection from "./form-sections/ContactInfoSection";
import ContractInfoSection from "./form-sections/ContractInfoSection";
import RiskAssessmentSection from "./form-sections/RiskAssessmentSection";
import NotesSection from "./form-sections/NotesSection";

interface VendorProfileFormProps {
  vendor?: VendorProfile;
  onSubmit: (data: Partial<VendorProfile>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const VendorProfileForm: React.FC<VendorProfileFormProps> = ({
  vendor,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: vendor ? {
      vendor_name: vendor.vendor_name,
      service_provided: vendor.service_provided,
      criticality: vendor.criticality,
      contact_email: vendor.contact_email || '',
      contact_phone: vendor.contact_phone || '',
      website: vendor.website || '',
      address: vendor.address || '',
      sla_expiry_date: vendor.sla_expiry_date || '',
      contract_start_date: vendor.contract_start_date || '',
      contract_end_date: vendor.contract_end_date || '',
      annual_spend: vendor.annual_spend || 0,
      status: vendor.status,
      risk_rating: vendor.risk_rating || '',
      last_assessment_date: vendor.last_assessment_date || '',
      next_assessment_date: vendor.next_assessment_date || '',
      notes: vendor.notes || ''
    } : {
      criticality: 'medium' as const,
      status: 'active' as const,
      annual_spend: 0
    }
  });

  const handleFormSubmit = (data: any) => {
    const formattedData = {
      ...data,
      annual_spend: data.annual_spend ? Number(data.annual_spend) : undefined
    };
    onSubmit(formattedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{vendor ? 'Edit Vendor Profile' : 'Add New Vendor'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <BasicInfoSection
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
            <ContactInfoSection register={register} />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Contract Information</h3>
            <ContractInfoSection register={register} />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Risk Assessment</h3>
            <RiskAssessmentSection
              register={register}
              setValue={setValue}
              watch={watch}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Additional Information</h3>
            <NotesSection register={register} />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : vendor ? 'Update Vendor' : 'Add Vendor'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VendorProfileForm;
