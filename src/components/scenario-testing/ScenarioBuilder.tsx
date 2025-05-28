
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save, Download } from "lucide-react";
import { ScenarioTest } from "@/services/scenario-testing-service";

const DISRUPTION_TYPES = [
  'Cyberattack',
  'Power Outage',
  'Network Failure',
  'Natural Disaster',
  'Pandemic',
  'Supply Chain Disruption',
  'Third-Party Service Failure',
  'Human Error',
  'Equipment Failure',
  'Other'
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'secondary' },
  { value: 'medium', label: 'Medium', color: 'default' },
  { value: 'high', label: 'High', color: 'destructive' },
  { value: 'critical', label: 'Critical', color: 'destructive' }
];

const OUTCOME_OPTIONS = [
  { value: 'successful', label: 'Successful', color: 'default' },
  { value: 'partial', label: 'Partial Success', color: 'secondary' },
  { value: 'failed', label: 'Failed', color: 'destructive' }
];

interface ScenarioBuilderProps {
  scenario?: ScenarioTest;
  onSave: (scenario: Partial<ScenarioTest>) => void;
  onComplete: (scenario: Partial<ScenarioTest>) => void;
  onCancel: () => void;
}

const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  scenario,
  onSave,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(scenario?.current_step || 1);
  const [formData, setFormData] = useState({
    title: scenario?.title || '',
    description: scenario?.description || '',
    disruption_type: scenario?.disruption_type || '',
    severity_level: scenario?.severity_level || 'medium',
    response_plan: scenario?.response_plan || '',
    post_mortem: scenario?.post_mortem || '',
    lessons_learned: scenario?.lessons_learned || '',
    improvements_identified: scenario?.improvements_identified || '',
    outcome: scenario?.outcome || ''
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      handleSave({ current_step: newStep });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      handleSave({ current_step: newStep });
    }
  };

  const handleSave = (additionalData: Partial<ScenarioTest> = {}) => {
    onSave({
      ...formData,
      current_step: currentStep,
      ...additionalData
    });
  };

  const handleComplete = () => {
    onComplete({
      ...formData,
      current_step: totalSteps,
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  };

  const handleExport = () => {
    const exportData = {
      ...formData,
      scenario_id: scenario?.id,
      created_at: scenario?.created_at,
      completed_at: scenario?.completed_at
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-test-${formData.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Choose Disruption</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Scenario Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Q1 2024 Cyberattack Simulation"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the scenario purpose and scope..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="disruption_type">Disruption Type</Label>
                <Select value={formData.disruption_type} onValueChange={(value) => setFormData({ ...formData, disruption_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select disruption type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISRUPTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="severity_level">Severity Level</Label>
                <Select value={formData.severity_level} onValueChange={(value) => setFormData({ ...formData, severity_level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Identify Impacted Business Functions</h3>
            <p className="text-muted-foreground">
              Business functions will be selected in the next component integration.
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 3: View Dependencies and Tolerances</h3>
            <p className="text-muted-foreground">
              Dependencies and impact tolerances will be displayed here based on selected functions.
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 4: Response Plan and Post-Mortem</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="response_plan">Response Plan</Label>
                <Textarea
                  id="response_plan"
                  value={formData.response_plan}
                  onChange={(e) => setFormData({ ...formData, response_plan: e.target.value })}
                  placeholder="Document the response plan and actions taken..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="post_mortem">Post-Mortem Analysis</Label>
                <Textarea
                  id="post_mortem"
                  value={formData.post_mortem}
                  onChange={(e) => setFormData({ ...formData, post_mortem: e.target.value })}
                  placeholder="Analyze what happened, timeline of events, decisions made..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 5: Mark Outcome and Lessons Learned</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="outcome">Outcome</Label>
                <Select value={formData.outcome} onValueChange={(value) => setFormData({ ...formData, outcome: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTCOME_OPTIONS.map((outcome) => (
                      <SelectItem key={outcome.value} value={outcome.value}>
                        {outcome.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lessons_learned">Lessons Learned</Label>
                <Textarea
                  id="lessons_learned"
                  value={formData.lessons_learned}
                  onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
                  placeholder="What did we learn from this scenario test?"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="improvements_identified">Improvements Identified</Label>
                <Textarea
                  id="improvements_identified"
                  value={formData.improvements_identified}
                  onChange={(e) => setFormData({ ...formData, improvements_identified: e.target.value })}
                  placeholder="What improvements should be made based on this test?"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 6: Export Results</h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Scenario Summary</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {formData.title}</div>
                  <div><strong>Disruption:</strong> {formData.disruption_type}</div>
                  <div><strong>Severity:</strong> 
                    <Badge variant={SEVERITY_LEVELS.find(s => s.value === formData.severity_level)?.color as any} className="ml-2">
                      {SEVERITY_LEVELS.find(s => s.value === formData.severity_level)?.label}
                    </Badge>
                  </div>
                  {formData.outcome && (
                    <div><strong>Outcome:</strong>
                      <Badge variant={OUTCOME_OPTIONS.find(o => o.value === formData.outcome)?.color as any} className="ml-2">
                        {OUTCOME_OPTIONS.find(o => o.value === formData.outcome)?.label}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Scenario Test Builder</CardTitle>
            <CardDescription>
              Step {currentStep} of {totalSteps}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStepContent()}
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave()}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            {currentStep === totalSteps ? (
              <Button onClick={handleComplete}>
                Complete Test
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioBuilder;
