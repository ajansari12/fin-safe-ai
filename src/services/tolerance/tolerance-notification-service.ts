import { supabase } from '@/integrations/supabase/client';

export interface NotificationRecipient {
  email?: string;
  phone?: string;
  name: string;
  role: string;
}

export interface ToleranceNotificationConfig {
  emailEnabled: boolean;
  smsEnabled: boolean;
  priority: 'normal' | 'high' | 'urgent';
  escalationDelay: number; // minutes
}

export interface BreachNotificationData {
  orgId: string;
  breachId: string;
  breachSeverity: 'low' | 'medium' | 'high' | 'critical';
  actualValue: number;
  thresholdValue: number;
  variancePercentage: number;
  businessFunctionName?: string;
  detectedAt: string;
}

class ToleranceNotificationService {
  
  async sendBreachNotification(
    breachData: BreachNotificationData,
    config: ToleranceNotificationConfig
  ): Promise<boolean> {
    try {
      const recipients = await this.getNotificationRecipients(breachData.orgId, breachData.breachSeverity);
      
      if (recipients.length === 0) {
        console.warn('No notification recipients found for breach notification');
        return false;
      }

      const notifications: Promise<any>[] = [];

      // Send email notifications
      if (config.emailEnabled && recipients.some(r => r.email)) {
        const emailRecipients = recipients.filter(r => r.email).map(r => r.email!);
        notifications.push(this.sendEmailNotification(breachData, emailRecipients));
      }

      // Send priority email notifications for high/critical severity (replaced SMS)
      if (config.smsEnabled && 
          ['high', 'critical'].includes(breachData.breachSeverity) && 
          recipients.some(r => r.email)) {
        const priorityEmailRecipients = recipients.filter(r => r.email).map(r => r.email!);
        notifications.push(this.sendPriorityEmailNotification(breachData, priorityEmailRecipients, config.priority));
      }

      await Promise.all(notifications);
      
      console.log(`Tolerance breach notifications sent for breach ${breachData.breachId}`);
      return true;

    } catch (error) {
      console.error('Error sending tolerance breach notification:', error);
      return false;
    }
  }

  private async getNotificationRecipients(
    orgId: string, 
    severity: string
  ): Promise<NotificationRecipient[]> {
    // Get admin users for the organization
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('organization_id', orgId);

    if (!profiles) return [];

    // For critical breaches, include all admins; for others, include primary contacts
    const recipients: NotificationRecipient[] = profiles.map(profile => ({
      email: profile.email || undefined,
      name: profile.full_name || 'Unknown User',
      role: 'Administrator'
    }));

    // Add emergency contact numbers for critical breaches
    if (severity === 'critical') {
      // In real implementation, this would come from organizational settings
      const emergencyContacts = [
        { phone: '+1234567890', name: 'Risk Manager', role: 'Risk Management' },
        { phone: '+1234567891', name: 'CRO', role: 'Chief Risk Officer' }
      ];
      recipients.push(...emergencyContacts);
    }

    return recipients;
  }

  private async sendEmailNotification(
    breachData: BreachNotificationData,
    recipients: string[]
  ): Promise<void> {
    const subject = `🚨 OSFI E-21 Tolerance Breach Alert - ${breachData.breachSeverity.toUpperCase()} Severity`;
    
    const htmlContent = this.createEmailContent(breachData);

    await supabase.functions.invoke('send-email-notification', {
      body: {
        to: recipients,
        subject,
        html: htmlContent
      }
    });
  }

  private async sendPriorityEmailNotification(
    breachData: BreachNotificationData,
    recipients: string[],
    priority: 'normal' | 'high' | 'urgent'
  ): Promise<void> {
    const subject = `Tolerance Breach Alert - ${breachData.businessFunctionName || 'Critical System'}`;
    const htmlContent = this.createEmailContent(breachData);

    await supabase.functions.invoke('send-email-notification', {
      body: {
        to: recipients,
        subject,
        html: htmlContent,
        priority: priority === 'urgent' ? 'critical' : priority
      }
    });
  }

