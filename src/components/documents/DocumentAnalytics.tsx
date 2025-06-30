
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, FileText, Clock, Users, Download } from "lucide-react";

interface DocumentAnalyticsProps {
  analytics: any;
}

const DocumentAnalytics: React.FC<DocumentAnalyticsProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Analytics Loading</h3>
          <p className="text-muted-foreground">
            Document analytics will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Across all repositories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAccesses}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analytics.totalAccesses / 30)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 GB</div>
            <p className="text-xs text-muted-foreground">
              Of 10 GB limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Document Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Document Status Distribution</CardTitle>
          <CardDescription>
            Breakdown of documents by current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.documentsByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(100, ((count as number) / analytics.totalDocuments) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Accessed Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Most Accessed Documents</CardTitle>
          <CardDescription>
            Documents with highest view counts this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.mostAccessedDocuments && analytics.mostAccessedDocuments.length > 0 ? (
            <div className="space-y-3">
              {analytics.mostAccessedDocuments.slice(0, 10).map((doc: any, index: number) => (
                <div key={doc.documentId} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Document #{doc.documentId.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.accessCount} views
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{doc.accessCount} views</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2" />
              <p>No access data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Activity</CardTitle>
          <CardDescription>
            Document upload trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.uploadsOverTime && Object.keys(analytics.uploadsOverTime).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(analytics.uploadsOverTime).map(([period, count]) => (
                <div key={period} className="flex items-center justify-between">
                  <span className="text-sm">{period}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, ((count as number) / Math.max(...Object.values(analytics.uploadsOverTime))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p>No upload data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentAnalytics;
