import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, GitBranch, Play, Settings, Save } from "lucide-react";

export const WorkflowDesigner = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const workflowTemplates = [
    {
      id: 1,
      name: "Risk Assessment Workflow",
      description: "Automated risk assessment with ML scoring",
      steps: 8,
      avgTime: "4.2 hours",
      category: "Risk Management",
      complexity: "Medium"
    },
    {
      id: 2,
      name: "Incident Response Process",
      description: "Automated incident detection and response",
      steps: 12,
      avgTime: "2.1 hours",
      category: "Incident Management",
      complexity: "High"
    },
    {
      id: 3,
      name: "Document Review Pipeline",
      description: "AI-powered document analysis and approval",
      steps: 6,
      avgTime: "1.5 hours",
      category: "Compliance",
      complexity: "Low"
    }
  ];

  const workflowSteps = [
    {
      id: 1,
      name: "Trigger Event",
      type: "trigger",
      description: "Define what starts the workflow",
      configured: true
    },
    {
      id: 2,
      name: "Data Collection",
      type: "action",
      description: "Gather required information",
      configured: true
    },
    {
      id: 3,
      name: "AI Analysis", 
      type: "ai",
      description: "Apply machine learning models",
      configured: false
    },
    {
      id: 4,
      name: "Decision Point",
      type: "decision",
      description: "Route based on analysis results",
      configured: false
    },
    {
      id: 5,
      name: "Human Review",
      type: "human",
      description: "Expert validation when needed",
      configured: false
    },
    {
      id: 6,
      name: "Final Action",
      type: "action",
      description: "Complete the workflow",
      configured: false
    }
  ];

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return '🎯';
      case 'action': return '⚡';
      case 'ai': return '🤖';
      case 'decision': return '🔀';
      case 'human': return '👤';
      default: return '📝';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Designer</h2>
          <p className="text-muted-foreground">Design and configure automated workflows</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <GitBranch className="h-4 w-4 mr-2" />
            Import Template
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Templates</CardTitle>
            <CardDescription>
              Pre-built workflow templates to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflowTemplates.map((template) => (
                <div 
                  key={template.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <Badge variant="outline" className={getComplexityColor(template.complexity)}>
                        {template.complexity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{template.steps} steps</span>
                      <span>{template.avgTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Configuration</CardTitle>
            <CardDescription>
              Configure workflow settings and parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input 
                id="workflow-name" 
                placeholder="Enter workflow name"
                defaultValue="Risk Assessment Workflow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea 
                id="workflow-description" 
                placeholder="Describe the workflow purpose"
                defaultValue="Automated risk assessment with ML-powered analysis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workflow-category">Category</Label>
              <Input 
                id="workflow-category" 
                placeholder="Workflow category"
                defaultValue="Risk Management"
              />
            </div>

            <div className="space-y-2">
              <Label>Trigger Conditions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">New vendor onboarding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Risk threshold breach</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Scheduled review</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Steps</CardTitle>
            <CardDescription>
              Design the workflow step sequence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="relative">
                  <div className={`p-3 border rounded-lg ${step.configured ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStepIcon(step.type)}</span>
                        <span className="font-medium text-sm">{step.name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                    {step.configured && (
                      <Badge variant="outline" className="mt-2 text-xs bg-green-100 text-green-800">
                        Configured
                      </Badge>
                    )}
                  </div>
                  
                  {index < workflowSteps.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="w-px h-4 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Preview</CardTitle>
          <CardDescription>
            Visual representation of the workflow flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
            <div className="text-center text-muted-foreground">
              <GitBranch className="h-12 w-12 mx-auto mb-2" />
              <p>Workflow diagram will appear here</p>
              <p className="text-sm">Configure steps to see the visual flow</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};