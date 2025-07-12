
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Upload, 
  Search, 
  Brain, 
  Network, 
  Users, 
  BarChart3,
  Bot,
  Globe,
  Eye,
  MessageSquare,
  Zap
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { documentManagementService } from '@/services/document-management-service';
import DocumentList from './DocumentList';
import DocumentUploader from './DocumentUploader';
import DocumentViewer from './DocumentViewer';
import AIDocumentAnalysis from './AIDocumentAnalysis';
import DocumentAnalytics from './DocumentAnalytics';
import { toast } from 'sonner';

const DocumentManagementDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      loadDashboardData();
    }
  }, [profile?.organization_id]);

  const loadDashboardData = async () => {
    try {
      const [docsData, reposData, analyticsData] = await Promise.all([
        documentManagementService.getDocuments(),
        documentManagementService.getRepositories(),
        documentManagementService.getDocumentAnalytics('month')
      ]);

      setDocuments(docsData);
      setRepositories(reposData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load document data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await documentManagementService.searchDocuments(searchQuery);
      setDocuments(results);
    } catch (error) {
      console.error('Error searching documents:', error);
      toast.error('Search failed');
    }
  };

  const documentFeatures = [
    {
      id: 'documents',
      title: 'Document Library',
      description: 'Browse and manage all documents',
      icon: FileText,
      badge: 'Active',
      count: documents.length
    },
    {
      id: 'ai-analysis',
      title: 'AI Analysis',
      description: 'Intelligent document insights and extraction',
      icon: Brain,
      badge: 'AI-Powered',
      count: documents.filter((d: any) => d.ai_analysis_status === 'completed').length
    },
    {
      id: 'knowledge-graph',
      title: 'Knowledge Graph',
      description: 'Document relationships and connections',
      icon: Network,
      badge: 'Smart',
      count: 0
    },
    {
      id: 'collaboration',
      title: 'Collaboration',
      description: 'Real-time editing and comments',
      icon: Users,
      badge: 'Live',
      count: 0
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Usage insights and trends',
      icon: BarChart3,
      badge: 'Insights',
      count: analytics?.totalAccesses || 0
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">
            AI-powered document analysis and knowledge extraction platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            AI-Enhanced
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Smart Features
          </Badge>
        </div>
      </div>

      {/* AI-Powered Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Intelligent Document Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search documents with natural language (e.g., 'find risk policies from last quarter')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs">Semantic Search</Badge>
            <Badge variant="outline" className="text-xs">Content Analysis</Badge>
            <Badge variant="outline" className="text-xs">Relationship Mapping</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Feature Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {documentFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={feature.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab(feature.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {feature.description}
                </p>
                <div className="text-lg font-bold text-blue-600">
                  {feature.count}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Insights Panel */}
      <Card className="border-l-4 border-l-green-500 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">AI Document Insights</h4>
              <p className="text-sm text-green-700 mb-2">
                {analytics?.totalDocuments || 0} documents analyzed, {' '}
                {documents.filter((d: any) => d.ai_analysis_status === 'completed').length} with AI insights
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs bg-white">
                  Risk Indicators: {documents.reduce((acc: number, doc: any) => 
                    acc + (doc.key_risk_indicators?.length || 0), 0)}
                </Badge>
                <Badge variant="outline" className="text-xs bg-white">
                  Compliance Gaps: {documents.reduce((acc: number, doc: any) => 
                    acc + (doc.compliance_gaps?.length || 0), 0)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="knowledge-graph" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Knowledge Graph
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaboration
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Document Library</h2>
            <DocumentUploader onUploadComplete={loadDashboardData} />
          </div>
          <DocumentList 
            documents={documents} 
            onDocumentSelect={setSelectedDocument}
            onDocumentUpdate={loadDashboardData}
          />
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-6">
          <AIDocumentAnalysis 
            documents={documents}
            onAnalysisComplete={loadDashboardData}
          />
        </TabsContent>

        <TabsContent value="knowledge-graph" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Knowledge Graph & Document Relationships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Network className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Knowledge Graph Coming Soon</h3>
                <p className="text-muted-foreground">
                  Visualize document relationships and knowledge connections
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaborative Document Editing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Real-time Comments</h4>
                        <p className="text-sm text-muted-foreground">
                          Collaborative review and feedback
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Eye className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-medium">Live Editing</h4>
                        <p className="text-sm text-muted-foreground">
                          Real-time document collaboration
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <DocumentAnalytics analytics={analytics} />
        </TabsContent>
      </Tabs>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer 
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};

export default DocumentManagementDashboard;
