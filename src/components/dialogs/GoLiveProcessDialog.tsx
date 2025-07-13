import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  PlayCircle,
  Pause,
  RotateCcw,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoLiveProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GoLiveStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: string;
  error?: string;
}

export const GoLiveProcessDialog: React.FC<GoLiveProcessDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [processStatus, setProcessStatus] = useState<'idle' | 'running' | 'completed' | 'failed' | 'paused'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<GoLiveStep[]>([
    {
      id: '1',
      name: 'Pre-flight Validation',
      description: 'Validate system configuration and dependencies',
      status: 'pending'
    },
    {
      id: '2',
      name: 'Database Migration',
      description: 'Apply pending database migrations and schema updates',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Security Verification',
      description: 'Verify security configurations and access controls',
      status: 'pending'
    },
    {
      id: '4',
      name: 'Service Health Check',
      description: 'Validate all critical services are operational',
      status: 'pending'
    },
    {
      id: '5',
      name: 'User Access Test',
      description: 'Test user authentication and authorization flows',
      status: 'pending'
    },
    {
      id: '6',
      name: 'Final Verification',
      description: 'Complete end-to-end system verification',
      status: 'pending'
    }
  ]);
  const { toast } = useToast();

  const handleStartGoLive = async () => {
    setProcessStatus('running');
    setCurrentStep(0);
    setProgress(0);

    // Reset all steps to pending
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const })));

    // Simulate go-live process
    for (let i = 0; i < steps.length; i++) {
      if (processStatus === 'paused') break;

      setCurrentStep(i);
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'running' } : step
      ));

      // Simulate step execution time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate occasional failures for testing
      const shouldFail = Math.random() < 0.1 && i === 2; // 10% chance to fail on security step
      
      if (shouldFail) {
        setSteps(prev => prev.map((step, index) => 
          index === i ? { 
            ...step, 
            status: 'failed',
            error: 'Security configuration validation failed. Please check access control settings.'
          } : step
        ));
        setProcessStatus('failed');
        toast({
          title: "Go-Live Failed",
          description: "Security validation failed. Please review and retry.",
          variant: "destructive"
        });
        return;
      }

      setSteps(prev => prev.map((step, index) => 
        index === i ? { 
          ...step, 
          status: 'completed',
          duration: `${Math.floor(Math.random() * 30) + 10}s`
        } : step
      ));
      
      setProgress(((i + 1) / steps.length) * 100);
    }

    setProcessStatus('completed');
    toast({
      title: "Go-Live Successful!",
      description: "System is now live and operational. Monitoring initiated.",
    });
  };

  const handlePauseResume = () => {
    setProcessStatus(prev => prev === 'running' ? 'paused' : 'running');
  };

  const handleRollback = () => {
    setProcessStatus('idle');
    setCurrentStep(0);
    setProgress(0);
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const })));
    
    toast({
      title: "Rollback Initiated",
      description: "System has been rolled back to previous stable state.",
      variant: "destructive"
    });
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  const getStatusBadge = () => {
    switch (processStatus) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running': return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'paused': return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      default: return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Go-Live Process</DialogTitle>
            {getStatusBadge()}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {processStatus !== 'idle' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Step {currentStep + 1} of {steps.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {processStatus === 'idle' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will initiate the go-live process. Ensure all team members are ready and monitoring systems are active.
                The process typically takes 5-10 minutes and should not be interrupted unless critical issues are detected.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Go-Live Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${
                      index === currentStep && processStatus === 'running' 
                        ? 'border-primary bg-primary/5' 
                        : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{step.name}</h4>
                        {step.duration && (
                          <span className="text-xs text-muted-foreground">{step.duration}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.error && (
                        <Alert className="mt-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">{step.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            {processStatus === 'failed' && (
              <Button 
                variant="outline" 
                onClick={handleRollback}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Rollback
              </Button>
            )}
            {(processStatus === 'running' || processStatus === 'paused') && (
              <Button 
                variant="outline" 
                onClick={handlePauseResume}
                className="flex items-center gap-2"
              >
                {processStatus === 'running' ? <Pause className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                {processStatus === 'running' ? 'Pause' : 'Resume'}
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {processStatus === 'idle' && (
              <Button 
                onClick={handleStartGoLive}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Initiate Go-Live
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};