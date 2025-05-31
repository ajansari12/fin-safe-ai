
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enhancedAdminService, AdminLog } from "@/services/enhanced-admin-service";

const AdminAuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    actionType: '',
    resourceType: '',
    adminUser: '',
    dateRange: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAdminLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadAdminLogs = async () => {
    try {
      setLoading(true);
      const data = await enhancedAdminService.getAdminLogs(500);
      setLogs(data);
    } catch (error) {
      console.error('Error loading admin logs:', error);
      toast({ title: "Error", description: "Failed to load admin logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.actionType) {
      filtered = filtered.filter(log => log.action_type === filters.actionType);
    }

    if (filters.resourceType) {
      filtered = filtered.filter(log => log.resource_type === filters.resourceType);
    }

    if (filters.adminUser) {
      filtered = filtered.filter(log => 
        log.admin_user_name.toLowerCase().includes(filters.adminUser.toLowerCase())
      );
    }

    if (filters.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(log => new Date(log.created_at) >= cutoffDate);
    }

    setFilteredLogs(filtered);
  };

  const getActionTypeColor = (actionType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (actionType) {
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Admin User', 'Action', 'Resource Type', 'Resource Name', 'Details'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toISOString(),
        log.admin_user_name,
        log.action_type,
        log.resource_type,
        log.resource_name || '',
        JSON.stringify(log.action_details || {})
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uniqueActionTypes = [...new Set(logs.map(log => log.action_type))];
  const uniqueResourceTypes = [...new Set(logs.map(log => log.resource_type))];

  if (loading) {
    return <div className="animate-pulse">Loading audit logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Admin Audit Log</CardTitle>
            <CardDescription>
              Track all administrative actions performed in the system
            </CardDescription>
          </div>
          <Button onClick={exportLogs} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4 mb-6 p-4 border rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Action Type</label>
            <Select value={filters.actionType} onValueChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                {uniqueActionTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Resource Type</label>
            <Select value={filters.resourceType} onValueChange={(value) => setFilters(prev => ({ ...prev, resourceType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All resources</SelectItem>
                {uniqueResourceTypes.map(type => (
                  <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admin User</label>
            <Input
              placeholder="Search by admin name"
              value={filters.adminUser}
              onChange={(e) => setFilters(prev => ({ ...prev, adminUser: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All time</SelectItem>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {logs.length} log entries
        </div>

        {/* Logs Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.admin_user_name}</TableCell>
                  <TableCell>
                    <Badge variant={getActionTypeColor(log.action_type)}>
                      {log.action_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.resource_type.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.resource_name || '-'}</TableCell>
                  <TableCell>
                    <Dialog open={isDetailDialogOpen && selectedLog?.id === log.id} onOpenChange={setIsDetailDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                          <DialogDescription>
                            Detailed information about this administrative action
                          </DialogDescription>
                        </DialogHeader>
                        {selectedLog && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Timestamp</label>
                                <p className="text-sm">{new Date(selectedLog.created_at).toLocaleString()}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Admin User</label>
                                <p className="text-sm">{selectedLog.admin_user_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Action Type</label>
                                <p className="text-sm">{selectedLog.action_type}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Resource Type</label>
                                <p className="text-sm">{selectedLog.resource_type}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Resource Name</label>
                                <p className="text-sm">{selectedLog.resource_name || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">User Agent</label>
                                <p className="text-sm text-xs">{selectedLog.user_agent || 'N/A'}</p>
                              </div>
                            </div>
                            {selectedLog.action_details && (
                              <div>
                                <label className="text-sm font-medium">Action Details</label>
                                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-40">
                                  {JSON.stringify(selectedLog.action_details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No audit logs found matching the current filters
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAuditLog;
