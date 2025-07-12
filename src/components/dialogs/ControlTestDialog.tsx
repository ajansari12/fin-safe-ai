import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ControlForm from "@/components/controls/ControlForm";

interface ControlTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ControlTestDialog: React.FC<ControlTestDialogProps> = ({
  open,
  onOpenChange
}) => {
  const handleSubmit = (data: any) => {
    console.log('Control test data:', data);
    // TODO: Implement control testing logic
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Control Testing</DialogTitle>
        </DialogHeader>
        
        <ControlForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};