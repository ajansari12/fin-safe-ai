
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { documentManagementService } from '@/services/document-management-service';
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface AIDocumentAnalysisProps {
  documentId: string;
}

const AIDocumentAnalysis: React.FC<AIDocumentAnalysisProps> = ({ documentId }) => {
  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentManagementService.getDocuments()
  });

  const document = documents.find(doc => doc.id === documentId);

  if (!document) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Document not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Analysis Status */}
            <div className="flex items-center gap-2">
              <span className="font-medium">Analysis Status:</span>
              <Badge 
                variant={document.ai_analysis_status === 'completed' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {document.ai_analysis_status || 'pending'}
              </Badge>
            </div>

            {/* Confidence Score */}
            {document.ai_confidence_score && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Confidence Score:</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${document.ai_confidence_score}%` }}
                    />
                  </div>
                  <span className="text-sm">{document.ai_confidence_score}%</span>
                </div>
              </div>
            )}

            {/* AI Summary */}
            {document.ai_summary && (
              <div>
                <h4 className="font-medium mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {document.ai_summary}
                </p>
              </div>
            )}

            {/* Key Risk Indicators */}
            {document.key_risk_indicators && document.key_risk_indicators.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Key Risk Indicators
                </h4>
                <div className="space-y-2">
                  {document.key_risk_indicators.map((risk, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{risk.title || `Risk ${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{risk.description || 'No description available'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Gaps */}
            {document.compliance_gaps && document.compliance_gaps.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Compliance Gaps
                </h4>
                <div className="space-y-2">
                  {document.compliance_gaps.map((gap, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{gap.title || `Gap ${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{gap.description || 'No description available'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Classification */}
            {document.document_classification && Object.keys(document.document_classification).length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Document Classification
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(document.document_classification).map(([key, value]) => (
                    <div key={key} className="p-2 bg-muted rounded">
                      <p className="text-xs font-medium capitalize">{key.replace('_', ' ')}</p>
                      <p className="text-sm">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Analysis Available */}
            {document.ai_analysis_status === 'pending' && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analysis in Progress</h3>
                <p className="text-muted-foreground">
                  AI analysis is being processed. This may take a few minutes.
                </p>
              </div>
            )}

            {document.ai_analysis_status === 'failed' && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
                <p className="text-muted-foreground">
                  There was an error processing this document. Please try re-uploading.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDocumentAnalysis;
