import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  PlayCircle,
  Pause,
  RotateCcw,
  Zap,
  RefreshCw,
  Shield,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoles } from "@/hooks/useRoles";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useOperationMonitor } from "@/hooks/useOperationMonitor";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";

interface GoLiveProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GoLiveStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  duration?: string;
  error?: string;
  retryCount?: number;
  canRetry?: boolean;
}

export const GoLiveProcessDialog: React.FC<GoLiveProcessDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [processStatus, setProcessStatus] = useState<'idle' | 'running' | 'completed' | 'failed' | 'paused'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [canCancel, setCanCancel] = useState(false);
  
  // Performance monitoring
  const operationMonitor = useOperationMonitor({
    operationType: 'go_live_process',
    operationId: `go-live-${Date.now()}`,
    trackMemory: true,
    trackNetwork: true,
    realTimeUpdates: true,
    reportingInterval: 500
  });

  // Real-time updates
  const realTimeUpdates = useRealTimeUpdates({
    channel: 'go-live-process',
    eventTypes: ['step_update', 'progress_update', 'status_change']
  }, (event) => {
    if (event.eventType === 'progress_update') {
      setProgress(event.payload.progress);
      operationMonitor.updateProgress(event.payload.progress, event.payload.currentStep);
    }
  });
  const [steps, setSteps] = useState<GoLiveStep[]>([
    {
      id: '1',
      name: 'Pre-flight Validation',
      description: 'Validate system configuration and dependencies',
      status: 'pending',
      canRetry: true,
      retryCount: 0
    },
    {
      id: '2',
      name: 'Database Migration',
      description: 'Apply pending database migrations and schema updates',
      status: 'pending',
      canRetry: false,
      retryCount: 0
    },
    {
      id: '3',
      name: 'Security Verification',
      description: 'Verify security configurations and access controls',
      status: 'pending',
      canRetry: true,
      retryCount: 0
    },
    {
      id: '4',
      name: 'Service Health Check',
      description: 'Validate all critical services are operational',
      status: 'pending',
      canRetry: true,
      retryCount: 0
    },
    {
      id: '5',
      name: 'User Access Test',
      description: 'Test user authentication and authorization flows',
      status: 'pending',
      canRetry: true,
      retryCount: 0
    },
    {
      id: '6',
      name: 'Final Verification',
      description: 'Complete end-to-end system verification',
      status: 'pending',
      canRetry: false,
      retryCount: 0
    }
  ]);
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin } = useRoles();
  const { handleError, handleAsyncError } = useErrorHandler();

  // Permission check
  const canInitiateGoLive = isAdmin() || isSuperAdmin();

  // Auto-enable cancellation after process starts
  useEffect(() => {
    if (processStatus === 'running') {
      const timer = setTimeout(() => setCanCancel(true), 10000); // Allow cancel after 10s
      return () => clearTimeout(timer);
    }
  }, [processStatus]);

  const handleStartGoLive = async () => {
    if (!canInitiateGoLive) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to initiate go-live process.",
        variant: "destructive"
      });
      return;
    }

    await handleAsyncError(async () => {
      setProcessStatus('running');
      setCurrentStep(0);
      setProgress(0);
      setCanCancel(false);

      // Start performance monitoring
      operationMonitor.startMonitoring();

      // Reset all steps to pending
      setSteps(prev => prev.map(step => ({ 
        ...step, 
        status: 'pending' as const,
        retryCount: 0,
        error: undefined
      })));

      // Simulate go-live process
      for (let i = 0; i < steps.length; i++) {
        if (processStatus === 'paused') break;

        setCurrentStep(i);
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'running' } : step
        ));

        // Simulate step execution time with more realistic delays
        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

        // Simulate occasional failures for testing
        const shouldFail = Math.random() < 0.15 && i === 2; // 15% chance to fail on security step
        
        if (shouldFail) {
          const errorMessage = 'Security configuration validation failed. Please check access control settings and retry.';
          setSteps(prev => prev.map((step, index) => 
            index === i ? { 
              ...step, 
              status: 'failed',
              error: errorMessage
            } : step
          ));
          setProcessStatus('failed');
          
          handleError(new Error(errorMessage), 'Go-Live Process');
          return;
        }

        setSteps(prev => prev.map((step, index) => 
          index === i ? { 
            ...step, 
            status: 'completed',
            duration: `${Math.floor(Math.random() * 45) + 15}s`
          } : step
        ));
        
        const progressValue = ((i + 1) / steps.length) * 100;
        setProgress(progressValue);
        operationMonitor.updateProgress(progressValue, steps[i].name);
      }

      setProcessStatus('completed');
      await operationMonitor.completeMonitoring('completed');
      
      toast({
        title: "Go-Live Successful!",
        description: "System is now live and operational. Real-time monitoring initiated.",
      });
    }, 'Go-Live Process');
  };

  const handlePauseResume = () => {
    setProcessStatus(prev => prev === 'running' ? 'paused' : 'running');
    toast({
      title: processStatus === 'running' ? "Process Paused" : "Process Resumed",
      description: processStatus === 'running' 
        ? "Go-live process has been paused. You can resume when ready."
        : "Go-live process has been resumed.",
    });
  };

  const handleCancel = () => {
    setProcessStatus('idle');
    setCurrentStep(0);
    setProgress(0);
    setCanCancel(false);
    setSteps(prev => prev.map(step => ({ 
      ...step, 
      status: 'pending' as const,
      retryCount: 0,
      error: undefined
    })));
    
    toast({
      title: "Process Cancelled",
      description: "Go-live process has been cancelled and reset.",
      variant: "destructive"
    });
  };

  const handleRollback = async () => {
    await handleAsyncError(async () => {
      setProcessStatus('idle');
      setCurrentStep(0);
      setProgress(0);
      setCanCancel(false);
      setSteps(prev => prev.map(step => ({ 
        ...step, 
        status: 'pending' as const,
        retryCount: 0,
        error: undefined
      })));
      
      // Simulate rollback process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Rollback Complete",
        description: "System has been safely rolled back to previous stable state.",
      });
    }, 'Rollback Process');
  };

  const handleRetryStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step.canRetry || (step.retryCount || 0) >= 3) return;

    await handleAsyncError(async () => {
      setSteps(prev => prev.map((s, index) => 
        index === stepIndex ? { 
          ...s, 
          status: 'retrying',
          retryCount: (s.retryCount || 0) + 1,
          error: undefined
        } : s
      ));

      // Simulate retry delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 70% success rate on retry
      const retrySuccess = Math.random() > 0.3;
      
      if (retrySuccess) {
        setSteps(prev => prev.map((s, index) => 
          index === stepIndex ? { 
            ...s, 
            status: 'completed',
            duration: `${Math.floor(Math.random() * 30) + 10}s`
          } : s
        ));
        
        toast({
          title: "Retry Successful",
          description: `${step.name} completed successfully on retry.`,
        });
      } else {
        setSteps(prev => prev.map((s, index) => 
          index === stepIndex ? { 
            ...s, 
            status: 'failed',
            error: 'Retry failed. Please check system configuration.'
          } : s
        ));
        
        toast({
          title: "Retry Failed",
          description: `${step.name} failed again. Manual intervention may be required.`,
          variant: "destructive"
        });
      }
    }, 'Step Retry');
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />;
      case 'retrying': return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
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
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DialogTitle>Go-Live Process</DialogTitle>
                {!canInitiateGoLive && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Admin permissions required</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
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
                    {processStatus === 'running' && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Estimated time remaining: {Math.max(0, 8 - Math.floor(progress/12.5))} minutes</span>
                        {canCancel && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleCancel}
                            className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                          >
                            Cancel Process
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {processStatus === 'idle' && !canInitiateGoLive && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You need admin or super admin permissions to initiate the go-live process. 
                  Please contact your system administrator for access.
                </AlertDescription>
              </Alert>
            )}

            {processStatus === 'idle' && canInitiateGoLive && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will initiate the go-live process. Ensure all team members are ready and monitoring systems are active.
                  The process typically takes 8-12 minutes and should not be interrupted unless critical issues are detected.
                </AlertDescription>
              </Alert>
            )}

            {/* Performance Monitor */}
            {processStatus !== 'idle' && (
              <PerformanceMonitor
                metrics={{
                  progress,
                  duration: operationMonitor.metrics.duration,
                  currentStep: steps[currentStep]?.name,
                  status: processStatus === 'paused' ? 'cancelled' : processStatus
                }}
                realTimeMetrics={operationMonitor.realTimeMetrics}
                insights={operationMonitor.getPerformanceInsights()}
                showDetailedMetrics={true}
              />
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
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                        index === currentStep && processStatus === 'running' 
                          ? 'border-primary bg-primary/5' 
                          : step.status === 'failed' 
                          ? 'border-red-200 bg-red-50' 
                          : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {getStepIcon(step.status)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{step.name}</h4>
                            {step.retryCount && step.retryCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Retry {step.retryCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {step.duration && (
                              <span className="text-xs text-muted-foreground">{step.duration}</span>
                            )}
                            {step.status === 'failed' && step.canRetry && (step.retryCount || 0) < 3 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRetryStep(index)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Retry
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Retry this step (max 3 attempts)</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.error && (
                          <Alert className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-xs">{step.error}</AlertDescription>
                          </Alert>
                        )}
                        {!step.canRetry && (
                          <div className="flex items-center gap-1 mt-1">
                            <Info className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Critical step - no retry available</span>
                          </div>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      onClick={handleRollback}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Rollback
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Safely rollback to previous stable state</p>
                  </TooltipContent>
                </Tooltip>
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
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={processStatus === 'running'}
              >
                {processStatus === 'running' ? 'Cannot Close' : 'Close'}
              </Button>
              {processStatus === 'idle' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleStartGoLive}
                      disabled={!canInitiateGoLive}
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Initiate Go-Live
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{!canInitiateGoLive ? 'Admin permissions required' : 'Start the go-live process'}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};