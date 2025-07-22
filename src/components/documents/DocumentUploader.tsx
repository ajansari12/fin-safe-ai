
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { documentManagementService } from '@/services/document-management-service';
import { toast } from 'sonner';

interface DocumentUploaderProps {
  existingDocumentId?: string;
  isNewVersion?: boolean;
  onUploadComplete?: () => void;
  onCancel?: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  existingDocumentId,
  isNewVersion = false,
  onUploadComplete,
  onCancel
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setUploadError(null);
    
    // Auto-fill title if not already set
    if (!title && acceptedFiles.length > 0) {
      const fileName = acceptedFiles[0].name;
      const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
      setTitle(nameWithoutExtension);
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg']
    },
    multiple: !isNewVersion,
    maxSize: 10 * 1024 * 1024 // 10MB limit
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadError('Please select at least one file to upload');
      return;
    }

    if (!title.trim()) {
      setUploadError('Please provide a title for the document');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      for (const file of files) {
        // Create a simple file path for now (in production, you'd upload to storage)
        const filePath = `documents/${Date.now()}_${file.name}`;
        const checksum = await generateFileChecksum(file);

        const documentData = {
          title: files.length === 1 ? title : `${title} - ${file.name}`,
          description: description || undefined,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          checksum: checksum,
          status: 'draft' as const,
          extraction_status: 'pending' as const,
          ai_analysis_status: 'pending' as const
        };

        if (isNewVersion && existingDocumentId) {
          // Handle version upload
          await documentManagementService.createNewVersion(existingDocumentId, documentData, file);
        } else {
          // Handle new document upload
          await documentManagementService.uploadDocument(documentData);
        }
      }

      toast.success(
        isNewVersion 
          ? 'New version uploaded successfully!' 
          : `${files.length} document(s) uploaded successfully!`
      );
      
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const generateFileChecksum = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Supported: PDF, DOC, DOCX, TXT, XLS, XLSX, Images (max 10MB each)
            </p>
          </div>
        )}
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Files</Label>
          {files.map((file, index) => (
            <Card key={index}>
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Document Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            disabled={isUploading}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter document description (optional)"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{uploadError}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
        >
          {isUploading ? 'Uploading...' : isNewVersion ? 'Upload New Version' : 'Upload Documents'}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploader;
