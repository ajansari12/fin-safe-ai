
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowRight, 
  Shield, 
  Users, 
  BarChart3, 
  CheckCircle 
} from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const roleOptions = [
  { id: 'risk_manager', label: 'Risk Manager', icon: Shield, description: 'Lead risk assessments and strategy' },
  { id: 'compliance_officer', label: 'Compliance Officer', icon: CheckCircle, description: 'Ensure regulatory compliance' },
  { id: 'operations_staff', label: 'Operations Staff', icon: Users, description: 'Day-to-day operational tasks' },
  { id: 'executive', label: 'Executive/Board Member', icon: BarChart3, description: 'Strategic oversight and reporting' },
  { id: 'analyst', label: 'Risk Analyst', icon: BarChart3, description: 'Data analysis and reporting' },
];

const experienceOptions = [
  { id: 'beginner', label: 'New to Risk Management', description: 'I\'m just getting started' },
  { id: 'intermediate', label: 'Some Experience', description: 'I have basic knowledge' },
  { id: 'advanced', label: 'Experienced Professional', description: 'I\'m well-versed in risk management' },
];

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const { completeStep } = useOnboarding();
  const { profile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (selectedRole && selectedExperience && !isSubmitting) {
      console.log('WelcomeStep: Starting completion process');
      setIsSubmitting(true);
      
      try {
        await completeStep('welcome', 'Welcome & Assessment', {
          role: selectedRole,
          experience: selectedExperience,
          timestamp: new Date().toISOString()
        });
        console.log('WelcomeStep: Step completed successfully');
        // Don't call onNext() here - the context will handle navigation
      } catch (error) {
        console.error('WelcomeStep: Error completing step:', error);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Welcome, {profile?.full_name || 'User'}! 👋
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Let's customize your experience by understanding your role and background
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Role Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">What's your primary role?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${selectedRole === role.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`h-6 w-6 mt-1 ${
                      selectedRole === role.id ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{role.label}</h4>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <h3 className="text-lg font-semibold mb-4">What's your experience level?</h3>
          <div className="space-y-3">
            {experienceOptions.map((exp) => (
              <div
                key={exp.id}
                onClick={() => setSelectedExperience(exp.id)}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md
                  ${selectedExperience === exp.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{exp.label}</h4>
                    <p className="text-sm text-gray-600">{exp.description}</p>
                  </div>
                  {selectedExperience === exp.id && (
                    <Badge className="bg-blue-500">Selected</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end pt-6">
          <Button 
            onClick={handleContinue}
            disabled={!selectedRole || !selectedExperience || isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Processing...' : 'Continue Setup'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
