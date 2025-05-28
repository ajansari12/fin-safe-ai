
import { supabase } from "@/integrations/supabase/client";

export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface WelcomeEmailData {
  userName: string;
  organizationName: string;
  loginUrl: string;
}

export interface SLAExpiryEmailData {
  vendorName: string;
  serviceName: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

export interface PolicyReviewEmailData {
  policyTitle: string;
  frameworkTitle: string;
  reviewDate: string;
  reviewerName: string;
}

export interface KRIBreachEmailData {
  kriName: string;
  actualValue: number;
  thresholdValue: string;
  breachType: 'warning' | 'critical';
  measurementDate: string;
}

export interface IncidentAssignmentEmailData {
  incidentTitle: string;
  incidentId: string;
  severity: string;
  assigneeName: string;
  reportedBy: string;
  dashboardUrl: string;
}

export class EmailTemplates {
  static welcomeEmail(data: WelcomeEmailData): EmailTemplate {
    return {
      subject: `Welcome to ResilientFI - ${data.organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ResilientFI</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.userName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Welcome to ResilientFI! Your organization <strong>${data.organizationName}</strong> has been successfully set up.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              You can now access your operational risk management dashboard and start building your resilience framework.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${data.loginUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Access Your Dashboard
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 30px 0;">
              <h3 style="color: #333; margin-top: 0;">Getting Started:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>Set up your business functions and impact tolerances</li>
                <li>Define your risk appetite statements</li>
                <li>Configure governance frameworks and policies</li>
                <li>Establish KRIs and controls</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              If you have any questions, our support team is here to help.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Best regards,<br>
              The ResilientFI Team
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px;">
            © 2024 ResilientFI. All rights reserved.
          </div>
        </div>
      `
    };
  }

  static slaExpiryAlert(data: SLAExpiryEmailData): EmailTemplate {
    const urgencyColor = data.daysUntilExpiry <= 7 ? '#dc3545' : '#ffc107';
    
    return {
      subject: `SLA Expiry Alert: ${data.vendorName} - ${data.daysUntilExpiry} days remaining`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${urgencyColor}; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ SLA Expiry Alert</h1>
          </div>
          
          <div style="padding: 30px 20px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Action Required: SLA Renewal</h2>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-weight: bold;">
                The SLA for ${data.vendorName} expires in ${data.daysUntilExpiry} day(s)
              </p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Vendor:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${data.vendorName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Service:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${data.serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Expiry Date:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${data.expiryDate}</td>
              </tr>
            </table>
            
            <p style="color: #666; line-height: 1.6;">
              Please review and renew the SLA agreement to avoid service disruption.
            </p>
          </div>
        </div>
      `
    };
  }

  static policyReviewReminder(data: PolicyReviewEmailData): EmailTemplate {
    return {
      subject: `Policy Review Due: ${data.policyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #17a2b8; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📋 Policy Review Required</h1>
          </div>
          
          <div style="padding: 30px 20px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.reviewerName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              A policy under the ${data.frameworkTitle} framework is due for review.
            </p>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #0c5460; margin-top: 0;">Policy Details:</h3>
              <p style="margin: 10px 0; color: #0c5460;"><strong>Policy:</strong> ${data.policyTitle}</p>
              <p style="margin: 10px 0; color: #0c5460;"><strong>Framework:</strong> ${data.frameworkTitle}</p>
              <p style="margin: 10px 0; color: #0c5460;"><strong>Review Due:</strong> ${data.reviewDate}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Please complete your review to ensure continued compliance and effectiveness of our governance framework.
            </p>
          </div>
        </div>
      `
    };
  }

  static kriBreachNotification(data: KRIBreachEmailData): EmailTemplate {
    const severityColor = data.breachType === 'critical' ? '#dc3545' : '#ffc107';
    const severityText = data.breachType === 'critical' ? 'CRITICAL' : 'WARNING';
    
    return {
      subject: `KRI ${severityText} Breach: ${data.kriName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${severityColor}; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚨 KRI ${severityText} Breach</h1>
          </div>
          
          <div style="padding: 30px 20px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Immediate Attention Required</h2>
            
            <div style="background: ${data.breachType === 'critical' ? '#f8d7da' : '#fff3cd'}; border: 1px solid ${data.breachType === 'critical' ? '#f5c6cb' : '#ffeaa7'}; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: ${data.breachType === 'critical' ? '#721c24' : '#856404'}; font-weight: bold;">
                ${severityText} threshold breach detected
              </p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">KRI Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${data.kriName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Actual Value:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${data.actualValue}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Threshold:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${data.thresholdValue}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Date:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${data.measurementDate}</td>
              </tr>
            </table>
            
            <p style="color: #666; line-height: 1.6;">
              Please investigate this breach and take appropriate corrective action.
            </p>
          </div>
        </div>
      `
    };
  }

  static incidentAssignment(data: IncidentAssignmentEmailData): EmailTemplate {
    const severityColors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    
    const severityColor = severityColors[data.severity as keyof typeof severityColors] || '#6c757d';
    
    return {
      subject: `Incident Assigned: ${data.incidentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${severityColor}; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎯 Incident Assignment</h1>
          </div>
          
          <div style="padding: 30px 20px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.assigneeName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You have been assigned to handle the following incident:
            </p>
            
            <div style="background: #e9ecef; border-left: 4px solid ${severityColor}; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">${data.incidentTitle}</h3>
              <p style="margin: 10px 0; color: #666;"><strong>Incident ID:</strong> ${data.incidentId}</p>
              <p style="margin: 10px 0; color: #666;"><strong>Severity:</strong> <span style="background: ${severityColor}; color: white; padding: 2px 8px; border-radius: 3px; text-transform: uppercase; font-size: 12px;">${data.severity}</span></p>
              <p style="margin: 10px 0; color: #666;"><strong>Reported by:</strong> ${data.reportedBy}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardUrl}" style="background: ${severityColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Incident Details
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Please review the incident details and begin your response as soon as possible.
            </p>
          </div>
        </div>
      `
    };
  }
}

export async function sendEmail(to: string[], template: EmailTemplate, from?: string) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email-notification', {
      body: {
        to,
        subject: template.subject,
        html: template.html,
        from: from || 'ResilientFI <no-reply@resilientfi.com>'
      }
    });

    if (error) {
      console.error('Email sending error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Convenience functions for sending specific email types
export const EmailService = {
  async sendWelcomeEmail(to: string[], data: WelcomeEmailData) {
    const template = EmailTemplates.welcomeEmail(data);
    return sendEmail(to, template);
  },

  async sendSLAExpiryAlert(to: string[], data: SLAExpiryEmailData) {
    const template = EmailTemplates.slaExpiryAlert(data);
    return sendEmail(to, template);
  },

  async sendPolicyReviewReminder(to: string[], data: PolicyReviewEmailData) {
    const template = EmailTemplates.policyReviewReminder(data);
    return sendEmail(to, template);
  },

  async sendKRIBreachNotification(to: string[], data: KRIBreachEmailData) {
    const template = EmailTemplates.kriBreachNotification(data);
    return sendEmail(to, template);
  },

  async sendIncidentAssignment(to: string[], data: IncidentAssignmentEmailData) {
    const template = EmailTemplates.incidentAssignment(data);
    return sendEmail(to, template);
  }
};
