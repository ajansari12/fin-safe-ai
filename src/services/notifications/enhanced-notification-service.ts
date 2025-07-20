import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface EnhancedNotification {
  id: string;
  org_id: string;
  recipient_id: string;
  sender_id?: string;
  notification_type: string;
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  metadata: Record<string, any>;
  read_at?: string;
  created_at: string;
  category?: string;
  actions?: NotificationAction[];
  correlation_id?: string;
  escalation_level?: number;
}

export interface NotificationAction {
  id: string;
  label: string;
  action_type: 'acknowledge' | 'dismiss' | 'escalate' | 'redirect' | 'custom';
  action_data?: Record<string, any>;
  style?: 'primary' | 'secondary' | 'destructive';
}

export interface NotificationTemplate {
  id: string;
  org_id: string;
  template_name: string;
  template_type: string;
  channel_type: 'email' | 'in_app';
  subject_template?: string;
  body_template: string;
  variables: Record<string, string>;
  formatting_options: Record<string, any>;
  is_system_template: boolean;
  is_active: boolean;
}

export interface UserNotificationPreferences {
  id: string;
  user_id: string;
  org_id: string;
  channel_preferences: Record<string, boolean>;
  alert_type_preferences: Record<string, any>;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  frequency_settings: Record<string, any>;
  escalation_preferences: Record<string, any>;
}

export interface EmailNotificationData {
  to: string[];
  subject: string;
  html: string;
  priority: 'normal' | 'high' | 'urgent' | 'critical';
  template_id?: string;
  variables?: Record<string, any>;
}

export interface NotificationDeliveryResult {
  success: boolean;
  channel: string;
  delivery_id?: string;
  error?: string;
  delivered_at: Date;
}

class EnhancedNotificationService {
  private correlationMap = new Map<string, EnhancedNotification[]>();
  private deliveryQueue: Array<{ notification: EnhancedNotification; channels: string[] }> = [];

  // =======================
  // CORE NOTIFICATION MANAGEMENT
  // =======================

  async createNotification(
    notificationData: Omit<EnhancedNotification, 'id' | 'created_at' | 'org_id'>
  ): Promise<EnhancedNotification> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    // Check for correlation and deduplication
    const correlatedNotifications = await this.findCorrelatedNotifications(
      notificationData.notification_type,
      notificationData.metadata
    );

    let notification: EnhancedNotification;

