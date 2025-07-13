import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  FileText, 
  Database,
  Users,
  Shield,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeUserData: true,
    includeAuditLogs: false,
    includeDocuments: true,
    includeConfigurations: true,
    anonymizeData: true,
    compressOutput: true
  });
  const { toast } = useToast();

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
    setIsExporting(true);
    setProgress(0);

    // Simulate export process
    const steps = [
      'Preparing export query...',
      'Collecting data records...',
      'Processing user information...',
      'Applying data filters...',
      'Generating export file...',
      'Finalizing export...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Create mock export file
    const exportData = {
      exportType,
      timestamp: new Date().toISOString(),
      options: exportOptions,
      metadata: {
        recordCount: Math.floor(Math.random() * 10000) + 1000,
        dataSize: config.estimatedSize,
        exportedBy: 'Current User',
        version: '1.0'
      },
      data: {
        message: 'This is a mock export file. In production, this would contain the actual data.'
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
    
    toast({
      title: "Export Completed",
      description: `${config.title} has been downloaded successfully.`,
    });

    onOpenChange(false);
  };

  const updateOption = (key: keyof ExportOptions, value: boolean) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {config.description}. Ensure you have proper authorization and follow data protection protocols.
            </AlertDescription>
          </Alert>

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
                  <p className="text-center text-sm text-muted-foreground">
                    {Math.round(progress)}% Complete
                  </p>
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
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Start Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};