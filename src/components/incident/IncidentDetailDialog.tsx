
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Incident } from "@/services/incident";
import IncidentDetailDialogHeader from "./IncidentDetailDialogHeader";
import IncidentDetailDialogContent from "./IncidentDetailDialogContent";

interface IncidentDetailDialogProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IncidentDetailDialog: React.FC<IncidentDetailDialogProps> = ({
  incident,
  open,
  onOpenChange,
}) => {
  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <IncidentDetailDialogHeader incident={incident} />
        <IncidentDetailDialogContent incident={incident} open={open} />
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDetailDialog;
