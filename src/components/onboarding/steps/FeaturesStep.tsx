
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { 
  ArrowRight, 
  ArrowLeft, 
  Shield, 
  Users, 
  BarChart3, 
  FileText,
  AlertTriangle,
  Target,
  Lightbulb,
  CheckCircle
} from "lucide-react";

interface FeaturesStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const features = [
  {
    id: 'risk_appetite',
    name: 'Risk Appetite Management',
    icon: Target,
    description: 'Define and monitor your organization\'s risk tolerance',
    category: 'Core'
  },
  {
    id: 'incident_management',
    name: 'Incident Management',
    icon: AlertTriangle,
    description: 'Track and manage risk incidents with SLA monitoring',
    category: 'Core'
  },
  {
    id: 'governance',
    name: 'Governance Framework',
    icon: Shield,
    description: 'Manage policies, procedures, and compliance',
    category: 'Core'
  },
  {
    id: 'third_party',
    name: 'Third Party Risk',
    icon: Users,
    description: 'Assess and monitor vendor and supplier risks',
    category: 'Core'
  },
  {
    id: 'analytics',
    name: 'Analytics & Reporting',
    icon: BarChart3,
    description: 'Generate insights with advanced analytics',
    category: 'Analytics'
  },
  {
    id: 'documents',
    name: 'Document Management',
    icon: FileText,
    description: 'Store and manage risk-related documents',
    category: 'Support'
  }
];

export const FeaturesStep: React.FC<FeaturesStepProps> = ({ onNext, onPrevious }) => {
  const { completeStep } = useOnboarding();
  const [interestedFeatures, setInterestedFeatures] = useState<string[]>([]);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  const toggleFeature = (featureId: string) => {
    setInterestedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleContinue = async () => {
    await completeStep('features', 'Feature Discovery', {
      interestedFeatures,
      viewedFeatures: features.map(f => f.id),
      completedAt: new Date().toISOString()
    });
    onNext();
  };

  const currentFeature = features[currentFeatureIndex];
  const Icon = currentFeature.icon;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Lightbulb className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Discover Key Features
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Let's explore the platform features that matter most to your role
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature Showcase */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <Icon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{currentFeature.name}</h3>
                <Badge variant="secondary">{currentFeature.category}</Badge>
              </div>
              <p className="text-gray-700 mb-4">{currentFeature.description}</p>
              <Button
                variant={interestedFeatures.includes(currentFeature.id) ? "default" : "outline"}
                onClick={() => toggleFeature(currentFeature.id)}
                className="mr-4"
              >
                {interestedFeatures.includes(currentFeature.id) ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Interested
                  </>
                ) : (
                  'Mark as Interested'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentFeatureIndex(Math.max(0, currentFeatureIndex - 1))}
            disabled={currentFeatureIndex === 0}
          >
            Previous Feature
          </Button>
          <div className="flex space-x-2">
            {features.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentFeatureIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentFeatureIndex(Math.min(features.length - 1, currentFeatureIndex + 1))}
            disabled={currentFeatureIndex === features.length - 1}
          >
            Next Feature
          </Button>
        </div>

        {/* Selected Features Summary */}
        {interestedFeatures.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">
              Features you're interested in ({interestedFeatures.length}):
            </h4>
            <div className="flex flex-wrap gap-2">
              {interestedFeatures.map(featureId => {
                const feature = features.find(f => f.id === featureId);
                return (
                  <Badge key={featureId} className="bg-green-500">
                    {feature?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
          <Button onClick={handleContinue}>
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
