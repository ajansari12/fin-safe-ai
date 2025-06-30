
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  Users,
  Calendar,
  BarChart3,
  Target
} from "lucide-react";

const CustomerHealthDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  const healthScores = [
    {
      id: 1,
      customerName: "FirstNational Bank",
      overallScore: 92,
      usageScore: 95,
      adoptionScore: 88,
      outcomeScore: 93,
      trend: "up",
      lastActive: "2 hours ago",
      riskLevel: "low"
    },
    {
      id: 2,
      customerName: "Community Credit Union",
      overallScore: 67,
      usageScore: 72,
      adoptionScore: 58,
      outcomeScore: 71,
      trend: "down",
      lastActive: "1 day ago",
      riskLevel: "medium"
    },
    {
      id: 3,
      customerName: "Regional Bank Corp",
      overallScore: 43,
      usageScore: 38,
      adoptionScore: 45,
      outcomeScore: 46,
      trend: "down",
      lastActive: "5 days ago",
      riskLevel: "high"
    }
  ];

  const healthMetrics = {
    averageScore: 78,
    healthyAccounts: 34,
    atRiskAccounts: 8,
    criticalAccounts: 5,
    trendsImproving: 23,
    trendsDecling: 12
  };

  const predictiveAlerts = [
    {
      id: 1,
      customer: "Community Credit Union",
      type: "Feature Adoption Risk",
      severity: "Medium",
      prediction: "65% likelihood of reduced adoption in next 30 days",
      recommendation: "Schedule feature training session"
    },
    {
      id: 2,
      customer: "Regional Bank Corp", 
      type: "Churn Risk",
      severity: "High",
      prediction: "78% likelihood of churn in next 90 days",
      recommendation: "Immediate executive intervention required"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Healthy</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">At Risk</Badge>;
    return <Badge className="bg-red-500">Critical</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Health Overview</TabsTrigger>
          <TabsTrigger value="scores">Individual Scores</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Health Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Healthy (80-100)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(healthMetrics.healthyAccounts / 47) * 100} className="w-20 h-2" />
                      <span className="text-sm font-medium">{healthMetrics.healthyAccounts}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">At Risk (60-79)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(healthMetrics.atRiskAccounts / 47) * 100} className="w-20 h-2" />
                      <span className="text-sm font-medium">{healthMetrics.atRiskAccounts}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical (0-59)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(healthMetrics.criticalAccounts / 47) * 100} className="w-20 h-2" />
                      <span className="text-sm font-medium">{healthMetrics.criticalAccounts}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Health Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Improving</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{healthMetrics.trendsImproving}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Declining</span>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">{healthMetrics.trendsDecling}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">{healthMetrics.averageScore}</div>
                    <div className="text-sm text-muted-foreground">Average Health Score</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">87%</div>
                      <div className="text-muted-foreground">Feature Adoption</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">92%</div>
                      <div className="text-muted-foreground">Usage Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Health Scores</CardTitle>
              <CardDescription>
                Multi-dimensional health scoring based on usage, adoption, and outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthScores.map((customer) => (
                  <div key={customer.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{customer.customerName}</h4>
                        <p className="text-sm text-muted-foreground">Last active: {customer.lastActive}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(customer.trend)}
                        {getScoreBadge(customer.overallScore)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs">Overall</span>
                          <span className={`text-xs font-medium ${getScoreColor(customer.overallScore)}`}>
                            {customer.overallScore}
                          </span>
                        </div>
                        <Progress value={customer.overallScore} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs">Usage</span>
                          <span className="text-xs font-medium">{customer.usageScore}</span>
                        </div>
                        <Progress value={customer.usageScore} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs">Adoption</span>
                          <span className="text-xs font-medium">{customer.adoptionScore}</span>
                        </div>
                        <Progress value={customer.adoptionScore} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs">Outcomes</span>
                          <span className="text-xs font-medium">{customer.outcomeScore}</span>
                        </div>
                        <Progress value={customer.outcomeScore} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Predictive Risk Alerts
              </CardTitle>
              <CardDescription>
                AI-powered early warning system for customer success risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{alert.customer}</h4>
                        <p className="text-sm text-muted-foreground">{alert.type}</p>
                      </div>
                      <Badge variant={alert.severity === "High" ? "destructive" : "default"}>
                        {alert.severity} Risk
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Prediction:</span>
                        <p className="text-sm text-muted-foreground">{alert.prediction}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Recommendation:</span>
                        <p className="text-sm text-muted-foreground">{alert.recommendation}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm">Create Intervention</Button>
                      <Button variant="outline" size="sm">Schedule Call</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Industry Benchmarks</CardTitle>
                <CardDescription>Compare against similar financial institutions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Community Banks</span>
                      <span className="text-sm font-medium">Industry: 74 | You: 78</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Regional Banks</span>
                      <span className="text-sm font-medium">Industry: 81 | You: 85</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Credit Unions</span>
                      <span className="text-sm font-medium">Industry: 72 | You: 76</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Metrics Trends</CardTitle>
                <CardDescription>30-day moving averages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Platform Adoption Rate</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">+5.2%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Time to Value</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">-12 days</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">+0.8 pts</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerHealthDashboard;
