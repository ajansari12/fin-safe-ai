
import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, CheckCircle, XCircle, Clock, FileDown } from "lucide-react";
import { ScenarioTest } from "@/services/scenario-testing-service";
import { 
  ScenarioResult, 
  ScenarioExecutionStep,
  createScenarioResult,
  updateScenarioResult,
  createExecutionStep,
  updateExecutionStep,
  getExecutionSteps,
  generateAIRecommendations
} from "@/services/scenario-analytics-service";
import { toast } from "@/hooks/use-toast";
import { generateScenarioTestPDF } from "@/services/scenario-pdf-service";

interface GuidedTestExecutionProps {
  scenario: ScenarioTest;
  onComplete: () => void;
  onCancel: () => void;
}

const DEFAULT_EXECUTION_STEPS = [
  {
    step_number: 1,
    step_name: "Initial Detection",
    step_description: "Detect and acknowledge the disruption scenario",
    expected_outcome: "Disruption detected within SLA timeframe"
  },
  {
    step_number: 2,
    step_name: "Impact Assessment",
    step_description: "Assess the scope and impact of the disruption",
    expected_outcome: "Complete impact assessment documented"
  },
  {
    step_number: 3,
    step_name: "Response Activation",
    step_description: "Activate appropriate response teams and procedures",
    expected_outcome: "Response teams mobilized and procedures initiated"
  },
  {
    step_number: 4,
    step_name: "Containment",
    step_description: "Implement containment measures to limit impact",
    expected_outcome: "Disruption contained and spread prevented"
  },
  {
    step_number: 5,
    step_name: "Recovery Actions",
    step_description: "Execute recovery procedures to restore operations",
    expected_outcome: "Operations restored to acceptable levels"
  },
  {
    step_number: 6,
    step_name: "Validation & Closure",
    step_description: "Validate recovery and formally close the incident",
    expected_outcome: "All systems validated and incident closed"
  }
];

