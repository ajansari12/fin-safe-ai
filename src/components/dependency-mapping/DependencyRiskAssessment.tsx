
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dependencyMappingService, DependencyRisk, EnhancedDependency } from "@/services/dependency-mapping-service";

interface DependencyRiskAssessmentProps {
  dependency: EnhancedDependency;
}

const DependencyRiskAssessment: React.FC<DependencyRiskAssessmentProps> = ({ dependency }) => {
  const [isAddingRisk, setIsAddingRisk] = useState(false);
  const [formData, setFormData] = useState({
    risk_category: 'operational' as const,
    likelihood_score: 3,
    impact_score: 3,
    mitigation_strategy: '',
    contingency_plan: '',
    next_assessment_date: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: risks = [], isLoading } = useQuery({
    queryKey: ['dependencyRisks', dependency.id],
    queryFn: () => dependencyMappingService.getDependencyRisks(dependency.id)
  });

  const createRiskMutation = useMutation({
    mutationFn: (risk: any) => dependencyMappingService.createDependencyRisk({
      ...risk,
      dependency_id: dependency.id,
      last_assessment_date: new Date().toISOString().split('T')[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependencyRisks'] });
      setIsAddingRisk(false);
      setFormData({
        risk_category: 'operational',
        likelihood_score: 3,
        impact_score: 3,
        mitigation_strategy: '',
        contingency_plan: '',
        next_assessment_date: ''
      });
      toast({
        title: "Success",
        description: "Risk assessment created successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create risk assessment.",
        variant: "destructive"
      });
    }
  });

  const getRiskColor = (rating: string) => {
    switch (rating) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      case 'very_low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskIcon = (rating: string) => {
    switch (rating) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Target className="h-4 w-4" />;
      case 'low':
      case 'very_low':
        return <Shield className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRiskMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Risk Assessment - {dependency.dependency_name}
        </CardTitle>
        <CardDescription>
          Assess and manage risks associated with this dependency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {risks.length === 0 && !isAddingRisk && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No risk assessments found for this dependency.</p>
            <Button onClick={() => setIsAddingRisk(true)}>
              Create Risk Assessment
            </Button>
          </div>
        )}

        {risks.map((risk) => (
          <div key={risk.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getRiskColor(risk.risk_rating)}>
                  {getRiskIcon(risk.risk_rating)}
                  {risk.risk_rating.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-600 capitalize">{risk.risk_category}</span>
              </div>
              <div className="text-sm text-gray-500">
                Risk Score: {risk.likelihood_score} × {risk.impact_score} = {risk.likelihood_score * risk.impact_score}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Likelihood:</span> {risk.likelihood_score}/5
              </div>
              <div>
                <span className="font-medium">Impact:</span> {risk.impact_score}/5
              </div>
            </div>

            {risk.mitigation_strategy && (
              <div>
                <span className="font-medium text-sm">Mitigation Strategy:</span>
                <p className="text-sm text-gray-600 mt-1">{risk.mitigation_strategy}</p>
              </div>
            )}

            {risk.contingency_plan && (
              <div>
                <span className="font-medium text-sm">Contingency Plan:</span>
                <p className="text-sm text-gray-600 mt-1">{risk.contingency_plan}</p>
              </div>
            )}

            <div className="flex justify-between text-xs text-gray-500">
              <span>Last assessed: {new Date(risk.last_assessment_date).toLocaleDateString()}</span>
              {risk.next_assessment_date && (
                <span>Next review: {new Date(risk.next_assessment_date).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}

        {risks.length > 0 && !isAddingRisk && (
          <Button 
            onClick={() => setIsAddingRisk(true)}
            variant="outline"
            className="w-full"
          >
            Add Another Risk Assessment
          </Button>
        )}

        {isAddingRisk && (
          <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium">New Risk Assessment</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="risk_category">Risk Category</Label>
                <Select
                  value={formData.risk_category}
                  onValueChange={(value: any) => setFormData({ ...formData, risk_category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="reputational">Reputational</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="next_assessment_date">Next Assessment Date</Label>
                <Input
                  type="date"
                  value={formData.next_assessment_date}
                  onChange={(e) => setFormData({ ...formData, next_assessment_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="likelihood_score">Likelihood (1-5)</Label>
                <Select
                  value={formData.likelihood_score.toString()}
                  onValueChange={(value) => setFormData({ ...formData, likelihood_score: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Unlikely</SelectItem>
                    <SelectItem value="2">2 - Unlikely</SelectItem>
                    <SelectItem value="3">3 - Possible</SelectItem>
                    <SelectItem value="4">4 - Likely</SelectItem>
                    <SelectItem value="5">5 - Very Likely</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="impact_score">Impact (1-5)</Label>
                <Select
                  value={formData.impact_score.toString()}
                  onValueChange={(value) => setFormData({ ...formData, impact_score: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Minimal</SelectItem>
                    <SelectItem value="2">2 - Minor</SelectItem>
                    <SelectItem value="3">3 - Moderate</SelectItem>
                    <SelectItem value="4">4 - Major</SelectItem>
                    <SelectItem value="5">5 - Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="mitigation_strategy">Mitigation Strategy</Label>
              <Textarea
                placeholder="Describe how to reduce the likelihood or impact of this risk..."
                value={formData.mitigation_strategy}
                onChange={(e) => setFormData({ ...formData, mitigation_strategy: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="contingency_plan">Contingency Plan</Label>
              <Textarea
                placeholder="Describe what to do if this risk materializes..."
                value={formData.contingency_plan}
                onChange={(e) => setFormData({ ...formData, contingency_plan: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createRiskMutation.isPending}>
                {createRiskMutation.isPending ? 'Creating...' : 'Create Assessment'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingRisk(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default DependencyRiskAssessment;
