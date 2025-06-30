
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3,
  Lightbulb
} from "lucide-react";

const ProactiveSupportCenter = () => {
  const usageAnalytics = [
    {
      id: 1,
      customer: "FirstNational Bank",
      feature: "Risk Assessment Module",
      usage: 85,
      trend: "up",
      opportunity: "Advanced reporting features underutilized",
      recommendation: "Schedule training on custom dashboard creation"
    },
    {
      id: 2,
      customer: "Community Credit Union",
      feature: "Incident Management",
      usage: 45,
      trend: "down",
      opportunity: "Low adoption of automated workflows",
      recommendation: "Implement workflow templates for common incidents"
    },
    {
      id: 3,
      customer: "Regional Bank Corp",
      feature: "Compliance Tracking",
      usage: 92,
      trend: "up",
      opportunity: "Ready for advanced compliance analytics",
      recommendation: "Introduce predictive compliance risk scoring"
    }
  ];

  const bestPractices = [
    {
      id: 1,
      title: "Automated Risk Threshold Monitoring",
      category: "Risk Management",
      adoptionRate: 78,
      description: "Set up automated alerts when risk metrics exceed defined thresholds",
      benefits: ["Faster response times", "Reduced manual monitoring", "Proactive risk management"],
      customers: ["FirstNational Bank", "Regional Bank Corp"]
    },
    {
      id: 2,
      title: "Quarterly Risk Assessment Automation",
      category: "Compliance",
      adoptionRate: 62,
      description: "Automate quarterly risk assessments using templates and workflows",
      benefits: ["Time savings", "Consistency", "Audit trail"],
      customers: ["Community Credit Union", "Metro Bank"]
    }
  ];

  const feedbackData = [
    {
      id: 1,
      customer: "FirstNational Bank",
      type: "Feature Request",
      sentiment: "positive",
      feedback: "Would love to see more customizable dashboard widgets",
      date: "2024-07-20",
      status: "under_review"
    },
    {
      id: 2,
      customer: "Community Credit Union", 
      type: "Support Issue",
      sentiment: "neutral",
      feedback: "Integration with legacy system needs improvement",
      date: "2024-07-18",
      status: "in_progress"
    },
    {
      id: 3,
      customer: "Regional Bank Corp",
      type: "Praise",
      sentiment: "positive",
      feedback: "The new reporting features have saved us hours of work",
      date: "2024-07-15",
      status: "closed"
    }
  ];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "neutral": return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      case "negative": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="practices">Best Practices</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Check-ins</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Feature Usage Analytics
              </CardTitle>
              <CardDescription>
                Identify optimization opportunities through usage pattern analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">87</div>
                      <p className="text-xs text-muted-foreground">Out of 120 available</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">73%</div>
                      <p className="text-xs text-muted-foreground">Across all customers</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Optimization Ops</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">Identified this month</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {usageAnalytics.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.customer}</h4>
                          <p className="text-sm text-muted-foreground">{item.feature}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(item.trend)}
                          <span className="text-sm font-medium">{item.usage}% usage</span>
                        </div>
                      </div>
                      
                      <Progress value={item.usage} className="h-2" />
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Opportunity:</span>
                          <p className="text-sm text-muted-foreground">{item.opportunity}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Recommendation:</span>
                          <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">Create Action Plan</Button>
                        <Button variant="outline" size="sm">Schedule Training</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Proactive Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered suggestions for workflow improvements and feature adoption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "Feature Adoption",
                    title: "Enable Automated Risk Scoring",
                    customer: "Community Credit Union",
                    impact: "High",
                    effort: "Low",
                    description: "Based on usage patterns, automated risk scoring could reduce manual assessment time by 40%"
                  },
                  {
                    type: "Workflow Optimization", 
                    title: "Streamline Incident Response Process",
                    customer: "Regional Bank Corp",
                    impact: "Medium",
                    effort: "Medium",
                    description: "Current incident response takes 3x longer than industry average. Template workflows could reduce time by 60%"
                  },
                  {
                    type: "Integration",
                    title: "Connect Legacy Reporting System", 
                    customer: "FirstNational Bank",
                    impact: "High",
                    effort: "High",
                    description: "Direct integration would eliminate double data entry and reduce reporting errors by 85%"
                  }
                ].map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.customer}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={rec.impact === "High" ? "default" : "secondary"}>
                          {rec.impact} Impact
                        </Badge>
                        <Badge variant="outline">{rec.effort} Effort</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                    
                    <div className="flex gap-2">
                      <Button size="sm">Implement</Button>
                      <Button variant="outline" size="sm">Schedule Discussion</Button>
                      <Button variant="outline" size="sm">Defer</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Best Practice Sharing
              </CardTitle>
              <CardDescription>
                Share successful implementations and proven strategies across customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Shared Practices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">156</div>
                      <p className="text-xs text-muted-foreground">Documented best practices</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Adoption Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">68%</div>
                      <p className="text-xs text-muted-foreground">Average across customers</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {bestPractices.map((practice) => (
                    <div key={practice.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{practice.title}</h4>
                          <p className="text-sm text-muted-foreground">{practice.category}</p>
                        </div>
                        <Badge>{practice.adoptionRate}% adopted</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{practice.description}</p>
                      
                      <div>
                        <span className="text-sm font-medium">Benefits:</span>
                        <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                          {practice.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Successfully implemented by:</span>
                        <p className="text-sm text-muted-foreground">{practice.customers.join(", ")}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">Share with Customers</Button>
                        <Button variant="outline" size="sm">View Implementation Guide</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Customer Feedback & Check-ins
              </CardTitle>
              <CardDescription>
                Regular feedback collection with sentiment analysis and escalation management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Feedback Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">142</div>
                      <p className="text-xs text-muted-foreground">This quarter</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg Sentiment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">4.3</div>
                      <p className="text-xs text-muted-foreground">Out of 5.0</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Response Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">89%</div>
                      <p className="text-xs text-muted-foreground">To check-in requests</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Recent Feedback</h4>
                    <Button size="sm">Send Check-in Survey</Button>
                  </div>
                  
                  {feedbackData.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(item.sentiment)}
                          <div>
                            <h4 className="font-medium">{item.customer}</h4>
                            <p className="text-sm text-muted-foreground">{item.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.status === "closed" ? "default" : "secondary"}>
                            {item.status.replace("_", " ")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{item.date}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{item.feedback}</p>
                      
                      <div className="flex gap-2">
                        <Button size="sm">Respond</Button>
                        <Button variant="outline" size="sm">Escalate</Button>
                        <Button variant="outline" size="sm">Add to Roadmap</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProactiveSupportCenter;
