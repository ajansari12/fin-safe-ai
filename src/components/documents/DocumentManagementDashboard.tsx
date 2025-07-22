
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { documentManagementService } from "@/services/document-management-service";
import { Search, Plus, FileText, Upload, BarChart3, MessageSquare, History } from "lucide-react";
import { toast } from "sonner";
import DocumentUploader from "./DocumentUploader";
import DocumentList from "./DocumentList";
import DocumentViewer from "./DocumentViewer";
import AIDocumentAnalysis from "./AIDocumentAnalysis";
import DocumentAnalytics from "./DocumentAnalytics";
import DocumentComments from "./DocumentComments";
import DocumentVersionHistory from "./DocumentVersionHistory";

const DocumentManagementDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch documents with error handling
  const { data: documents = [], isLoading: documentsLoading, error: documentsError, refetch: refetchDocuments } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentManagementService.getDocuments(),
    retry: 2
  });

  // Fetch repositories with error handling
  const { data: repositories = [], isLoading: repositoriesLoading, error: repositoriesError } = useQuery({
    queryKey: ['document-repositories'],
    queryFn: () => documentManagementService.getRepositories(),
    retry: 2
  });

  // Fetch analytics with error handling
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['document-analytics', 'month'],
    queryFn: () => documentManagementService.getDocumentAnalytics('month'),
    retry: 2
  });

  // Handle errors with useEffect
  React.useEffect(() => {
    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      toast.error('Failed to load documents. Please try again.');
    }
    if (repositoriesError) {
      console.error('Error fetching repositories:', repositoriesError);
      toast.error('Failed to load repositories. Please try again.');
    }
  }, [documentsError, repositoriesError]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      refetchDocuments();
      return;
    }

    try {
      const results = await documentManagementService.searchDocuments(searchQuery);
      // Update the documents list with search results
      toast.success(`Found ${results.length} documents`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  const handleUploadComplete = () => {
    setShowUploader(false);
    refetchDocuments();
    toast.success('Document uploaded successfully!');
  };

  // Show error state if there are critical errors
  if (documentsError && !documents.length) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Documents</h3>
            <p className="text-muted-foreground text-center mb-4">
              There was an error loading your documents. This might be due to permissions or connectivity issues.
            </p>
            <Button onClick={() => refetchDocuments()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">
            Upload, organize, and analyze your documents with AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowUploader(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{documentsLoading ? '...' : documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Repositories</p>
                <p className="text-2xl font-bold">{repositoriesLoading ? '...' : repositories.length}</p>
              </div>
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Analyzed</p>
                <p className="text-2xl font-bold">
                  {documentsLoading ? '...' : documents.filter(doc => doc.ai_analysis_status === 'completed').length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                <p className="text-2xl font-bold">
                  {analyticsLoading ? '...' : (analytics?.totalAccesses || 0)}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          {selectedDocument && (
            <>
              <TabsTrigger value="viewer">Viewer</TabsTrigger>
              <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {documentsLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents yet</p>
                    <Button onClick={() => setShowUploader(true)} className="mt-2">
                      Upload your first document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{doc.title}</span>
                        </div>
                        <Badge variant="outline">{doc.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Repositories</CardTitle>
              </CardHeader>
              <CardContent>
                {repositoriesLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </div>
                ) : repositories.length === 0 ? (
                  <div className="text-center py-8">
                    <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No repositories created</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {repositories.map((repo) => (
                      <div key={repo.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                        <div>
                          <p className="font-medium">{repo.name}</p>
                          <p className="text-sm text-muted-foreground">{repo.document_type}</p>
                        </div>
                        <Badge variant="outline">{repo.access_level}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentList
            documents={documents}
            isLoading={documentsLoading}
            onDocumentSelect={setSelectedDocument}
            selectedDocument={selectedDocument}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <DocumentAnalytics />
        </TabsContent>

        {selectedDocument && (
          <>
            <TabsContent value="viewer">
              <DocumentViewer documentId={selectedDocument} />
            </TabsContent>

            <TabsContent value="ai-analysis">
              <AIDocumentAnalysis documentId={selectedDocument} />
            </TabsContent>

            <TabsContent value="comments">
              <DocumentComments documentId={selectedDocument} />
            </TabsContent>

            <TabsContent value="versions">
              <DocumentVersionHistory documentId={selectedDocument} />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Document Uploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload Document</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowUploader(false)}>
                ×
              </Button>
            </div>
            <DocumentUploader
              onUploadComplete={handleUploadComplete}
              onCancel={() => setShowUploader(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagementDashboard;
