
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Zap,
  TrendingUp,
  Shield,
  Search
} from 'lucide-react';
import { documentManagementService } from '@/services/document-management-service';
import { toast } from 'sonner';

interface AIDocumentAnalysisProps {
  documents: any[];
  onAnalysisComplete: () => void;
}

const AIDocumentAnalysis: React.FC<AIDocumentAnalysisProps> = ({
  documents,
  onAnalysisComplete
}) => {
  const [analyzingDocuments, setAnalyzingDocuments] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const analyzeDocument = async (documentId: string) => {
    setAnalyzingDocuments(prev => [...prev, documentId]);
    
    try {
      // Simulate AI analysis - in production, this would call actual AI services
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Document analysis completed');
      onAnalysisComplete();
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast.error('Analysis failed');
    } finally {
      setAnalyzingDocuments(prev => prev.filter(id => id !== documentId));
    }
  };

  const analyzedDocuments = documents.filter(doc => doc.ai_analysis_status === 'completed');
  const pendingDocuments = documents.filter(doc => doc.ai_analysis_status === 'pending');
  const processingDocuments = documents.filter(doc => doc.ai_analysis_status === 'processing');

  const totalRiskIndicators = analyzedDocuments.reduce((acc, doc) => 
    acc + (doc.key_risk_indicators?.length || 0), 0);
  const totalComplianceGaps = analyzedDocuments.reduce((acc, doc) => 
    acc + (doc.compliance_gaps?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Document Analysis</h2>
          <p className="text-muted-foreground">
            Intelligent analysis and knowledge extraction from your documents
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Brain className="h-3 w-3" />
          AI-Powered
        </Badge>
      </div>

      {/* Analysis Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {analyzedDocuments.length}
                </div>
                <div className="text-sm text-muted-foreground">Analyzed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {totalRiskIndicators}
                </div>
                <div className="text-sm text-muted-foreground">Risk Indicators</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {totalComplianceGaps}
                </div>
                <div className="text-sm text-muted-foreground">Compliance Gaps</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {pendingDocuments.length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Analysis</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Status */}
      {processingDocuments.length > 0 && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Analysis in Progress</h4>
                <p className="text-sm text-blue-700 mb-3">
                  {processingDocuments.length} documents are being analyzed by AI
                </p>
                {processingDocuments.map((doc, index) => (
                  <div key={doc.id} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{doc.title}</span>
                      <span>Processing...</span>
                    </div>
                    <Progress value={Math.random() * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Documents */}
      {pendingDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Documents Ready for Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {doc.mime_type} • {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'Unknown size'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => analyzeDocument(doc.id)}
                    disabled={analyzingDocuments.includes(doc.id)}
                    size="sm"
                  >
                    {analyzingDocuments.includes(doc.id) ? (
                      <>
                        <Brain className="h-4 w-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analyzed Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyzedDocuments.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No analyzed documents yet</p>
              <p className="text-sm text-muted-foreground">
                Upload documents and run AI analysis to see insights here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyzedDocuments.map((doc) => (
                <Card key={doc.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{doc.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {Math.round((doc.ai_confidence_score || 0) * 100)}% confidence
                          </Badge>
                        </div>
                        
                        {doc.ai_summary && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {doc.ai_summary}
                          </p>
                        )}

                        <div className="flex gap-4 text-sm">
                          {doc.key_risk_indicators?.length > 0 && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <span>{doc.key_risk_indicators.length} Risk Indicators</span>
                            </div>
                          )}
                          {doc.compliance_gaps?.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4 text-red-600" />
                              <span>{doc.compliance_gaps.length} Compliance Gaps</span>
                            </div>
                          )}
                        </div>

                        {doc.document_classification && (
                          <div className="flex gap-2 mt-2">
                            {Object.entries(doc.document_classification).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Analysis Details Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto m-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI Analysis: {selectedDocument.title}</span>
                <Button variant="ghost" onClick={() => setSelectedDocument(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Summary */}
              {selectedDocument.ai_summary && (
                <div>
                  <h4 className="font-medium mb-2">AI Summary</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedDocument.ai_summary}
                  </p>
                </div>
              )}

              {/* Risk Indicators */}
              {selectedDocument.key_risk_indicators?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Key Risk Indicators
                  </h4>
                  <div className="space-y-2">
                    {selectedDocument.key_risk_indicators.map((indicator: any, index: number) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {indicator.type}
                            </Badge>
                            <p className="text-sm">{indicator.description}</p>
                          </div>
                          <Badge variant={
                            indicator.severity === 'high' ? 'destructive' :
                            indicator.severity === 'medium' ? 'default' : 'secondary'
                          }>
                            {indicator.severity}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance Gaps */}
              {selectedDocument.compliance_gaps?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    Compliance Gaps
                  </h4>
                  <div className="space-y-2">
                    {selectedDocument.compliance_gaps.map((gap: any, index: number) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {gap.framework}
                            </Badge>
                            <p className="text-sm font-medium">{gap.requirement}</p>
                            <p className="text-sm text-muted-foreground">{gap.gap}</p>
                          </div>
                          <Badge variant={
                            gap.severity === 'high' ? 'destructive' :
                            gap.severity === 'medium' ? 'default' : 'secondary'
                          }>
                            {gap.severity}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIDocumentAnalysis;
