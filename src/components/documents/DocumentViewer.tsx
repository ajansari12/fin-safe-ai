
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Document } from "@/services/document-management-service";
import { FileText, Download, Share, Edit, MessageSquare, Brain, Calendar, Users, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DocumentComments from "./DocumentComments";
import DocumentVersionHistory from "./DocumentVersionHistory";

interface DocumentViewerProps {
  document: Document;
  open: boolean;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, open, onClose }) => {
  const [activeTab, setActiveTab] = useState("content");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {document.title}
              <Badge className={getStatusColor(document.status)}>
                {document.status}
              </Badge>
              {document.ai_analysis_status === 'completed' && (
                <Badge className="bg-green-100 text-green-800">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Analyzed
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="content" className="h-full">
                <div className="space-y-4">
                  {/* Document Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Version</h4>
                      <p className="text-sm">{document.version_number}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Last Updated</h4>
                      <p className="text-sm">{formatDistanceToNow(new Date(document.updated_at))} ago</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Uploaded By</h4>
                      <p className="text-sm">{document.uploaded_by_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Views</h4>
                      <p className="text-sm">{document.access_count}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {document.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-gray-700">{document.description}</p>
                    </div>
                  )}

                  {/* Document Content Preview */}
                  <div className="border rounded-lg p-4 min-h-[400px] bg-white">
                    <h4 className="font-medium mb-4">Document Content</h4>
                    {document.extracted_text ? (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm">
                          {document.extracted_text.slice(0, 2000)}
                          {document.extracted_text.length > 2000 && '...'}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-16 w-16 mx-auto mb-4" />
                        <p>Document content will appear here after processing</p>
                        {document.extraction_status === 'pending' && (
                          <p className="text-sm">Processing...</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="h-full">
                <div className="space-y-6">
                  {/* AI Summary */}
                  {document.ai_summary && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI Summary
                        {document.ai_confidence_score && (
                          <Badge variant="secondary">
                            {Math.round(document.ai_confidence_score * 100)}% confidence
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm">{document.ai_summary}</p>
                    </div>
                  )}

                  {/* Key Risk Indicators */}
                  {document.key_risk_indicators.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Key Risk Indicators</h4>
                      <div className="space-y-3">
                        {document.key_risk_indicators.map((indicator, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="destructive">{indicator.type}</Badge>
                              <Badge variant="outline">{indicator.severity}</Badge>
                            </div>
                            <p className="text-sm">{indicator.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compliance Gaps */}
                  {document.compliance_gaps.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Compliance Gaps</h4>
                      <div className="space-y-3">
                        {document.compliance_gaps.map((gap, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{gap.framework}</Badge>
                              <Badge variant={gap.severity === 'high' ? 'destructive' : 'secondary'}>
                                {gap.severity}
                              </Badge>
                            </div>
                            <h5 className="font-medium text-sm">{gap.requirement}</h5>
                            <p className="text-sm text-gray-600 mt-1">{gap.gap}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Classification */}
                  {document.document_classification && Object.keys(document.document_classification).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Document Classification</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(document.document_classification).map(([key, value]) => (
                          <div key={key} className="p-3 bg-gray-50 rounded">
                            <h5 className="font-medium text-sm capitalize">{key.replace('_', ' ')}</h5>
                            <p className="text-sm text-gray-600">{value as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="h-full">
                <DocumentComments documentId={document.id} />
              </TabsContent>

              <TabsContent value="versions" className="h-full">
                <DocumentVersionHistory documentId={document.id} />
              </TabsContent>

              <TabsContent value="metadata" className="h-full">
                <div className="space-y-6">
                  {/* Basic Metadata */}
                  <div>
                    <h4 className="font-medium mb-3">Document Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">File Size</Label>
                        <p className="text-sm">{document.file_size ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">MIME Type</Label>
                        <p className="text-sm">{document.mime_type || 'Unknown'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Created</Label>
                        <p className="text-sm">{new Date(document.created_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Last Access</Label>
                        <p className="text-sm">
                          {document.last_accessed_at 
                            ? formatDistanceToNow(new Date(document.last_accessed_at)) + ' ago'
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Review Dates */}
                  <div>
                    <h4 className="font-medium mb-3">Review & Expiry</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Review Due</Label>
                        <p className="text-sm">
                          {document.review_due_date 
                            ? new Date(document.review_due_date).toLocaleDateString()
                            : 'Not set'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Expires</Label>
                        <p className="text-sm">
                          {document.expiry_date 
                            ? new Date(document.expiry_date).toLocaleDateString()
                            : 'No expiry'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {document.tags && document.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Metadata */}
                  {document.metadata && Object.keys(document.metadata).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Custom Metadata</h4>
                      <div className="space-y-2">
                        {Object.entries(document.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium text-sm">{key}</span>
                            <span className="text-sm">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <label className={className}>{children}</label>
);

export default DocumentViewer;
