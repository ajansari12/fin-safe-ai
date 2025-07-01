
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  TrendingUp, 
  Eye, 
  Download, 
  Users, 
  Clock,
  FileText,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface DocumentAnalyticsProps {
  analytics: any;
}

const DocumentAnalytics: React.FC<DocumentAnalyticsProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusData = Object.entries(analytics.documentsByStatus || {}).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count
  }));

  const uploadData = Object.entries(analytics.uploadsOverTime || {}).map(([period, count]) => ({
    period,
    uploads: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Document Analytics</h2>
          <p className="text-muted-foreground">
            Usage insights and document management metrics
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{analytics.totalDocuments}</div>
                <div className="text-sm text-muted-foreground">Total Documents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{analytics.totalAccesses}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {analytics.mostAccessedDocuments?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Popular Docs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(analytics.totalAccesses / Math.max(analytics.totalDocuments, 1))}
                </div>
                <div className="text-sm text-muted-foreground">Avg Views/Doc</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Document Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Document Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upload Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Document Upload Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={uploadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="uploads" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Most Accessed Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Most Accessed Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.mostAccessedDocuments?.length > 0 ? (
            <div className="space-y-3">
              {analytics.mostAccessedDocuments.slice(0, 10).map((doc: any, index: number) => (
                <div key={doc.documentId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">Document {doc.documentId}</h4>
                      <p className="text-sm text-muted-foreground">
                        {doc.accessCount} views
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {doc.accessCount}
                    </div>
                    <div className="text-xs text-muted-foreground">views</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No access data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Summary */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900">AI Analysis Summary</h4>
              <div className="grid gap-2 md:grid-cols-3 mt-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Risk Indicators Found</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Compliance Gaps Identified</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Documents Classified</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentAnalytics;
