import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorProfile } from "@/services/third-party-service";

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

  const watchedCriticality = watch('criticality');
  const watchedStatus = watch('status');
  const watchedRiskRating = watch('risk_rating');

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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendor_name">Vendor Name *</Label>
              <Input
                id="vendor_name"
                {...register('vendor_name', { required: 'Vendor name is required' })}
                placeholder="Enter vendor name"
              />
              {errors.vendor_name && (
                <p className="text-sm text-destructive mt-1">{errors.vendor_name.message}</p>
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
                <p className="text-sm text-destructive mt-1">{errors.service_provided.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="criticality">Criticality *</Label>
              <Select 
                value={watchedCriticality} 
                onValueChange={(value) => setValue('criticality', value)}
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
                onValueChange={(value) => setValue('status', value)}
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

            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                {...register('contact_email')}
                placeholder="vendor@company.com"
              />
            </div>

            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                {...register('contact_phone')}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://vendor-website.com"
              />
            </div>

            <div>
              <Label htmlFor="annual_spend">Annual Spend ($)</Label>
              <Input
                id="annual_spend"
                type="number"
                step="0.01"
                {...register('annual_spend')}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="sla_expiry_date">SLA Expiry Date</Label>
              <Input
                id="sla_expiry_date"
                type="date"
                {...register('sla_expiry_date')}
              />
            </div>

            <div>
              <Label htmlFor="contract_start_date">Contract Start Date</Label>
              <Input
                id="contract_start_date"
                type="date"
                {...register('contract_start_date')}
              />
            </div>

            <div>
              <Label htmlFor="contract_end_date">Contract End Date</Label>
              <Input
                id="contract_end_date"
                type="date"
                {...register('contract_end_date')}
              />
            </div>

            <div>
              <Label htmlFor="risk_rating">Risk Rating</Label>
              <Select 
                value={watchedRiskRating} 
                onValueChange={(value) => setValue('risk_rating', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="last_assessment_date">Last Assessment Date</Label>
              <Input
                id="last_assessment_date"
                type="date"
                {...register('last_assessment_date')}
              />
            </div>

            <div>
              <Label htmlFor="next_assessment_date">Next Assessment Date</Label>
              <Input
                id="next_assessment_date"
                type="date"
                {...register('next_assessment_date')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter vendor address"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this vendor"
              rows={3}
            />
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
