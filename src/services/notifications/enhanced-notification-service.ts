import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserProfile } from '@/lib/supabase-utils';

export interface EnhancedNotification {
  id: string;
  org_id: string;
  recipient_id: string;
  title: string;
  message: string;
  notification_type: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  delivery_channel?: string;
  delivery_status?: 'pending' | 'sent' | 'failed' | 'delivered';
  actions?: NotificationAction[];
  created_at: string;
  read_at?: string;
  delivered_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  label: string;
  action_type: 'acknowledge' | 'resolve' | 'dismiss' | 'escalate' | 'redirect' | 'custom';
  action_data?: Record<string, any>;
}

export interface UserNotificationPreferences {
  id: string;
  user_id: string;
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  preferred_channel: 'email' | 'push' | 'sms';
  notification_volume: 'low' | 'medium' | 'high';
  notification_schedule: string;
  category_preferences: Record<string, boolean>;
  keyword_filters: string[];
  snooze_until?: string;
}

export interface NotificationTemplate {
  id: string;
  org_id: string;
  template_name: string;
  template_type: string;
  channel_type: string;
  subject_template?: string;
  body_template: string;
  variables: string[];
  is_system_template: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class EnhancedNotificationService {
  async createNotification(notificationData: Omit<EnhancedNotification, 'id' | 'created_at' | 'org_id'>): Promise<EnhancedNotification> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notificationData,
        org_id: profile.organization_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getNotificationsForUser(userId: string, options?: { category?: string; limit?: number }): Promise<EnhancedNotification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (options?.category) {
      query = query.eq('notification_type', options.category);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('recipient_id', userId);

    if (error) throw error;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', userId)
      .is('read_at', null);

    if (error) throw error;
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('recipient_id', userId);

    if (error) throw error;
  }

  async getUserPreferences(userId: string): Promise<UserNotificationPreferences | null> {
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('Error fetching user preferences:', error);
      return null;
    }

    return data;
  }