    if (correlatedNotifications.length > 0) {
      // Update existing notification instead of creating duplicate
      const existingNotification = correlatedNotifications[0];
      notification = await this.updateNotificationWithCorrelation(
        existingNotification.id,
        notificationData
      );
    } else {
      // Create new notification
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          org_id: profile.organization_id,
          correlation_id: this.generateCorrelationId(notificationData),
        })
        .select()
        .single();

      if (error) throw error;
      notification = data;
    }

    // Process delivery through appropriate channels
    await this.processNotificationDelivery(notification);

    return notification;
  }

  async getNotificationsForUser(
    userId: string,
    filters?: {
      category?: string;
      urgency?: string;
      unread_only?: boolean;
      limit?: number;
    }
  ): Promise<EnhancedNotification[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('notification_type', filters.category);
    }

    if (filters?.urgency) {
      query = query.eq('urgency', filters.urgency);
    }

    if (filters?.unread_only) {
      query = query.is('read_at', null);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
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
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('org_id', profile.organization_id)
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

  // =======================
  // EMAIL NOTIFICATION SYSTEM
  // =======================

  async sendEmailNotification(emailData: EmailNotificationData): Promise<NotificationDeliveryResult> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: emailData
      });

      if (error) throw error;

      // Log delivery attempt
      await this.logDelivery({
        channel: 'email',
        recipients: emailData.to,
        status: 'sent',
        delivery_data: data,
        sent_at: new Date().toISOString()
      });

      return {
        success: true,
        channel: 'email',
        delivery_id: data.id,
        delivered_at: new Date()
      };
    } catch (error: any) {
      await this.logDelivery({
        channel: 'email',
        recipients: emailData.to,
        status: 'failed',
        error_message: error.message,
        sent_at: new Date().toISOString()
      });

      return {
        success: false,
        channel: 'email',
        error: error.message,
        delivered_at: new Date()
      };
    }
  }

  async processTemplatedEmail(
    templateId: string,
    variables: Record<string, any>,
    recipients: string[],
    priority: 'normal' | 'high' | 'urgent' | 'critical' = 'normal'
  ): Promise<NotificationDeliveryResult> {
    const template = await this.getEmailTemplate(templateId);
    if (!template) {
      throw new Error(`Email template not found: ${templateId}`);
    }

    const processedSubject = this.processTemplate(template.subject_template || '', variables);
    const processedBody = this.processTemplate(template.body_template, variables);

    return this.sendEmailNotification({
      to: recipients,
      subject: processedSubject,
      html: processedBody,
      priority,
      template_id: templateId,
      variables
    });
  }

  // =======================
  // TEMPLATE MANAGEMENT
  // =======================

  async getEmailTemplate(templateId: string): Promise<NotificationTemplate | null> {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('id', templateId)
      .eq('channel_type', 'email')
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data;
  }

  async createEmailTemplate(
    templateData: Omit<NotificationTemplate, 'id' | 'org_id' | 'created_at' | 'updated_at'>
  ): Promise<NotificationTemplate> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('notification_templates')
      .insert({
        ...templateData,
        org_id: profile.organization_id,
        channel_type: 'email'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAvailableTemplates(templateType?: string): Promise<NotificationTemplate[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    let query = supabase
      .from('notification_templates')
      .select('*')
      .or(`org_id.eq.${profile.organization_id},is_system_template.eq.true`)
      .eq('is_active', true)
      .order('template_name');

    if (templateType) {
      query = query.eq('template_type', templateType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    // Replace variables in format {{variable_name}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value));
    });

    return processed;
  }

  // =======================
  // USER PREFERENCES
  // =======================

  async getUserPreferences(userId: string): Promise<UserNotificationPreferences | null> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('org_id', profile.organization_id)
      .single();

    if (error) return null;
    return data;
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserNotificationPreferences>
  ): Promise<UserNotificationPreferences> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: userId,
        org_id: profile.organization_id,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async isInQuietHours(userId: string): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId);
    if (!preferences?.quiet_hours_enabled) return false;

    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
    
    if (preferences.quiet_hours_start && preferences.quiet_hours_end) {
      return currentTime >= preferences.quiet_hours_start && currentTime <= preferences.quiet_hours_end;
    }

    return false;
  }

  // =======================
  // INTELLIGENT ROUTING & CORRELATION
  // =======================

  private async findCorrelatedNotifications(
    notificationType: string,
    metadata: Record<string, any>
  ): Promise<EnhancedNotification[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    // Look for notifications of the same type with similar metadata in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('notification_type', notificationType)
      .gte('created_at', oneHourAgo)
      .is('read_at', null);

    if (error) return [];

    // Simple correlation logic based on metadata similarity
    return (data || []).filter(notification => {
      return this.calculateMetadataSimilarity(notification.metadata, metadata) > 0.7;
    });
  }

  private calculateMetadataSimilarity(metadata1: Record<string, any>, metadata2: Record<string, any>): number {
    const keys1 = Object.keys(metadata1);
    const keys2 = Object.keys(metadata2);
    const allKeys = [...new Set([...keys1, ...keys2])];

    if (allKeys.length === 0) return 1;

    let matchingKeys = 0;
    allKeys.forEach(key => {
      if (metadata1[key] === metadata2[key]) {
        matchingKeys++;
      }
    });

    return matchingKeys / allKeys.length;
  }

  private generateCorrelationId(notificationData: any): string {
    // Generate correlation ID based on notification type and key metadata
    const keyData = {
      type: notificationData.notification_type,
      source: notificationData.metadata?.source,
      entity_id: notificationData.metadata?.entity_id
    };
    
    return `${keyData.type}-${keyData.source || 'system'}-${keyData.entity_id || 'general'}`;
  }

  private async updateNotificationWithCorrelation(
    existingNotificationId: string,
    newNotificationData: any
  ): Promise<EnhancedNotification> {
    // Update existing notification with new information
    const { data, error } = await supabase
      .from('notifications')
      .update({
        message: `${newNotificationData.message} (Updated: ${new Date().toLocaleTimeString()})`,
        urgency: this.escalateUrgency(newNotificationData.urgency),
        metadata: {
          ...newNotificationData.metadata,
          correlation_count: (newNotificationData.metadata?.correlation_count || 0) + 1,
          last_update: new Date().toISOString()
        }
      })
      .eq('id', existingNotificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private escalateUrgency(currentUrgency: string): string {
    const urgencyLevels = ['low', 'medium', 'high', 'critical'];
    const currentIndex = urgencyLevels.indexOf(currentUrgency);
    return urgencyLevels[Math.min(currentIndex + 1, urgencyLevels.length - 1)];
  }

  // =======================
  // DELIVERY PROCESSING
  // =======================

  private async processNotificationDelivery(notification: EnhancedNotification): Promise<void> {
    const userPreferences = await this.getUserPreferences(notification.recipient_id);
    
    // Check quiet hours
    if (await this.isInQuietHours(notification.recipient_id) && notification.urgency !== 'critical') {
      // Queue for later delivery
      this.deliveryQueue.push({ notification, channels: notification.channels });
      return;
    }

    // Process each channel
    for (const channel of notification.channels) {
      await this.deliverToChannel(notification, channel, userPreferences);
    }
  }

  private async deliverToChannel(
    notification: EnhancedNotification,
    channel: string,
    preferences: UserNotificationPreferences | null
  ): Promise<void> {
    try {
      switch (channel) {
        case 'email':
          await this.deliverEmail(notification, preferences);
          break;
        case 'in_app':
          // In-app notifications are already stored in the database
          break;
        default:
          console.warn(`Unsupported notification channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Failed to deliver notification via ${channel}:`, error);
      await this.logDelivery({
        notification_id: notification.id,
        channel,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        sent_at: new Date().toISOString()
      });
    }
  }

  private async deliverEmail(
    notification: EnhancedNotification,
    preferences: UserNotificationPreferences | null
  ): Promise<void> {
    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', notification.recipient_id)
      .single();

    if (!profile?.email) return;

    // Check if user wants email notifications for this type
    if (preferences?.channel_preferences?.email === false) return;

    // Use appropriate template or default format
    const emailData: EmailNotificationData = {
      to: [profile.email],
      subject: notification.title,
      html: this.generateDefaultEmailTemplate(notification),
      priority: this.mapUrgencyToPriority(notification.urgency)
    };

    await this.sendEmailNotification(emailData);
  }

  private generateDefaultEmailTemplate(notification: EnhancedNotification): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 16px;">${notification.title}</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 16px;">${notification.message}</p>
          
          ${notification.actions && notification.actions.length > 0 ? `
            <div style="margin-top: 20px;">
              <h3 style="color: #333; font-size: 16px; margin-bottom: 12px;">Available Actions:</h3>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${notification.actions.map(action => `
                  <a href="#" style="
                    background-color: ${action.style === 'destructive' ? '#dc2626' : action.style === 'secondary' ? '#6b7280' : '#2563eb'};
                    color: white;
                    padding: 10px 16px;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: 500;
                    display: inline-block;
                  ">${action.label}</a>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p><strong>Urgency:</strong> ${notification.urgency.toUpperCase()}</p>
            <p><strong>Time:</strong> ${new Date(notification.created_at).toLocaleString()}</p>
            ${notification.metadata?.source ? `<p><strong>Source:</strong> ${notification.metadata.source}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  private mapUrgencyToPriority(urgency: string): 'normal' | 'high' | 'urgent' | 'critical' {
    switch (urgency) {
      case 'critical': return 'critical';
      case 'high': return 'urgent';
      case 'medium': return 'high';
      case 'low': return 'normal';
      default: return 'normal';
    }
  }

  // =======================
  // LOGGING & ANALYTICS
  // =======================

  private async logDelivery(deliveryData: {
    notification_id?: string;
    channel: string;
    recipients?: string[];
    status: 'sent' | 'failed' | 'pending';
    delivery_data?: any;
    error_message?: string;
    sent_at: string;
  }): Promise<void> {
    try {
      await supabase
        .from('notification_delivery_logs')
        .insert(deliveryData);
    } catch (error) {
      console.error('Failed to log notification delivery:', error);
    }
  }

  async getDeliveryAnalytics(timeRange?: { start: Date; end: Date }) {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    let query = supabase
      .from('notification_delivery_logs')
      .select('*')
      .eq('org_id', profile.organization_id);

    if (timeRange) {
      query = query
        .gte('sent_at', timeRange.start.toISOString())
        .lte('sent_at', timeRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    // Calculate analytics
    const total = data?.length || 0;
    const successful = data?.filter(log => log.status === 'sent').length || 0;
    const failed = data?.filter(log => log.status === 'failed').length || 0;

    return {
      total_deliveries: total,
      successful_deliveries: successful,
      failed_deliveries: failed,
      success_rate: total > 0 ? (successful / total) * 100 : 0,
      by_channel: this.groupByChannel(data || []),
      recent_failures: data?.filter(log => log.status === 'failed').slice(0, 10) || []
    };
  }

  private groupByChannel(logs: any[]): Record<string, { total: number; successful: number; failed: number }> {
    const grouped: Record<string, { total: number; successful: number; failed: number }> = {};

    logs.forEach(log => {
      if (!grouped[log.channel]) {
        grouped[log.channel] = { total: 0, successful: 0, failed: 0 };
      }
      
      grouped[log.channel].total++;
      if (log.status === 'sent') {
        grouped[log.channel].successful++;
      } else if (log.status === 'failed') {
        grouped[log.channel].failed++;
      }
    });

    return grouped;
  }
}

export const enhancedNotificationService = new EnhancedNotificationService();