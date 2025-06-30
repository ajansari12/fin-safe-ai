
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  CheckCircle,
  Clock,
  FileText,
  Users,
  BarChart3
} from "lucide-react";

const SuccessPlanningHub = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const successPlans = [
    {
      id: 1,
      customerName: "FirstNational Bank",
      planName: "Q3 2024 Growth Initiative",
      status: "active",
      progress: 78,
      startDate: "2024-07-01",
      targetDate: "2024-09-30",
      goals: 5,
      completedGoals: 4,
      businessValue: "$2.1M",
      owner: "Sarah Johnson"
    },
    {
      id: 2,
      customerName: "Community Credit Union",
      planName: "Risk Management Enhancement",
      status: "planning",
      progress: 25,
      startDate: "2024-08-01",
      targetDate: "2024-12-31",
      goals: 7,
      completedGoals: 2,
      businessValue: "$850K",
      owner: "Michael Chen"
    },
    {
      id: 3,
      customerName: "Regional Bank Corp",
      planName: "Digital Transformation Phase 2",
      status: "at_risk",
      progress: 42,
      startDate: "2024-06-15",
      targetDate: "2024-10-15",
      goals: 8,
      completedGoals: 3,
      businessValue: "$3.5M",
      owner: "Lisa Rodriguez"
    }
  ];

  const qbrSchedule = [
    {
      id: 1,
      customer: "FirstNational Bank",
      date: "2024-07-25",
      type: "Q2 Review",
      status: "scheduled",
      participants: ["Sarah Johnson", "Mike Wilson", "David Kim"]
    },
    {
      id: 2,
      customer: "Community Credit Union",
      date: "2024-08-05",
      type: "Q2 Review",
      status: "preparing",
      participants: ["Michael Chen", "Lisa Park"]
    }
  ];

  const businessValueMetrics = {
    totalValue: "$12.8M",
    realizedValue: "$8.2M",
    projectedValue: "$4.6M",
    averageTimeToValue: "45 days"
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500">Active</Badge>;
      case "planning": return <Badge className="bg-blue-500">Planning</Badge>;
      case "at_risk": return <Badge className="bg-red-500">At Risk</Badge>;
      case "completed": return <Badge variant="secondary">Completed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Success Plans</TabsTrigger>
          <TabsTrigger value="goals">Goal Tracking</TabsTrigger>
          <TabsTrigger value="qbr">QBR Management</TabsTrigger>
          <TabsTrigger value="value">Value Realization</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">31</div>
                <p className="text-xs text-muted-foreground">Across all customers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Plans at Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">4</div>
                <p className="text-xs text-muted-foreground">Behind schedule</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">67%</div>
                <p className="text-xs text-muted-foreground">This quarter</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Goals Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">Out of 203 total</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Success Plans</CardTitle>
              <CardDescription>
                Collaborative success plans with progress tracking and milestone management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {successPlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{plan.planName}</h4>
                        <p className="text-sm text-muted-foreground">{plan.customerName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(plan.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Progress:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={plan.progress} className="h-2 flex-1" />
                          <span className="text-xs">{plan.progress}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Goals:</span>
                        <p className="text-muted-foreground">{plan.completedGoals}/{plan.goals} completed</p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Timeline:</span>
                        <p className="text-muted-foreground">{plan.startDate} - {plan.targetDate}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Value:</span>
                        <p className="text-muted-foreground">{plan.businessValue}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm">View Details</Button>
                      <Button variant="outline" size="sm">Update Progress</Button>
                      <Button variant="outline" size="sm">Generate Report</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Tracking & Milestones
              </CardTitle>
              <CardDescription>
                Monitor progress towards customer success objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">203</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={70} className="h-2 flex-1" />
                        <span className="text-xs">70% complete</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">On Track</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">156</div>
                      <p className="text-xs text-muted-foreground">Meeting timeline</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Behind Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">19</div>
                      <p className="text-xs text-muted-foreground">Require attention</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Recent Goal Completions</h4>
                  {[
                    { goal: "Implement automated risk reporting", customer: "FirstNational Bank", completedDate: "2024-07-20" },
                    { goal: "Train 50+ users on new features", customer: "Community Credit Union", completedDate: "2024-07-18" },
                    { goal: "Reduce manual processes by 30%", customer: "Regional Bank Corp", completedDate: "2024-07-15" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium">{item.goal}</p>
                        <p className="text-sm text-muted-foreground">{item.customer}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.completedDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qbr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Quarterly Business Reviews
              </CardTitle>
              <CardDescription>
                Schedule and manage customer QBRs with automated reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">QBRs This Quarter</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">23</div>
                      <p className="text-xs text-muted-foreground">8 remaining</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg Satisfaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4.7</div>
                      <p className="text-xs text-muted-foreground">Out of 5.0</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Action Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">47</div>
                      <p className="text-xs text-muted-foreground">From recent QBRs</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Upcoming QBRs</h4>
                    <Button size="sm">Schedule New QBR</Button>
                  </div>
                  
                  {qbrSchedule.map((qbr) => (
                    <div key={qbr.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{qbr.customer}</h4>
                          <p className="text-sm text-muted-foreground">{qbr.type}</p>
                        </div>
                        <Badge variant={qbr.status === "scheduled" ? "default" : "secondary"}>
                          {qbr.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date:</span>
                          <p className="text-muted-foreground">{qbr.date}</p>
                        </div>
                        <div>
                          <span className="font-medium">Participants:</span>
                          <p className="text-muted-foreground">{qbr.participants.join(", ")}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">Generate Report</Button>
                        <Button variant="outline" size="sm">View Agenda</Button>
                        <Button variant="outline" size="sm">Send Reminder</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="value" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Business Value Realization
              </CardTitle>
              <CardDescription>
                Track and measure business outcomes and ROI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{businessValueMetrics.totalValue}</div>
                      <p className="text-xs text-muted-foreground">Projected + Realized</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Realized Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">{businessValueMetrics.realizedValue}</div>
                      <p className="text-xs text-muted-foreground">64% of total</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Projected Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-500">{businessValueMetrics.projectedValue}</div>
                      <p className="text-xs text-muted-foreground">36% remaining</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Time to Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{businessValueMetrics.averageTimeToValue}</div>
                      <p className="text-xs text-muted-foreground">Average across all customers</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Value Realization by Customer</h4>
                  {[
                    { customer: "FirstNational Bank", realized: "$3.2M", projected: "$1.8M", roi: "285%" },
                    { customer: "Community Credit Union", realized: "$1.8M", projected: "$1.2M", roi: "220%" },
                    { customer: "Regional Bank Corp", realized: "$2.1M", projected: "$1.6M", roi: "195%" }
                  ].map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium">{item.customer}</h5>
                        <Badge className="bg-green-500">{item.roi} ROI</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Realized Value:</span>
                          <p className="text-muted-foreground">{item.realized}</p>
                        </div>
                        <div>
                          <span className="font-medium">Projected Value:</span>
                          <p className="text-muted-foreground">{item.projected}</p>
                        </div>
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

export default SuccessPlanningHub;
