
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from "recharts";
import { CheckCircle, XCircle, Clock, TrendingUp, Target } from "lucide-react";
import { continuityService, ContinuityTestOutcome } from "@/services/continuity-service";
import { useToast } from "@/hooks/use-toast";

interface ContinuityTestDashboardProps {
  orgId: string;
}

const ContinuityTestDashboard: React.FC<ContinuityTestDashboardProps> = ({ orgId }) => {
  const [testOutcomes, setTestOutcomes] = useState<ContinuityTestOutcome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTestOutcomes();
  }, [orgId]);

  const loadTestOutcomes = async () => {
    try {
      setIsLoading(true);
      const outcomes = await continuityService.getContinuityTestOutcomes(orgId);
      setTestOutcomes(outcomes);
    } catch (error) {
      console.error('Error loading test outcomes:', error);
      toast({
        title: "Error",
        description: "Failed to load test outcomes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "destructive";
  };

  // Calculate aggregate metrics
  const totalTests = testOutcomes.length;
  const successfulTests = testOutcomes.filter(t => t.overall_score >= 70).length;
  const averageScore = totalTests > 0 ? testOutcomes.reduce((sum, t) => sum + t.overall_score, 0) / totalTests : 0;
  const rtoSuccessRate = totalTests > 0 ? (testOutcomes.filter(t => t.rto_achieved).length / totalTests) * 100 : 0;
  const rpoSuccessRate = totalTests > 0 ? (testOutcomes.filter(t => t.rpo_achieved).length / totalTests) * 100 : 0;

  // Prepare chart data
  const scoreTrendData = testOutcomes
    .slice(-6)
    .map((outcome, index) => ({
      test: `Test ${index + 1}`,
      score: outcome.overall_score,
      rto: outcome.rto_achieved ? 100 : 0,
      rpo: outcome.rpo_achieved ? 100 : 0,
    }));

  const scorecardData = testOutcomes.length > 0 ? [
    {
      metric: 'Technical Readiness',
      score: testOutcomes.reduce((sum, t) => sum + t.scorecard_data.technical_readiness, 0) / totalTests,
    },
    {
      metric: 'Process Effectiveness',
      score: testOutcomes.reduce((sum, t) => sum + t.scorecard_data.process_effectiveness, 0) / totalTests,
    },
    {
      metric: 'Team Preparedness',
      score: testOutcomes.reduce((sum, t) => sum + t.scorecard_data.team_preparedness, 0) / totalTests,
    },
    {
      metric: 'Documentation Quality',
      score: testOutcomes.reduce((sum, t) => sum + t.scorecard_data.documentation_quality, 0) / totalTests,
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Continuity Test Dashboard</h2>
        <p className="text-muted-foreground">
          Comprehensive scorecards and analytics for business continuity testing outcomes
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">
              {successfulTests} successful ({totalTests > 0 ? Math.round((successfulTests / totalTests) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall test performance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RTO Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(rtoSuccessRate)}`}>
              {rtoSuccessRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Recovery time objectives met
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RPO Success</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(rpoSuccessRate)}`}>
              {rpoSuccessRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Recovery point objectives met
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scorecards">Scorecards</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="details">Test Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
                <CardDescription>
                  Overall assessment across key dimensions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={scorecardData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 10]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>
                  Test scores across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scorecardData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scorecards">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testOutcomes.slice(0, 6).map((outcome) => (
              <Card key={outcome.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Test Scorecard</CardTitle>
                    <Badge variant={getScoreBadge(outcome.overall_score)}>
                      {outcome.overall_score.toFixed(1)}%
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(outcome.test_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Technical Readiness</span>
                        <span>{outcome.scorecard_data.technical_readiness.toFixed(1)}</span>
                      </div>
                      <Progress value={outcome.scorecard_data.technical_readiness * 10} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Process Effectiveness</span>
                        <span>{outcome.scorecard_data.process_effectiveness.toFixed(1)}</span>
                      </div>
                      <Progress value={outcome.scorecard_data.process_effectiveness * 10} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Team Preparedness</span>
                        <span>{outcome.scorecard_data.team_preparedness.toFixed(1)}</span>
                      </div>
                      <Progress value={outcome.scorecard_data.team_preparedness * 10} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Documentation Quality</span>
                        <span>{outcome.scorecard_data.documentation_quality.toFixed(1)}</span>
                      </div>
                      <Progress value={outcome.scorecard_data.documentation_quality * 10} className="h-2" />
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">RTO Achieved</span>
                        {outcome.rto_achieved ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">RPO Achieved</span>
                        {outcome.rpo_achieved ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Test Performance Trends</CardTitle>
              <CardDescription>
                Track improvement in test scores over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="test" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" name="Overall Score" />
                  <Line type="monotone" dataKey="rto" stroke="#82ca9d" name="RTO Success" />
                  <Line type="monotone" dataKey="rpo" stroke="#ffc658" name="RPO Success" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
              <CardDescription>
                Detailed breakdown of all continuity tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testOutcomes.map((outcome) => (
                  <div key={outcome.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium">
                          Test conducted on {new Date(outcome.test_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Overall Score: {outcome.overall_score.toFixed(1)}%
                        </div>
                      </div>
                      <Badge variant={getScoreBadge(outcome.overall_score)}>
                        {getScoreBadge(outcome.overall_score) === 'success' ? 'Passed' : 
                         getScoreBadge(outcome.overall_score) === 'warning' ? 'Marginal' : 'Failed'}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-sm font-medium mb-2">Recovery Objectives</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>RTO Target vs Actual:</span>
                            <span className={outcome.rto_achieved ? "text-green-600" : "text-red-600"}>
                              {outcome.actual_rto_hours}h ({outcome.rto_achieved ? "✓" : "✗"})
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>RPO Target vs Actual:</span>
                            <span className={outcome.rpo_achieved ? "text-green-600" : "text-red-600"}>
                              {outcome.actual_rpo_hours}h ({outcome.rpo_achieved ? "✓" : "✗"})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Performance Scores</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Communication:</span>
                            <span>{outcome.communication_effectiveness.toFixed(1)}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span>System Recovery:</span>
                            <span>{outcome.system_recovery_score.toFixed(1)}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Resource Availability:</span>
                            <span>{outcome.resource_availability_score.toFixed(1)}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {outcome.lessons_learned && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-1">Lessons Learned</div>
                        <div className="text-sm text-muted-foreground">{outcome.lessons_learned}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {testOutcomes.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No continuity test outcomes available yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Run continuity tests to see performance analytics and scorecards here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContinuityTestDashboard;
