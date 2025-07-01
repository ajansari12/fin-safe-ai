
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Download, 
  Edit, 
  Share2, 
  MessageSquare, 
  Brain,
  AlertTriangle,
  Shield,
  FileText,
  Clock,
  User,
  Eye
} from 'lucide-react';
import { documentManagementService } from '@/services/document-management-service';
import DocumentComments from './DocumentComments';
import DocumentVersionHistory from './DocumentVersionHistory';

interface DocumentViewerProps {
  document: any;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const [comments, setComments] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);

  useEffect(() => {
    loadDocumentData();
  }, [document.id]);

  const loadDocumentData = async () => {
    try {
      const [commentsData, versionsData, relationshipsData] = await Promise.all([
        documentManagementService.getComments(document.id),
        documentManagementService.getDocumentVersions(document.id),
        documentManagementService.getDocumentRelationships(document.id)
      ]);

      setComments(commentsData);
      setVersions(versionsData);
      setRelationships(relationshipsData);
    } catch (error) {
      console.error('Error loading document data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden m-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl">{document.title}</CardTitle>
              <Badge className={getStatusColor(document.status)}>
                {document.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {document.uploaded_by_name || 'Unknown'}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(document.created_at).toLocaleDateString()}
              </div>
              {document.file_size && (
                <div>{formatFileSize(document.file_size)}</div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {document.access_count || 0} views
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 border-b">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
                <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
                <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
                <TabsTrigger value="relationships">Relationships</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {document.description && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-muted-foreground">{document.description}</p>
                      </div>
                    )}

                    {document.extracted_text ? (
                      <div>
                        <h4 className="font-medium mb-2">Extracted Text</h4>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-96 overflow-auto">
                          {document.extracted_text}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">
                          Content extraction pending or not available
                        </p>
                      </div>
                    )}

                    {document.tags && document.tags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Tags</h4>
                        <div className="flex gap-1 flex-wrap">
                          {document.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-analysis" className="space-y-6">
                {document.ai_analysis_status === 'completed' ? (
                  <>
                    {/* AI Summary */}
                    {document.ai_summary && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-blue-600" />
                            AI Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm bg-blue-50 p-4 rounded-lg">
                            {document.ai_summary}
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Confidence: {Math.round((document.ai_confidence_score || 0) * 100)}%
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Risk Indicators */}
                    {document.key_risk_indicators && document.key_risk_indicators.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Key Risk Indicators
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {document.key_risk_indicators.map((indicator: any, index: number) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <Badge variant="outline" className="mb-2">
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
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Compliance Gaps */}
                    {document.compliance_gaps && document.compliance_gaps.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-red-600" />
                            Compliance Gaps
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {document.compliance_gaps.map((gap: any, index: number) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <Badge variant="outline" className="mb-2">
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
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Document Classification */}
                    {document.document_classification && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Document Classification</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-2 md:grid-cols-2">
                            {Object.entries(document.document_classification).map(([key, value]) => (
                              <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                                <span className="font-medium">{key.replace('_', ' ').toUpperCase()}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        {document.ai_analysis_status === 'processing' 
                          ? 'AI analysis in progress...' 
                          : 'AI analysis not completed'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="comments">
                <DocumentComments 
                  documentId={document.id}
                  comments={comments}
                  onCommentsUpdate={loadDocumentData}
                />
              </TabsContent>

              <TabsContent value="versions">
                <DocumentVersionHistory 
                  documentId={document.id}
                  versions={versions}
                />
              </TabsContent>

              <TabsContent value="relationships" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Relationships</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {relationships.length > 0 ? (
                      <div className="space-y-3">
                        {relationships.map((rel: any) => (
                          <div key={rel.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">
                                {rel.source_document?.title || rel.target_document?.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {rel.relationship_type.replace('_', ' ')}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {Math.round((rel.relationship_strength || 0) * 100)}% strength
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No relationships found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default DocumentViewer;
