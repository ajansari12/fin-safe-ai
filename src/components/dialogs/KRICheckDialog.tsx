import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KRICheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface KRICheckResult {
  id: string;
  name: string;
  currentValue: number;
  threshold: number;
  status: 'pass' | 'warning' | 'breach';
  lastChecked: string;
}

export const KRICheckDialog: React.FC<KRICheckDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<KRICheckResult[]>([]);
  const { toast } = useToast();

  const mockKRIResults: KRICheckResult[] = [
    {
      id: '1',
      name: 'Transaction Volume Variance',
      currentValue: 85,
      threshold: 90,
      status: 'pass',
      lastChecked: new Date().toLocaleString()
    },
    {
      id: '2',
      name: 'System Availability',
      currentValue: 97.5,
      threshold: 99,
      status: 'warning',
      lastChecked: new Date().toLocaleString()
    },
    {
      id: '3',
      name: 'Failed Login Attempts',
      currentValue: 125,
      threshold: 100,
      status: 'breach',
      lastChecked: new Date().toLocaleString()
    }
  ];

  const handleRunCheck = async () => {
    setIsRunning(true);
    
    // Simulate API call
    setTimeout(() => {
      setResults(mockKRIResults);
      setIsRunning(false);
      
      const breaches = mockKRIResults.filter(r => r.status === 'breach');
      const warnings = mockKRIResults.filter(r => r.status === 'warning');
      
      toast({
        title: "KRI Check Complete",
        description: `Found ${breaches.length} breaches and ${warnings.length} warnings`,
      });
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'breach': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass': return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'breach': return <Badge className="bg-red-100 text-red-800">Breach</Badge>;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KRI Validation Check</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Run real-time validation against all active KRI thresholds
            </p>
            <Button 
              onClick={handleRunCheck} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isRunning ? 'Running Check...' : 'Run KRI Check'}
            </Button>
          </div>

          {isRunning && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>Validating KRI thresholds...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && !isRunning && (
            <div className="space-y-3">
              <h3 className="font-medium">Validation Results</h3>
              {results.map((result) => (
                <Card key={result.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{result.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        {getStatusBadge(result.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Value:</span>
                        <p className="font-medium">{result.currentValue}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threshold:</span>
                        <p className="font-medium">{result.threshold}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Checked:</span>
                        <p className="font-medium">{result.lastChecked}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};