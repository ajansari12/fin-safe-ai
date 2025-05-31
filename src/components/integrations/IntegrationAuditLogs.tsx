
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Search, Download, RefreshCw } from "lucide-react";
import { integrationService, IntegrationLog } from "@/services/integration-service";

const IntegrationAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await integrationService.getIntegrationLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error loading integration logs:', error);
      toast({ title: "Error", description: "Failed to load audit logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.error_message && log.error_message.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesEventType = eventTypeFilter === "all" || log.event_type === eventTypeFilter;
    
    return matchesSearch && matchesStatus && matchesEventType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    const icons: Record<string, string> = {
      'api_call': '🔌',
      'webhook_send': '📤',
      'webhook_receive': '📥',
      'test_connection': '🧪',
      'sync_data': '🔄',
      'auth_refresh': '🔑',
      'error': '❌',
      'config_change': '⚙️'
    };
    return icons[eventType] || '📝';
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Event Type', 'Status', 'Response Time (ms)', 'Error Message'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toISOString(),
        log.event_type,
        log.status,
        log.response_time_ms || '',
        log.error_message || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Audit logs have been exported to CSV",
    });
  };

  const uniqueEventTypes = [...new Set(logs.map(log => log.event_type))];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integration Audit Logs</CardTitle>
          <CardDescription>Loading audit logs...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading audit logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Integration Audit Logs
        </CardTitle>
        <CardDescription>
          Track all integration activities, API calls, and webhook events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueEventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No audit logs found.</p>
            {searchTerm || statusFilter !== "all" || eventTypeFilter !== "all" ? (
              <p className="text-sm mt-2">Try adjusting your filters.</p>
            ) : (
              <p className="text-sm mt-2">Integration activities will appear here.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getEventTypeIcon(log.event_type)}</span>
                      <span className="capitalize">
                        {log.event_type.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(log.status)}
                  </TableCell>
                  <TableCell>
                    {log.response_time_ms ? (
                      <span className="text-sm">
                        {log.response_time_ms}ms
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {log.error_message ? (
                        <span className="text-red-600 text-sm">{log.error_message}</span>
                      ) : log.event_data ? (
                        <span className="text-sm text-muted-foreground">
                          {typeof log.event_data === 'string' 
                            ? log.event_data 
                            : JSON.stringify(log.event_data).substring(0, 50) + '...'
                          }
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationAuditLogs;
