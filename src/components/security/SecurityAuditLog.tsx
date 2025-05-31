
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertTriangle, Eye, Download, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { securityLoggingService, SecurityLog } from "@/services/security/security-logging-service";

const SecurityAuditLog: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, actionTypeFilter, statusFilter]);

  const loadSecurityLogs = async () => {
    try {
      const data = await securityLoggingService.getSecurityLogs(200);
      setLogs(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load security logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionTypeFilter !== "all") {
      filtered = filtered.filter(log => log.action_type === actionTypeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    setFilteredLogs(filtered);
  };

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'User', 'Action', 'Resource', 'Status', 'Risk Score'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toISOString(),
        log.user_email || log.user_name || 'System',
        log.action_type,
        log.resource_type,
        log.status,
        log.risk_score
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Security logs have been exported to CSV"
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      warning: "secondary",
      failure: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const getRiskBadge = (score: number) => {
    if (score >= 8) return <Badge variant="destructive">High</Badge>;
    if (score >= 5) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  const uniqueActionTypes = [...new Set(logs.map(log => log.action_type))];

  if (loading) {
    return <div className="animate-pulse">Loading security logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Audit Log
            </CardTitle>
            <CardDescription>
              Monitor and audit all security-related activities in your organization
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
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActionTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">
                      {log.user_name || 'System'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.user_email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm">
                    {log.action_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  {log.resource_name && (
                    <div className="text-xs text-muted-foreground">
                      {log.resource_name}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {log.resource_type.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getStatusBadge(log.status)}
                </TableCell>
                <TableCell>
                  {getRiskBadge(log.risk_score)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.ip_address || 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No security logs found matching the current filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLog;
