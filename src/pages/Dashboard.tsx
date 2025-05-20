
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, ArrowRight, Clock, FileCheck2, ShieldAlert } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import RiskScoreChart from "@/components/dashboard/RiskScoreChart";
import TimelineChart from "@/components/dashboard/TimelineChart";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

// Sample data for charts
const riskByCategory = [
  { name: "High Risk", value: 10, color: "#ef4444" },
  { name: "Medium Risk", value: 25, color: "#f59e0b" },
  { name: "Low Risk", value: 65, color: "#10b981" },
];

const riskByDomain = [
  { name: "Cyber", value: 15, color: "#6366f1" },
  { name: "Vendor", value: 25, color: "#8b5cf6" },
  { name: "Process", value: 35, color: "#ec4899" },
  { name: "People", value: 25, color: "#14b8a6" },
];

const incidentsOverTime = [
  { date: "Jan", cyber: 4, vendor: 2, process: 1, people: 3 },
  { date: "Feb", cyber: 3, vendor: 3, process: 2, people: 2 },
  { date: "Mar", cyber: 5, vendor: 4, process: 3, people: 2 },
  { date: "Apr", cyber: 7, vendor: 3, process: 4, people: 3 },
  { date: "May", cyber: 4, vendor: 5, process: 3, people: 2 },
  { date: "Jun", cyber: 6, vendor: 2, process: 2, people: 1 },
];

const timelineDataKeys = [
  { key: "cyber", name: "Cyber", color: "#6366f1" },
  { key: "vendor", name: "Vendor", color: "#8b5cf6" },
  { key: "process", name: "Process", color: "#ec4899" },
  { key: "people", name: "People", color: "#14b8a6" },
];

const actionItems = [
  {
    title: "Complete Cyber Vulnerability Assessment",
    dueDate: "2025-06-15",
    status: "pending",
    priority: "high",
  },
  {
    title: "Update Third-Party Risk Register",
    dueDate: "2025-06-10",
    status: "in-progress",
    priority: "medium",
  },
  {
    title: "Review Business Continuity Plan",
    dueDate: "2025-06-30",
    status: "pending",
    priority: "medium",
  },
  {
    title: "Conduct Staff Resilience Training",
    dueDate: "2025-06-22",
    status: "pending",
    priority: "low",
  },
];

const Dashboard = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your operational risk management program.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Tabs defaultValue="overview" className="w-[400px] max-w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="governance">Governance</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="incidents">Incidents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* Summary Statistics */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Total Risk Items"
                    value={124}
                    description="Across all operational domains"
                    icon={ShieldAlert}
                    trend={{ value: 4, isPositive: false }}
                  />
                  <StatCard
                    title="Compliance Score"
                    value="76%"
                    description="Based on E-21 requirements"
                    icon={FileCheck2}
                    trend={{ value: 12, isPositive: true }}
                  />
                  <StatCard
                    title="Active Incidents"
                    value={3}
                    description="Requiring immediate attention"
                    icon={AlertTriangle}
                  />
                  <StatCard
                    title="Assessments Due"
                    value={8}
                    description="In the next 30 days"
                    icon={Clock}
                    footer={
                      <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link to="/assessments">
                          View Schedule <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    }
                  />
                </div>

                {/* Risk Charts */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  <RiskScoreChart 
                    data={riskByCategory} 
                    title="Risks by Severity" 
                    description="Distribution of risks by severity level"
                  />
                  <RiskScoreChart 
                    data={riskByDomain} 
                    title="Risks by Domain" 
                    description="Distribution of risks across operational domains"
                  />
                </div>

                {/* Timeline Charts */}
                <TimelineChart 
                  data={incidentsOverTime} 
                  title="Incidents Over Time" 
                  description="6-month trend of operational incidents by category"
                  dataKeys={timelineDataKeys}
                />

                {/* Action Items */}
                <Card>
                  <CardHeader className="flex flex-row items-center">
                    <div className="flex-1">
                      <CardTitle>Action Items</CardTitle>
                      <CardDescription>Required actions to improve operational resilience</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/tasks">
                        View All <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {actionItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-start space-x-4">
                            <div className={`w-2 h-2 mt-2 rounded-full ${
                              item.priority === "high" 
                                ? "bg-red-500" 
                                : item.priority === "medium" 
                                  ? "bg-amber-500" 
                                  : "bg-green-500"
                            }`} />
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                Due {new Date(item.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={`${
                                item.status === "in-progress" 
                                  ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" 
                                  : "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              {item.status === "in-progress" ? "Continue" : "Start"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Program Maturity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Program Maturity</CardTitle>
                    <CardDescription>Operational resilience program development progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Governance Framework</span>
                          <span className="text-sm text-muted-foreground">80%</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Risk Assessment</span>
                          <span className="text-sm text-muted-foreground">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Third-Party Management</span>
                          <span className="text-sm text-muted-foreground">45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Incident Response</span>
                          <span className="text-sm text-muted-foreground">70%</span>
                        </div>
                        <Progress value={70} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Testing & Exercises</span>
                          <span className="text-sm text-muted-foreground">30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="governance">
                <div className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Governance</CardTitle>
                      <CardDescription>Manage your governance framework and policies</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Governance content will be displayed here.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="risks">
                <div className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Management</CardTitle>
                      <CardDescription>Monitor and manage operational risks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Risk management content will be displayed here.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="incidents">
                <div className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Incident Management</CardTitle>
                      <CardDescription>Track and respond to operational incidents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Incident management content will be displayed here.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
