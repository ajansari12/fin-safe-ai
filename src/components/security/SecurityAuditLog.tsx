import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Filter, RefreshCw, Download, Search } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { toast } from "sonner";

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_category: string;
  severity: string;
  event_details: any;
  source_ip: string;
  user_agent: string;
  risk_score: number;
  created_at: string;
  status: string;
}

interface FilterState {
  severity: string;
  category: string;
  eventType: string;
  dateRange: string;
  searchTerm: string;
}

const SecurityAuditLog: React.FC = () => {
  const { userContext } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    severity: 'all',
    category: 'all',
    eventType: 'all',
    dateRange: '7d',
    searchTerm: ''
  });

  useEffect(() => {
    if (!userContext?.userId) return;
    
    loadSecurityEvents();
    
    // Set up real-time monitoring
    const channel = supabase
      .channel('security-audit-log')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events'
        },
        () => {
          loadSecurityEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userContext?.userId]);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading security events:', error);
      toast.error('Failed to load security events');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Apply severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(event => event.severity === filters.severity);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(event => event.event_category === filters.category);
    }

    // Apply event type filter
    if (filters.eventType !== 'all') {
      filtered = filtered.filter(event => event.event_type === filters.eventType);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const days = parseInt(filters.dateRange.replace('d', ''));
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(event => new Date(event.created_at) >= cutoff);
    }

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.event_type.toLowerCase().includes(searchLower) ||
        event.event_category.toLowerCase().includes(searchLower) ||
        JSON.stringify(event.event_details).toLowerCase().includes(searchLower)
      );
    }

    setFilteredEvents(filtered);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportEvents = () => {
    try {
      const csvContent = [
        ['Timestamp', 'Event Type', 'Category', 'Severity', 'Risk Score', 'Details'],
        ...filteredEvents.map(event => [
          new Date(event.created_at).toLocaleString(),
          event.event_type,
          event.event_category,
          event.severity,
          event.risk_score.toString(),
          JSON.stringify(event.event_details)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Security audit log exported successfully');
    } catch (error) {
      console.error('Error exporting events:', error);
      toast.error('Failed to export security audit log');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'default';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Security Audit Log</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadSecurityEvents} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportEvents} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={filters.severity} onValueChange={(value) => updateFilter('severity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="authorization">Authorization</SelectItem>
                  <SelectItem value="data_access">Data Access</SelectItem>
                  <SelectItem value="configuration">Configuration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Security Events ({filteredEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No security events found matching your criteria</p>
              ) : (
                filteredEvents.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{formatEventType(event.event_type)}</span>
                          <Badge variant={getSeverityColor(event.severity) as any}>
                            {event.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {event.event_category}
                          </Badge>
                          <Badge variant="outline">
                            Risk: {event.risk_score}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {new Date(event.created_at).toLocaleString()}
                        </div>
                        <div className="text-sm">
                          <strong>Details:</strong> {JSON.stringify(event.event_details, null, 2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAuditLog;