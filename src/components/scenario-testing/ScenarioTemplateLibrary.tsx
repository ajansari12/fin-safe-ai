
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileTemplate, Clock, AlertTriangle } from "lucide-react";
import { getScenarioTemplates, getPredefinedTemplates, createScenarioTemplate, ScenarioTemplate, CreateScenarioTemplateData } from "@/services/scenario-templates-service";
import { toast } from "sonner";

const CRISIS_TYPES = [
  'cyberattack', 'power_outage', 'network_failure', 'natural_disaster', 
  'pandemic', 'supply_chain_disruption', 'third_party_failure', 'human_error', 
  'equipment_failure', 'data_breach'
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'secondary' },
  { value: 'medium', label: 'Medium', color: 'default' },
  { value: 'high', label: 'High', color: 'destructive' },
  { value: 'critical', label: 'Critical', color: 'destructive' }
];

interface ScenarioTemplateLibraryProps {
  onUseTemplate: (template: ScenarioTemplate) => void;
}

const ScenarioTemplateLibrary: React.FC<ScenarioTemplateLibraryProps> = ({ onUseTemplate }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');
  const [formData, setFormData] = useState<CreateScenarioTemplateData>({
    template_name: '',
    template_description: '',
    crisis_type: 'cyberattack',
    severity_level: 'medium',
    template_steps: [],
    success_criteria: ''
  });

  const { data: customTemplates = [], isLoading: loadingCustom, refetch } = useQuery({
    queryKey: ['scenarioTemplates'],
    queryFn: getScenarioTemplates
  });

  const { data: predefinedTemplates = [], isLoading: loadingPredefined } = useQuery({
    queryKey: ['predefinedTemplates'],
    queryFn: getPredefinedTemplates
  });

  const handleCreateTemplate = async () => {
    try {
      await createScenarioTemplate(formData);
      toast.success("Template created successfully");
      setIsCreateDialogOpen(false);
      setFormData({
        template_name: '',
        template_description: '',
        crisis_type: 'cyberattack',
        severity_level: 'medium',
        template_steps: [],
        success_criteria: ''
      });
      refetch();
    } catch (error) {
      toast.error("Failed to create template");
      console.error('Error creating template:', error);
    }
  };

  const TemplateCard = ({ template }: { template: ScenarioTemplate }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{template.template_name}</CardTitle>
            <CardDescription className="mt-1">
              {template.template_description}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="outline">{template.crisis_type}</Badge>
            <Badge variant={SEVERITY_LEVELS.find(s => s.value === template.severity_level)?.color as any}>
              {template.severity_level}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileTemplate className="h-4 w-4" />
              {template.template_steps?.length || 0} steps
            </div>
            {template.estimated_duration_hours && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {template.estimated_duration_hours}h
              </div>
            )}
          </div>
          <Button 
            onClick={() => onUseTemplate(template)}
            size="sm"
          >
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Scenario Template Library</h2>
          <p className="text-muted-foreground">
            Choose from predefined templates or create your own scenario templates
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        <Button
          variant={activeTab === 'predefined' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('predefined')}
          className="rounded-b-none"
        >
          Predefined Templates
        </Button>
        <Button
          variant={activeTab === 'custom' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('custom')}
          className="rounded-b-none"
        >
          Custom Templates
        </Button>
      </div>

      {/* Template Grid */}
      {activeTab === 'predefined' && (
        <div className="space-y-4">
          {loadingPredefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-32 animate-pulse bg-gray-100 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predefinedTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-4">
          {loadingCustom ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-32 animate-pulse bg-gray-100 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : customTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileTemplate className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No custom templates created yet.</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-4"
              >
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Scenario Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for scenario testing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template_name">Template Name</Label>
              <Input
                id="template_name"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                placeholder="e.g., Q1 2024 Cyberattack Simulation"
              />
            </div>
            
            <div>
              <Label htmlFor="template_description">Description</Label>
              <Textarea
                id="template_description"
                value={formData.template_description}
                onChange={(e) => setFormData({ ...formData, template_description: e.target.value })}
                placeholder="Describe the template purpose and scope..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="crisis_type">Crisis Type</Label>
                <Select 
                  value={formData.crisis_type} 
                  onValueChange={(value) => setFormData({ ...formData, crisis_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crisis type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRISIS_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="severity_level">Severity Level</Label>
                <Select 
                  value={formData.severity_level} 
                  onValueChange={(value) => setFormData({ ...formData, severity_level: value })}
                >
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
            
            <div>
              <Label htmlFor="success_criteria">Success Criteria</Label>
              <Textarea
                id="success_criteria"
                value={formData.success_criteria}
                onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
                placeholder="Define what constitutes a successful test..."
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScenarioTemplateLibrary;
