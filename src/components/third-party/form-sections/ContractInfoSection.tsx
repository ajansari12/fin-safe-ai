
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ContractInfoSectionProps {
  register: UseFormRegister<any>;
}

const ContractInfoSection: React.FC<ContractInfoSectionProps> = ({ register }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
};

export default ContractInfoSection;
