
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, AlertTriangle, Clock, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ToleranceReporting = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const { toast } = useToast();

  // Sample data for charts
  const tolerancePerformanceData = [
    { month: 'Jan', breaches: 2, degradations: 8, operational: 28 },
    { month: 'Feb', breaches: 1, degradations: 5, operational: 30 },
    { month: 'Mar', breaches: 3, degradations: 12, operational: 25 },
    { month: 'Apr', breaches: 0, degradations: 6, operational: 32 },
    { month: 'May', breaches: 4, degradations: 15, operational: 22 },
    { month: 'Jun', breaches: 1, degradations: 7, operational: 30 }
  ];

  const breachCategoryData = [
    { name: 'RTO Breach', value: 35, color: '#ef4444' },
    { name: 'RPO Breach', value: 25, color: '#f97316' },
    { name: 'Service Level', value: 30, color: '#eab308' },
    { name: 'Multiple', value: 10, color: '#dc2626' }
  ];

  const uptimeData = [
    { operation: 'Core Banking', uptime: 99.95, target: 99.9 },
    { operation: 'Online Banking', uptime: 99.2, target: 99.5 },
    { operation: 'ATM Network', uptime: 98.8, target: 99.0 },
    { operation: 'Mobile App', uptime: 99.1, target: 99.0 },
    { operation: 'Card Processing', uptime: 99.7, target: 99.5 }
  ];

  const regulatoryMetrics = [
    { metric: 'Critical Operations Identified', value: '15', status: 'compliant' },
    { metric: 'Tolerance Definitions Complete', value: '100%', status: 'compliant' },
    { metric: 'Monitoring Coverage', value: '100%', status: 'compliant' },
    { metric: 'Breach Response Time (Avg)', value: '12 min', status: 'compliant' },
    { metric: 'Board Reporting Frequency', value: 'Monthly', status: 'compliant' },
    { metric: 'Regulatory Submissions', value: 'Current', status: 'compliant' }
  ];

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report has been generated and downloaded.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tolerance Reporting & Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive reporting for management and regulatory compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExportReport("Executive Summary")}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory Compliance</TabsTrigger>
          <TabsTrigger value="benchmarking">Industry Benchmarking</TabsTrigger>
          <TabsTrigger value="executive">Executive Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Breaches</p>
                    <p className="text-2xl font-bold text-red-600">11</p>
                    <p className="text-xs text-muted-foreground">Last 6 months</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold text-blue-600">8.5 min</p>
                    <p className="text-xs text-green-600">↓ 15% from last period</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overall Uptime</p>
                    <p className="text-2xl font-bold text-green-600">99.4%</p>
                    <p className="text-xs text-green-600">Above target</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                    <p className="text-2xl font-bold text-green-600">98%</p>
                    <p className="text-xs text-muted-foreground">OSFI E-21</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tolerance Performance Trends</CardTitle>
              <CardDescription>Monthly breakdown of operational status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tolerancePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="operational" fill="#10b981" name="Operational" />
                  <Bar dataKey="degradations" fill="#f59e0b" name="Degradations" />
                  <Bar dataKey="breaches" fill="#ef4444" name="Breaches" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breach Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Breach Categories</CardTitle>
                <CardDescription>Distribution of tolerance breaches by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={breachCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {breachCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {breachCategoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Uptime Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Uptime Performance</CardTitle>
                <CardDescription>Current vs target uptime by operation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uptimeData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.operation}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.uptime}%</span>
                          <Badge variant={item.uptime >= item.target ? "default" : "destructive"}>
                            Target: {item.target}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.uptime >= item.target ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${item.uptime}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>OSFI E-21 Compliance Status</CardTitle>
              <CardDescription>Regulatory compliance metrics and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regulatoryMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{metric.metric}</p>
                      <p className="text-lg font-bold">{metric.value}</p>
                    </div>
                    <Badge variant={metric.status === 'compliant' ? 'default' : 'destructive'}>
                      {metric.status === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regulatory Reporting Templates</CardTitle>
              <CardDescription>Pre-configured reports for regulatory submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">OSFI E-21 Quarterly Report</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive quarterly submission including tolerance performance and breach analysis
                  </p>
                  <Button variant="outline" onClick={() => handleExportReport("OSFI E-21 Quarterly")}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Board Risk Committee Report</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Executive summary for board reporting with key risk indicators
                  </p>
                  <Button variant="outline" onClick={() => handleExportReport("Board Risk Committee")}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Incident Response Summary</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Detailed analysis of tolerance breaches and response effectiveness
                  </p>
                  <Button variant="outline" onClick={() => handleExportReport("Incident Response")}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Tolerance Calibration Report</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Analysis and recommendations for tolerance threshold adjustments
                  </p>
                  <Button variant="outline" onClick={() => handleExportReport("Tolerance Calibration")}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarking</CardTitle>
              <CardDescription>Compare your tolerance performance against industry standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Banking Sector Average</h4>
                    <p className="text-2xl font-bold text-blue-600">99.2%</p>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Your Performance</h4>
                    <p className="text-2xl font-bold text-green-600">99.4%</p>
                    <p className="text-sm text-green-600">+0.2% above average</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Top Quartile</h4>
                    <p className="text-2xl font-bold text-purple-600">99.7%</p>
                    <p className="text-sm text-muted-foreground">Target benchmark</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Industry Insights</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 85% of institutions have RTO targets under 2 hours for critical operations</li>
                    <li>• Average breach response time has improved 25% industry-wide in the last year</li>
                    <li>• Financial institutions with mature tolerance frameworks report 40% fewer operational disruptions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Executive Dashboard</CardTitle>
              <CardDescription>High-level tolerance framework performance for leadership</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Operational Resilience</h4>
                  <p className="text-3xl font-bold text-green-600">Strong</p>
                  <p className="text-sm text-muted-foreground">Overall assessment</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Regulatory Compliance</h4>
                  <p className="text-3xl font-bold text-blue-600">98%</p>
                  <p className="text-sm text-muted-foreground">OSFI E-21 score</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium mb-2">Risk Exposure</h4>
                  <p className="text-3xl font-bold text-yellow-600">Low</p>
                  <p className="text-sm text-muted-foreground">Current level</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium mb-2">Framework Maturity</h4>
                  <p className="text-3xl font-bold text-purple-600">Advanced</p>
                  <p className="text-sm text-muted-foreground">Industry comparison</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Key Recommendations</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>Consider tightening RTO requirements for non-critical operations to improve overall resilience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                      <span>Implement automated tolerance monitoring for emerging digital channels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span>Enhance cross-functional coordination in breach response procedures</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Upcoming Milestones</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Q2 2024: OSFI E-21 compliance assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Q3 2024: Tolerance framework annual review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Q4 2024: Industry benchmarking study</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ToleranceReporting;
