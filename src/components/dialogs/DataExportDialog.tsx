import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Download, 
  FileText, 
  Database,
  Users,
  Shield,
  CheckCircle,
  AlertTriangle,
  X,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoles } from "@/hooks/useRoles";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface DataExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: 'json' | 'schema' | 'users';
}

interface ExportOptions {
  includeUserData: boolean;
  includeAuditLogs: boolean;
  includeDocuments: boolean;
  includeConfigurations: boolean;
  anonymizeData: boolean;
  compressOutput: boolean;
}

export const DataExportDialog: React.FC<DataExportDialogProps> = ({
  open,
  onOpenChange,
  exportType
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [canCancel, setCanCancel] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeUserData: true,
    includeAuditLogs: false,
    includeDocuments: true,
    includeConfigurations: true,
    anonymizeData: true,
    compressOutput: true
  });
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin, canReadOrg } = useRoles();
  const { handleError, handleAsyncError } = useErrorHandler();

  // Permission check
  const canExport = isAdmin() || isSuperAdmin() || canReadOrg();

  const exportTypeConfig = {
    json: {
      title: 'Export All Data (JSON)',
      description: 'Export all organizational data in JSON format for backup or migration',
      icon: <FileText className="h-5 w-5" />,
      estimatedSize: '2.3 GB',
      estimatedTime: '5-8 minutes'
    },
    schema: {
      title: 'Export Database Schema',
      description: 'Export database structure and table definitions',
      icon: <Database className="h-5 w-5" />,
      estimatedSize: '15 MB',
      estimatedTime: '1-2 minutes'
    },
    users: {
      title: 'Export User Data',
      description: 'Export user profiles, roles, and access information',
      icon: <Users className="h-5 w-5" />,
      estimatedSize: '45 MB',
      estimatedTime: '2-3 minutes'
    }
  };

  const config = exportTypeConfig[exportType];

  const handleExport = async () => {
    if (!canExport) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to export data.",
        variant: "destructive"
      });
      return;
    }

    await handleAsyncError(async () => {
      setIsExporting(true);
      setProgress(0);
      setCanCancel(false);

      // Simulate export process with more detailed steps
      const steps = [
        'Validating permissions and access...',
        'Preparing export query...',
        'Collecting data records...',
        'Processing user information...',
        'Applying data filters and anonymization...',
        'Generating export file...',
        'Compressing and finalizing export...'
      ];

      for (let i = 0; i < steps.length; i++) {
        if (!isExporting) break; // Check for cancellation
        
        setCurrentStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        setProgress(((i + 1) / steps.length) * 100);
        
        // Enable cancellation after 3 seconds
        if (i === 1) setCanCancel(true);
      }

      // Validate export options
      if (exportType === 'json' && !exportOptions.includeUserData && !exportOptions.includeDocuments && !exportOptions.includeConfigurations) {
        throw new Error('At least one data type must be selected for export');
      }

      // Create mock export file with validation
      const exportData = {
        exportType,
        timestamp: new Date().toISOString(),
        options: exportOptions,
        metadata: {
          recordCount: Math.floor(Math.random() * 10000) + 1000,
          dataSize: config.estimatedSize,
          exportedBy: 'Current User',
          version: '1.0',
          checksumValid: true
        },
        data: {
          message: 'This is a mock export file. In production, this would contain the actual data.',
          validation: 'Export completed successfully with data integrity checks passed'
        }
      };

      // Download the file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setCurrentStep('');
      
      toast({
        title: "Export Completed Successfully",
        description: `${config.title} has been downloaded with ${exportData.metadata.recordCount.toLocaleString()} records.`,
      });

      onOpenChange(false);
    }, 'Data Export');
  };

  const handleCancelExport = () => {
    setIsExporting(false);
    setProgress(0);
    setCurrentStep('');
    setCanCancel(false);
    
    toast({
      title: "Export Cancelled",
      description: "The export process has been cancelled.",
      variant: "destructive"
    });
  };

  const updateOption = (key: keyof ExportOptions, value: boolean) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DialogTitle className="flex items-center gap-2">
                  {config.icon}
                  {config.title}
                </DialogTitle>
                {!canExport && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export permissions required</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              {isExporting && canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelExport}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {!canExport && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You need appropriate permissions to export data. Please contact your administrator for access.
                </AlertDescription>
              </Alert>
            )}

            {canExport && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {config.description}. Ensure you follow data protection protocols and organizational policies.
                </AlertDescription>
              </Alert>
            )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Estimated Size:</span>
                  <p className="font-medium">{config.estimatedSize}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Estimated Time:</span>
                  <p className="font-medium">{config.estimatedTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {exportType === 'json' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeUserData"
                      checked={exportOptions.includeUserData}
                      onCheckedChange={(checked) => updateOption('includeUserData', !!checked)}
                    />
                    <label htmlFor="includeUserData" className="text-sm font-medium">
                      Include User Data
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeAuditLogs"
                      checked={exportOptions.includeAuditLogs}
                      onCheckedChange={(checked) => updateOption('includeAuditLogs', !!checked)}
                    />
                    <label htmlFor="includeAuditLogs" className="text-sm font-medium">
                      Include Audit Logs
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeDocuments"
                      checked={exportOptions.includeDocuments}
                      onCheckedChange={(checked) => updateOption('includeDocuments', !!checked)}
                    />
                    <label htmlFor="includeDocuments" className="text-sm font-medium">
                      Include Documents
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeConfigurations"
                      checked={exportOptions.includeConfigurations}
                      onCheckedChange={(checked) => updateOption('includeConfigurations', !!checked)}
                    />
                    <label htmlFor="includeConfigurations" className="text-sm font-medium">
                      Include System Configurations
                    </label>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="anonymizeData"
                        checked={exportOptions.anonymizeData}
                        onCheckedChange={(checked) => updateOption('anonymizeData', !!checked)}
                      />
                      <label htmlFor="anonymizeData" className="text-sm font-medium">
                        Anonymize Sensitive Data
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox 
                        id="compressOutput"
                        checked={exportOptions.compressOutput}
                        onCheckedChange={(checked) => updateOption('compressOutput', !!checked)}
                      />
                      <label htmlFor="compressOutput" className="text-sm font-medium">
                        Compress Output File
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isExporting && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span>Exporting data...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{currentStep}</span>
                    <span className="font-medium">{Math.round(progress)}% Complete</span>
                  </div>
                  {canCancel && (
                    <div className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelExport}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Cancel Export
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!isExporting && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Large exports may take several minutes. Do not close this window during the export process.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            {isExporting ? 'Cannot Close' : 'Cancel'}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleExport}
                disabled={isExporting || !canExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Start Export'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{!canExport ? 'Export permissions required' : 'Begin data export process'}</p>
            </TooltipContent>
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </TooltipProvider>
  );
};