  private createEmailContent(breachData: BreachNotificationData): string {
    const severityColor = this.getSeverityColor(breachData.breachSeverity);
    const osfiCitation = this.getOSFICitation(breachData.breachSeverity);

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${severityColor}; margin: 0; font-size: 24px;">
              🚨 OSFI E-21 Tolerance Breach Alert
            </h1>
            <div style="background-color: ${severityColor}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold;">
              ${breachData.breachSeverity.toUpperCase()} SEVERITY
            </div>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">OSFI E-21 Regulatory Citation</h3>
            <p style="margin: 0; font-size: 14px; line-height: 1.5;">
              ${osfiCitation}
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #d1d5db; font-weight: bold;">Breach Details</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Values</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Detected At</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">${new Date(breachData.detectedAt).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Actual Value</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; color: ${severityColor}; font-weight: bold;">${breachData.actualValue}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Threshold Value</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">${breachData.thresholdValue}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Variance</td>
              <td style="padding: 12px; border: 1px solid #d1d5db; color: ${severityColor}; font-weight: bold;">${breachData.variancePercentage.toFixed(1)}%</td>
            </tr>
            ${breachData.businessFunctionName ? `
            <tr>
              <td style="padding: 12px; border: 1px solid #d1d5db;">Business Function</td>
              <td style="padding: 12px; border: 1px solid #d1d5db;">${breachData.businessFunctionName}</td>
            </tr>
            ` : ''}
          </table>

          <div style="background-color: #fecaca; border: 1px solid #f87171; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h3 style="color: #991b1b; margin: 0 0 8px 0;">Required Actions</h3>
            <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
              ${breachData.breachSeverity === 'critical' ? `
              <li>Immediate board/senior management notification required</li>
              <li>Activate incident response procedures</li>
              <li>Document root cause analysis within 24 hours</li>
              <li>Implement immediate containment measures</li>
              ` : `
              <li>Management review and assessment required</li>
              <li>Document breach circumstances and impact</li>
              <li>Review and update tolerance levels if necessary</li>
              <li>Monitor for additional related breaches</li>
              `}
            </ul>
          </div>

          <div style="background-color: #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 20px;">
            <h3 style="color: #374151; margin: 0 0 8px 0;">Regulatory Disclaimer</h3>
            <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.4;">
              <strong>Important:</strong> This automated analysis is based on OSFI Guideline E-21 requirements. 
              This does not constitute regulatory advice. Organizations should consult OSFI directly or qualified 
              compliance professionals for specific regulatory guidance applicable to their institution's circumstances.
            </p>
          </div>
        </div>
      </div>
    `;
  }


  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  }

  private getOSFICitation(severity: string): string {
    if (severity === 'critical') {
      return 'Per OSFI E-21 Principle 7, this disruption exceeds your institution\'s defined tolerance for critical operations. ' +
             'Principle 5 requires immediate escalation to board and senior management. ' +
             'Principle 6 requires assessment of critical operations and dependencies impact.';
    }
    
    return 'Per OSFI E-21 Principle 7, this event indicates a potential exceedance of defined disruption tolerances. ' +
           'Principle 5 requires monitoring and appropriate escalation based on severity and duration.';
  }

  // Test notification functionality
  async testNotifications(orgId: string): Promise<void> {
    const testBreachData: BreachNotificationData = {
      orgId,
      breachId: 'test-' + Date.now(),
      breachSeverity: 'high',
      actualValue: 150,
      thresholdValue: 120,
      variancePercentage: 25,
      businessFunctionName: 'Customer Transaction Processing',
      detectedAt: new Date().toISOString()
    };

    const testConfig: ToleranceNotificationConfig = {
      emailEnabled: true,
      smsEnabled: true,
      priority: 'high',
      escalationDelay: 15
    };

    await this.sendBreachNotification(testBreachData, testConfig);
  }
}

export const toleranceNotificationService = new ToleranceNotificationService();