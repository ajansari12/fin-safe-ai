
import { useState } from "react";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  FileX
} from "lucide-react";
import { getComplianceAnalytics } from "@/services/governance-service";

export default function ComplianceAnalyticsDashboard() {
  const { profile } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['complianceAnalytics', profile?.organization_id],
    queryFn: () => profile?.organization_id ? getComplianceAnalytics(profile.organization_id) : Promise.resolve(null),
    enabled: !!profile?.organization_id
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
        <p className="text-gray-500">Start creating policies to see compliance analytics.</p>
      </div>
    );
  }

  const statusColors = {
    draft: '#94a3b8',
    under_review: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    active: '#3b82f6',
    archived: '#6b7280'
  };

  const statusData = Object.entries(analytics.policies_by_status).map(([status, count]) => ({
    name: status.replace('_', ' ').toUpperCase(),
    value: count,
    color: statusColors[status as keyof typeof statusColors]
  }));

  const workloadData = analytics.reviewer_workloads.map(reviewer => ({
    name: reviewer.reviewer_name,
    pending: reviewer.pending_reviews,
    completed: reviewer.completed_reviews,
    avgDays: reviewer.avg_turnaround_days
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Policies</p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics.overdue_percentage.toFixed(1)}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Approval Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.avg_approval_time_days.toFixed(1)} days
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.total_policies}
                </p>
              </div>
              <FileX className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Reviewers</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.reviewer_workloads.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Policy Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reviewer Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Reviewer Workload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending Reviews" />
                <Bar dataKey="completed" fill="#10b981" name="Completed Reviews" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Reviewer Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Reviewer Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.reviewer_workloads.map((reviewer) => (
              <div key={reviewer.reviewer_id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{reviewer.reviewer_name}</p>
                    <p className="text-sm text-gray-500">
                      {reviewer.completed_reviews} completed • {reviewer.pending_reviews} pending
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={reviewer.avg_turnaround_days <= 3 ? "default" : reviewer.avg_turnaround_days <= 7 ? "secondary" : "destructive"}>
                    {reviewer.avg_turnaround_days.toFixed(1)} day avg
                  </Badge>
                </div>
              </div>
            ))}
            {analytics.reviewer_workloads.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No reviewer activity yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
