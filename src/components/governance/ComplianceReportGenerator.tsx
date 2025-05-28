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
import { getFrameworks, getComplianceMetricsByOrgId, getPoliciesByFramework } from "@/services/governance-service";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { generateGovernancePolicyListPDF } from "@/services/governance-pdf-service";

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
      if (selectedFramework === "all") {
        // Generate comprehensive report with policies from all frameworks
        const allPolicies: any[] = [];
        if (frameworks) {
          for (const framework of frameworks) {
            const policies = await getPoliciesByFramework(framework.id);
            allPolicies.push(...policies.map(p => ({ ...p, framework })));
          }
        }
        await generateGovernancePolicyListPDF(allPolicies, "All Frameworks");
      } else {
        // Generate report for specific framework
        const framework = frameworks?.find(f => f.id === selectedFramework);
        const policies = await getPoliciesByFramework(selectedFramework);
        const policiesWithFramework = policies.map(p => ({ ...p, framework }));
        await generateGovernancePolicyListPDF(policiesWithFramework, framework?.title);
      }

      toast.success("PDF report generated successfully");
      
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsGenerating(false);
    }
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
