
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  register: UseFormRegister<any>;
}

const NotesSection: React.FC<NotesSectionProps> = ({ register }) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default NotesSection;
