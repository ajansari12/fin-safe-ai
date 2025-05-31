
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, AlertCircle, DollarSign } from "lucide-react";
import { continuityService, ContinuityPlan } from "@/services/continuity-service";
import { getDependencies } from "@/services/dependencies-service";
import { useToast } from "@/hooks/use-toast";

interface BusinessImpactCalculatorProps {
  orgId: string;
  selectedPlan?: ContinuityPlan;
}

const BusinessImpactCalculator: React.FC<BusinessImpactCalculatorProps> = ({ 
  orgId, 
  selectedPlan 
}) => {
  const [plans, setPlans] = useState<ContinuityPlan[]>([]);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(selectedPlan?.id || '');
  const [assessmentData, setAssessmentData] = useState({
    financial_impact_estimate: 0,
    operational_disruption_hours: 0,
    dependencies_affected: [] as string[],
  });
  const [impactResults, setImpactResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    try {
      const [plansData, dependenciesData] = await Promise.all([
        continuityService.getContinuityPlans(orgId),
        getDependencies()
      ]);
      setPlans(plansData);
      setDependencies(dependenciesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load plans and dependencies",
        variant: "destructive",
      });
    }
  };

  const calculateImpact = async () => {
    if (!selectedPlanId) {
      toast({
        title: "Error",
        description: "Please select a continuity plan",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCalculating(true);
      const result = await continuityService.calculateBusinessImpact(selectedPlanId, assessmentData);
      setImpactResults(result);
      toast({
        title: "Success",
        description: "Business impact calculated successfully",
      });
    } catch (error) {
      console.error('Error calculating impact:', error);
      toast({
        title: "Error",
        description: "Failed to calculate business impact",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getImpactColor = (score: number) => {
    if (score >= 8) return "text-red-600";
    if (score >= 6) return "text-orange-600";
    if (score >= 4) return "text-yellow-600";
    return "text-green-600";
  };

  const getImpactLabel = (score: number) => {
    if (score >= 8) return "Critical";
    if (score >= 6) return "High";
    if (score >= 4) return "Medium";
    return "Low";
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Business Impact Calculator</h2>
        <p className="text-muted-foreground">
          Calculate potential business impact based on dependencies, RTO/RPO, and operational factors
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Impact Assessment Parameters
            </CardTitle>
            <CardDescription>
              Configure the parameters for business impact calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="plan-select">Continuity Plan</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a continuity plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.plan_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlanData && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm space-y-1">
                  <div><strong>RTO:</strong> {selectedPlanData.rto_hours} hours</div>
                  {selectedPlanData.rpo_hours && (
                    <div><strong>RPO:</strong> {selectedPlanData.rpo_hours} hours</div>
                  )}
                  <div><strong>Status:</strong> 
                    <Badge variant="secondary" className="ml-2">{selectedPlanData.status}</Badge>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="financial-impact">Financial Impact Estimate ($)</Label>
              <Input
                id="financial-impact"
                type="number"
                value={assessmentData.financial_impact_estimate}
                onChange={(e) => setAssessmentData({
                  ...assessmentData,
                  financial_impact_estimate: parseFloat(e.target.value) || 0
                })}
                placeholder="Enter estimated financial impact"
              />
            </div>

            <div>
              <Label htmlFor="operational-hours">Operational Disruption (hours)</Label>
              <Input
                id="operational-hours"
                type="number"
                value={assessmentData.operational_disruption_hours}
                onChange={(e) => setAssessmentData({
                  ...assessmentData,
                  operational_disruption_hours: parseFloat(e.target.value) || 0
                })}
                placeholder="Expected disruption duration"
              />
            </div>

            <div>
              <Label>Critical Dependencies Affected</Label>
              <div className="mt-2 max-h-32 overflow-y-auto space-y-2">
                {dependencies.map((dep) => (
                  <label key={dep.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={assessmentData.dependencies_affected.includes(dep.id)}
                      onChange={(e) => {
                        const newDeps = e.target.checked
                          ? [...assessmentData.dependencies_affected, dep.id]
                          : assessmentData.dependencies_affected.filter(id => id !== dep.id);
                        setAssessmentData({
                          ...assessmentData,
                          dependencies_affected: newDeps
                        });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{dep.dependency_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {dep.criticality}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>

            <Button 
              onClick={calculateImpact} 
              disabled={isCalculating || !selectedPlanId}
              className="w-full"
            >
              {isCalculating ? "Calculating..." : "Calculate Business Impact"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Impact Assessment Results
            </CardTitle>
            <CardDescription>
              Calculated business impact scores and risk analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {impactResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getImpactColor(impactResults.overall_risk_score)}`}>
                      {impactResults.overall_risk_score.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Risk</div>
                    <Badge variant="outline" className="mt-1">
                      {getImpactLabel(impactResults.overall_risk_score)}
                    </Badge>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${impactResults.financial_impact_estimate.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Financial Impact</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Business Impact</span>
                    <span className={`font-medium ${getImpactColor(impactResults.business_impact_score)}`}>
                      {impactResults.business_impact_score.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Operational Impact</span>
                    <span className={`font-medium ${getImpactColor(impactResults.operational_impact_score)}`}>
                      {impactResults.operational_impact_score.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Compliance Impact</span>
                    <span className={`font-medium ${getImpactColor(impactResults.compliance_impact_score)}`}>
                      {impactResults.compliance_impact_score.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reputational Impact</span>
                    <span className={`font-medium ${getImpactColor(impactResults.reputational_impact_score)}`}>
                      {impactResults.reputational_impact_score.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recovery Complexity</span>
                    <span className={`font-medium ${getImpactColor(impactResults.recovery_complexity_score)}`}>
                      {impactResults.recovery_complexity_score.toFixed(1)}/10
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>Dependencies affected: {impactResults.dependencies_affected.length}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Run the calculator to see business impact results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessImpactCalculator;
