
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Eye, 
  Users, 
  TrendingUp,
  MousePointer,
  Clock,
  Target,
  MessageSquare,
  Star,
  Filter,
  Download
} from "lucide-react";

const UserAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  const behaviorMetrics = {
    heatmapData: [
      { area: "Dashboard", clicks: 2341, time: "2.4 min", engagement: 85 },
      { area: "Risk Assessment", clicks: 1876, time: "4.2 min", engagement: 92 },
      { area: "Incident Management", clicks: 1234, time: "3.1 min", engagement: 78 },
      { area: "Reporting", clicks: 987, time: "1.8 min", engagement: 67 },
      { area: "Settings", clicks: 456, time: "0.9 min", engagement: 45 }
    ],
    userJourneys: [
      {
        path: "Login → Dashboard → Risk Assessment → Reports",
        frequency: 45,
        avgTime: "8.2 min",
        conversionRate: 87,
        dropoffPoint: "Reports"
      },
      {
        path: "Login → Dashboard → Incidents → Documentation",
        frequency: 32,
        avgTime: "6.7 min",
        conversionRate: 72,
        dropoffPoint: "Documentation"
      },
      {
        path: "Login → Training → Assessment → Certification",
        frequency: 28,
        avgTime: "15.3 min",
        conversionRate: 94,
        dropoffPoint: null
      }
    ]
  };

  const abTestResults = [
    {
      id: 1,
      name: "Dashboard Layout A/B Test",
      status: "completed",
      variantA: { name: "Grid Layout", conversion: 67, users: 1245 },
      variantB: { name: "List Layout", conversion: 74, users: 1287 },
      winner: "B",
      improvement: 10.4,
      confidence: 95
    },
    {
      id: 2,
      name: "Onboarding Flow Test",
      status: "running",
      variantA: { name: "3-Step Flow", conversion: 82, users: 456 },
      variantB: { name: "5-Step Flow", conversion: 88, users: 443 },
      winner: null,
      improvement: 7.3,
      confidence: 78
    }
  ];

  const feedbackData = [
    {
      category: "Feature Requests",
      count: 127,
      avgRating: 4.2,
      topFeedback: [
        "Better mobile experience",
        "Advanced filtering options",
        "Integration with third-party tools"
      ]
    },
    {
      category: "Usability Issues",
      count: 89,
      avgRating: 3.1,
      topFeedback: [
        "Navigation could be clearer",
        "Loading times on reports",
        "Need more contextual help"
      ]
    },
    {
      category: "Training Feedback",
      count: 156,
      avgRating: 4.6,
      topFeedback: [
        "More hands-on examples needed",
        "Love the interactive tutorials",
        "Shorter video segments preferred"
      ]
    }
  ];

  const userSegments = [
    {
      name: "Power Users",
      size: 234,
      characteristics: "High engagement, use advanced features",
      satisfaction: 4.7,
      retentionRate: 96,
      color: "bg-green-500"
    },
    {
      name: "Regular Users",
      size: 867,
      characteristics: "Moderate usage, core features only",
      satisfaction: 4.1,
      retentionRate: 84,
      color: "bg-blue-500"
    },
    {
      name: "Struggling Users",
      size: 123,
      characteristics: "Low engagement, frequent help requests",
      satisfaction: 3.2,
      retentionRate: 67,
      color: "bg-orange-500"
    },
    {
      name: "New Users",
      size: 89,
      characteristics: "Recently onboarded, learning platform",
      satisfaction: 3.8,
      retentionRate: 78,
      color: "bg-purple-500"
    }
  ];

  const optimizationInsights = [
    {
      type: "Friction Point",
      title: "High Dropout on Advanced Settings",
      description: "42% of users abandon the advanced settings configuration",
      impact: "High",
      recommendation: "Add progressive disclosure and guided setup wizard"
    },
    {
      type: "Usage Pattern",
      title: "Mobile Usage Spike Weekends",
      description: "68% increase in mobile access during weekends",
      impact: "Medium",
      recommendation: "Optimize mobile interface for weekend workflows"
    },
    {
      type: "Feature Adoption",
      title: "Low Adoption of Analytics Dashboard",
      description: "Only 23% of users regularly use analytics features",
      impact: "High",
      recommendation: "Improve discoverability and add guided tour"
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="behavior" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
          <TabsTrigger value="segmentation">User Segmentation</TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  Heat Map Analysis
                </CardTitle>
                <CardDescription>
                  Click tracking and engagement heat mapping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {behaviorMetrics.heatmapData.map((area, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{area.area}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{area.clicks} clicks</Badge>
                          <Badge variant="secondary">{area.time}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={area.engagement} className="flex-1" />
                        <span className="text-sm text-muted-foreground">{area.engagement}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Heat Map
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  User Journey Analysis
                </CardTitle>
                <CardDescription>
                  Common paths and conversion funnels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {behaviorMetrics.userJourneys.map((journey, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{journey.path}</p>
                          <p className="text-xs text-muted-foreground">
                            {journey.frequency}% of sessions • {journey.avgTime} avg time
                          </p>
                        </div>
                        <Badge className={journey.conversionRate > 80 ? "bg-green-500" : "bg-orange-500"}>
                          {journey.conversionRate}%
                        </Badge>
                      </div>
                      {journey.dropoffPoint && (
                        <p className="text-xs text-red-600">
                          Common dropoff: {journey.dropoffPoint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Detailed Journey Analysis
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Optimization Insights
              </CardTitle>
              <CardDescription>
                AI-identified improvement opportunities based on user behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationInsights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.type}</p>
                      </div>
                      <Badge variant={insight.impact === "High" ? "destructive" : "secondary"}>
                        {insight.impact} Impact
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm"><strong>Recommendation:</strong> {insight.recommendation}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm">Implement Solution</Button>
                      <Button variant="outline" size="sm">Create A/B Test</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                A/B Testing Framework
              </CardTitle>
              <CardDescription>
                Continuous testing for interface improvements and feature optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Button>Create New Test</Button>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Tests
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                </div>

                <div className="space-y-4">
                  {abTestResults.map((test) => (
                    <div key={test.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{test.name}</h4>
                          <Badge variant={test.status === "completed" ? "default" : "secondary"}>
                            {test.status}
                          </Badge>
                        </div>
                        {test.winner && (
                          <Badge className="bg-green-500">
                            {test.improvement}% improvement
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Variant A: {test.variantA.name}</h5>
                          <div className="flex items-center gap-2">
                            <Progress value={test.variantA.conversion} className="flex-1" />
                            <span className="text-sm">{test.variantA.conversion}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{test.variantA.users} users</p>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Variant B: {test.variantB.name}</h5>
                          <div className="flex items-center gap-2">
                            <Progress value={test.variantB.conversion} className="flex-1" />
                            <span className="text-sm">{test.variantB.conversion}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{test.variantB.users} users</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-muted-foreground">
                          Confidence: {test.confidence}%
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          {test.status === "completed" && test.winner && (
                            <Button size="sm">Implement Winner</Button>
                          )}
                        </div>
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
                Feedback Analysis & Sentiment
              </CardTitle>
              <CardDescription>
                Comprehensive feedback collection with AI-powered sentiment analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {feedbackData.map((category, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{category.avgRating}/5.0</span>
                        <Badge variant="outline">{category.count} items</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium">Top Feedback:</h5>
                        <ul className="space-y-1">
                          {category.topFeedback.map((feedback, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              {feedback}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Feedback Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">87%</div>
                      <div className="text-sm text-muted-foreground">Positive Sentiment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">4.2/5</div>
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">34%</div>
                      <div className="text-sm text-muted-foreground">Response Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">12 hrs</div>
                      <div className="text-sm text-muted-foreground">Avg Response Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segmentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Segmentation & Cohort Analysis
              </CardTitle>
              <CardDescription>
                Targeted insights for different user groups and behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {userSegments.map((segment, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${segment.color}`}></div>
                          <CardTitle className="text-lg">{segment.name}</CardTitle>
                        </div>
                        <Badge variant="outline">{segment.size} users</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{segment.characteristics}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Satisfaction</span>
                            <span className="font-medium">{segment.satisfaction}/5</span>
                          </div>
                          <Progress value={(segment.satisfaction / 5) * 100} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Retention</span>
                            <span className="font-medium">{segment.retentionRate}%</span>
                          </div>
                          <Progress value={segment.retentionRate} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Cohort Performance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-500">78%</div>
                          <div className="text-sm text-muted-foreground">30-Day Retention</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-500">65%</div>
                          <div className="text-sm text-muted-foreground">90-Day Retention</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-500">52%</div>
                          <div className="text-sm text-muted-foreground">1-Year Retention</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Detailed Cohort Analysis
                        </Button>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export Segment Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAnalytics;
