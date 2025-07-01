
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Zap, 
  Brain, 
  CheckCircle,
  Settings,
  FileText,
  Download,
  Target,
  Shield,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { intelligentFrameworkGenerationService } from '@/services/intelligent-framework-generation-service';
import { toast } from '@/hooks/use-toast';

interface IntelligentFrameworkGeneratorProps {
  orgId: string;
  profileId: string;
}

const IntelligentFrameworkGenerator: React.FC<IntelligentFrameworkGeneratorProps> = ({ 
  orgId, 
  profileId 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [generatedFrameworks, setGeneratedFrameworks] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState('selection');

  const frameworkOptions = [
    {
      id: 'governance',
      name: 'Governance Structure Framework',
      icon: Users,
      description: 'Board committees, reporting lines, and stakeholder engagement',
      estimatedTime: '15 minutes',
      complexity: 'Medium',
      color: 'text-blue-500'
    },
    {
      id: 'risk_appetite',
      name: 'Risk Appetite Framework',
      icon: Target,
      description: 'Risk tolerance levels, KRIs, and appetite statements',
      estimatedTime: '20 minutes',
      complexity: 'High',
      color: 'text-red-500'
    },
    {
      id: 'impact_tolerance',
      name: 'Impact Tolerance Framework',
      icon: Shield,
      description: 'Business function mapping, RTOs, RPOs, and continuity plans',
      estimatedTime: '25 minutes',
      complexity: 'High',
      color: 'text-green-500'
    },
    {
      id: 'control',
      name: 'Control Framework',
      icon: CheckCircle,
      description: 'Control objectives, activities, and monitoring procedures',
      estimatedTime: '30 minutes',
      complexity: 'High',
      color: 'text-purple-500'
    },
    {
      id: 'compliance',
      name: 'Compliance Monitoring Framework',
      icon: FileText,
      description: 'Regulatory compliance procedures and reporting',
      estimatedTime: '20 minutes',
      complexity: 'Medium',
      color: 'text-orange-500'
    },
    {
      id: 'scenario_testing',
      name: 'Scenario Testing Framework',
      icon: TrendingUp,
      description: 'Industry scenarios, stress tests, and OSFI E-21 compliance',
      estimatedTime: '25 minutes',
      complexity: 'High',
      color: 'text-indigo-500'
    }
  ];

  const handleFrameworkSelection = (frameworkId: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(frameworkId) 
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  const handleGenerateFrameworks = async () => {
    if (selectedFrameworks.length === 0) {
      toast({
        title: "No Frameworks Selected",
        description: "Please select at least one framework to generate.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setCurrentStep('generating');
    setGenerationProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 1000);

      const results = await intelligentFrameworkGenerationService.generateFrameworks({
        profileId,
        frameworkTypes: selectedFrameworks,
        customizations: {}
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGeneratedFrameworks(results);
      setCurrentStep('results');

      toast({
        title: "Frameworks Generated Successfully!",
        description: `Generated ${results.length} customized frameworks for your organization.`
      });
    } catch (error) {
      console.error('Framework generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate frameworks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setSelectedFrameworks([]);
    setGeneratedFrameworks([]);
    setCurrentStep('selection');
    setGenerationProgress(0);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalEstimatedTime = () => {
    const selectedOptions = frameworkOptions.filter(option => 
      selectedFrameworks.includes(option.id)
    );
    
    const totalMinutes = selectedOptions.reduce((sum, option) => {
      const minutes = parseInt(option.estimatedTime.replace(' minutes', ''));
      return sum + minutes;
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (currentStep === 'generating') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-500 animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Generating Intelligent Frameworks</h2>
              <p className="text-muted-foreground">
                AI is analyzing your organization and creating customized frameworks...
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 animate-spin" />
              Generation Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={generationProgress} className="w-full" />
            <div className="flex items-center justify-between text-sm">
              <span>Processing organizational profile...</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
            
            <div className="grid gap-2">
              {selectedFrameworks.map((frameworkId, index) => {
                const framework = frameworkOptions.find(f => f.id === frameworkId);
                const isActive = index <= (generationProgress / 100) * selectedFrameworks.length;
                
                return (
                  <div key={frameworkId} className={`flex items-center gap-2 p-2 rounded ${
                    isActive ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    {isActive ? (
                      <Settings className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={isActive ? 'text-blue-700' : 'text-gray-500'}>
                      {framework?.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'results') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Frameworks Generated Successfully!</h2>
              <p className="text-muted-foreground">
                {generatedFrameworks.length} intelligent frameworks ready for implementation
              </p>
            </div>
          </div>
          <Button onClick={handleStartOver} variant="outline">
            Generate More
          </Button>
        </div>

        <div className="grid gap-4">
          {generatedFrameworks.map((result, index) => {
            const framework = result.framework;
            const frameworkOption = frameworkOptions.find(f => f.id === framework.framework_type);
            const IconComponent = frameworkOption?.icon || FileText;
            
            return (
              <Card key={framework.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-6 w-6 ${frameworkOption?.color || 'text-gray-500'}`} />
                      <div>
                        <CardTitle className="text-lg">{framework.framework_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Generated on {new Date(framework.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Score: {Math.round(result.effectiveness_score)}%
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Framework Components</h4>
                      <div className="space-y-1">
                        {result.components.slice(0, 3).map((component: any, idx: number) => (
                          <div key={idx} className="text-sm text-muted-foreground">
                            • {component.component_name}
                          </div>
                        ))}
                        {result.components.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            • +{result.components.length - 3} more components
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Implementation Plan</h4>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Duration: {result.implementationPlan.total_duration}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Phases: {result.implementationPlan.phases.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Resources: {result.implementationPlan.resource_allocation}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Customize
                    </Button>
                    <Button size="sm" variant="outline">
                      <Zap className="h-4 w-4 mr-2" />
                      Implement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Intelligent Framework Generator</h2>
            <p className="text-muted-foreground">
              AI-powered framework generation tailored to your organization
            </p>
          </div>
        </div>
        {selectedFrameworks.length > 0 && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {selectedFrameworks.length} framework{selectedFrameworks.length !== 1 ? 's' : ''} selected
            </div>
            <div className="text-sm font-medium">
              Estimated time: {getTotalEstimatedTime()}
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="selection" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="selection">Framework Selection</TabsTrigger>
          <TabsTrigger value="customization">Customization Options</TabsTrigger>
        </TabsList>

        <TabsContent value="selection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Frameworks to Generate</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose the frameworks you want to generate based on your organizational needs
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {frameworkOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedFrameworks.includes(option.id);
                  
                  return (
                    <Card 
                      key={option.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleFrameworkSelection(option.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox 
                              checked={isSelected}
                              onChange={() => {}}
                              className="mt-1"
                            />
                            <IconComponent className={`h-6 w-6 ${option.color} mt-0.5`} />
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{option.name}</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {option.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="secondary" 
                                  className={getComplexityColor(option.complexity)}
                                >
                                  {option.complexity}
                                </Badge>
                                <Badge variant="outline">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {option.estimatedTime}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {selectedFrameworks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Ready to Generate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected {selectedFrameworks.length} framework{selectedFrameworks.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm font-medium">
                      Total estimated generation time: {getTotalEstimatedTime()}
                    </p>
                  </div>
                  <Button 
                    onClick={handleGenerateFrameworks}
                    disabled={isGenerating}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <Settings className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate Frameworks
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="customization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customization Options</CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced options to tailor the generated frameworks
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">AI-Driven Customization</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    Our AI automatically customizes frameworks based on your organizational profile, 
                    sector requirements, and maturity levels. Advanced customization options will be 
                    available after initial framework generation.
                  </p>
                </div>
                
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">
                    Select frameworks to unlock customization options
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentFrameworkGenerator;
