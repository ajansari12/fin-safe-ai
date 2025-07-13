import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Upload,
  Calendar,
  User,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  mime_type: string | null;
  file_size: number | null;
  status: string;
  uploaded_by_name: string | null;
  created_at: string;
  updated_at: string;
  tags: string[] | null;
}

interface DocumentListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositoryId: string;
  repositoryName: string;
}

const DocumentListingDialog: React.FC<DocumentListingDialogProps> = ({ 
  open, 
  onOpenChange, 
  repositoryId, 
  repositoryName 
}) => {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (open && repositoryId) {
      loadDocuments();
    }
  }, [open, repositoryId]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, statusFilter]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('repository_id', repositoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocuments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const uniqueStatuses = [...new Set(documents.map(doc => doc.status))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents in {repositoryName}
          </DialogTitle>
          <DialogDescription>
            View and manage all documents in this repository
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Actions Bar */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={loadDocuments} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            <Button variant="default" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          <Separator />

          {/* Documents List */}
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 animate-pulse text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {documents.length === 0 ? 'No documents in this repository' : 'No documents match your filters'}
                </p>
                {documents.length === 0 && (
                  <Button variant="outline" className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First Document
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((document) => (
                  <div key={document.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h4 className="font-medium text-sm truncate">{document.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(document.status)}`}
                          >
                            {document.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {document.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {document.description}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                          </div>
                          {document.uploaded_by_name && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {document.uploaded_by_name}
                            </div>
                          )}
                          <div>
                            Size: {formatFileSize(document.file_size)}
                          </div>
                          {document.mime_type && (
                            <div>
                              Type: {document.mime_type.split('/')[1]?.toUpperCase() || 'Unknown'}
                            </div>
                          )}
                        </div>
                        
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {document.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {document.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{document.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
            <span>
              Showing {filteredDocuments.length} of {documents.length} documents
            </span>
            <span>
              Total size: {formatFileSize(documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0))}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentListingDialog;