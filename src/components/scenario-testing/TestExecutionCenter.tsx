
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare,
  Timer,
  Activity
} from "lucide-react";
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
  endTime?: Date;
  assignedTo?: string;
  notes?: string;
}

const TestExecutionCenter: React.FC<TestExecutionCenterProps> = ({
  scenario,
  onComplete,
  onCancel
}) => {
  const [executionStatus, setExecutionStatus] = useState<'not_started' | 'running' | 'paused' | 'completed'>('not_started');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [participants, setParticipants] = useState([
    { name: 'John Smith', role: 'Test Coordinator', status: 'online' },
    { name: 'Sarah Johnson', role: 'BC Manager', status: 'online' },
    { name: 'Mike Chen', role: 'IT Operations', status: 'away' },
    { name: 'Lisa Rodriguez', role: 'Risk Manager', status: 'offline' }
  ]);
  
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([
    {
      id: '1',
      name: 'Initial Assessment',
      description: 'Assess the scope and impact of the scenario',
      status: 'pending'
    },
    {
      id: '2',
      name: 'Incident Declaration',
      description: 'Formally declare the incident and activate response procedures',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Team Notification',
      description: 'Notify all relevant teams and stakeholders',
      status: 'pending'
    },
    {
      id: '4',
      name: 'Response Execution',
      description: 'Execute response and recovery procedures',
      status: 'pending'
    },
    {
      id: '5',
      name: 'Communication',
      description: 'Manage internal and external communications',
      status: 'pending'
    },
    {
      id: '6',
      name: 'Recovery Validation',
      description: 'Validate recovery and return to normal operations',
      status: 'pending'
    }
  ]);

  const [communications, setCommunications] = useState([
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000),
      sender: 'Test Coordinator',
      message: 'Scenario execution initiated. All teams please confirm readiness.',
      type: 'announcement'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getElapsedTime = () => {
    if (!startTime) return '00:00:00';
    const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartExecution = () => {
    setExecutionStatus('running');
    setStartTime(new Date());
    // Start first step
    setExecutionSteps(prev => prev.map((step, index) => 
      index === 0 ? { ...step, status: 'in_progress', startTime: new Date() } : step
    ));
  };

  const handlePauseExecution = () => {
    setExecutionStatus('paused');
  };

  const handleResumeExecution = () => {
    setExecutionStatus('running');
  };

  const handleStopExecution = () => {
    setExecutionStatus('completed');
    if (onComplete) onComplete();
  };

  const handleStepComplete = (stepId: string) => {
    setExecutionSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return { ...step, status: 'completed', endTime: new Date() };
      }
      return step;
    }));

    // Start next step
    const currentIndex = executionSteps.findIndex(s => s.id === stepId);
    if (currentIndex < executionSteps.length - 1) {
      setExecutionSteps(prev => prev.map((step, index) => 
        index === currentIndex + 1 ? { ...step, status: 'in_progress', startTime: new Date() } : step
      ));
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setCommunications(prev => [...prev, {
        id: Date.now().toString(),
        timestamp: new Date(),
        sender: 'Test Coordinator',
        message: newMessage,
        type: 'message'
      }]);
      setNewMessage('');
    }
  };

  const completedSteps = executionSteps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / executionSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Execution Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{scenario?.title}</h2>
          <p className="text-muted-foreground">{scenario?.disruption_type} - {scenario?.severity_level} severity</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Elapsed Time</div>
            <div className="text-lg font-mono font-semibold">{getElapsedTime()}</div>
          </div>
          
          <Badge variant={
            executionStatus === 'running' ? 'default' :
            executionStatus === 'paused' ? 'secondary' :
            executionStatus === 'completed' ? 'default' : 'outline'
          }>
            {executionStatus.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {executionStatus === 'not_started' && (
          <Button onClick={handleStartExecution}>
            <Play className="h-4 w-4 mr-2" />
            Start Test
          </Button>
        )}
        
        {executionStatus === 'running' && (
          <Button variant="outline" onClick={handlePauseExecution}>
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
        )}
        
        {executionStatus === 'paused' && (
          <Button onClick={handleResumeExecution}>
            <Play className="h-4 w-4 mr-2" />
            Resume
          </Button>
        )}
        
        {['running', 'paused'].includes(executionStatus) && (
          <Button variant="destructive" onClick={handleStopExecution}>
            <Square className="h-4 w-4 mr-2" />
            Complete Test
          </Button>
        )}
        
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Test Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Steps Completed</span>
              <span>{completedSteps} of {executionSteps.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="steps" className="space-y-4">
        <TabsList>
          <TabsTrigger value="steps">Execution Steps</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="metrics">Real-time Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-4">
          {executionSteps.map((step) => (
            <Card key={step.id} className={
              step.status === 'in_progress' ? 'border-primary' :
              step.status === 'completed' ? 'border-green-500' :
              step.status === 'failed' ? 'border-red-500' : ''
            }>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{step.name}</h4>
                      <Badge variant={
                        step.status === 'pending' ? 'secondary' :
                        step.status === 'in_progress' ? 'default' :
                        step.status === 'completed' ? 'default' : 'destructive'
                      }>
                        {step.status === 'in_progress' && <Timer className="h-3 w-3 mr-1" />}
                        {step.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {step.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {step.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`assignee-${step.id}`}>Assigned To</Label>
                        <Input
                          id={`assignee-${step.id}`}
                          value={step.assignedTo || ''}
                          onChange={(e) => setExecutionSteps(prev => 
                            prev.map(s => s.id === step.id ? { ...s, assignedTo: e.target.value } : s)
                          )}
                          placeholder="Assign team member"
                          disabled={step.status === 'completed'}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`notes-${step.id}`}>Notes</Label>
                        <Input
                          id={`notes-${step.id}`}
                          value={step.notes || ''}
                          onChange={(e) => setExecutionSteps(prev => 
                            prev.map(s => s.id === step.id ? { ...s, notes: e.target.value } : s)
                          )}
                          placeholder="Add notes"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {step.status === 'in_progress' && (
                      <Button size="sm" onClick={() => handleStepComplete(step.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Test Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-sm text-muted-foreground">{participant.role}</div>
                    </div>
                    <Badge variant={
                      participant.status === 'online' ? 'default' :
                      participant.status === 'away' ? 'secondary' : 'destructive'
                    }>
                      {participant.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communications Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-64 overflow-y-auto space-y-3">
                {communications.map((comm) => (
                  <div key={comm.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{comm.sender}</span>
                      <span className="text-xs text-muted-foreground">
                        {comm.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{comm.message}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Initial Response Time</span>
                    <span className="font-medium">2m 34s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Team Assembly Time</span>
                    <span className="font-medium">5m 12s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Decision Time</span>
                    <span className="font-medium">3m 45s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Primary Systems</span>
                    <Badge variant="destructive">Affected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Backup Systems</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Recovery Site</span>
                    <Badge variant="default">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestExecutionCenter;
