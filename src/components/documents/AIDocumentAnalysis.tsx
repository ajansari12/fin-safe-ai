
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Document } from "@/services/document-management-service";
import { Brain, Search, AlertTriangle, Shield, TrendingUp, FileText, Zap } from "lucide-react";

interface AIDocumentAnalysisProps {
  documents: Document[];
}

const AIDocumentAnalysis: React.FC<AIDocumentAnalysisProps> = ({ documents }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter documents that have been analyzed
  const analyzedDocuments = documents.filter(doc => doc.ai_analysis_status === 'completed');
  const processingDocuments = documents.filter(doc => doc.ai_analysis_status === 'processing');
  const failedDocuments = documents.filter(doc => doc.ai_analysis_status === 'failed');

  // Get all risk indicators
  const allRiskIndicators = analyzedDocuments.flatMap(doc => 
    doc.key_risk_indicators.map(indicator => ({
      ...indicator,
      documentId: doc.id,
      documentTitle: doc.title
    }))
  );

  // Get all compliance gaps
  const allComplianceGaps = analyzedDocuments.flatMap(doc => 
    doc.compliance_gaps.map(gap => ({
      ...gap,
      documentId: doc.id,
      documentTitle: doc.title
    }))
  );

  // Filter based on search
  const filteredRiskIndicators = allRiskIndicators.filter(indicator =>
    indicator.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indicator.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComplianceGaps = allComplianceGaps.filter(gap =>
    gap.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gap.framework.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnalysisStats = () => {
    const totalDocs = documents.length;
    const analyzed = analyzedDocuments.length;
    const avgConfidence = analyzed > 0 
      ? analyzedDocuments.reduce((sum, doc) => sum + (doc.ai_confidence_score || 0), 0) / analyzed
      : 0;
    
    return {
      totalDocs,
      analyzed,
      processing: processingDocuments.length,
      failed: failedDocuments.length,
      avgConfidence: Math.round(avgConfidence * 100),
      totalRisks: allRiskIndicators.length,
      totalGaps: allComplianceGaps.length
    };
  };

  const stats = getAnalysisStats();

  return (
    <div className="space-y-6">
      {/* AI Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyzed Documents</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analyzed}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalDocs} total documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConfidence}%</div>
            <p className="text-xs text-muted-foreground">
              AI analysis confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Indicators</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRisks}</div>
            <p className="text-xs text-muted-foreground">
              Identified across documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Gaps</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGaps}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Processing Status */}
      {(stats.processing > 0 || stats.failed > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Processing Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.processing > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                  <span className="text-sm">{stats.processing} documents being analyzed</span>
                </div>
              )}
              {stats.failed > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">Failed</Badge>
                  <span className="text-sm">{stats.failed} documents failed analysis</span>
                  <Button variant="outline" size="sm">Retry All</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search risk indicators, compliance gaps, or document content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Risk Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Indicators ({filteredRiskIndicators.length})
          </CardTitle>
          <CardDescription>
            AI-identified risk factors across analyzed documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRiskIndicators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
              <p>No risk indicators found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRiskIndicators.slice(0, 20).map((indicator, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{indicator.type}</Badge>
                      <Badge className={getSeverityColor(indicator.severity)}>
                        {indicator.severity}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      View Document
                    </Button>
                  </div>
                  <p className="text-sm mb-2">{indicator.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Found in: {indicator.documentTitle}
                  </p>
                </div>
              ))}
              {filteredRiskIndicators.length > 20 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    Load More ({filteredRiskIndicators.length - 20} remaining)
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Gaps ({filteredComplianceGaps.length})
          </CardTitle>
          <CardDescription>
            Identified compliance requirements and gaps
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredComplianceGaps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2" />
              <p>No compliance gaps identified</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplianceGaps.slice(0, 20).map((gap, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{gap.framework}</Badge>
                      <Badge className={getSeverityColor(gap.severity)}>
                        {gap.severity}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      View Document
                    </Button>
                  </div>
                  <h5 className="font-medium text-sm mb-1">{gap.requirement}</h5>
                  <p className="text-sm text-gray-600 mb-2">{gap.gap}</p>
                  <p className="text-xs text-muted-foreground">
                    Found in: {gap.documentTitle}
                  </p>
                </div>
              ))}
              {filteredComplianceGaps.length > 20 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    Load More ({filteredComplianceGaps.length - 20} remaining)
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Classification Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Classification Insights
          </CardTitle>
          <CardDescription>
            AI-powered document categorization and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Document Types</h4>
              <div className="space-y-1">
                {Array.from(new Set(analyzedDocuments.map(doc => doc.document_classification?.document_type).filter(Boolean))).map(type => (
                  <Badge key={type} variant="secondary" className="mr-1">{type}</Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2">Subject Areas</h4>
              <div className="space-y-1">
                {Array.from(new Set(
                  analyzedDocuments.flatMap(doc => doc.document_classification?.subject_areas || [])
                )).map(area => (
                  <Badge key={area} variant="secondary" className="mr-1">{area}</Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium mb-2">Confidentiality Levels</h4>
              <div className="space-y-1">
                {Array.from(new Set(analyzedDocuments.map(doc => doc.document_classification?.confidentiality).filter(Boolean))).map(level => (
                  <Badge key={level} variant="secondary" className="mr-1">{level}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDocumentAnalysis;
