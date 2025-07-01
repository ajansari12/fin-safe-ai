import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  X, 
  Brain, 
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { documentManagementService } from '@/services/document-management-service';
import { toast } from 'sonner';

interface DocumentUploaderProps {
  onUploadComplete: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadComplete }) => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [repositories, setRepositories] = useState<any[]>([]);

  const [documentData, setDocumentData] = useState({
    title: '',
    description: '',
    repository_id: '',
    status: 'draft',
    tags: [] as string[],
    enable_ai_analysis: true
  });

  const [tagInput, setTagInput] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      loadRepositories();
    }
  }, [isOpen]);

  const loadRepositories = async () => {
    try {
      const repos = await documentManagementService.getRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error('Error loading repositories:', error);
    }
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadFiles(prev => [...prev, ...files]);
    
    // Auto-fill title if only one file and no title set
    if (files.length === 1 && !documentData.title) {
      setDocumentData(prev => ({
        ...prev,
        title: files[0].name.replace(/\.[^/.]+$/, "")
      }));
    }
  }, [documentData.title]);

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = (tag: string) => {
    if (tag && !documentData.tags.includes(tag)) {
      setDocumentData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setDocumentData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    if (!documentData.title.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        
        // Simulate file upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        // Create document record
        const document = await documentManagementService.uploadDocument({
          ...documentData,
          title: uploadFiles.length > 1 ? `${documentData.title} (${i + 1})` : documentData.title,
          file_path: `documents/${file.name}`,
          file_size: file.size,
          mime_type: file.type,
          checksum: await calculateChecksum(file),
          org_id: profile?.organization_id!,
          extraction_status: 'pending',
          ai_analysis_status: documentData.enable_ai_analysis ? 'pending' : 'pending'
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        toast.success(`Document "${document.title}" uploaded successfully`);
      }

      // Reset form
      setDocumentData({
        title: '',
        description: '',
        repository_id: '',
        status: 'draft',
        tags: [],
        enable_ai_analysis: true
      });
      setUploadFiles([]);
      setUploadProgress(0);
      setIsOpen(false);
      onUploadComplete();

    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const calculateChecksum = async (file: File): Promise<string> => {
    // Simple checksum calculation - in production, use a proper hash function
    return `checksum_${file.size}_${file.lastModified}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.md"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">
                    Support: PDF, DOC, DOCX, TXT, MD (Max 10MB each)
                  </p>
                </label>
              </div>

              {/* Selected Files */}
              {uploadFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Files:</h4>
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize(file.size)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title *</label>
                <Input
                  value={documentData.title}
                  onChange={(e) => setDocumentData(prev => ({...prev, title: e.target.value}))}
                  placeholder="Enter document title"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={documentData.description}
                  onChange={(e) => setDocumentData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Enter document description (optional)"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Repository</label>
                  <Select 
                    value={documentData.repository_id} 
                    onValueChange={(value) => setDocumentData(prev => ({...prev, repository_id: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select repository" />
                    </SelectTrigger>
                    <SelectContent>
                      {repositories.map((repo) => (
                        <SelectItem key={repo.id} value={repo.id}>
                          {repo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select 
                    value={documentData.status} 
                    onValueChange={(value) => setDocumentData(prev => ({...prev, status: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium mb-1 block">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                  />
                  <Button type="button" onClick={() => addTag(tagInput)} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {documentData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Options */}
          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">AI-Powered Analysis</h4>
                      <p className="text-sm text-blue-700">
                        Enable automatic content analysis, risk indicator extraction, and compliance checking
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={documentData.enable_ai_analysis}
                      onChange={(e) => setDocumentData(prev => ({
                        ...prev, 
                        enable_ai_analysis: e.target.checked
                      }))}
                      className="rounded"
                    />
                  </div>
                  {documentData.enable_ai_analysis && (
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs bg-white">
                        <Zap className="h-3 w-3 mr-1" />
                        Content Extraction
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-white">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Risk Analysis
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Compliance Check
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {uploading && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading documents...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || uploadFiles.length === 0}>
            {uploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {uploadFiles.length} Document{uploadFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploader;
