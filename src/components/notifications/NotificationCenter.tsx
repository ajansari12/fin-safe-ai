import React, { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Bell, 
  AlertTriangle, 
  Shield, 
  Activity, 
  X,
  CheckCheck,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useNotificationCenter, type Notification } from '@/hooks/useNotificationCenter';
import { formatDistanceToNow } from 'date-fns';
import AllNotificationsDialog from '@/components/dialogs/AllNotificationsDialog';

const NotificationCenter = memo(() => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification
  } = useNotificationCenter();
  
  const [showAllNotifications, setShowAllNotifications] = useState(false);

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors hover:bg-muted/50 cursor-pointer relative ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
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
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full text-xs" 
                size="sm"
                onClick={() => setShowAllNotifications(true)}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>

      {/* All Notifications Dialog */}
      <AllNotificationsDialog 
        open={showAllNotifications} 
        onOpenChange={setShowAllNotifications} 
      />
    </Popover>
  );
});

NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;