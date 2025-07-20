
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserProfile } from '@/lib/supabase-utils';

export interface BatchNotificationJob {
  id: string;
  org_id: string;
  job_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_recipients: number;
  processed_count: number;
  success_count: number;
  failure_count: number;
  batch_size: number;
  notification_template: string;
  recipient_filters: any;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationQueue {
  id: string;
  org_id: string;
  batch_job_id?: string;
  notification_type: string;
  recipient_id: string;
  recipient_email?: string;
  recipient_phone?: string;
  channel_type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  template_id: string;
  template_data: any;
  scheduled_for: string;
  retry_count: number;
  max_retries: number;
  status: 'queued' | 'processing' | 'sent' | 'failed' | 'cancelled';
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

export interface BatchProcessingMetrics {
  queue_size: number;
  processing_rate: number;
  success_rate: number;
  average_processing_time: number;
  failed_notifications: number;
  retry_queue_size: number;
}

class BatchNotificationService {
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private batchSize = 100;
  private processingDelay = 1000; // 1 second between batches

  async createBatchJob(
    jobName: string,
    templateId: string,
    recipientFilters: any,
    scheduledAt?: Date
  ): Promise<BatchNotificationJob> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('batch_notification_jobs')
      .insert({
        org_id: profile.organization_id,
        job_name: jobName,
        notification_template: templateId,
        recipient_filters: recipientFilters,
        scheduled_at: scheduledAt?.toISOString(),
        created_by: profile.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async queueNotification(notification: Omit<NotificationQueue, 'id' | 'created_at' | 'org_id'>): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { error } = await supabase
      .from('notification_queue')
      .insert({
        ...notification,
        org_id: profile.organization_id
      });

    if (error) throw error;
  }

  async queueBulkNotifications(notifications: Omit<NotificationQueue, 'id' | 'created_at' | 'org_id'>[]): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const notificationsWithOrg = notifications.map(notification => ({
      ...notification,
      org_id: profile.organization_id
    }));

    const { error } = await supabase
      .from('notification_queue')
      .insert(notificationsWithOrg);

    if (error) throw error;
  }

  async getQueuedNotifications(limit: number = 100): Promise<NotificationQueue[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('status', 'queued')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async processNotificationQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    try {
      const notifications = await this.getQueuedNotifications(this.batchSize);
      
      if (notifications.length === 0) {
        this.isProcessing = false;
        return;
      }

      // Process notifications in batches
      for (const notification of notifications) {
        try {
          await this.processIndividualNotification(notification);
        } catch (error) {
          console.error(`Failed to process notification ${notification.id}:`, error);
          await this.markNotificationFailed(notification.id, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processIndividualNotification(notification: NotificationQueue): Promise<void> {
    // Mark as processing
    await supabase
      .from('notification_queue')
      .update({ status: 'processing' })
      .eq('id', notification.id);

    try {
      // Send notification based on channel type
      let success = false;
      
      switch (notification.channel_type) {
        case 'email':
          success = await this.sendEmailNotification(notification);
          break;
        case 'sms':
          success = await this.sendSMSNotification(notification);
          break;
        case 'slack':
          success = await this.sendSlackNotification(notification);
          break;
        case 'webhook':
          success = await this.sendWebhookNotification(notification);
          break;
        default:
          throw new Error(`Unsupported channel type: ${notification.channel_type}`);
      }

      if (success) {
        await supabase
          .from('notification_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id);
      } else {
        throw new Error('Notification sending failed');
      }
    } catch (error) {
      await this.handleNotificationError(notification, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async sendEmailNotification(notification: NotificationQueue): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          to: [notification.recipient_email!],
          subject: notification.template_data.subject || 'Notification',
          html: notification.template_data.body,
          priority: notification.priority
        }
      });

      return !error;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  private async sendSMSNotification(notification: NotificationQueue): Promise<boolean> {
    // SMS implementation would go here
    // For now, return true as placeholder
    console.log('SMS notification would be sent to:', notification.recipient_phone);
    return true;
  }

  private async sendSlackNotification(notification: NotificationQueue): Promise<boolean> {
    // Slack implementation would go here
    console.log('Slack notification would be sent');
    return true;
  }

  private async sendWebhookNotification(notification: NotificationQueue): Promise<boolean> {
    // Webhook implementation would go here
    console.log('Webhook notification would be sent');
    return true;
  }

  private async handleNotificationError(notification: NotificationQueue, errorMessage: string): Promise<void> {
    const retryCount = notification.retry_count + 1;
    
    if (retryCount <= notification.max_retries) {
      // Schedule for retry with exponential backoff
      const retryDelay = Math.pow(2, retryCount) * 60 * 1000; // exponential backoff in minutes
      const retryTime = new Date(Date.now() + retryDelay);
      
      await supabase
        .from('notification_queue')
        .update({
          status: 'queued',
          retry_count: retryCount,
          scheduled_for: retryTime.toISOString(),
          error_message: errorMessage
        })
        .eq('id', notification.id);
    } else {
      await this.markNotificationFailed(notification.id, errorMessage);
    }
  }

  private async markNotificationFailed(notificationId: string, errorMessage: string): Promise<void> {
    await supabase
      .from('notification_queue')
      .update({
        status: 'failed',
        error_message: errorMessage
      })
      .eq('id', notificationId);
  }

  async getBatchProcessingMetrics(): Promise<BatchProcessingMetrics> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data: queueStats } = await supabase
      .from('notification_queue')
      .select('status')
      .eq('org_id', profile.organization_id);

    const queueSize = queueStats?.filter(n => n.status === 'queued').length || 0;
    const processing = queueStats?.filter(n => n.status === 'processing').length || 0;
    const sent = queueStats?.filter(n => n.status === 'sent').length || 0;
    const failed = queueStats?.filter(n => n.status === 'failed').length || 0;
    const retryQueue = queueStats?.filter(n => n.status === 'queued' && n.retry_count > 0).length || 0;

    const total = sent + failed;
    const successRate = total > 0 ? (sent / total) * 100 : 0;

    return {
      queue_size: queueSize,
      processing_rate: processing,
      success_rate: successRate,
      average_processing_time: 1.5, // placeholder
      failed_notifications: failed,
      retry_queue_size: retryQueue
    };
  }

  startBatchProcessing(): void {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(() => {
      this.processNotificationQueue();
    }, this.processingDelay);
  }

  stopBatchProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  async cancelBatchJob(jobId: string): Promise<void> {
    await supabase
      .from('batch_notification_jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId);

    // Cancel queued notifications for this job
    await supabase
      .from('notification_queue')
      .update({ status: 'cancelled' })
      .eq('batch_job_id', jobId)
      .eq('status', 'queued');
  }

  async getBatchJobs(): Promise<BatchNotificationJob[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    const { data, error } = await supabase
      .from('batch_notification_jobs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const batchNotificationService = new BatchNotificationService();
