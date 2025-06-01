
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, TrendingUp } from "lucide-react";

interface TestScorecardData {
  overall_score: number;
  rto_achieved: boolean;
  rpo_achieved: boolean;
  actual_rto_hours: number;
  actual_rpo_hours: number;
  communication_effectiveness: number;
  resource_availability_score: number;
  system_recovery_score: number;
  stakeholder_response_score: number;
  scorecard_data: {
    technical_readiness: number;
    process_effectiveness: number;
    team_preparedness: number;
    documentation_quality: number;
  };
}

interface ContinuityTestScorecardProps {
  testResults: TestScorecardData;
  testName: string;
  testDate: string;
}

const ContinuityTestScorecard: React.FC<ContinuityTestScorecardProps> = ({
  testResults,
  testName,
  testDate
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (achieved: boolean) => {
    return achieved ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Met
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Not Met
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {testName} - Test Scorecard
          <Badge variant="outline">{testDate}</Badge>
        </CardTitle>
        <CardDescription>
          Comprehensive test results and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(testResults.overall_score)}`}>
              {testResults.overall_score}%
            </div>
            <p className="text-sm text-gray-600">Overall Test Score</p>
          </div>

          {/* RTO/RPO Achievement */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getScoreBadge(testResults.rto_achieved)}
              </div>
              <p className="text-sm font-medium">RTO Target</p>
              <p className="text-xs text-gray-600">
                Actual: {testResults.actual_rto_hours}h
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getScoreBadge(testResults.rpo_achieved)}
              </div>
              <p className="text-sm font-medium">RPO Target</p>
              <p className="text-xs text-gray-600">
                Actual: {testResults.actual_rpo_hours}h
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h4 className="font-medium">Performance Metrics</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Communication Effectiveness</span>
                  <span className={getScoreColor(testResults.communication_effectiveness * 10)}>
                    {testResults.communication_effectiveness}/10
                  </span>
                </div>
                <Progress value={testResults.communication_effectiveness * 10} className="mt-1" />
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>Resource Availability</span>
                  <span className={getScoreColor(testResults.resource_availability_score * 10)}>
                    {testResults.resource_availability_score}/10
                  </span>
                </div>
                <Progress value={testResults.resource_availability_score * 10} className="mt-1" />
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>System Recovery</span>
                  <span className={getScoreColor(testResults.system_recovery_score * 10)}>
                    {testResults.system_recovery_score}/10
                  </span>
                </div>
                <Progress value={testResults.system_recovery_score * 10} className="mt-1" />
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>Stakeholder Response</span>
                  <span className={getScoreColor(testResults.stakeholder_response_score * 10)}>
                    {testResults.stakeholder_response_score}/10
                  </span>
                </div>
                <Progress value={testResults.stakeholder_response_score * 10} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Detailed Scorecard */}
          <div className="space-y-4">
            <h4 className="font-medium">Detailed Assessment</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Technical Readiness</span>
                  <span className={getScoreColor(testResults.scorecard_data.technical_readiness * 10)}>
                    {testResults.scorecard_data.technical_readiness.toFixed(1)}/10
                  </span>
                </div>
                <Progress value={testResults.scorecard_data.technical_readiness * 10} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Process Effectiveness</span>
                  <span className={getScoreColor(testResults.scorecard_data.process_effectiveness * 10)}>
                    {testResults.scorecard_data.process_effectiveness.toFixed(1)}/10
                  </span>
                </div>
                <Progress value={testResults.scorecard_data.process_effectiveness * 10} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Team Preparedness</span>
                  <span className={getScoreColor(testResults.scorecard_data.team_preparedness * 10)}>
                    {testResults.scorecard_data.team_preparedness.toFixed(1)}/10
                  </span>
                </div>
                <Progress value={testResults.scorecard_data.team_preparedness * 10} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Documentation Quality</span>
                  <span className={getScoreColor(testResults.scorecard_data.documentation_quality * 10)}>
                    {testResults.scorecard_data.documentation_quality.toFixed(1)}/10
                  </span>
                </div>
                <Progress value={testResults.scorecard_data.documentation_quality * 10} />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <h5 className="font-medium text-blue-900">Recommendations</h5>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              {testResults.overall_score < 70 && (
                <li>• Consider additional training for the response team</li>
              )}
              {!testResults.rto_achieved && (
                <li>• Review and optimize recovery procedures to meet RTO targets</li>
              )}
              {!testResults.rpo_achieved && (
                <li>• Improve backup and data recovery processes</li>
              )}
              {testResults.communication_effectiveness < 7 && (
                <li>• Enhance communication protocols and contact lists</li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContinuityTestScorecard;