const GuidedTestExecution: React.FC<GuidedTestExecutionProps> = ({
  scenario,
  onComplete,
  onCancel
}) => {
  const queryClient = useQueryClient();
  const [currentResult, setCurrentResult] = useState<ScenarioResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [executionStarted, setExecutionStarted] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string>("");

  const { data: executionSteps = [], refetch: refetchSteps } = useQuery({
    queryKey: ['executionSteps', currentResult?.id],
    queryFn: () => currentResult ? getExecutionSteps(currentResult.id) : Promise.resolve([]),
    enabled: !!currentResult
  });

  const createResultMutation = useMutation({
    mutationFn: createScenarioResult,
    onSuccess: (data) => {
      setCurrentResult(data);
      setExecutionStarted(true);
      toast({
        title: "Test execution started",
        description: "Scenario test execution has begun"
      });
    }
  });

  const updateResultMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScenarioResult> }) =>
      updateScenarioResult(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarioAnalytics'] });
    }
  });

  const createStepMutation = useMutation({
    mutationFn: createExecutionStep,
    onSuccess: () => refetchSteps()
  });

  const updateStepMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScenarioExecutionStep> }) =>
      updateExecutionStep(id, data),
    onSuccess: () => refetchSteps()
  });

  const startExecution = async () => {
    const result = await createResultMutation.mutateAsync({
      scenario_test_id: scenario.id,
      execution_started_at: new Date().toISOString(),
      affected_functions_count: 0
    });

    // Create initial execution steps
    for (const stepTemplate of DEFAULT_EXECUTION_STEPS) {
      await createStepMutation.mutateAsync({
        scenario_result_id: result.id,
        ...stepTemplate,
        status: 'pending'
      });
    }
  };

  const startStep = async (stepId: string) => {
    await updateStepMutation.mutateAsync({
      id: stepId,
      data: {
        status: 'in_progress',
        started_at: new Date().toISOString()
      }
    });
  };

  const completeStep = async (stepId: string, stepData: {
    actual_outcome: string;
    notes: string;
    duration_minutes: number;
    status: 'completed' | 'failed';
  }) => {
    await updateStepMutation.mutateAsync({
      id: stepId,
      data: {
        ...stepData,
        completed_at: new Date().toISOString()
      }
    });

    if (currentStepIndex < executionSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const completeExecution = async (finalData: {
    success_rate: number;
    response_time_minutes: number;
    recovery_time_minutes: number;
    execution_notes: string;
    lessons_learned: string;
  }) => {
    if (!currentResult) return;

    const recommendations = await generateAIRecommendations({
      ...currentResult,
      ...finalData
    });

    await updateResultMutation.mutateAsync({
      id: currentResult.id,
      data: {
        ...finalData,
        execution_completed_at: new Date().toISOString(),
        ai_recommendations: recommendations,
        overall_score: finalData.success_rate
      }
    });

    setAiRecommendations(recommendations);
    
    toast({
      title: "Test execution completed",
      description: "AI recommendations have been generated"
    });
  };

  const exportResults = async () => {
    if (!currentResult) return;
    
    try {
      await generateScenarioTestPDF(scenario);
      toast({
        title: "Success",
        description: "Test execution report exported successfully"
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Error",
        description: "Failed to export execution report",
        variant: "destructive"
      });
    }
  };

  const currentStep = executionSteps[currentStepIndex];
  const completedSteps = executionSteps.filter(step => 
    step.status === 'completed' || step.status === 'failed'
  ).length;
  const progressPercentage = executionSteps.length > 0 
    ? (completedSteps / executionSteps.length) * 100 
    : 0;

  if (!executionStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Start Guided Test Execution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Test Scenario</h4>
            <p className="text-sm"><strong>Title:</strong> {scenario.title}</p>
            <p className="text-sm"><strong>Disruption:</strong> {scenario.disruption_type}</p>
            <p className="text-sm"><strong>Severity:</strong> {scenario.severity_level}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Execution Steps</h4>
            <div className="space-y-2">
              {DEFAULT_EXECUTION_STEPS.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{step.step_number}</Badge>
                  <span>{step.step_name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={startExecution} disabled={createResultMutation.isPending}>
              <Play className="h-4 w-4 mr-2" />
              Start Test Execution
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Test Execution Progress</CardTitle>
            <Badge variant="default">
              {completedSteps} of {executionSteps.length} steps completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {executionSteps.map((step, index) => (
              <div
                key={step.id}
                className={`p-2 rounded text-center text-xs ${
                  step.status === 'completed' ? 'bg-green-100 text-green-800' :
                  step.status === 'failed' ? 'bg-red-100 text-red-800' :
                  step.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                }`}
              >
                <div className="font-medium">{step.step_number}</div>
                <div className="truncate">{step.step_name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {currentStep && currentStep.status !== 'completed' && currentStep.status !== 'failed' && (
        <StepExecutionCard
          step={currentStep}
          onStart={() => startStep(currentStep.id)}
          onComplete={(data) => completeStep(currentStep.id, data)}
        />
      )}

      {/* Execution Summary */}
      {progressPercentage === 100 && (
        <ExecutionSummaryCard
          scenario={scenario}
          executionSteps={executionSteps}
          aiRecommendations={aiRecommendations}
          onComplete={completeExecution}
          onExport={exportResults}
          onFinish={onComplete}
        />
      )}
    </div>
  );
};

interface StepExecutionCardProps {
  step: ScenarioExecutionStep;
  onStart: () => void;
  onComplete: (data: {
    actual_outcome: string;
    notes: string;
    duration_minutes: number;
    status: 'completed' | 'failed';
  }) => void;
}

const StepExecutionCard: React.FC<StepExecutionCardProps> = ({
  step,
  onStart,
  onComplete
}) => {
  const [actualOutcome, setActualOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const handleStart = () => {
    setStartTime(new Date());
    onStart();
  };

  const handleComplete = (success: boolean) => {
    const endTime = new Date();
    const durationMinutes = startTime 
      ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
      : duration;

    onComplete({
      actual_outcome: actualOutcome,
      notes,
      duration_minutes: durationMinutes,
      status: success ? 'completed' : 'failed'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge>{step.step_number}</Badge>
          {step.step_name}
          {step.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Description</Label>
          <p className="text-sm text-muted-foreground">{step.step_description}</p>
        </div>

        <div>
          <Label className="text-sm font-medium">Expected Outcome</Label>
          <p className="text-sm text-muted-foreground">{step.expected_outcome}</p>
        </div>

        {step.status === 'pending' && (
          <Button onClick={handleStart}>
            <Play className="h-4 w-4 mr-2" />
            Start Step
          </Button>
        )}

        {step.status === 'in_progress' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="actual_outcome">Actual Outcome</Label>
              <Textarea
                id="actual_outcome"
                value={actualOutcome}
                onChange={(e) => setActualOutcome(e.target.value)}
                placeholder="Describe what actually happened..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes & Observations</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes, challenges, or observations..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleComplete(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
              <Button 
                onClick={() => handleComplete(false)}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Failed
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ExecutionSummaryCardProps {
  scenario: ScenarioTest;
  executionSteps: ScenarioExecutionStep[];
  aiRecommendations: string;
  onComplete: (data: {
    success_rate: number;
    response_time_minutes: number;
    recovery_time_minutes: number;
    execution_notes: string;
    lessons_learned: string;
  }) => void;
  onExport: () => void;
  onFinish: () => void;
}

const ExecutionSummaryCard: React.FC<ExecutionSummaryCardProps> = ({
  scenario,
  executionSteps,
  aiRecommendations,
  onComplete,
  onExport,
  onFinish
}) => {
  const [executionNotes, setExecutionNotes] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [summarySubmitted, setSummarySubmitted] = useState(false);

  const completedSteps = executionSteps.filter(step => step.status === 'completed').length;
  const successRate = (completedSteps / executionSteps.length) * 100;
  
  const totalDuration = executionSteps.reduce((sum, step) => 
    sum + (step.duration_minutes || 0), 0
  );
  
  const firstStep = executionSteps.find(step => step.step_number === 1);
  const responseTime = firstStep?.duration_minutes || 0;

  const handleSubmitSummary = () => {
    onComplete({
      success_rate: successRate,
      response_time_minutes: responseTime,
      recovery_time_minutes: totalDuration,
      execution_notes: executionNotes,
      lessons_learned: lessonsLearned
    });
    setSummarySubmitted(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {successRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {responseTime}
              <span className="text-sm font-normal">min</span>
            </div>
            <p className="text-sm text-muted-foreground">Response Time</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {totalDuration}
              <span className="text-sm font-normal">min</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Duration</p>
          </div>
        </div>

        {!summarySubmitted ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="execution_notes">Execution Notes</Label>
              <Textarea
                id="execution_notes"
                value={executionNotes}
                onChange={(e) => setExecutionNotes(e.target.value)}
                placeholder="Overall observations about the test execution..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="lessons_learned">Lessons Learned</Label>
              <Textarea
                id="lessons_learned"
                value={lessonsLearned}
                onChange={(e) => setLessonsLearned(e.target.value)}
                placeholder="Key lessons and insights from this test..."
                rows={3}
              />
            </div>

            <Button onClick={handleSubmitSummary} className="w-full">
              Generate AI Recommendations
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* AI Recommendations */}
            <div>
              <Label className="text-sm font-medium">AI-Generated Recommendations</Label>
              <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">{aiRecommendations}</pre>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onExport} variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button onClick={onFinish} className="flex-1">
                Complete Test
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GuidedTestExecution;
