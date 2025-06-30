
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { ArrowLeft, Target, CheckCircle, Trophy } from "lucide-react";

interface GoalsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const goalOptions = [
  {
    id: 'compliance',
    title: 'Achieve Regulatory Compliance',
    description: 'Meet all regulatory requirements and maintain compliance status',
    category: 'Compliance'
  },
  {
    id: 'risk_reduction',
    title: 'Reduce Overall Risk Exposure',
    description: 'Identify and mitigate key risks across the organization',
    category: 'Risk Management'
  },
  {
    id: 'incident_response',
    title: 'Improve Incident Response Time',
    description: 'Faster detection, response, and resolution of risk incidents',
    category: 'Operations'
  },
  {
    id: 'reporting',
    title: 'Enhanced Risk Reporting',
    description: 'Better visibility and reporting for stakeholders and board',
    category: 'Governance'
  },
  {
    id: 'automation',
    title: 'Process Automation',
    description: 'Automate manual risk management processes and workflows',
    category: 'Efficiency'
  },
  {
    id: 'third_party',
    title: 'Third Party Risk Management',
    description: 'Better assessment and monitoring of vendor and supplier risks',
    category: 'Third Party'
  }
];

export const GoalsStep: React.FC<GoalsStepProps> = ({ onNext, onPrevious }) => {
  const { completeStep, completeOnboarding } = useOnboarding();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeStep('goals', 'Goal Setting', {
        selectedGoals,
        completedAt: new Date().toISOString()
      });
      
      // Complete the entire onboarding process
      await completeOnboarding();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Set Your Goals
        </CardTitle>
        <p className="text-gray-600 mt-2">
          What do you want to achieve with this platform? Select your primary objectives.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goal Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goalOptions.map((goal) => (
            <div
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`
                p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md
                ${selectedGoals.includes(goal.id) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {goal.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
                {selectedGoals.includes(goal.id) && (
                  <CheckCircle className="h-5 w-5 text-blue-600 ml-2 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Goals Summary */}
        {selectedGoals.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Your Selected Goals ({selectedGoals.length}):
            </h4>
            <div className="space-y-1">
              {selectedGoals.map(goalId => {
                const goal = goalOptions.find(g => g.id === goalId);
                return (
                  <div key={goalId} className="text-sm text-green-800">
                    • {goal?.title}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Final Message */}
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            You're All Set! 🎉
          </h3>
          <p className="text-blue-800 mb-4">
            Congratulations! You've completed the setup process. The platform is now customized for your needs and you're ready to start managing risk effectively.
          </p>
          <p className="text-sm text-blue-700">
            You can always update your preferences and goals from the Settings page.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
          <Button 
            onClick={handleComplete} 
            disabled={isCompleting}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {isCompleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Completing Setup...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-5 w-5" />
                Complete Setup
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
