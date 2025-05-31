
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enhancedAuditService } from "@/services/enhanced-audit-service";

interface ComplianceGapReportProps {
  orgId: string;
}

const ComplianceGapReport: React.FC<ComplianceGapReportProps> = ({ orgId }) => {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [orgId]);

  const loadReportData = async () => {
    try {
      const data = await enhancedAuditService.getComplianceGapReport(orgId);
      setReportData(data);
    } catch (error) {
      console.error('Error loading compliance gap report:', error);
      toast({
        title: "Error",
        description: "Failed to load compliance gap report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading compliance gap report...</div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No compliance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const frameworkChartData = Object.entries(reportData.gapsByFramework).map(([framework, data]: [string, any]) => ({
    framework: framework.replace('_', ' '),
    compliant: data.compliant,
    non_compliant: data.non_compliant,
    partial: data.partial,
    total: data.total
  }));

  const severityChartData = Object.entries(reportData.gapsBySeverity).map(([severity, count]) => ({
    severity: severity,
    count: count as number,
    fill: severity === 'critical' ? '#ef4444' : 
          severity === 'high' ? '#f97316' :
          severity === 'medium' ? '#eab308' : '#22c55e'
  }));

  const overallComplianceRate = reportData.totalGaps > 0 ? 
    Math.round((reportData.closedGaps / reportData.totalGaps) * 100) : 100;

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compliance Gap Report</h3>
          <p className="text-sm text-muted-foreground">
            Open vs. closed compliance gaps across regulatory frameworks
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Open Gaps</p>
                <p className="text-2xl font-bold text-red-600">{reportData.openGaps}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Closed Gaps</p>
                <p className="text-2xl font-bold text-green-600">{reportData.closedGaps}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Gaps</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.totalGaps}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Avg Resolution</p>
                <p className="text-2xl font-bold text-orange-600">{reportData.averageResolutionTime}d</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Compliance Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Overall Compliance Rate
            <Badge variant={overallComplianceRate >= 80 ? 'default' : overallComplianceRate >= 60 ? 'outline' : 'destructive'}>
              {overallComplianceRate}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallComplianceRate} className="h-4" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>0%</span>
            <span>Target: 90%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="frameworks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="frameworks">Framework Breakdown</TabsTrigger>
          <TabsTrigger value="severity">Gap Severity</TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks">
          <Card>
            <CardHeader>
              <CardTitle>Compliance by Regulatory Framework</CardTitle>
              <CardDescription>
                Compliance status across OSFI regulatory frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={frameworkChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="framework" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="compliant" stackId="a" fill="#22c55e" name="Compliant" />
                  <Bar dataKey="partial" stackId="a" fill="#eab308" name="Partially Compliant" />
                  <Bar dataKey="non_compliant" stackId="a" fill="#ef4444" name="Non-Compliant" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="severity">
          <Card>
            <CardHeader>
              <CardTitle>Open Gaps by Severity</CardTitle>
              <CardDescription>
                Distribution of open compliance gaps by severity level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ severity, count }: { severity: string; count: number }) => `${severity}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {severityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  <h4 className="font-medium">Gap Severity Breakdown</h4>
                  {severityChartData.map((item, index) => (
                    <div key={item.severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="capitalize">{item.severity}</span>
                      </div>
                      <Badge variant="outline">{item.count}</Badge>
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

export default ComplianceGapReport;
