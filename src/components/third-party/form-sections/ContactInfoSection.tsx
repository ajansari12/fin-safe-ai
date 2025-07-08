
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ContactInfoSectionProps {
  register: UseFormRegister<any>;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ register }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="contact_email">Contact Email</Label>
        <Input
          id="contact_email"
          type="email"
          {...register('contact_email')}
          placeholder="primary.contact@vendor.ca"
        />
      </div>

      <div>
        <Label htmlFor="contact_phone">Contact Phone</Label>
        <Input
          id="contact_phone"
          {...register('contact_phone')}
          placeholder="+1 (416) 555-0123"
        />
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          {...register('website')}
          placeholder="https://www.vendor.ca"
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
    </div>
  );
};

export default ContactInfoSection;
