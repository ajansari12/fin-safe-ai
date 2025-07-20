import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Square, Clock, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { ScenarioTest } from "@/services/scenario-testing-service";

interface TestExecutionCenterProps {
  scenario?: ScenarioTest;
  onComplete?: () => void;
  onCancel?: () => void;
}

interface ExecutionStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime?: Date;
  duration?: number;
  notes?: string;
}

const TestExecutionCenter: React.FC<TestExecutionCenterProps> = ({ 
  scenario, 
  onComplete, 
  onCancel 
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notes, setNotes] = useState("");

  // Sample execution steps - in a real implementation, these would come from the scenario
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([
    {
      id: '1',
      name: 'Initialize Test Environment',
      description: 'Set up monitoring tools and notify test participants',
      status: 'pending'
    },
    {
      id: '2', 
      name: 'Trigger Disruption Event',
      description: 'Simulate the defined disruption scenario',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Monitor Initial Response',
      description: 'Observe and document initial response actions',
      status: 'pending'
    },
    {
      id: '4',
      name: 'Evaluate Recovery Actions',
      description: 'Assess the effectiveness of recovery procedures',
      status: 'pending'
    },
    {
      id: '5',
      name: 'Complete Test & Debrief',
      description: 'Conclude the test and conduct immediate debrief',
      status: 'pending'
    }
  ]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExecuting && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExecuting, startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startExecution = () => {
    setIsExecuting(true);
    setStartTime(new Date());
    // Update first step to in_progress
    setExecutionSteps(prev => prev.map((step, index) => 
      index === 0 ? { ...step, status: 'in_progress', startTime: new Date() } : step
    ));
  };

  const pauseExecution = () => {
    setIsExecuting(false);
  };

  const completeCurrentStep = () => {
    setExecutionSteps(prev => prev.map((step, index) => {
      if (index === currentStep) {
        return { ...step, status: 'completed', duration: elapsedTime };
      } else if (index === currentStep + 1) {
        return { ...step, status: 'in_progress', startTime: new Date() };
      }
      return step;
    }));
    
    if (currentStep < executionSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Test completed
      setIsExecuting(false);
      onComplete?.();
    }
  };

  const failCurrentStep = () => {
    setExecutionSteps(prev => prev.map((step, index) => 
      index === currentStep ? { ...step, status: 'failed' } : step
    ));
    setIsExecuting(false);
  };

  const stopExecution = () => {
    setIsExecuting(false);
    onCancel?.();
  };

  const progressPercentage = ((currentStep + 1) / executionSteps.length) * 100;

  if (!scenario) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Test Execution Center</h3>
            <p className="text-muted-foreground">
              Real-time execution monitoring and coordination dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Execution Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{scenario.title}</CardTitle>
              <CardDescription>
                {scenario.disruption_type.replace('_', ' ')} • {scenario.severity_level} severity
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isExecuting ? "default" : "secondary"}>
                {isExecuting ? "EXECUTING" : "READY"}
              </Badge>
              <div className="text-sm text-muted-foreground">
                <Clock className="h-4 w-4 inline mr-1" />
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="flex gap-2">
              {!isExecuting && currentStep === 0 && (
                <Button onClick={startExecution}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Test Execution
                </Button>
              )}
              {isExecuting && (
                <>
                  <Button onClick={pauseExecution} variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button onClick={completeCurrentStep} variant="default">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Step
                  </Button>
                  <Button onClick={failCurrentStep} variant="destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Mark Failed
                  </Button>
                </>
              )}
              <Button onClick={stopExecution} variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Stop Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="steps" className="space-y-4">
        <TabsList>
          <TabsTrigger value="steps">Execution Steps</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="notes">Notes & Observations</TabsTrigger>
        </TabsList>

        <TabsContent value="steps">
          <Card>
            <CardHeader>
              <CardTitle>Execution Steps</CardTitle>
              <CardDescription>
                Track progress through each phase of the scenario test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executionSteps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      index === currentStep ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {step.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {step.status === 'in_progress' && (
                        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      )}
                      {step.status === 'failed' && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      {step.status === 'pending' && (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{step.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                      {step.startTime && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Started: {step.startTime.toLocaleTimeString()}
                          {step.duration && ` • Duration: ${formatTime(step.duration)}`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Test Participants</CardTitle>
              <CardDescription>
                Key personnel involved in the scenario test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Test Coordinator</p>
                    <p className="text-sm text-muted-foreground">Managing overall test execution</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">Active</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Business Function Owners</p>
                    <p className="text-sm text-muted-foreground">Responsible for specific business areas</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">Standby</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">IT Response Team</p>
                    <p className="text-sm text-muted-foreground">Technical recovery and support</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">Ready</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Execution Notes</CardTitle>
              <CardDescription>
                Document observations, issues, and key findings during execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Record observations, timing, effectiveness of responses, issues encountered, and any deviations from expected procedures..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={10}
              />
              <Button className="mt-4">
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestExecutionCenter;