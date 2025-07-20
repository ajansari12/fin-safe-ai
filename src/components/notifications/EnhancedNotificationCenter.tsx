import React, { useState } from 'react';
import { 
  Bell, 
  Settings, 
  Filter, 
  Search, 
  MoreHorizontal,
  Check,
  X,
  Archive,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { type EnhancedNotification, type NotificationAction } from '@/services/notifications/enhanced-notification-service';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedNotificationCenterProps {
  showAsDropdown?: boolean;
  maxHeight?: string;
}

export const EnhancedNotificationCenter: React.FC<EnhancedNotificationCenterProps> = ({ 
  showAsDropdown = false,
  maxHeight = "500px"
}) => {
  const {
    notifications,
    stats,
    isLoading,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    executeNotificationAction,
    updatePreferences,
    getNotificationsByCategory,
    getNotificationsByUrgency
  } = useEnhancedNotifications({ realTimeUpdates: true });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [showRead, setShowRead] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || notification.notification_type === categoryFilter;
    const matchesUrgency = urgencyFilter === 'all' || notification.urgency === urgencyFilter;
    const matchesReadStatus = showRead || !notification.read_at;

    return matchesSearch && matchesCategory && matchesUrgency && matchesReadStatus;
  });

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const NotificationItem = ({ notification }: { notification: EnhancedNotification }) => {
    const isUnread = !notification.read_at;
    
    return (
      <Card className={`transition-all duration-200 ${isUnread ? 'border-primary/50 bg-primary/5' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {getUrgencyIcon(notification.urgency)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-sm font-medium truncate ${isUnread ? 'font-semibold' : ''}`}>
                    {notification.title}
                  </h4>
                  {isUnread && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getUrgencyColor(notification.urgency)} className="text-xs">
                    {notification.urgency}
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs">
                    {notification.notification_type}
                  </Badge>
                  
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                  
                  {notification.metadata?.correlation_count && notification.metadata.correlation_count > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      +{notification.metadata.correlation_count - 1} similar
                    </Badge>
                  )}
                </div>

                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    {notification.actions.slice(0, 2).map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={action.style === 'destructive' ? 'destructive' : 
                                action.style === 'secondary' ? 'secondary' : 'default'}
                        onClick={() => executeNotificationAction(notification.id, action)}
                        className="h-7 text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                    
                    {notification.actions.length > 2 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {notification.actions.slice(2).map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => executeNotificationAction(notification.id, action)}
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isUnread && (
                  <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => deleteNotification(notification.id)}
                  className="text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SettingsPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Channel Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={preferences?.channel_preferences?.email !== false}
                onCheckedChange={(checked) => updatePreferences({
                  channel_preferences: { ...preferences?.channel_preferences, email: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="in-app-notifications">In-App Notifications</Label>
              <Switch
                id="in-app-notifications"
                checked={preferences?.channel_preferences?.in_app !== false}
                onCheckedChange={(checked) => updatePreferences({
                  channel_preferences: { ...preferences?.channel_preferences, in_app: checked }
                })}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-3">Quiet Hours</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
              <Switch
                id="quiet-hours"
                checked={preferences?.quiet_hours_enabled || false}
                onCheckedChange={(checked) => updatePreferences({
                  quiet_hours_enabled: checked
                })}
              />
            </div>
            
            {preferences?.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Start Time</Label>
                  <Input
                    type="time"
                    value={preferences.quiet_hours_start || '22:00'}
                    onChange={(e) => updatePreferences({
                      quiet_hours_start: e.target.value
                    })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">End Time</Label>
                  <Input
                    type="time"
                    value={preferences.quiet_hours_end || '08:00'}
                    onChange={(e) => updatePreferences({
                      quiet_hours_end: e.target.value
                    })}
                    className="h-8"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (showAsDropdown) {
    return (
      <div className="w-96 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span className="font-semibold">Notifications</span>
            {stats.unread > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.unread}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {stats.unread > 0 && (
              <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="p-3 border-b space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="h-8 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              size="sm"
              variant={showRead ? "default" : "outline"}
              onClick={() => setShowRead(!showRead)}
              className="h-8"
            >
              {showRead ? "All" : "Unread"}
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-3 border-b">
            <SettingsPanel />
          </div>
        )}

        {/* Notifications List */}
        <ScrollArea style={{ maxHeight: maxHeight }} className="flex-1">
          <div className="p-3 space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || categoryFilter !== 'all' || urgencyFilter !== 'all' 
                  ? 'No notifications match your filters' 
                  : 'No notifications'}
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Full page view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notification Center</h1>
          {stats.unread > 0 && (
            <Badge variant="destructive">
              {stats.unread} unread
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          {stats.unread > 0 && (
            <Button onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Notifications</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">{stats.unread}</div>
            <p className="text-xs text-muted-foreground">Unread</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-500">
              {stats.byUrgency?.critical || 0}
            </div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-500">
              {stats.byUrgency?.high || 0}
            </div>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.keys(stats.byCategory).map(category => (
                    <SelectItem key={category} value={category}>
                      {category} ({stats.byCategory[category]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant={showRead ? "default" : "outline"}
                onClick={() => setShowRead(!showRead)}
              >
                {showRead ? "Showing All" : "Unread Only"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && <SettingsPanel />}

      {/* Notifications List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading notifications...</div>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              {searchTerm || categoryFilter !== 'all' || urgencyFilter !== 'all' 
                ? 'No notifications match your filters' 
                : 'No notifications found'}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
};