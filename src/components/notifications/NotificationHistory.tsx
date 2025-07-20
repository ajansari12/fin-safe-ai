
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, Filter, Download, Eye, Calendar, Clock, 
  CheckCircle, XCircle, AlertCircle, Loader
} from 'lucide-react';
import { enhancedNotificationService, type EnhancedNotification } from '@/services/notifications/enhanced-notification-service';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface NotificationFilters {
  status?: string;
  channel?: string;
  severity?: string;
  dateRange?: string;
  search?: string;
}

export const NotificationHistory: React.FC = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<EnhancedNotification | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    loadNotificationHistory();
  }, [filters, currentPage]);

  const loadNotificationHistory = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const data = await enhancedNotificationService.getNotificationHistory(
        profile.id,
        {
          ...filters,
          page: currentPage,
          limit: itemsPerPage
        }
      );
      
      setNotifications(data.notifications || []);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
    } catch (error) {
      console.error('Failed to load notification history:', error);
      toast.error('Failed to load notification history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      delivered: 'default',
      failed: 'destructive',
      pending: 'secondary'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return <Badge variant={variants[severity] || 'secondary'}>{severity}</Badge>;
  };

  const exportHistory = async () => {
    try {
      const data = await enhancedNotificationService.exportNotificationHistory(
        profile?.id!,
        filters
      );
      
      // Create and download CSV
      const csvContent = data.map(row => Object.values(row).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notification-history-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Notification history exported successfully');
    } catch (error) {
      console.error('Failed to export history:', error);
      toast.error('Failed to export notification history');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notification History</h1>
          <p className="text-muted-foreground">View and manage your notification history</p>
        </div>
        <Button onClick={exportHistory}>
          <Download className="h-4 w-4 mr-2" />
          Export History
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search notifications..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>

            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.channel} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, channel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.severity} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(notification.delivery_status || 'pending')}
                      {getStatusBadge(notification.delivery_status || 'pending')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {notification.message}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {notification.delivery_channel || 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getSeverityBadge(notification.urgency)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{notification.recipient_email || notification.recipient_id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(notification.created_at), 'MMM d, yyyy')}
                      <Clock className="h-3 w-3 ml-2" />
                      {format(new Date(notification.created_at), 'HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedNotification(notification)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Notification Details</DialogTitle>
                        </DialogHeader>
                        {selectedNotification && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <div className="mt-1">
                                  {getStatusBadge(selectedNotification.delivery_status || 'pending')}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Severity</label>
                                <div className="mt-1">
                                  {getSeverityBadge(selectedNotification.urgency)}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Title</label>
                              <p className="mt-1">{selectedNotification.title}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Message</label>
                              <p className="mt-1 whitespace-pre-wrap">{selectedNotification.message}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Channel</label>
                                <p className="mt-1">{selectedNotification.delivery_channel || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Recipient</label>
                                <p className="mt-1">{selectedNotification.recipient_email || selectedNotification.recipient_id}</p>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Sent At</label>
                              <p className="mt-1">
                                {format(new Date(selectedNotification.created_at), 'PPpp')}
                              </p>
                            </div>
                            
                            {selectedNotification.error_message && (
                              <div>
                                <label className="text-sm font-medium text-red-600">Error Message</label>
                                <p className="mt-1 text-red-600">{selectedNotification.error_message}</p>
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
          
          {notifications.length === 0 && !loading && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                No notifications match your current filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
