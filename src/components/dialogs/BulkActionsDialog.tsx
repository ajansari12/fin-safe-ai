import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, AlertTriangle, Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BulkAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export const BulkActionsDialog: React.FC<BulkActionsDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleBulkAction = async (actionName: string, action: () => void) => {
    setIsProcessing(true);
    
    // Simulate bulk operation
    setTimeout(() => {
      setIsProcessing(false);
      action();
      
      toast({
        title: "Bulk Action Completed",
        description: `${actionName} has been completed successfully.`,
      });
    }, 2000);
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'acknowledge-alerts',
      title: 'Bulk Acknowledge Alerts',
      description: 'Acknowledge all selected alerts at once',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      action: () => console.log('Bulk acknowledging alerts')
    },
    {
      id: 'assign-incidents',
      title: 'Bulk Assign Incidents',
      description: 'Assign multiple incidents to team members',
      icon: <Users className="h-5 w-5 text-blue-500" />,
      action: () => console.log('Bulk assigning incidents')
    },
    {
      id: 'update-controls',
      title: 'Bulk Update Control Status',
      description: 'Update status for multiple controls',
      icon: <Settings className="h-5 w-5 text-purple-500" />,
      action: () => console.log('Bulk updating controls')
    },
    {
      id: 'escalate-alerts',
      title: 'Bulk Escalate Alerts',
      description: 'Escalate multiple high-priority alerts',
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
      action: () => console.log('Bulk escalating alerts')
    },
    {
      id: 'export-data',
      title: 'Export Selected Data',
      description: 'Export selected items to CSV/Excel',
      icon: <Download className="h-5 w-5 text-gray-500" />,
      action: () => console.log('Exporting selected data')
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk Operations</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a bulk operation to perform on multiple items at once. 
            These actions will be applied to all currently selected items.
          </p>

          {isProcessing && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>Processing bulk operation...</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {bulkActions.map((bulkAction) => (
              <Card 
                key={bulkAction.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => !isProcessing && handleBulkAction(bulkAction.title, bulkAction.action)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {bulkAction.icon}
                    <div>
                      <CardTitle className="text-base">{bulkAction.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {bulkAction.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};