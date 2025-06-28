
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save, Download, AlertTriangle, Shield, Zap, Globe } from "lucide-react";
import { ScenarioTest } from "@/services/scenario-testing-service";

const SCENARIO_TEMPLATES = [
  {
    id: 'cyber-ransomware',
    name: 'Ransomware Attack',
    icon: Shield,
    type: 'Cyber Attack',
    severity: 'critical',
    description: 'Simulation of a ransomware attack affecting critical systems',
    duration: '4-8 hours',
    affectedSystems: ['Trading Systems', 'Customer Portals', 'Internal Networks']
  },
  {
    id: 'natural-disaster',
    name: 'Natural Disaster',
    icon: AlertTriangle,
    type: 'Natural Disaster',
    severity: 'high',
    description: 'Earthquake, flood, or severe weather affecting primary site',
    duration: '24-72 hours',
    affectedSystems: ['Primary Data Center', 'Office Facilities', 'Communications']
  },
  {
    id: 'system-outage',
    name: 'Critical System Failure',
    icon: Zap,
    type: 'System Failure',
    severity: 'high',
    description: 'Core banking or trading system experiencing complete failure',
    duration: '2-6 hours',
    affectedSystems: ['Core Banking', 'Payment Processing', 'Risk Systems']
  },
  {
    id: 'pandemic',
    name: 'Pandemic Response',
    icon: Globe,
    type: 'Pandemic',
    severity: 'medium',
    description: 'Widespread illness affecting workforce availability',
    duration: '2-4 weeks',
    affectedSystems: ['Workforce', 'Operations', 'Customer Service']
  }
];

const DISRUPTION_TYPES = [
  'Cyber Attack',
  'Natural Disaster',
  'System Failure',
  'Third-Party Failure',
  'Pandemic',
  'Power Outage',
  'Network Failure',
  'Human Error',
  'Regulatory Action',
  'Other'
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'secondary' },
  { value: 'medium', label: 'Medium', color: 'default' },
  { value: 'high', label: 'High', color: 'destructive' },
  { value: 'critical', label: 'Critical', color: 'destructive' }
];

interface ScenarioBuilderProps {
  scenario?: ScenarioTest;
  onSave: (scenario: Partial<ScenarioTest>) => void;
  onCancel: () => void;
}

const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  scenario,
  onSave,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: scenario?.title || '',
    description: scenario?.description || '',
    disruption_type: scenario?.disruption_type || '',
    severity_level: scenario?.severity_level || 'medium',
    estimated_duration: '',
    affected_systems: [] as string[],
    success_criteria: '',
    participants: [] as string[],
    testing_approach: 'tabletop'
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = SCENARIO_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setFormData({
        ...formData,
        title: template.name,
        description: template.description,
        disruption_type: template.type,
        severity_level: template.severity,
        estimated_duration: template.duration,
        affected_systems: template.affectedSystems
      });
    }
  };

  const handleSave = () => {
    onSave({
      ...formData,
      status: 'draft',
      current_step: 1
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Step 1: Choose Scenario Type</h3>
            
            {/* Template Selection */}
            <div>
              <Label className="text-base font-medium">Pre-built Templates</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {SCENARIO_TEMPLATES.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <IconComponent className="h-6 w-6 text-primary mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={template.severity === 'critical' ? 'destructive' : 'default'} className="text-xs">
                                {template.severity}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{template.duration}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Custom Scenario Option */}
            <div className="border-t pt-6">
              <Label className="text-base font-medium">Or Create Custom Scenario</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <Label htmlFor="title">Scenario Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Q1 2024 Cyber Attack Simulation"
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
              </div>
              
              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the scenario purpose and scope..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Step 2: Configure Parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div>
                <Label htmlFor="testing_approach">Testing Approach</Label>
                <Select value={formData.testing_approach} onValueChange={(value) => setFormData({ ...formData, testing_approach: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select approach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tabletop">Tabletop Exercise</SelectItem>
                    <SelectItem value="walkthrough">Walkthrough</SelectItem>
                    <SelectItem value="simulation">Live Simulation</SelectItem>
                    <SelectItem value="full-scale">Full-Scale Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="estimated_duration">Estimated Duration</Label>
              <Input
                id="estimated_duration"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                placeholder="e.g., 2-4 hours, 1-2 days"
              />
            </div>

            <div>
              <Label htmlFor="success_criteria">Success Criteria</Label>
              <Textarea
                id="success_criteria"
                value={formData.success_criteria}
                onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
                placeholder="Define what constitutes successful completion of this scenario test..."
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Step 3: Affected Systems & Dependencies</h3>
            
            <div>
              <Label>Critical Systems & Functions</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select the systems and business functions that will be affected in this scenario.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Core Banking System',
                  'Trading Platform',
                  'Payment Processing',
                  'Customer Portals',
                  'Risk Management System',
                  'Compliance System',
                  'Data Center',
                  'Network Infrastructure',
                  'Communication Systems',
                  'Third-Party Services',
                  'Backup Systems',
                  'Recovery Site'
                ].map((system) => (
                  <div key={system} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={system}
                      checked={formData.affected_systems.includes(system)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            affected_systems: [...formData.affected_systems, system]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            affected_systems: formData.affected_systems.filter(s => s !== system)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={system} className="text-sm">
                      {system}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Step 4: Participants & Review</h3>
            
            <div>
              <Label>Test Participants</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Assign roles and responsibilities for the scenario test.
              </p>
              
              <div className="space-y-3">
                {[
                  { role: 'Test Coordinator', required: true },
                  { role: 'Business Continuity Manager', required: true },
                  { role: 'IT Operations', required: true },
                  { role: 'Risk Manager', required: false },
                  { role: 'Communications Team', required: false },
                  { role: 'Executive Sponsor', required: false }
                ].map((participant) => (
                  <div key={participant.role} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{participant.role}</span>
                      {participant.required && <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>}
                    </div>
                    <Input 
                      placeholder="Assign person"
                      className="w-48"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scenario Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Scenario Summary</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Title:</strong> {formData.title}</div>
                <div><strong>Type:</strong> {formData.disruption_type}</div>
                <div><strong>Severity:</strong> 
                  <Badge variant={formData.severity_level === 'critical' ? 'destructive' : 'default'} className="ml-2">
                    {formData.severity_level}
                  </Badge>
                </div>
                <div><strong>Duration:</strong> {formData.estimated_duration}</div>
                <div><strong>Affected Systems:</strong> {formData.affected_systems.length} selected</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Scenario Test Builder</h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
        <Progress value={progress} className="w-32" />
      </div>
      
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>
      
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
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          
          {currentStep === totalSteps ? (
            <Button onClick={handleSave}>
              Create Scenario Test
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioBuilder;
