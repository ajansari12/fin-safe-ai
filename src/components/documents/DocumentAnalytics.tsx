
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { documentManagementService } from '@/services/document-management-service';
import { BarChart3, TrendingUp, FileText, Eye } from 'lucide-react';

const DocumentAnalytics: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['document-analytics', 'month'],
    queryFn: () => documentManagementService.getDocumentAnalytics('month')
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentManagementService.getDocuments()
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    totalDocuments: documents.length,
    totalAccesses: documents.reduce((sum, doc) => sum + (doc.access_count || 0), 0),
    avgFileSize: documents.length > 0 
      ? (documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0) / documents.length / 1024 / 1024)
      : 0,
    documentsWithAI: documents.filter(doc => doc.ai_analysis_status === 'completed').length,
    documentsByStatus: documents.reduce((acc, doc) => {
      const status = doc.status || 'draft';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalAccesses}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Analyzed</p>
                <p className="text-2xl font-bold">{stats.documentsWithAI}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg File Size</p>
                <p className="text-2xl font-bold">{stats.avgFileSize.toFixed(1)}MB</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Document Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.documentsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'approved' ? 'bg-green-500' :
                    status === 'draft' ? 'bg-yellow-500' :
                    status === 'rejected' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{count}</span>
                  <span className="text-sm text-muted-foreground">
                    ({((count / stats.totalDocuments) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {doc.access_count || 0} views
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentAnalytics;
