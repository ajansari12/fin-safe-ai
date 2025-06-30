
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DocumentRepository } from "@/services/document-management-service";
import { FolderPlus, Folder, FileText, Settings, Users, Shield } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentManagementService } from "@/services/document-management-service";
import { useToast } from "@/components/ui/use-toast";

interface DocumentRepositoryManagerProps {
  repositories: DocumentRepository[];
}

const DocumentRepositoryManager: React.FC<DocumentRepositoryManagerProps> = ({ repositories }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    document_type: "policy" as const,
    access_level: "internal" as const,
    retention_years: 7
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => documentManagementService.createRepository(data),
    onSuccess: () => {
      toast({
        title: "Repository created",
        description: "Document repository has been created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['document-repositories'] });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        document_type: "policy",
        access_level: "internal",
        retention_years: 7
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a repository name",
        variant: "destructive"
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'confidential': return 'bg-yellow-100 text-yellow-800';
      case 'restricted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'policy': return <Shield className="h-4 w-4" />;
      case 'procedure': return <FileText className="h-4 w-4" />;
      case 'risk_assessment': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Repositories</h2>
          <p className="text-muted-foreground">
            Organize documents into categorized repositories with access controls
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Repository
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Document Repository</DialogTitle>
              <DialogDescription>
                Create a new repository to organize documents by type and access level
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Repository Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Risk Management Policies"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this repository contains"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="document_type">Document Type</Label>
                  <select
                    id="document_type"
                    value={formData.document_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value as any }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="policy">Policy</option>
                    <option value="procedure">Procedure</option>
                    <option value="risk_assessment">Risk Assessment</option>
                    <option value="audit_report">Audit Report</option>
                    <option value="compliance_doc">Compliance Document</option>
                    <option value="contract">Contract</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="access_level">Access Level</Label>
                  <select
                    id="access_level"
                    value={formData.access_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, access_level: e.target.value as any }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="public">Public</option>
                    <option value="internal">Internal</option>
                    <option value="confidential">Confidential</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="retention_years">Retention Period (Years)</Label>
                <Input
                  id="retention_years"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.retention_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, retention_years: parseInt(e.target.value) || 7 }))}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Repository'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {repositories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No repositories found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first document repository to get started
            </p>
            <Button onClick={() => setOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Repository
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repository) => (
            <Card key={repository.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getDocumentTypeIcon(repository.document_type)}
                  {repository.name}
                  <Badge className={getAccessLevelColor(repository.access_level)}>
                    {repository.access_level}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {repository.description || `Repository for ${repository.document_type} documents`}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Document Type</span>
                    <Badge variant="outline">
                      {repository.document_type.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Retention</span>
                    <span>{repository.retention_years} years</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(repository.created_at).toLocaleDateString()}</span>
                  </div>

                  {repository.created_by_name && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created by</span>
                      <span>{repository.created_by_name}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="h-4 w-4 mr-1" />
                      View Documents
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentRepositoryManager;
