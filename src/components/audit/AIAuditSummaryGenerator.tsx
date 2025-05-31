
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Bot, FileText, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIAuditSummaryGeneratorProps {
  orgId: string;
}

const AIAuditSummaryGenerator: React.FC<AIAuditSummaryGeneratorProps> = ({ orgId }) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const generateAISummary = async () => {
    try {
      setGenerating(true);
      
      // Fetch audit data for AI analysis
      const [findingsResponse, mappingsResponse, gapsResponse] = await Promise.all([
        supabase.from('compliance_findings').select('*').eq('org_id', orgId),
        supabase.from('regulatory_mapping').select('*').eq('org_id', orgId),
        supabase.from('audit_gap_logs').select('*').eq('org_id', orgId)
      ]);

      const auditData = {
        findings: findingsResponse.data || [],
        mappings: mappingsResponse.data || [],
        gaps: gapsResponse.data || []
      };

      // Call AI assistant function
      const response = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: `Generate a comprehensive audit summary report based on the following data:

COMPLIANCE FINDINGS (${auditData.findings.length} total):
${auditData.findings.map(f => `- ${f.finding_title} (${f.severity}): ${f.finding_description}`).join('\n')}

REGULATORY MAPPINGS (${auditData.mappings.length} total):
${auditData.mappings.map(m => `- ${m.regulatory_framework} ${m.requirement_section}: ${m.requirement_title} (Status: ${m.compliance_status})`).join('\n')}

COMPLIANCE GAPS (${auditData.gaps.length} total):
${auditData.gaps.map(g => `- ${g.gap_title} (${g.current_status}): ${g.gap_description}`).join('\n')}

Please provide:
1. Executive Summary
2. Key Risk Areas
3. Compliance Status Overview
4. Critical Gaps Requiring Immediate Attention
5. Recommendations for Improvement
6. Risk Mitigation Strategies

Format the response in a professional audit report style with clear sections and actionable insights.`,
          context: {
            module: 'audit_compliance',
            org_id: orgId,
            data_summary: {
              total_findings: auditData.findings.length,
              total_mappings: auditData.mappings.length,
              total_gaps: auditData.gaps.length,
              critical_findings: auditData.findings.filter(f => f.severity === 'critical').length,
              open_gaps: auditData.gaps.filter(g => g.current_status === 'open').length
            }
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setSummary(response.data.response);
      setShowPreview(true);
      
      toast({
        title: "AI Summary Generated",
        description: "Audit summary has been generated successfully"
      });

    } catch (error) {
      console.error('Error generating AI summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI audit summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Audit Summary Generator
          </CardTitle>
          <CardDescription>
            Generate comprehensive audit summaries using AI analysis of your compliance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Generate Audit Summary</h4>
                <p className="text-sm text-muted-foreground">
                  AI will analyze your findings, mappings, and gaps to create a comprehensive summary
                </p>
              </div>
              <Button 
                onClick={generateAISummary} 
                disabled={generating}
                className="shrink-0"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>

            {summary && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="gap-1">
                    <FileText className="h-3 w-3" />
                    Summary Generated
                  </Badge>
                  <div className="flex gap-2">
                    <Dialog open={showPreview} onOpenChange={setShowPreview}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>AI-Generated Audit Summary</DialogTitle>
                          <DialogDescription>
                            Comprehensive analysis of your audit and compliance data
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          <Textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="min-h-[500px] font-mono text-sm"
                            placeholder="AI-generated summary will appear here..."
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={downloadSummary}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" onClick={() => setShowPreview(false)}>
                            Close
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm" onClick={downloadSummary}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Preview (first 200 characters):</p>
                  <p className="text-sm">
                    {summary.substring(0, 200)}...
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 border rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-medium text-sm">Comprehensive Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  AI analyzes all compliance data
                </p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Bot className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-medium text-sm">Intelligent Insights</h4>
                <p className="text-xs text-muted-foreground">
                  Generates actionable recommendations
                </p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Download className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h4 className="font-medium text-sm">Exportable Reports</h4>
                <p className="text-xs text-muted-foreground">
                  Download for executive review
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAuditSummaryGenerator;
