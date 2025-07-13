import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';

export interface Notification {
  id: string;
  type: 'breach' | 'incident' | 'control' | 'kri' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterOptions {
  maxNotifications?: number;
  autoMarkAsRead?: boolean;
  enableToasts?: boolean;
}

export const useNotificationCenter = (options: NotificationCenterOptions = {}) => {
  const { profile } = useAuth();
  const {
    maxNotifications = 100,
    autoMarkAsRead = false,
    enableToasts = true
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing notifications
  const loadNotifications = useCallback(async () => {
    if (!profile?.organization_id) return;

    setIsLoading(true);
    try {
      // Load recent appetite breaches
      const { data: breaches } = await supabase
        .from('appetite_breach_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Load recent incidents
      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Transform to notifications
      const allNotifications: Notification[] = [];

      breaches?.forEach(breach => {
        allNotifications.push({
          id: `breach-${breach.id}`,
          type: 'breach',
          severity: breach.breach_severity || 'medium',
          title: 'Risk Appetite Breach',
          message: `Breach detected with ${breach.variance_percentage?.toFixed(1)}% variance`,
          timestamp: new Date(breach.created_at),
          read: false,
          actionUrl: `/app/risk-appetite/breaches/${breach.id}`,
          metadata: { breachId: breach.id, actualValue: breach.actual_value }
        });
      });

      incidents?.forEach(incident => {
        allNotifications.push({
          id: `incident-${incident.id}`,
          type: 'incident',
          severity: incident.severity || 'medium',
          title: 'New Incident',
          message: incident.incident_title || 'Incident reported',
          timestamp: new Date(incident.created_at),
          read: false,
          actionUrl: `/app/incidents/${incident.id}`,
          metadata: { incidentId: incident.id, category: incident.category }
        });
      });

      // Sort by timestamp and limit
      const sortedNotifications = allNotifications
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, maxNotifications);

      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.organization_id, maxNotifications]);

  // Generate predictive breach alerts
  const generatePredictiveAlerts = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      const response = await supabase.functions.invoke('enhanced-predictive-analytics', {
        body: {
          type: 'alert_prediction',
          orgId: profile.organization_id
        }
      });

      if (response.data?.alerts) {
        response.data.alerts.forEach((alert: any) => {
          addNotification({
            type: 'breach',
            severity: alert.severity || 'medium',
            title: 'Predictive Breach Alert',
            message: `${alert.message} (Predicted with ${Math.round(alert.confidence * 100)}% confidence)`,
            actionUrl: '/app/predictive-analytics'
          });
        });
      }
    } catch (error) {
      console.error('Failed to generate predictive alerts:', error);
    }
  }, [profile?.organization_id]);

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${notification.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });

    setUnreadCount(prev => prev + 1);

    // Show toast if enabled
    if (enableToasts) {
      const toastConfig = {
        duration: notification.severity === 'critical' ? 10000 : 5000
      };

      switch (notification.severity) {
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
    }

    return newNotification.id;
  }, [maxNotifications, enableToasts]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      const filtered = prev.filter(n => n.id !== notificationId);
      
      if (notification && !notification.read) {
        setUnreadCount(current => Math.max(0, current - 1));
      }
      
      return filtered;
    });
  }, []);

  // Auto-mark as read after view
  useEffect(() => {
    if (autoMarkAsRead && notifications.length > 0) {
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications.length, autoMarkAsRead, markAllAsRead]);

  // Load notifications on mount and generate predictive alerts
  useEffect(() => {
    loadNotifications();
    generatePredictiveAlerts();
  }, [loadNotifications, generatePredictiveAlerts]);

  return {
    notifications,
    unreadCount,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
    refresh: loadNotifications,
    generatePredictiveAlerts
  };
};