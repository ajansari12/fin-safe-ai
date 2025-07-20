import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { 
  enhancedNotificationService, 
  type EnhancedNotification, 
  type NotificationAction,
  type UserNotificationPreferences 
} from '@/services/notifications/enhanced-notification-service';

export interface UseEnhancedNotificationsOptions {
  maxNotifications?: number;
  autoMarkAsRead?: boolean;
  enableToasts?: boolean;
  category?: string;
  realTimeUpdates?: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byUrgency: Record<string, number>;
  byCategory: Record<string, number>;
}

export const useEnhancedNotifications = (options: UseEnhancedNotificationsOptions = {}) => {
  const { profile } = useAuth();
  const {
    maxNotifications = 100,
    autoMarkAsRead = false,
    enableToasts = true,
    category,
    realTimeUpdates = true
  } = options;

  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byUrgency: {},
    byCategory: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);

  // =======================
  // CORE NOTIFICATION LOADING
  // =======================

  const loadNotifications = useCallback(async () => {
    if (!profile?.id) return;

    setIsLoading(true);
    try {
      const data = await enhancedNotificationService.getNotificationsForUser(
        profile.id,
        {
          category,
          limit: maxNotifications
        }
      );

      setNotifications(data);
      updateStats(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, category, maxNotifications]);

  const loadUserPreferences = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const userPrefs = await enhancedNotificationService.getUserPreferences(profile.id);
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }, [profile?.id]);

  // =======================
  // NOTIFICATION ACTIONS
  // =======================

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!profile?.id) return;

    try {
      await enhancedNotificationService.markAsRead(notificationId, profile.id);
      
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        );
        updateStats(updated);
        return updated;
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, [profile?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!profile?.id) return;

    try {
      await enhancedNotificationService.markAllAsRead(profile.id);
      
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, read_at: new Date().toISOString() }));
        updateStats(updated);
        return updated;
      });
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }, [profile?.id]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!profile?.id) return;

    try {
      await enhancedNotificationService.deleteNotification(notificationId, profile.id);
      
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== notificationId);
        updateStats(updated);
        return updated;
      });
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [profile?.id]);

  const executeNotificationAction = useCallback(async (
    notificationId: string, 
    action: NotificationAction
  ) => {
    if (!profile?.id) return;

    try {
      switch (action.action_type) {
        case 'acknowledge':
          await markAsRead(notificationId);
          break;
        case 'dismiss':
          await deleteNotification(notificationId);
          break;
        case 'escalate':
          // TODO: Implement escalation logic
          toast.info('Escalation requested');
          break;
        case 'redirect':
          if (action.action_data?.url) {
            window.location.href = action.action_data.url;
          }
          break;
        default:
          console.log('Custom action:', action);
      }
    } catch (error) {
      console.error('Failed to execute notification action:', error);
      toast.error('Failed to execute action');
    }
  }, [profile?.id, markAsRead, deleteNotification]);

  // =======================
  // NOTIFICATION CREATION
  // =======================

  const createNotification = useCallback(async (
    notificationData: Omit<EnhancedNotification, 'id' | 'created_at' | 'org_id' | 'recipient_id'>
  ) => {
    if (!profile?.id) return;

    try {
      const newNotification = await enhancedNotificationService.createNotification({
        ...notificationData,
        recipient_id: profile.id
      });

      // Add to local state
      setNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, maxNotifications);
        updateStats(updated);
        return updated;
      });

      // Show toast if enabled
      if (enableToasts) {
        showNotificationToast(newNotification);
      }

      return newNotification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      toast.error('Failed to create notification');
    }
  }, [profile?.id, maxNotifications, enableToasts]);

  // =======================
  // PREFERENCES MANAGEMENT
  // =======================

  const updatePreferences = useCallback(async (
    newPreferences: Partial<UserNotificationPreferences>
  ) => {
    if (!profile?.id) return;

    try {
      const updated = await enhancedNotificationService.updateUserPreferences(
        profile.id,
        newPreferences
      );
      setPreferences(updated);
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    }
  }, [profile?.id]);

  // =======================
  // REAL-TIME UPDATES
  // =======================

  useEffect(() => {
    if (!realTimeUpdates || !profile?.organization_id) return;

    const channel = supabase
      .channel('notification-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${profile.id}`
        },
        (payload) => {
          const newNotification = payload.new as EnhancedNotification;
          
          setNotifications(prev => {
            const updated = [newNotification, ...prev].slice(0, maxNotifications);
            updateStats(updated);
            return updated;
          });

          if (enableToasts) {
            showNotificationToast(newNotification);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${profile.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as EnhancedNotification;
          
          setNotifications(prev => {
            const updated = prev.map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            );
            updateStats(updated);
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realTimeUpdates, profile?.id, profile?.organization_id, maxNotifications, enableToasts]);

  // =======================
  // AUTO-REFRESH & LIFECYCLE
  // =======================

  useEffect(() => {
    loadNotifications();
    loadUserPreferences();
  }, [loadNotifications, loadUserPreferences]);

  useEffect(() => {
    if (autoMarkAsRead && notifications.length > 0) {
      const timer = setTimeout(() => {
        const unreadNotifications = notifications.filter(n => !n.read_at);
        if (unreadNotifications.length > 0) {
          markAllAsRead();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications, autoMarkAsRead, markAllAsRead]);

  // =======================
  // HELPER FUNCTIONS
  // =======================

  const updateStats = useCallback((notificationList: EnhancedNotification[]) => {
    const total = notificationList.length;
    const unread = notificationList.filter(n => !n.read_at).length;
    
    const byUrgency = notificationList.reduce((acc, n) => {
      acc[n.urgency] = (acc[n.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = notificationList.reduce((acc, n) => {
      acc[n.notification_type] = (acc[n.notification_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({ total, unread, byUrgency, byCategory });
  }, []);

  const showNotificationToast = useCallback((notification: EnhancedNotification) => {
    const toastConfig = {
      duration: notification.urgency === 'critical' ? 10000 : 5000,
      action: notification.actions?.length ? {
        label: notification.actions[0].label,
        onClick: () => executeNotificationAction(notification.id, notification.actions![0])
      } : undefined
    };

    switch (notification.urgency) {
      case 'critical':
        toast.error(notification.title, { description: notification.message, ...toastConfig });
        break;
      case 'high':
        toast.error(notification.title, { description: notification.message, ...toastConfig });
        break;
      case 'medium':
        toast.warning(notification.title, { description: notification.message, ...toastConfig });
        break;
      case 'low':
        toast.info(notification.title, { description: notification.message, ...toastConfig });
        break;
    }
  }, [executeNotificationAction]);

  const getNotificationsByCategory = useCallback((categoryFilter: string) => {
    return notifications.filter(n => n.notification_type === categoryFilter);
  }, [notifications]);

  const getNotificationsByUrgency = useCallback((urgencyFilter: string) => {
    return notifications.filter(n => n.urgency === urgencyFilter);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read_at);
  }, [notifications]);

  return {
    // Core data
    notifications,
    stats,
    isLoading,
    preferences,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    executeNotificationAction,
    createNotification,
    updatePreferences,
    refresh: loadNotifications,
    
    // Filters
    getNotificationsByCategory,
    getNotificationsByUrgency,
    getUnreadNotifications,
    
    // Computed values
    unreadCount: stats.unread,
    hasUnread: stats.unread > 0,
    totalCount: stats.total
  };
};