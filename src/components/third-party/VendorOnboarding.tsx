import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCheck, 
  FileText, 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Upload,
  Download,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingDocument {
  name: string;
  status: 'pending' | 'received' | 'approved' | 'rejected';
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  documents: OnboardingDocument[];
  dependencies?: string[];
}

interface OnboardingWorkflow {
  id: string;
  vendorName: string;
  status: 'initiated' | 'in_progress' | 'pending_approval' | 'completed' | 'rejected';
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  steps: OnboardingStep[];
  assignedTo: string;
  startDate: Date;
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
}

const VendorOnboarding: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<OnboardingWorkflow | null>(null);
  const [workflows, setWorkflows] = useState<OnboardingWorkflow[]>([
    {
      id: '1',
      vendorName: 'TechCorp Solutions',
      status: 'in_progress',
      currentStep: 2,
      totalSteps: 6,
      completionPercentage: 33,
      assignedTo: 'John Smith',
      startDate: new Date('2024-01-15'),
      targetCompletionDate: new Date('2024-02-15'),
      steps: [
        {
          id: 'basic_info',
          title: 'Basic Information',
          description: 'Collect vendor basic information and contact details',
          required: true,
          completed: true,
          documents: []
        },
        {
          id: 'due_diligence',
          title: 'Due Diligence',
          description: 'Financial health assessment and background verification',
          required: true,
          completed: false,
          documents: [
            { name: 'Financial Statements', status: 'pending' },
            { name: 'References', status: 'received' }
          ]
        },
        {
          id: 'risk_assessment',
          title: 'Risk Assessment',
          description: 'Complete comprehensive risk assessment questionnaire',
          required: true,
          completed: false,
          documents: []
        },
        {
          id: 'security_review',
          title: 'Security Review',
          description: 'IT security assessment and compliance verification',
          required: true,
          completed: false,
          documents: []
        },
        {
          id: 'contract_negotiation',
          title: 'Contract Negotiation',
          description: 'Negotiate and finalize service agreements',
          required: true,
          completed: false,
          documents: []
        },
        {
          id: 'approval',
          title: 'Final Approval',
          description: 'Management approval and vendor activation',
          required: true,
          completed: false,
          documents: []
        }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending_approval': return <AlertTriangle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const completeStep = (workflowId: string, stepId: string) => {
    setWorkflows(workflows.map(workflow => {
      if (workflow.id === workflowId) {
        const updatedSteps = workflow.steps.map(step => 
          step.id === stepId ? { ...step, completed: true } : step
        );
        const completedSteps = updatedSteps.filter(step => step.completed).length;
        const completionPercentage = Math.round((completedSteps / updatedSteps.length) * 100);
        
        return {
          ...workflow,
          steps: updatedSteps,
          currentStep: completedSteps + 1,
          completionPercentage,
          status: completionPercentage === 100 ? 'completed' : workflow.status
        };
      }
      return workflow;
    }));
    
    toast.success('Step completed successfully');
  };

  const startNewOnboarding = () => {
    const newWorkflow: OnboardingWorkflow = {
      id: Date.now().toString(),
      vendorName: 'New Vendor',
      status: 'initiated',
      currentStep: 1,
      totalSteps: 6,
      completionPercentage: 0,
      assignedTo: 'Current User',
      startDate: new Date(),
      targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      steps: [
        {
          id: 'basic_info',
          title: 'Basic Information',
          description: 'Collect vendor basic information and contact details',
          required: true,
          completed: false,
          documents: []
        },
        {
          id: 'due_diligence',
          title: 'Due Diligence',
          description: 'Financial health assessment and background verification',
          required: true,
          completed: false,
          documents: []
        },
        {
          id: 'risk_assessment',
          title: 'Risk Assessment',
          description: 'Complete comprehensive risk assessment questionnaire',
          required: true,
          completed: false,
          documents: []
        },
        {
          id: 'security_review',
          title: 'Security Review',
          description: 'IT security assessment and compliance verification',
          required: true,
          completed: false,
          documents: []
        },
        {
          id: 'contract_negotiation',
          title: 'Contract Negotiation',
          description: 'Negotiate and finalize service agreements',
          required: true,
          completed: false,
          documents: []
        },
        {
          id: 'approval',
          title: 'Final Approval',
          description: 'Management approval and vendor activation',
          required: true,
          completed: false,
          documents: []
        }
      ]
    };
    
    setWorkflows([...workflows, newWorkflow]);
    setActiveWorkflow(newWorkflow);
    toast.success('New vendor onboarding initiated');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Vendor Onboarding</h3>
          <p className="text-sm text-muted-foreground">
            Streamlined vendor onboarding with OSFI E-21 compliance
          </p>
        </div>
        <Button onClick={startNewOnboarding}>
          <UserCheck className="h-4 w-4 mr-2" />
          Start New Onboarding
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {workflows.filter(w => w.status !== 'completed').map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setActiveWorkflow(workflow)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workflow.vendorName}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(workflow.status)}>
                      {getStatusIcon(workflow.status)}
                      <span className="ml-1">{workflow.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    Step {workflow.currentStep} of {workflow.totalSteps} • Assigned to {workflow.assignedTo}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{workflow.completionPercentage}%</span>
                    </div>
                    <Progress value={workflow.completionPercentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Started: {workflow.startDate.toLocaleDateString()}</span>
                      <span>Due: {workflow.targetCompletionDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Templates</CardTitle>
              <CardDescription>
                Pre-configured workflows for different vendor types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Technology Vendor</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enhanced security and technical assessment requirements
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Professional Services</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Focus on qualifications and professional standards
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Critical Outsourcing</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Comprehensive OSFI E-21 critical operations assessment
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Standard Vendor</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Streamlined process for low-risk vendors
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {workflows.filter(w => w.status === 'completed').map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workflow.vendorName}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(workflow.status)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Completed
                    </Badge>
                  </div>
                  <CardDescription>
                    Completed on {workflow.actualCompletionDate?.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Workflow Details Modal */}
      {activeWorkflow && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{activeWorkflow.vendorName} - Onboarding Details</CardTitle>
              <Button variant="outline" onClick={() => setActiveWorkflow(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activeWorkflow.steps.map((step, index) => (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-100 text-green-600' : 
                        index + 1 === activeWorkflow.currentStep ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {step.completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    {!step.completed && index + 1 === activeWorkflow.currentStep && (
                      <Button 
                        size="sm"
                        onClick={() => completeStep(activeWorkflow.id, step.id)}
                      >
                        Complete Step
                      </Button>
                    )}
                  </div>
                  
                  {step.documents.length > 0 && (
                    <div className="ml-11 space-y-2">
                      <h5 className="text-sm font-medium">Required Documents:</h5>
                      {step.documents.map((doc, docIndex) => (
                        <div key={docIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{doc.name}</span>
                          <Badge variant="outline">
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorOnboarding;