
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Eye, 
  Download, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Brain,
  AlertTriangle,
  Shield,
  Clock,
  User
} from 'lucide-react';
import { documentManagementService } from '@/services/document-management-service';
import { toast } from 'sonner';

interface DocumentListProps {
  documents: any[];
  onDocumentSelect: (document: any) => void;
  onDocumentUpdate: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentSelect,
  onDocumentUpdate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAnalysisStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Brain className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Brain className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="procedure">Procedure</SelectItem>
                <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                <SelectItem value="audit_report">Audit Report</SelectItem>
                <SelectItem value="compliance_doc">Compliance Doc</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredDocuments.length} of {documents.length} documents
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Upload your first document to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <FileText className="h-6 w-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-lg">{document.title}</h3>
                          <Badge className={getStatusColor(document.status)}>
                            {document.status}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getAnalysisStatusIcon(document.ai_analysis_status)}
                            <span className="text-xs text-muted-foreground">
                              AI {document.ai_analysis_status}
                            </span>
                          </div>
                        </div>

                        {document.description && (
                          <p className="text-muted-foreground mb-2">
                            {document.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
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

                        {/* AI Analysis Results */}
                        {document.ai_analysis_status === 'completed' && (
                          <div className="flex gap-2 mb-3">
                            {document.key_risk_indicators?.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1 text-orange-600" />
                                {document.key_risk_indicators.length} Risk Indicators
                              </Badge>
                            )}
                            {document.compliance_gaps?.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1 text-red-600" />
                                {document.compliance_gaps.length} Compliance Gaps
                              </Badge>
                            )}
                            {document.ai_confidence_score && (
                              <Badge variant="outline" className="text-xs">
                                <Brain className="h-3 w-3 mr-1 text-blue-600" />
                                {Math.round(document.ai_confidence_score * 100)}% AI Confidence
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {document.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDocumentSelect(document)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Download functionality would be implemented here
                        toast.info('Download feature coming soon');
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Edit functionality would be implemented here
                        toast.info('Edit feature coming soon');
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentList;
