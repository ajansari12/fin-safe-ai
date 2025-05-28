
import React from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RiskAssessmentSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({
  register,
  setValue,
  watch
}) => {
  const watchedRiskRating = watch('risk_rating');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="risk_rating">Risk Rating</Label>
        <Select 
          value={watchedRiskRating || "not_set"} 
          onValueChange={(value) => setValue('risk_rating', value === "not_set" ? "" : value as 'low' | 'medium' | 'high' | 'critical')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select risk rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_set">Not assessed</SelectItem>
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
  );
};

export default RiskAssessmentSection;
