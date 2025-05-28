
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getFrameworks, getComplianceMetricsByOrgId } from "@/services/governance-service";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ComplianceReportGenerator() {
  const { profile } = useAuth();
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("summary");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: frameworks } = useQuery({
    queryKey: ['frameworks'],
    queryFn: getFrameworks
  });

  const { data: complianceMetrics } = useQuery({
    queryKey: ['complianceMetrics', profile?.organization_id],
    queryFn: () => profile?.organization_id ? getComplianceMetricsByOrgId(profile.organization_id) : Promise.resolve([]),
    enabled: !!profile?.organization_id
  });

  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, you would generate an actual PDF
      // For now, we'll create a mock report structure
      const reportData = {
        generatedDate: new Date().toISOString(),
        organization: profile?.organization_id,
        frameworks: selectedFramework === "all" ? frameworks : frameworks?.filter(f => f.id === selectedFramework),
        complianceMetrics: complianceMetrics,
        reportType: reportType
      };

      // Mock PDF generation - in production use libraries like jsPDF or puppeteer
      const reportContent = generateReportContent(reportData);
      
      // Create and download blob
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-report-${format(new Date(), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Compliance report generated successfully");
      
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate compliance report");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportContent = (data: any) => {
    const totalFrameworks = data.frameworks?.length || 0;
    const totalPolicies = data.complianceMetrics?.reduce((sum: number, metric: any) => sum + metric.total_policies, 0) || 0;
    const activePolicies = data.complianceMetrics?.reduce((sum: number, metric: any) => sum + metric.active_policies, 0) || 0;
    const policiesNeedingReview = data.complianceMetrics?.reduce((sum: number, metric: any) => sum + metric.policies_needing_review, 0) || 0;

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Governance Compliance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .framework { background-color: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .status-active { color: green; font-weight: bold; }
        .status-review { color: orange; font-weight: bold; }
        .status-overdue { color: red; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Governance Compliance Report</h1>
        <p>Generated on: ${format(new Date(data.generatedDate), 'PPP')}</p>
        <p>Report Type: ${data.reportType.charAt(0).toUpperCase() + data.reportType.slice(1)}</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <div class="metric">
            <h3>${totalFrameworks}</h3>
            <p>Governance Frameworks</p>
        </div>
        <div class="metric">
            <h3>${totalPolicies}</h3>
            <p>Total Policies</p>
        </div>
        <div class="metric">
            <h3>${activePolicies}</h3>
            <p>Active Policies</p>
        </div>
        <div class="metric">
            <h3 class="status-review">${policiesNeedingReview}</h3>
            <p>Policies Needing Review</p>
        </div>
    </div>

    <div class="section">
        <h2>Framework Compliance Status</h2>
        <table>
            <thead>
                <tr>
                    <th>Framework</th>
                    <th>Total Policies</th>
                    <th>Active Policies</th>
                    <th>Needing Review</th>
                    <th>Compliance Rate</th>
                </tr>
            </thead>
            <tbody>
                ${data.complianceMetrics?.map((metric: any) => {
                  const complianceRate = metric.total_policies > 0 
                    ? Math.round((metric.policies_up_to_date / metric.total_policies) * 100) 
                    : 0;
                  return `
                    <tr>
                        <td>${metric.framework_title}</td>
                        <td>${metric.total_policies}</td>
                        <td class="status-active">${metric.active_policies}</td>
                        <td class="status-review">${metric.policies_needing_review}</td>
                        <td class="${complianceRate >= 80 ? 'status-active' : complianceRate >= 60 ? 'status-review' : 'status-overdue'}">${complianceRate}%</td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="5">No compliance data available</td></tr>'}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        <ul>
            ${policiesNeedingReview > 0 ? `<li>Priority: Review ${policiesNeedingReview} overdue policies</li>` : ''}
            <li>Establish regular review schedules for all policies</li>
            <li>Implement automated reminder systems</li>
            <li>Consider consolidating overlapping policies</li>
        </ul>
    </div>

    <div class="section">
        <p><em>Report generated by Operational Resilience Management System</em></p>
    </div>
</body>
</html>
    `;
  };

  const getComplianceOverview = () => {
    if (!complianceMetrics) return null;

    const totalPolicies = complianceMetrics.reduce((sum, metric) => sum + metric.total_policies, 0);
    const policiesNeedingReview = complianceMetrics.reduce((sum, metric) => sum + metric.policies_needing_review, 0);
    const overallCompliance = totalPolicies > 0 ? Math.round(((totalPolicies - policiesNeedingReview) / totalPolicies) * 100) : 0;

    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalPolicies}</div>
          <div className="text-sm text-gray-600">Total Policies</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{overallCompliance}%</div>
          <div className="text-sm text-gray-600">Compliance Rate</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{policiesNeedingReview}</div>
          <div className="text-sm text-gray-600">Need Review</div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Compliance Report Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {getComplianceOverview()}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Framework</label>
            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger>
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                {frameworks?.map(framework => (
                  <SelectItem key={framework.id} value={framework.id}>
                    {framework.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Executive Summary</SelectItem>
                <SelectItem value="detailed">Detailed Analysis</SelectItem>
                <SelectItem value="compliance">Compliance Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <div className="font-medium">Report Preview</div>
              <div className="text-sm text-gray-600">
                {selectedFramework === "all" ? "All frameworks" : frameworks?.find(f => f.id === selectedFramework)?.title || "Selected framework"} • {reportType} report
              </div>
            </div>
          </div>
          
          <Button 
            onClick={generatePDFReport}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate PDF
              </>
            )}
          </Button>
        </div>

        {complianceMetrics && complianceMetrics.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Framework Status
            </h4>
            {complianceMetrics.map(metric => {
              const complianceRate = metric.total_policies > 0 
                ? Math.round((metric.policies_up_to_date / metric.total_policies) * 100) 
                : 0;
              
              return (
                <div key={metric.framework_id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{metric.framework_title}</div>
                    <div className="text-sm text-gray-600">
                      {metric.active_policies} active • {metric.policies_needing_review} need review
                    </div>
                  </div>
                  <Badge variant={complianceRate >= 80 ? "default" : complianceRate >= 60 ? "secondary" : "destructive"}>
                    {complianceRate}% compliant
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
