
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Eye, 
  Send, 
  Archive,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { regulatoryReportingService } from "@/services/regulatory-reporting-service";
import { format } from "date-fns";

const ReportInstancesManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: reportInstances = [], isLoading } = useQuery({
    queryKey: ['regulatory-report-instances'],
    queryFn: () => regulatoryReportingService.getReportInstances(),
  });

  const filteredInstances = reportInstances.filter(instance => {
    const matchesSearch = instance.instance_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || instance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'generated': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'draft': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      case 'archived': return <Archive className="h-4 w-4 text-gray-400" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'generated': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Instances</h2>
          <p className="text-muted-foreground">
            Manage generated reports and their submission status
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="generated">Generated</option>
          <option value="approved">Approved</option>
          <option value="submitted">Submitted</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Report List */}
      <div className="space-y-4">
        {filteredInstances.map((instance) => (
          <Card key={instance.id} className="transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(instance.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{instance.instance_name}</h3>
                      <Badge className={getStatusColor(instance.status)}>
                        {instance.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {instance.compliance_flags && instance.compliance_flags.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {instance.compliance_flags.length} Issues
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Generated: {format(new Date(instance.generation_date), 'MMM dd, yyyy')}
                      </div>
                      {instance.generated_by_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {instance.generated_by_name}
                        </div>
                      )}
                      {instance.report_period_start && instance.report_period_end && (
                        <div>
                          Period: {format(new Date(instance.report_period_start), 'MMM dd')} - {format(new Date(instance.report_period_end), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>

                    {instance.email_recipients && instance.email_recipients.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Send className="h-3 w-3" />
                        Recipients: {instance.email_recipients.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {instance.file_size && (
                    <span className="text-xs text-muted-foreground">
                      {(instance.file_size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                  
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    {instance.status === 'generated' && (
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-1" />
                        Submit
                      </Button>
                    )}
                    {instance.status === 'submitted' && (
                      <Button size="sm" variant="outline">
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Compliance Flags */}
              {instance.compliance_flags && instance.compliance_flags.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">
                      Compliance Issues Detected
                    </span>
                  </div>
                  <div className="text-xs text-red-700">
                    {instance.compliance_flags.length} data quality or compliance issues need to be resolved before submission.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInstances.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Reports Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "No reports match your current filters."
                : "No reports have been generated yet. Create a report from a template to get started."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportInstancesManager;
