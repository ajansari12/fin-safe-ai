
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, FileText, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIAssistantContinuityBuilderProps {
  onPlanGenerated: (planData: any) => void;
}

const AIAssistantContinuityBuilder: React.FC<AIAssistantContinuityBuilderProps> = ({
  onPlanGenerated
}) => {
  const [businessFunction, setBusinessFunction] = useState('');
  const [riskScenario, setRiskScenario] = useState('');
  const [currentCapabilities, setCurrentCapabilities] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePlan = async () => {
    if (!businessFunction || !riskScenario) {
      toast({
        title: "Missing Information",
        description: "Please provide business function and risk scenario details",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an AI service
      const generatedPlan = {
        plan_name: `${businessFunction} Continuity Plan`,
        plan_description: `Comprehensive continuity plan for ${businessFunction} addressing ${riskScenario}`,
        rto_hours: 4, // AI would determine based on criticality
        rpo_hours: 1,
        fallback_steps: generateFallbackSteps(businessFunction, riskScenario),
        recovery_procedures: generateRecoveryProcedures(businessFunction),
        communication_plan: generateCommunicationPlan(businessFunction),
        risk_assessment: generateRiskAssessment(riskScenario),
        testing_schedule: generateTestingSchedule()
      };

      onPlanGenerated(generatedPlan);
      
      toast({
        title: "Plan Generated",
        description: "AI has generated a comprehensive continuity plan based on your inputs"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate continuity plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackSteps = (businessFunction: string, scenario: string) => {
    return `1. Immediate Response (0-1 hours):
   - Activate incident response team
   - Assess impact on ${businessFunction}
   - Notify key stakeholders
   - Implement emergency procedures

2. Short-term Recovery (1-4 hours):
   - Switch to backup systems/processes
   - Relocate operations if necessary
   - Maintain essential ${businessFunction} services
   - Monitor system performance

3. Full Recovery (4-24 hours):
   - Restore primary systems
   - Resume normal ${businessFunction} operations
   - Conduct post-incident review
   - Update procedures based on lessons learned

Specific to ${scenario}:
- [AI would provide scenario-specific steps]
- [Risk mitigation actions]
- [Alternative resource allocation]`;
  };

  const generateRecoveryProcedures = (businessFunction: string) => {
    return `Recovery procedures tailored for ${businessFunction} operations including system restoration, data recovery, and operational continuity measures.`;
  };

  const generateCommunicationPlan = (businessFunction: string) => {
    return `Communication protocols for ${businessFunction} including internal notifications, customer communications, and regulatory reporting requirements.`;
  };

  const generateRiskAssessment = (scenario: string) => {
    return `Risk assessment for ${scenario} including likelihood, impact analysis, and mitigation strategies.`;
  };

  const generateTestingSchedule = () => {
    return "Quarterly tabletop exercises, semi-annual dry runs, and annual full-scale tests with specific scenarios and success criteria.";
  };

  const suggestions = [
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Document Current State",
      description: "Include existing backup systems, alternate locations, and current procedures"
    },
    {
      icon: <Clock className="h-4 w-4" />,
      title: "Define Time Objectives",
      description: "Specify maximum acceptable downtime and data loss tolerance"
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "Identify Critical Dependencies",
      description: "List key systems, suppliers, and resources required for operations"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Continuity Plan Builder
        </CardTitle>
        <CardDescription>
          Let AI help you create a comprehensive business continuity plan based on your specific requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Business Function</label>
            <Input
              placeholder="e.g., Customer Service, Payment Processing, Manufacturing"
              value={businessFunction}
              onChange={(e) => setBusinessFunction(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Risk Scenario</label>
            <Textarea
              placeholder="Describe the potential disruption scenario (e.g., system outage, natural disaster, cyber attack)"
              value={riskScenario}
              onChange={(e) => setRiskScenario(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Capabilities (Optional)</label>
            <Textarea
              placeholder="Describe existing backup systems, procedures, or resources"
              value={currentCapabilities}
              onChange={(e) => setCurrentCapabilities(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            AI Suggestions
          </h4>
          <div className="grid gap-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-blue-600 mt-0.5">{suggestion.icon}</div>
                <div>
                  <h5 className="text-sm font-medium">{suggestion.title}</h5>
                  <p className="text-xs text-gray-600">{suggestion.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={generatePlan} 
          disabled={isGenerating || !businessFunction || !riskScenario}
          className="w-full"
        >
          {isGenerating ? (
            <>Generating Plan...</>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Continuity Plan
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500">
          <Badge variant="outline" className="mr-2">Beta</Badge>
          AI-generated plans should be reviewed and customized by qualified personnel
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistantContinuityBuilder;
