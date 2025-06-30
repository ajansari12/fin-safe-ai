
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  FileText, 
  Settings,
  Target,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const PreImplementationDiscovery = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  const steps = [
    { id: 1, name: "Organization Structure", icon: Building2, completed: true },
    { id: 2, name: "Existing Systems", icon: Settings, completed: true },
    { id: 3, name: "Risk Maturity", icon: Target, completed: false },
    { id: 4, name: "Stakeholder Mapping", icon: Users, completed: false },
    { id: 5, name: "Success Criteria", icon: FileText, completed: false }
  ];

  const organizationData = {
    name: "FirstNational Bank",
    type: "Commercial Bank",
    assets: "$2.5B",
    employees: 450,
    branches: 12,
    regulatoryFramework: ["OSFI", "E-21", "SOX"]
  };

  const systemInventory = [
    { name: "Core Banking System", vendor: "Temenos T24", version: "R21", criticality: "Critical" },
    { name: "Risk Management", vendor: "SAS Risk Manager", version: "8.2", criticality: "High" },
    { name: "Document Management", vendor: "SharePoint", version: "2019", criticality: "Medium" },
    { name: "HR System", vendor: "Workday", version: "2023.R2", criticality: "Medium" }
  ];

  const stakeholders = [
    { name: "Sarah Johnson", role: "Chief Risk Officer", department: "Risk Management", influence: "High" },
    { name: "Michael Chen", role: "IT Director", department: "Technology", influence: "High" },
    { name: "Lisa Rodriguez", role: "Compliance Manager", department: "Compliance", influence: "Medium" },
    { name: "David Kim", role: "Operations Manager", department: "Operations", influence: "Medium" }
  ];

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Discovery Process
          </CardTitle>
          <CardDescription>
            Comprehensive assessment of your organization's current state and requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round((2/5) * 100)}% Complete</span>
            </div>
            <Progress value={40} />
            
            <div className="grid grid-cols-5 gap-2 mt-4">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-green-500 text-white' : 
                    step.id === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}>
                    {step.completed ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <span className="text-xs text-center font-medium">{step.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="systems">Systems</TabsTrigger>
          <TabsTrigger value="maturity">Risk Maturity</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="success">Success Criteria</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organizational Structure Assessment</CardTitle>
              <CardDescription>Capture key organizational details and structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input value={organizationData.name} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Institution Type</Label>
                  <Input value={organizationData.type} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Total Assets</Label>
                  <Input value={organizationData.assets} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Employee Count</Label>
                  <Input value={organizationData.employees.toString()} readOnly />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Regulatory Frameworks</Label>
                <div className="flex gap-2">
                  {organizationData.regulatoryFramework.map((framework) => (
                    <Badge key={framework} variant="secondary">{framework}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="systems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Existing Systems Inventory</CardTitle>
              <CardDescription>Current technology landscape and integration points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemInventory.map((system, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{system.name}</h4>
                      <p className="text-sm text-muted-foreground">{system.vendor} - {system.version}</p>
                    </div>
                    <Badge variant={system.criticality === 'Critical' ? 'destructive' : 
                                  system.criticality === 'High' ? 'default' : 'secondary'}>
                      {system.criticality}
                    </Badge>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Add System
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maturity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management Maturity Assessment</CardTitle>
              <CardDescription>Evaluate current risk management capabilities and processes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Governance & Policy</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Policy Framework</span>
                      <Badge variant="secondary">Developing</Badge>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Risk Identification</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Risk Assessment Process</span>
                      <Badge variant="secondary">Basic</Badge>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Monitoring & Reporting</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">KRI Framework</span>
                      <Badge variant="destructive">Minimal</Badge>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Technology & Tools</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Risk Technology</span>
                      <Badge variant="secondary">Developing</Badge>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stakeholders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stakeholder Mapping</CardTitle>
              <CardDescription>Key personnel and their roles in the implementation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stakeholders.map((stakeholder, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{stakeholder.name}</h4>
                      <p className="text-sm text-muted-foreground">{stakeholder.role} - {stakeholder.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={stakeholder.influence === 'High' ? 'default' : 'secondary'}>
                        {stakeholder.influence} Influence
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Add Stakeholder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Success Criteria Definition</CardTitle>
              <CardDescription>Define measurable outcomes and key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Business Objectives</Label>
                  <Textarea 
                    placeholder="e.g., Improve risk visibility, enhance regulatory reporting, reduce manual processes..."
                    className="min-h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Key Performance Indicators</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="e.g., 95% automation rate" />
                    <Input placeholder="e.g., 50% reduction in reporting time" />
                    <Input placeholder="e.g., 99.9% system availability" />
                    <Input placeholder="e.g., 100% regulatory compliance" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Timeline Expectations</Label>
                  <Input placeholder="e.g., Go-live within 6 months" />
                </div>
                
                <Button className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Finalize Success Criteria
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PreImplementationDiscovery;
