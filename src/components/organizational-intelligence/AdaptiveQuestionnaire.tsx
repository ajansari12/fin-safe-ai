
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, CheckCircle, Clock } from 'lucide-react';

interface AdaptiveQuestionnaireProps {
  orgId: string;
}

const AdaptiveQuestionnaire: React.FC<AdaptiveQuestionnaireProps> = ({ orgId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Adaptive Assessment</h2>
            <p className="text-muted-foreground">
              Intelligent organizational assessment questionnaire
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">~15 minutes</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assessment Progress</CardTitle>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Begin Assessment</h3>
            <p className="text-muted-foreground mb-4">
              This adaptive questionnaire will adjust based on your organization's profile and responses.
            </p>
            <Button size="lg">
              Start Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdaptiveQuestionnaire;
