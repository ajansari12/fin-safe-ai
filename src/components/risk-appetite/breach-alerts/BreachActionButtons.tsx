
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AppetiteBreachLog } from "@/services/appetite-breach-service";

interface BreachActionButtonsProps {
  breach: AppetiteBreachLog;
  onEscalate: (breachId: string, currentLevel: number) => void;
  onAcknowledge: (breachId: string) => void;
  onResolve: (breach: AppetiteBreachLog) => void;
}

const BreachActionButtons: React.FC<BreachActionButtonsProps> = ({
  breach,
  onEscalate,
  onAcknowledge,
  onResolve,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleResolve = () => {
    onResolve(breach);
    setResolutionNotes("");
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setResolutionNotes("");
    setIsDialogOpen(false);
  };

  return (
    <div className="flex gap-1">
      {breach.resolution_status === 'open' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAcknowledge(breach.id)}
        >
          Acknowledge
        </Button>
      )}
      
      {breach.resolution_status !== 'resolved' && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEscalate(breach.id, breach.escalation_level)}
          >
            Escalate
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                Resolve
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Resolve Breach</DialogTitle>
                <DialogDescription>
                  Add resolution notes and mark this breach as resolved.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Resolution notes..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleResolve}>
                    Resolve
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default BreachActionButtons;
