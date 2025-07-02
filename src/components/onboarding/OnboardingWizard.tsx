
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  SkipForward,
  Star,
  User,
  Settings,
  Target,
  Lightbulb
} from "lucide-react";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ProfileStep } from "./steps/ProfileStep";
import { FeaturesStep } from "./steps/FeaturesStep";
import { PersonalizationStep } from "./steps/PersonalizationStep";
import { FrameworkGenerationStep } from "./steps/FrameworkGenerationStep";
import { GoalsStep } from "./steps/GoalsStep";

const stepIcons = {
  welcome: Star,
  profile: User,
  features: Lightbulb,
  personalization: Settings,
  frameworks: Target,
  goals: CheckCircle
};

export const OnboardingWizard: React.FC = () => {
  const { 
    steps, 
    currentSession, 
    skipOnboarding, 
    completeOnboarding,
    getCurrentStepIndex,
    canSkip 
  } = useOnboarding();
  
  const currentStepIndex = getCurrentStepIndex();
  const completionPercentage = currentSession?.completionPercentage || 0;

  // Debug logging to track step changes
  useEffect(() => {
    console.log('OnboardingWizard: Step changed', {
      currentStepIndex,
      currentStep: currentSession?.currentStep,
      steps: steps.map(s => ({ id: s.id, completed: s.completed }))
    });
  }, [currentStepIndex, currentSession?.currentStep, steps]);

  const handleNext = () => {
    console.log('OnboardingWizard: handleNext called');
    if (currentStepIndex < steps.length - 1) {
      // The context will handle updating to the next step through completeStep
      // No need to manually update step state here
    } else {
      // Last step completed
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    // For now, we'll keep this simple and not implement going backwards
    // In a real implementation, you might want to update the session's current_step
    console.log("Previous navigation not implemented");
  };

  const renderStep = () => {
    const stepId = steps[currentStepIndex]?.id;
    console.log('OnboardingWizard: Rendering step', { stepId, currentStepIndex });
    
    switch (stepId) {
      case 'welcome':
        return <WelcomeStep onNext={handleNext} />;
      case 'profile':
        return <ProfileStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'features':
        return <FeaturesStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'personalization':
        return <PersonalizationStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'frameworks':
        return <FrameworkGenerationStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'goals':
        return <GoalsStep onNext={handleNext} onPrevious={handlePrevious} />;
      default:
        return <div>Step not found: {stepId}</div>;
    }
  };

  if (!steps.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Risk Management Platform
          </h1>
          <p className="text-gray-600">
            Let's get you set up for success in just a few steps
          </p>
        </div>

        {/* Progress Section */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Setup Progress</CardTitle>
              {canSkip && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={skipOnboarding}
                  className="text-gray-600"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip Setup
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
                <span>{completionPercentage}% Complete</span>
              </div>
              <Progress value={completionPercentage} className="w-full" />
              
              {/* Step indicators */}
              <div className="flex justify-between items-center mt-6">
                {steps.map((step, index) => {
                  const Icon = stepIcons[step.id as keyof typeof stepIcons];
                  const isCompleted = step.completed;
                  const isCurrent = index === currentStepIndex;
                  const isPast = index < currentStepIndex;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center space-y-2">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                        ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                          isCurrent ? 'bg-blue-500 border-blue-500 text-white' :
                          isPast ? 'bg-gray-300 border-gray-300 text-gray-600' :
                          'bg-white border-gray-300 text-gray-400'}
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-medium ${
                          isCurrent ? 'text-blue-600' : 
                          isCompleted ? 'text-green-600' : 
                          'text-gray-500'
                        }`}>
                          {step.name}
                        </div>
                        {isCompleted && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Done
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};
