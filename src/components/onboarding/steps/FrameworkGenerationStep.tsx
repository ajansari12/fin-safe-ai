import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboarding } from "@/contexts/OnboardingContext";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { intelligentFrameworkGenerationService } from "@/services/intelligent-framework-generation-service";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Brain, CheckCircle, Zap, Target, Shield, FileText } from "lucide-react";
import { toast } from "sonner";

interface FrameworkGenerationStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const frameworkOptions = [
  {
    id: 'governance',
    title: 'Governance Framework',
    description: 'Board oversight, committees, and accountability structures',
    icon: Shield,
    category: 'Foundation'
  },
  {
    id: 'risk_appetite',
    title: 'Risk Appetite Framework',
    description: 'Define and monitor organizational risk tolerance',
    icon: Target,
    category: 'Risk Management'
  },
  {
    id: 'impact_tolerance',
    title: 'Impact Tolerance Framework',
    description: 'Business continuity and operational resilience thresholds',
    icon: Zap,
    category: 'Operations'
  },
  {
    id: 'control',
    title: 'Control Framework',
    description: 'Operational controls and key risk indicators',
    icon: FileText,
    category: 'Controls'
  },
  {
    id: 'compliance',
    title: 'Compliance Framework',
    description: 'Regulatory requirements and monitoring',
    icon: CheckCircle,
    category: 'Compliance'
  },
  {
    id: 'scenario_testing',
    title: 'Scenario Testing Framework',
    description: 'Stress testing and business continuity planning',
    icon: Brain,
    category: 'Testing'
  }
];

export const FrameworkGenerationStep: React.FC<FrameworkGenerationStepProps> = ({ onNext, onPrevious }) => {
  const { completeStep } = useOnboarding();
  const { profile, updateProfile } = useAuth();
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(['governance', 'risk_appetite']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleFramework = (frameworkId: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(frameworkId)
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  const handleGenerateFrameworks = async () => {
    setError(null);
    
    // Get fresh user profile to ensure we have the latest organization_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('User not authenticated. Please log in again.');
      return;
    }

    // Fetch the latest profile from database
    const { data: freshProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      setError('Unable to fetch user profile. Please try again.');
      return;
    }

    if (!freshProfile?.organization_id) {
      setError('Organization not found. Please complete organization setup first.');
      return;
    }

    if (selectedFrameworks.length === 0) {
      setError('Please select at least one framework to generate.');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Starting framework generation for organization:', freshProfile.organization_id);
      
      // First, ensure we have an organizational profile
      let orgProfile = await createOrUpdateOrganizationalProfile(freshProfile.organization_id);
      
      if (!orgProfile) {
        throw new Error('Failed to create organizational profile');
      }

      console.log('Organizational profile ready:', orgProfile.id);

      // Generate frameworks
      const results = await intelligentFrameworkGenerationService.generateFrameworks({
        profileId: orgProfile.id,
        frameworkTypes: selectedFrameworks,
        customizations: {
          industry_focus: true,
          regulatory_compliance: true,
          risk_maturity_appropriate: true
        }
      });

      setGenerationResults(results);
      
      await completeStep('frameworks', 'Framework Generation', {
        selectedFrameworks,
        generatedFrameworks: results.map(r => ({
          type: r.framework_type,
          name: r.framework_name,
          effectiveness_score: r.effectiveness_score,
          components_count: r.generation_metadata?.components_count || 0
        })),
        completedAt: new Date().toISOString()
      });

      toast.success(`Successfully generated ${results.length} frameworks!`);
      onNext();
    } catch (error) {
      console.error('Error generating frameworks:', error);
      let errorMessage = 'Failed to generate frameworks. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = `Framework generation failed: ${error.message}`;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const createOrUpdateOrganizationalProfile = async (organizationId: string) => {
    try {
      console.log('Creating/updating organizational profile using safe database function');
      
      // Use the safe database function to create/update organizational profile
      const { data: profileId, error } = await supabase.rpc('create_organizational_profile_safe', {
        p_organization_id: organizationId,
        p_preferred_framework_types: selectedFrameworks,
        p_auto_generate_frameworks: true
      });

      if (error) {
        console.error('Error from create_organizational_profile_safe:', error);
        throw new Error(`Database function failed: ${error.message}`);
      }

      if (!profileId) {
        throw new Error('Database function returned null profile ID');
      }

      // Fetch the created/updated profile to return full object
      const { data: profile, error: fetchError } = await supabase
        .from('organizational_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (fetchError) {
        console.error('Error fetching created organizational profile:', fetchError);
        throw new Error(`Failed to fetch created profile: ${fetchError.message}`);
      }

      console.log('Organizational profile created/updated successfully:', profile.id);
      return profile;
    } catch (error) {
      console.error('Error in createOrUpdateOrganizationalProfile:', error);
      throw error;
    }
  };

  if (generationResults.length > 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Frameworks Generated Successfully! 🎉
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Your personalized risk management frameworks are ready
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {generationResults.map((result, index) => (
              <div key={index} className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-green-900">{result.framework_name || 'Generated Framework'}</h4>
                  <Badge className="bg-green-600">
                    {result.effectiveness_score || 85}% Effective
                  </Badge>
                </div>
                <p className="text-sm text-green-800 mb-2">
                  {result.generation_metadata?.components_count || 0} components • {result.framework_data?.estimated_implementation_months || 6} months implementation
                </p>
                <div className="text-xs text-green-700">
                  Framework Type: {result.framework_type}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Ready to Implement
            </h3>
            <p className="text-blue-800 mb-4">
              Your frameworks have been saved and are ready for implementation. You can view and customize them in the Governance module.
            </p>
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onPrevious}>
              <ArrowLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>
            <Button onClick={onNext} size="lg">
              Continue Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          AI Framework Generation
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Let our AI generate personalized risk management frameworks based on your organization profile
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Framework Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Frameworks to Generate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frameworkOptions.map((framework) => {
              const Icon = framework.icon;
              const isSelected = selectedFrameworks.includes(framework.id);
              
              return (
                <div
                  key={framework.id}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                  onClick={() => toggleFramework(framework.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      checked={isSelected} 
                      onChange={() => {}} 
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium text-gray-900">{framework.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {framework.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{framework.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Zap className="h-5 w-5 text-blue-600 mr-2" />
            AI-Powered Benefits
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-800 mb-1">Industry Tailored</h5>
              <p className="text-gray-600">Frameworks customized for your sector and size</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-1">Regulatory Aligned</h5>
              <p className="text-gray-600">Built-in compliance with relevant regulations</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-1">Implementation Ready</h5>
              <p className="text-gray-600">Complete with timelines and resource allocation</p>
            </div>
          </div>
        </div>

        {/* Selected Summary */}
        {selectedFrameworks.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">
              Selected for Generation ({selectedFrameworks.length}):
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedFrameworks.map(id => {
                const framework = frameworkOptions.find(f => f.id === id);
                return (
                  <Badge key={id} className="bg-green-600">
                    {framework?.title}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Framework Generation Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setError(null)}
                      className="text-red-700 border-red-300 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onNext}
                      className="text-red-700"
                    >
                      Skip Framework Generation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
          <div className="flex space-x-2">
            <Button 
              variant="ghost"
              onClick={onNext}
              disabled={isGenerating}
            >
              Skip for Now
            </Button>
            <Button 
              onClick={handleGenerateFrameworks} 
              disabled={selectedFrameworks.length === 0 || isGenerating}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Frameworks...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Generate Frameworks
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};