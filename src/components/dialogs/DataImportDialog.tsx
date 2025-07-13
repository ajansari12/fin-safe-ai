import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileText, 
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  File
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importType: 'json' | 'csv';
}

interface ImportResult {
  recordsProcessed: number;
  recordsImported: number;
  recordsSkipped: number;
  errors: string[];
}

export const DataImportDialog: React.FC<DataImportDialogProps> = ({
  open,
  onOpenChange,
  importType
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const importTypeConfig = {
    json: {
      title: 'Import JSON Data',
      description: 'Import organizational data from JSON files',
      icon: <FileText className="h-5 w-5" />,
      acceptedFiles: '.json',
      maxSize: '100 MB'
    },
    csv: {
      title: 'Import CSV Files',
      description: 'Import data from CSV files with automatic mapping',
      icon: <Database className="h-5 w-5" />,
      acceptedFiles: '.csv',
      maxSize: '50 MB'
    }
  };

  const config = importTypeConfig[importType];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setProgress(0);
    setImportResult(null);

    // Simulate import process
    const steps = [
      'Validating file format...',
      'Reading file contents...',
      'Validating data structure...',
      'Processing records...',
      'Importing to database...',
      'Finalizing import...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Generate mock import results
    const mockResult: ImportResult = {
      recordsProcessed: Math.floor(Math.random() * 1000) + 100,
      recordsImported: Math.floor(Math.random() * 900) + 90,
      recordsSkipped: Math.floor(Math.random() * 10),
      errors: Math.random() > 0.7 ? [
        'Row 45: Invalid email format for user record',
        'Row 123: Missing required field "organization_id"'
      ] : []
    };

    setImportResult(mockResult);
    setIsImporting(false);
    
    if (mockResult.errors.length === 0) {
      toast({
        title: "Import Completed Successfully",
        description: `Imported ${mockResult.recordsImported} records without errors.`,
      });
    } else {
      toast({
        title: "Import Completed with Warnings",
        description: `Imported ${mockResult.recordsImported} records with ${mockResult.errors.length} errors.`,
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setImportResult(null);
    setProgress(0);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {config.description}. Data imports will add new records or update existing ones. Ensure you have a backup before proceeding.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">File Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Accepted Files:</span>
                  <p className="font-medium">{config.acceptedFiles}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Maximum Size:</span>
                  <p className="font-medium">{config.maxSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={config.acceptedFiles}
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm font-medium">
                      Click to select a file or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.acceptedFiles} files up to {config.maxSize}
                    </p>
                  </label>
                </div>

                {selectedFile && (
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <File className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isImporting && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span>Processing import...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground">
                    {Math.round(progress)}% Complete
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {importResult.errors.length === 0 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Import Successful
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Import Completed with Warnings
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Processed:</span>
                    <p className="font-medium">{importResult.recordsProcessed}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Imported:</span>
                    <p className="font-medium text-green-600">{importResult.recordsImported}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Skipped:</span>
                    <p className="font-medium text-yellow-600">{importResult.recordsSkipped}</p>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Errors Found:</h4>
                    <div className="space-y-1">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          <span className="text-red-600">{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isImporting}
          >
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button 
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Start Import'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};