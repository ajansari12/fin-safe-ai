
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { documentManagementService } from "@/services/document-management-service";
import { FileText, Upload, Search, Filter, Brain, Users, Share2, BarChart3 } from "lucide-react";
import DocumentRepositoryManager from "./DocumentRepositoryManager";
import DocumentUploader from "./DocumentUploader";
import DocumentList from "./DocumentList";
import DocumentAnalytics from "./DocumentAnalytics";
import AIDocumentAnalysis from "./AIDocumentAnalysis";

const DocumentManagementDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepository, setSelectedRepository] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { data: repositories = [] } = useQuery({
    queryKey: ['document-repositories'],
    queryFn: () => documentManagementService.getRepositories()
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', selectedRepository, selectedStatus, searchQuery],
    queryFn: () => documentManagementService.getDocuments({
      repository_id: selectedRepository || undefined,
      status: selectedStatus || undefined,
      search: searchQuery || undefined
    })
  });

  const { data: analytics } = useQuery({
    queryKey: ['document-analytics'],
    queryFn: () => documentManagementService.getDocumentAnalytics()
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">
            Intelligent document management with AI-powered analysis
          </p>
        </div>
        <div className="flex gap-2">
          <DocumentUploader />
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share External
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {documents.filter(d => d.status === 'approved').length} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.ai_analysis_status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Documents analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repositories</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repositories.length}</div>
            <p className="text-xs text-muted-foreground">
              Active repositories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Due</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.review_due_date && new Date(d.review_due_date) <= new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="border rounded px-3 py-2"
              value={selectedRepository}
              onChange={(e) => setSelectedRepository(e.target.value)}
            >
              <option value="">All Repositories</option>
              {repositories.map(repo => (
                <option key={repo.id} value={repo.id}>{repo.name}</option>
              ))}
            </select>
            <select
              className="border rounded px-3 py-2"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <DocumentList documents={documents} />
        </TabsContent>

        <TabsContent value="repositories" className="space-y-4">
          <DocumentRepositoryManager repositories={repositories} />
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-4">
          <AIDocumentAnalysis documents={documents} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <DocumentAnalytics analytics={analytics} />
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Sharing</CardTitle>
              <CardDescription>
                Manage external document sharing and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Share2 className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Document Sharing</h3>
                <p>Configure secure document sharing with external parties</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentManagementDashboard;