  async updateUserPreferences(
    userId: string,
    updates: Partial<UserNotificationPreferences>
  ): Promise<UserNotificationPreferences> {
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getNotificationAnalytics(orgId: string, timeRange: string): Promise<any> {
    const cutoffDate = this.getTimeRangeCutoff(timeRange);
    
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('org_id', orgId)
      .gte('created_at', cutoffDate.toISOString());

    if (!notifications) return this.getEmptyAnalytics();

    const totalSent = notifications.length;
    const delivered = notifications.filter(n => n.delivery_status === 'delivered').length;
    const failed = notifications.filter(n => n.delivery_status === 'failed').length;
    const pending = notifications.filter(n => n.delivery_status === 'pending').length;
    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;

    const channelBreakdown = notifications.reduce((acc, n) => {
      const channel = n.delivery_channel || 'unknown';
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityBreakdown = notifications.reduce((acc, n) => {
      acc[n.urgency] = (acc[n.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSent,
      delivered,
      failed,
      pending,
      deliveryRate,
      avgResponseTime: 1250, // placeholder
      escalationCount: 0, // placeholder
      channelBreakdown,
      severityBreakdown,
      hourlyTrends: this.generateHourlyTrends(notifications),
      dailyTrends: this.generateDailyTrends(notifications)
    };
  }

  async getEscalationAnalytics(orgId: string, timeRange: string): Promise<any> {
    const cutoffDate = this.getTimeRangeCutoff(timeRange);
    
    const { data: escalations } = await supabase
      .from('escalation_executions')
      .select('*')
      .eq('org_id', orgId)
      .gte('escalated_at', cutoffDate.toISOString());

    if (!escalations) return this.getEmptyEscalationAnalytics();

    const totalEscalations = escalations.length;
    const resolvedEscalations = escalations.filter(e => e.status === 'resolved').length;
    const avgEscalationTime = this.calculateAverageEscalationTime(escalations);

    return {
      totalEscalations,
      resolvedEscalations,
      avgEscalationTime,
      escalationsByLevel: this.groupEscalationsByLevel(escalations),
      escalationTrends: this.generateEscalationTrends(escalations)
    };
  }

  async getNotificationTemplates(orgId: string): Promise<NotificationTemplate[]> {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .or(`org_id.eq.${orgId},is_system_template.eq.true`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createNotificationTemplate(templateData: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationTemplate> {
    const { data, error } = await supabase
      .from('notification_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateNotificationTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<void> {
    const { error } = await supabase
      .from('notification_templates')
      .update(updates)
      .eq('id', templateId);

    if (error) throw error;
  }

  async deleteNotificationTemplate(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('notification_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  }

  async getNotificationHistory(userId: string, filters: any): Promise<{ notifications: EnhancedNotification[]; total: number }> {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('delivery_status', filters.status);
    }

    if (filters.channel) {
      query = query.eq('delivery_channel', filters.channel);
    }

    if (filters.severity) {
      query = query.eq('urgency', filters.severity);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
    }

    if (filters.dateRange) {
      const cutoffDate = this.getDateRangeCutoff(filters.dateRange);
      query = query.gte('created_at', cutoffDate.toISOString());
    }

    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      notifications: data || [],
      total: count || 0
    };
  }

  async exportNotificationHistory(userId: string, filters: any): Promise<any[]> {
    const { notifications } = await this.getNotificationHistory(userId, { ...filters, limit: 10000 });
    
    return notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      urgency: n.urgency,
      delivery_channel: n.delivery_channel,
      delivery_status: n.delivery_status,
      created_at: n.created_at,
      delivered_at: n.delivered_at,
      error_message: n.error_message
    }));
  }

  private getTimeRangeCutoff(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private getDateRangeCutoff(dateRange: string): Date {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      default:
        return new Date(0);
    }
  }

  private getEmptyAnalytics() {
    return {
      totalSent: 0,
      delivered: 0,
      failed: 0,
      pending: 0,
      deliveryRate: 0,
      avgResponseTime: 0,
      escalationCount: 0,
      channelBreakdown: {},
      severityBreakdown: {},
      hourlyTrends: [],
      dailyTrends: []
    };
  }

  private getEmptyEscalationAnalytics() {
    return {
      totalEscalations: 0,
      resolvedEscalations: 0,
      avgEscalationTime: 0,
      escalationsByLevel: {},
      escalationTrends: []
    };
  }

  private generateHourlyTrends(notifications: any[]): Array<{ hour: string; count: number }> {
    const trends = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: 0
    }));

    notifications.forEach(n => {
      const hour = new Date(n.created_at).getHours();
      trends[hour].count++;
    });

    return trends;
  }

  private generateDailyTrends(notifications: any[]): Array<{ date: string; sent: number; delivered: number; failed: number }> {
    const trends: Record<string, { sent: number; delivered: number; failed: number }> = {};

    notifications.forEach(n => {
      const date = new Date(n.created_at).toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { sent: 0, delivered: 0, failed: 0 };
      }
      trends[date].sent++;
      if (n.delivery_status === 'delivered') trends[date].delivered++;
      if (n.delivery_status === 'failed') trends[date].failed++;
    });

    return Object.entries(trends).map(([date, data]) => ({
      date,
      ...data
    }));
  }

  private calculateAverageEscalationTime(escalations: any[]): number {
    const resolved = escalations.filter(e => e.resolved_at);
    if (resolved.length === 0) return 0;

    const totalTime = resolved.reduce((sum, e) => {
      const escalatedAt = new Date(e.escalated_at).getTime();
      const resolvedAt = new Date(e.resolved_at).getTime();
      return sum + (resolvedAt - escalatedAt);
    }, 0);

    return totalTime / resolved.length / (1000 * 60 * 60); // Convert to hours
  }

  private groupEscalationsByLevel(escalations: any[]): Record<string, number> {
    return escalations.reduce((acc, e) => {
      const level = e.escalation_level.toString();
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateEscalationTrends(escalations: any[]): Array<{ date: string; count: number }> {
    const trends: Record<string, number> = {};

    escalations.forEach(e => {
      const date = new Date(e.escalated_at).toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + 1;
    });

    return Object.entries(trends).map(([date, count]) => ({
      date,
      count
    }));
  }
}

export const enhancedNotificationService = new EnhancedNotificationService();
