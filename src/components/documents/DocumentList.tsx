
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Document } from "@/services/document-management-service";
import { FileText, Download, Eye, Edit, Share, MessageSquare, Brain, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DocumentViewer from "./DocumentViewer";

interface DocumentListProps {
  documents: Document[];
}

const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAIStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No documents found</h3>
          <p className="text-muted-foreground">
            Upload your first document or adjust your search filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {documents.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {document.title}
                    <Badge className={getStatusColor(document.status)}>
                      {document.status}
                    </Badge>
                    {document.ai_analysis_status === 'completed' && (
                      <Badge className={getAIStatusColor(document.ai_analysis_status)}>
                        <Brain className="h-3 w-3 mr-1" />
                        AI Analyzed
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="mt-2 space-y-1">
                    {document.description && (
                      <p className="text-sm text-muted-foreground">{document.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Version {document.version_number}</span>
                      <span>Updated {formatDistanceToNow(new Date(document.updated_at))} ago</span>
                      {document.uploaded_by_name && <span>by {document.uploaded_by_name}</span>}
                      <span>{document.access_count} views</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDocument(document)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* AI Analysis Summary */}
                {document.ai_summary && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Summary
                      {document.ai_confidence_score && (
                        <Badge variant="secondary">
                          {Math.round(document.ai_confidence_score * 100)}% confidence
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-gray-700">{document.ai_summary}</p>
                  </div>
                )}

                {/* Key Risk Indicators */}
                {document.key_risk_indicators.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Key Risk Indicators</h4>
                    <div className="flex flex-wrap gap-2">
                      {document.key_risk_indicators.slice(0, 3).map((indicator, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {indicator.type}: {indicator.description}
                        </Badge>
                      ))}
                      {document.key_risk_indicators.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{document.key_risk_indicators.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Compliance Gaps */}
                {document.compliance_gaps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Compliance Gaps</h4>
                    <div className="flex flex-wrap gap-2">
                      {document.compliance_gaps.slice(0, 2).map((gap, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {gap.framework}: {gap.requirement}
                        </Badge>
                      ))}
                      {document.compliance_gaps.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{document.compliance_gaps.length - 2} more gaps
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Due Date */}
                {document.review_due_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Review due: {new Date(document.review_due_date).toLocaleDateString()}</span>
                    {new Date(document.review_due_date) <= new Date() && (
                      <Badge variant="destructive">Overdue</Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Comments
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Brain className="h-4 w-4 mr-1" />
                    Re-analyze
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          open={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
};

export default DocumentList;
