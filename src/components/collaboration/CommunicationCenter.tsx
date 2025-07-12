
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  AlertTriangle, 
  Clock, 
  Send,
  Filter,
  Search,
  CheckCircle,
  Circle
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { collaborationService, type Notification } from '@/services/collaboration-service';
import { toast } from 'sonner';

const CommunicationCenter: React.FC = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // New notification form
  const [newNotification, setNewNotification] = useState({
    recipient: '',
    type: 'system' as Notification['notification_type'],
    title: '',
    message: '',
    urgency: 'medium' as Notification['urgency']
  });

  useEffect(() => {
    loadNotifications();
    setupRealtimeSubscriptions();
  }, [profile?.id]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, filterType, filterUrgency]);

  const loadNotifications = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('org_id', profile.organization_id)
        .eq('recipient_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`notifications:${profile.id}`)
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        setNotifications(prev => [payload.payload, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.notification_type === filterType);
    }

    if (filterUrgency !== 'all') {
      filtered = filtered.filter(n => n.urgency === filterUrgency);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const sendNotification = async () => {
    if (!newNotification.recipient || !newNotification.title || !newNotification.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await collaborationService.sendNotification(
        newNotification.recipient,
        newNotification.type,
        newNotification.title,
        newNotification.message,
        newNotification.urgency
      );

      setNewNotification({
        recipient: '',
        type: 'system',
        title: '',
        message: '',
        urgency: 'medium'
      });

      toast.success('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const getUrgencyColor = (urgency: Notification['urgency']) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeIcon = (type: Notification['notification_type']) => {
    switch (type) {
      case 'workflow': return Clock;
      case 'mention': return MessageSquare;
      case 'escalation': return AlertTriangle;
      case 'deadline': return Clock;
      default: return Bell;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Communication Center</h2>
          <p className="text-muted-foreground">
            Manage notifications, workflows, and team communications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {notifications.filter(n => !n.read_at).length} Unread
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="workflows">Workflow Events</TabsTrigger>
          <TabsTrigger value="compose">Send Message</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="workflow">Workflow</SelectItem>
                    <SelectItem value="mention">Mentions</SelectItem>
                    <SelectItem value="escalation">Escalations</SelectItem>
                    <SelectItem value="deadline">Deadlines</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgency</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No notifications found</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const TypeIcon = getTypeIcon(notification.notification_type);
                const isUnread = !notification.read_at;
                
                return (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-colors ${
                      isUnread ? 'border-l-4 border-l-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => isUnread && markAsRead(notification.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-full ${isUnread ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <TypeIcon className={`h-4 w-4 ${isUnread ? 'text-blue-600' : 'text-gray-600'}`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notification.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getUrgencyColor(notification.urgency)}`}
                            >
                              {notification.urgency}
                            </Badge>
                            {isUnread && (
                              <Circle className="h-2 w-2 fill-blue-600 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {new Date(notification.created_at).toLocaleDateString()} at{' '}
                              {new Date(notification.created_at).toLocaleTimeString()}
                            </span>
                            <span>via {notification.channels.join(', ')}</span>
                            <Badge variant="secondary" className="text-xs">
                              {notification.notification_type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isUnread ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Read
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Event Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Workflow event monitoring will be displayed here</p>
                <p className="text-sm">Automated notifications based on workflow triggers and deadlines</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Recipient</label>
                  <Input
                    placeholder="User ID or email"
                    value={newNotification.recipient}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, recipient: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <Select 
                    value={newNotification.type} 
                    onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value as Notification['notification_type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="workflow">Workflow</SelectItem>
                      <SelectItem value="mention">Mention</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input
                    placeholder="Notification title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Urgency</label>
                  <Select 
                    value={newNotification.urgency} 
                    onValueChange={(value) => setNewNotification(prev => ({ ...prev, urgency: value as Notification['urgency'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Message</label>
                <Textarea
                  placeholder="Enter your message..."
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
              </div>

              <Button onClick={sendNotification} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationCenter;
