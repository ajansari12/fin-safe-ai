import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  FileText, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Database,
  Users,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cleanupType: "sessions" | "logs" | "archive" | "purge";
}

export const DataCleanupDialog: React.FC<DataCleanupDialogProps> = ({
  open,
  onOpenChange,
  cleanupType,
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const cleanupConfigs = {
    sessions: {
      title: "Clean Old Sessions",
      description: "Remove inactive user sessions older than the configured retention period",
      icon: Users,
      estimatedItems: 1243,
      estimatedSpace: "45 MB",
      risk: "low",
      warning: "Users with expired sessions will need to re-authenticate",
    },
    logs: {
      title: "Archive Old Logs",
      description: "Move old system and audit logs to long-term storage",
      icon: FileText,
      estimatedItems: 8934,
      estimatedSpace: "2.3 GB",
      risk: "low",
      warning: "Archived logs will be moved to cold storage and retrieval may take longer",
    },
    archive: {
      title: "Archive Historical Data",
      description: "Archive old records according to retention policies",
      icon: Database,
      estimatedItems: 15678,
      estimatedSpace: "5.2 GB",
      risk: "medium",
      warning: "Archived data will not be immediately accessible and may require restoration",
    },
    purge: {
      title: "Purge Deleted Data",
      description: "Permanently remove data marked for deletion",
      icon: Trash2,
      estimatedItems: 456,
      estimatedSpace: "128 MB",
      risk: "high",
      warning: "This action is IRREVERSIBLE. Data will be permanently destroyed and cannot be recovered",
    }
  };

  const config = cleanupConfigs[cleanupType];

  const handleStartCleanup = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate cleanup process with progress updates
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgress(i);
      }

      toast({
        title: `${config.title} Complete`,
        description: `Successfully processed ${config.estimatedItems} items and freed ${config.estimatedSpace} of storage.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Cleanup Failed",
        description: "An error occurred during the cleanup process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge variant="default" className="bg-green-100 text-green-800">Low Risk</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium Risk</Badge>;
      case "high":
        return <Badge variant="destructive">High Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown Risk</Badge>;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <config.icon className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cleanup Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cleanup Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{config.estimatedItems.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Items to Process</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{config.estimatedSpace}</div>
                  <div className="text-sm text-muted-foreground">Storage to Free</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex justify-center mb-2">
                    {getRiskBadge(config.risk)}
                  </div>
                  <div className="text-sm text-muted-foreground">Risk Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Message */}
          <Alert>
            <AlertTriangle className={`h-4 w-4 ${getRiskColor(config.risk)}`} />
            <AlertDescription>
              <strong>Important:</strong> {config.warning}
            </AlertDescription>
          </Alert>

          {/* Progress Bar (shown during processing) */}
          {isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Processing Cleanup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing items...</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cleanup Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What Will Happen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cleanupType === "sessions" && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Inactive sessions older than 90 days will be removed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Active sessions will remain untouched</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Session cleanup logs will be generated</span>
                    </div>
                  </>
                )}
                
                {cleanupType === "logs" && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Logs older than 2 years will be archived</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Recent logs will remain in primary storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Archive metadata will be maintained for retrieval</span>
                    </div>
                  </>
                )}

                {cleanupType === "purge" && (
                  <>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>Data will be permanently deleted from all systems</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>Backup copies will also be removed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Audit trail of deletion will be maintained</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartCleanup} 
            disabled={isProcessing}
            variant={config.risk === "high" ? "destructive" : "default"}
          >
            {isProcessing ? "Processing..." : `Start ${config.title}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};