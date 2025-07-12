
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  Video, 
  Share2,
  Bell,
  Globe,
  Activity
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { collaborationService } from '@/services/collaboration-service';
import RealTimeCollaboration from './RealTimeCollaboration';
import CommunicationCenter from './CommunicationCenter';
import ExternalStakeholderPortal from './ExternalStakeholderPortal';
import KnowledgeBase from './KnowledgeBase';
import MeetingCenter from './MeetingCenter';
import { toast } from 'sonner';

const CollaborationDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('realtime');
  const [analytics, setAnalytics] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      loadCollaborationData();
      setupRealtimeSubscriptions();
    }
  }, [profile?.organization_id]);

  const loadCollaborationData = async () => {
    try {
      const [analyticsData] = await Promise.all([
        collaborationService.getCollaborationAnalytics('month')
      ]);

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
      toast.error('Failed to load collaboration data');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!profile?.id) return;

    // Subscribe to notifications
    const notificationChannel = supabase
      .channel(`notifications:${profile.id}`)
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        setNotifications(prev => [payload.payload, ...prev.slice(0, 9)]);
        toast(payload.payload.title, {
          description: payload.payload.message
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  };

  const collaborationFeatures = [
    {
      id: 'realtime',
      title: 'Real-Time Collaboration',
      description: 'Live editing, commenting, and presence indicators',
      icon: Users,
      badge: 'Live',
      stats: analytics?.totalSessions || 0
    },
    {
      id: 'communication',
      title: 'Communication Center',
      description: 'Notifications, workflows, and messaging',
      icon: MessageCircle,
      badge: 'Active',
      stats: analytics?.totalComments || 0
    },
    {
      id: 'external',
      title: 'External Stakeholders',
      description: 'Secure collaboration with external parties',
      icon: Globe,
      badge: 'Secure',
      stats: 0
    },
    {
      id: 'knowledge',
      title: 'Knowledge Base',
      description: 'Collaborative knowledge sharing and expertise',
      icon: BookOpen,
      badge: 'Community',
      stats: 0
    },
    {
      id: 'meetings',
      title: 'Meeting Center',
      description: 'Scheduling, hosting, and managing meetings',
      icon: Calendar,
      badge: 'Integrated',
      stats: analytics?.totalMeetings || 0
    }
  ];

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
          <h1 className="text-3xl font-bold tracking-tight">Collaboration Platform</h1>
          <p className="text-muted-foreground">
            Connect, communicate, and collaborate across all risk management activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {analytics?.activeUsers || 0} Active Users
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            Real-time
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {collaborationFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={feature.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab(feature.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {feature.description}
                </p>
                <div className="text-lg font-bold text-blue-600">
                  {feature.stats}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {notification.urgency}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Real-Time
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="external" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            External
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Meetings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeCollaboration />
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <CommunicationCenter />
        </TabsContent>

        <TabsContent value="external" className="space-y-6">
          <ExternalStakeholderPortal />
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <KnowledgeBase />
        </TabsContent>

        <TabsContent value="meetings" className="space-y-6">
          <MeetingCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationDashboard;
