
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentManagementService } from "@/services/document-management-service";
import { Upload, FileText, Brain, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DocumentUploader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    repository_id: "",
    tags: [] as string[],
    review_due_date: "",
    expiry_date: ""
  });
  const [tagInput, setTagInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: repositories = [] } = useQuery({
    queryKey: ['document-repositories'],
    queryFn: () => documentManagementService.getRepositories()
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      return documentManagementService.uploadDocument({
        ...data,
        file_size: selectedFile?.size || 0,
        mime_type: selectedFile?.type || "",
        extraction_status: 'pending',
        ai_analysis_status: 'pending',
        key_risk_indicators: [],
        compliance_gaps: [],
        document_classification: {},
        metadata: {},
        status: 'draft',
        is_current_version: true,
        is_archived: false,
        access_count: 0
      });
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded successfully",
        description: "AI analysis will begin shortly"
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      repository_id: "",
      tags: [],
      review_due_date: "",
      expiry_date: ""
    });
    setTagInput("");
    setSelectedFile(null);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a document title",
        variant: "destructive"
      });
      return;
    }

    uploadMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload New Document
          </DialogTitle>
          <DialogDescription>
            Upload a document for AI-powered analysis and risk assessment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Drag and drop your file here, or click to browse
                </p>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.md"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Choose File
                </Button>
              </div>
              {selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the document"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="repository">Repository</Label>
              <select
                id="repository"
                value={formData.repository_id}
                onChange={(e) => setFormData(prev => ({ ...prev, repository_id: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select repository</option>
                {repositories.map(repo => (
                  <option key={repo.id} value={repo.id}>{repo.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="review_due">Review Due Date</Label>
              <Input
                id="review_due"
                type="date"
                value={formData.review_due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, review_due_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* AI Analysis Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">AI Analysis</h3>
            </div>
            <p className="text-sm text-blue-700">
              This document will be automatically analyzed for:
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
              <li>Key risk indicators and threats</li>
              <li>Compliance gaps and requirements</li>
              <li>Document classification and categorization</li>
              <li>Policy and procedure analysis</li>
              <li>Similarity to existing documents</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Uploading...' : 'Upload & Analyze'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploader;
