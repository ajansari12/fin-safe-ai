import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Users, 
  Shield,
  Settings,
  Target,
  Zap
} from 'lucide-react';

interface FrameworkGenerationPreviewProps {
  orgData: any;
  frameworkProgress: {
    status: 'not_started' | 'analyzing' | 'generating' | 'customizing' | 'completed' | 'error';
    progress: number;
    currentStep: string;
    generatedFrameworks: any[];
    selectedFramework?: any;
    customizations?: Record<string, any>;
    errorMessage?: string;
  };
  onGenerateFramework?: () => void;
  onSelectFramework?: (framework: any) => void;
  onCustomizeFramework?: (customizations: Record<string, any>) => void;
}

const FrameworkGenerationPreview: React.FC<FrameworkGenerationPreviewProps> = ({
  orgData,
  frameworkProgress,
  onGenerateFramework,
  onSelectFramework,
  onCustomizeFramework
}) => {
  const { status, progress, currentStep, generatedFrameworks, selectedFramework, errorMessage } = frameworkProgress;

  const getStatusIcon = () => {
    switch (status) {
      case 'not_started':
        return <Brain className="h-8 w-8 text-primary" />;
      case 'analyzing':
      case 'generating':
      case 'customizing':
        return <Loader2 className="h-8 w-8 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Brain className="h-8 w-8 text-primary" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'analyzing':
      case 'generating':
      case 'customizing':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  if (status === 'not_started') {
    return (
      <div className="space-y-6">
        {/* Organization Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organization Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Organization</div>
                <div className="font-medium">{orgData.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Sector</div>
                <div className="font-medium">{orgData.sector}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Size</div>
                <div className="font-medium">{orgData.size}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Risk Maturity</div>
                <div className="font-medium capitalize">{orgData.riskMaturity || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Compliance Maturity</div>
                <div className="font-medium capitalize">{orgData.complianceMaturity || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Regulatory Frameworks</div>
                <div className="font-medium">
                  {orgData.regulatoryFrameworks?.length > 0 
                    ? orgData.regulatoryFrameworks.join(', ')
                    : 'None selected'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Framework Generation Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Framework Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Framework Generation Ready</h3>
                <p className="text-muted-foreground mb-6">
                  Your organization profile is complete. Framework generation will be handled in the next step 
                  where our AI will analyze your profile and generate customized risk management frameworks 
                  tailored to your specific needs, sector requirements, and regulatory obligations.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="font-medium">Regulatory Compliance</div>
                    <div className="text-sm text-muted-foreground">OSFI E-21, Basel III, ISO standards</div>
                  </div>
                  <div className="text-center">
                    <Settings className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="font-medium">Custom Controls</div>
                    <div className="text-sm text-muted-foreground">Tailored to your maturity level</div>
                  </div>
                  <div className="text-center">
                    <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="font-medium">Best Practices</div>
                    <div className="text-sm text-muted-foreground">Industry-leading frameworks</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-800">
                    <strong>Next Step:</strong> Framework generation will happen in the dedicated onboarding step 
                    where you can select and customize frameworks for your organization.
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'analyzing' || status === 'generating' || status === 'customizing') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              Framework Generation in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <div className="mb-4">
                <div className={`text-lg font-semibold ${getStatusColor()}`}>
                  {currentStep}
                </div>
                <div className="text-muted-foreground mt-2">
                  This may take a few minutes while we analyze your organization and generate optimal frameworks.
                </div>
              </div>
              
              <div className="max-w-md mx-auto">
                <Progress value={progress} className="w-full mb-2" />
                <div className="text-sm text-muted-foreground">
                  {progress}% complete
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className={`text-center p-4 rounded-lg border ${
                  progress > 25 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <Users className={`h-6 w-6 mx-auto mb-2 ${
                    progress > 25 ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <div className="text-sm font-medium">Profile Analysis</div>
                  {progress > 25 && <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />}
                </div>
                
                <div className={`text-center p-4 rounded-lg border ${
                  progress > 50 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <Target className={`h-6 w-6 mx-auto mb-2 ${
                    progress > 50 ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <div className="text-sm font-medium">Framework Generation</div>
                  {progress > 50 && <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />}
                </div>
                
                <div className={`text-center p-4 rounded-lg border ${
                  progress > 75 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <Settings className={`h-6 w-6 mx-auto mb-2 ${
                    progress > 75 ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <div className="text-sm font-medium">Customization</div>
                  {progress > 75 && <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Framework Generation Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Generation Failed</h3>
              <p className="text-muted-foreground mb-4">
                {errorMessage || 'An error occurred during framework generation. Please try again.'}
              </p>
                <Button onClick={() => onGenerateFramework?.()} variant="outline">
                  Try Again
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'completed' && generatedFrameworks.length > 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Framework Generation Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-lg font-semibold mb-2">
                Successfully generated {generatedFrameworks.length} customized frameworks
              </div>
              <div className="text-muted-foreground">
                Select a framework to review and customize further
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Frameworks */}
        <div className="grid gap-4">
          {generatedFrameworks.map((framework, index) => (
            <Card 
              key={framework.id || index}
              className={`cursor-pointer transition-all ${
                selectedFramework?.id === framework.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onSelectFramework?.(framework)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{framework.template_name}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      {framework.template_description}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{framework.template_type}</Badge>
                    <Badge variant="secondary">{framework.complexity_level}</Badge>
                    {selectedFramework?.id === framework.id && (
                      <Badge className="bg-primary">Selected</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Industry Sector</div>
                    <div className="font-medium capitalize">{framework.industry_sector}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Effectiveness Score</div>
                    <div className="font-medium">{(framework.effectiveness_score * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Usage Count</div>
                    <div className="font-medium">{framework.usage_count}</div>
                  </div>
                </div>
                
                {framework.regulatory_basis && framework.regulatory_basis.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-2">Regulatory Basis:</div>
                    <div className="flex flex-wrap gap-1">
                      {framework.regulatory_basis.map((reg: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {reg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedFramework && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Framework Preview: {selectedFramework.template_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Framework Overview</h4>
                  <p className="text-sm text-muted-foreground">
                    This framework includes {selectedFramework.template_data?.categories?.length || 'multiple'} risk categories,
                    comprehensive controls, and monitoring procedures tailored to your organization's profile.
                  </p>
                </div>
                
                {selectedFramework.template_data?.categories && (
                  <div>
                    <h4 className="font-medium mb-2">Risk Categories</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedFramework.template_data.categories.map((category: string, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedFramework.implementation_steps && (
                  <div>
                    <h4 className="font-medium mb-2">Implementation Steps</h4>
                    <div className="text-sm text-muted-foreground">
                      {selectedFramework.implementation_steps.length} step implementation guide included
                    </div>
                  </div>
                )}
                
                {selectedFramework.success_metrics && (
                  <div>
                    <h4 className="font-medium mb-2">Success Metrics</h4>
                    <div className="text-sm text-muted-foreground">
                      {selectedFramework.success_metrics.length} KPIs and success metrics defined
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
};

export default FrameworkGenerationPreview;