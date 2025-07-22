
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, MoreHorizontal, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Document } from '@/services/document-management-service';

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onDocumentSelect: (documentId: string) => void;
  selectedDocument: string | null;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  onDocumentSelect,
  selectedDocument
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
          <p className="text-muted-foreground text-center">
            Upload your first document to get started with document management and AI analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnalysisStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card 
          key={document.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedDocument === document.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onDocumentSelect(document.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{document.title}</h3>
                    {document.version_number && document.version_number > 1 && (
                      <Badge variant="outline" className="text-xs">
                        v{document.version_number}
                      </Badge>
                    )}
                  </div>
                  
                  {document.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {document.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{document.uploaded_by_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(document.created_at))} ago</span>
                    </div>
                    {document.file_size && (
                      <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    )}
                    {document.access_count !== undefined && (
                      <span>{document.access_count} views</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(document.status || 'draft')}>
                    {document.status || 'draft'}
                  </Badge>
                  {document.ai_analysis_status && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getAnalysisStatusColor(document.ai_analysis_status)}`}
                    >
                      AI: {document.ai_analysis_status}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                <div className="flex flex-wrap gap-1">
                  {document.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {document.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{document.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* AI Summary Preview */}
            {document.ai_summary && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>AI Summary:</strong> {document.ai_summary.slice(0, 120)}
                  {document.ai_summary.length > 120 && '...'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentList;
