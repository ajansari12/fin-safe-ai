import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  Archive,
  Settings,
  AlertTriangle,
  Shield,
  Activity,
  ExternalLink,
  X,
} from 'lucide-react';
import { useNotificationCenter, type Notification } from '@/hooks/useNotificationCenter';
import { formatDistanceToNow } from 'date-fns';

interface AllNotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AllNotificationsDialog: React.FC<AllNotificationsDialogProps> = ({ open, onOpenChange }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification
  } = useNotificationCenter();

  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, typeFilter, severityFilter, statusFilter]);

  const filterNotifications = () => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(notification => notification.severity === severityFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'read') {
        filtered = filtered.filter(notification => notification.read);
      } else if (statusFilter === 'unread') {
        filtered = filtered.filter(notification => !notification.read);
      }
    }

    setFilteredNotifications(filtered);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'breach':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'incident':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'control':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'kri':
        return <Activity className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const handleSelectNotification = (notificationId: string, checked: boolean) => {
    const newSelected = new Set(selectedNotifications);
    if (checked) {
      newSelected.add(notificationId);
    } else {
      newSelected.delete(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        markAsRead(id);
      }
    });
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => removeNotification(id));
    setSelectedNotifications(new Set());
  };

  const uniqueTypes = [...new Set(notifications.map(n => n.type))];
  const uniqueSeverities = [...new Set(notifications.map(n => n.severity))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            All Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount} unread
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Manage all your notifications and alerts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {uniqueSeverities.map(severity => (
                  <SelectItem key={severity} value={severity}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {filteredNotifications.length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
              <Checkbox
                checked={selectedNotifications.size === filteredNotifications.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedNotifications.size > 0 
                  ? `${selectedNotifications.size} selected` 
                  : 'Select all'
                }
              </span>
              
              {selectedNotifications.size > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={handleBulkMarkAsRead}>
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark as Read
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2 ml-auto">
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark All Read
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Notifications List */}
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 mx-auto mb-2 animate-pulse text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {notifications.length === 0 ? 'No notifications' : 'No notifications match your filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 cursor-pointer relative ${
                      !notification.read ? 'bg-blue-50/50 border-blue-200' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedNotifications.has(notification.id)}
                        onCheckedChange={(checked) => handleSelectNotification(notification.id, !!checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5"
                      />
                      
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium truncate">
                            {notification.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSeverityColor(notification.severity)}`}
                          >
                            {notification.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {notification.actionUrl && (
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            )}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
            <span>
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
            <span>
              {unreadCount} unread
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllNotificationsDialog;