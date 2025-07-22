
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Download,
  Search,
  Calendar,
  TrendingUp
} from "lucide-react";

const ExecutionHistoryViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  // Mock execution history data
  const executionHistory = [
    {
      execution_id: 'exec-001',
      rule_name: 'OSFI E-21 Monthly Report',
      started_at: '2024-01-15T09:00:00Z',
      completed_at: '2024-01-15T09:15:23Z',
      status: 'completed',
      report_instance_id: 'rpt-001',
      performance_metrics: {
        total_execution_time: 923000,
        data_quality_average: 96,
        records_processed: 1250,
        validation_issues: 2
      }
    },
    {
      execution_id: 'exec-002',
      rule_name: 'Basel III Quarterly Summary',
      started_at: '2024-01-14T14:30:00Z',
      completed_at: '2024-01-14T14:45:12Z',
      status: 'completed',
      report_instance_id: 'rpt-002',
      performance_metrics: {
        total_execution_time: 912000,
        data_quality_average: 94,
        records_processed: 980,
        validation_issues: 1
      }
    },
    {
      execution_id: 'exec-003',
      rule_name: 'Operational Risk Dashboard',
      started_at: '2024-01-13T11:00:00Z',
      completed_at: null,
      status: 'failed',
      error_details: 'Data source timeout - vendor API unavailable',
      performance_metrics: {
        total_execution_time: 45000,
        data_quality_average: 0,
        records_processed: 0,
        validation_issues: 0
      }
    },
    {
      execution_id: 'exec-004',
      rule_name: 'KRI Breach Analysis',
      started_at: '2024-01-12T16:15:00Z',
      completed_at: '2024-01-12T16:18:45Z',
      status: 'completed',
      report_instance_id: 'rpt-004',
      performance_metrics: {
        total_execution_time: 225000,
        data_quality_average: 92,
        records_processed: 345,
        validation_issues: 3
      }
    },
    {
      execution_id: 'exec-005',
      rule_name: 'Vendor Risk Assessment',
      started_at: '2024-01-11T10:30:00Z',
      completed_at: '2024-01-11T10:35:20Z',
      status: 'completed',
      report_instance_id: 'rpt-005',
      performance_metrics: {
        total_execution_time: 320000,
        data_quality_average: 89,
        records_processed: 156,
        validation_issues: 5
      }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const filteredHistory = executionHistory.filter(execution => {
    const matchesSearch = execution.rule_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary metrics
  const totalExecutions = executionHistory.length;
  const successfulExecutions = executionHistory.filter(e => e.status === 'completed').length;
  const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;
  const averageExecutionTime = executionHistory
    .filter(e => e.status === 'completed')
    .reduce((sum, e) => sum + (e.performance_metrics?.total_execution_time || 0), 0) / successfulExecutions;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Execution History</h2>
        <p className="text-muted-foreground">
          Track and analyze automated report generation performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">{totalExecutions}</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Execution Time</p>
                <p className="text-2xl font-bold">{formatDuration(averageExecutionTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Executions</p>
                <p className="text-2xl font-bold text-red-600">{totalExecutions - successfulExecutions}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by rule name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Execution History List */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Details</CardTitle>
          <CardDescription>Detailed execution history and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHistory.map((execution) => (
              <div key={execution.execution_id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <h4 className="font-medium">{execution.rule_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date(execution.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(execution.status)}>
                      {execution.status.toUpperCase()}
                    </Badge>
                    {execution.report_instance_id && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    )}
                  </div>
                </div>

                {execution.status === 'failed' && execution.error_details && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    <strong>Error:</strong> {execution.error_details}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p className="text-muted-foreground">
                      {execution.performance_metrics?.total_execution_time 
                        ? formatDuration(execution.performance_metrics.total_execution_time)
                        : 'N/A'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Records Processed:</span>
                    <p className="text-muted-foreground">
                      {execution.performance_metrics?.records_processed?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Data Quality:</span>
                    <p className="text-muted-foreground">
                      {execution.performance_metrics?.data_quality_average 
                        ? `${execution.performance_metrics.data_quality_average}%`
                        : 'N/A'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Validation Issues:</span>
                    <p className="text-muted-foreground">
                      {execution.performance_metrics?.validation_issues || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutionHistoryViewer;
