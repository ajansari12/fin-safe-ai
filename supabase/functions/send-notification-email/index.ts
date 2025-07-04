import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'sla_breach' | 'policy_review' | 'executive_summary';
  recipient_email: string;
  recipient_name?: string;
  data: any;
  org_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, recipient_email, recipient_name, data, org_id }: NotificationRequest = await req.json();

    console.log(`Sending ${type} notification to ${recipient_email}`);

    let emailSubject = '';
    let emailHtml = '';
    let fromEmail = 'notifications@yourcompany.com'; // Update with your verified domain

    switch (type) {
      case 'sla_breach':
        emailSubject = `🚨 SLA Breach Alert - ${data.incident_title}`;
        emailHtml = generateSLABreachEmail(data, recipient_name);
        break;

      case 'policy_review':
        emailSubject = `📋 Policy Review Required - ${data.policy_name}`;
        emailHtml = generatePolicyReviewEmail(data, recipient_name);
        break;

      case 'executive_summary':
        emailSubject = `📊 Weekly Executive Summary - Week of ${data.week_of}`;
        emailHtml = generateExecutiveSummaryEmail(data, recipient_name);
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [recipient_email],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log('Email sent successfully:', emailResponse);

    // Log the notification in the database
    const { error: logError } = await supabase
      .from('notifications')
      .insert({
        org_id,
        user_id: null, // Will be set by trigger if available
        notification_type: type,
        title: emailSubject,
        message: `Email notification sent to ${recipient_email}`,
        priority: type === 'sla_breach' ? 'high' : 'medium',
        metadata: {
          email_id: emailResponse.data?.id,
          recipient_email,
          notification_data: data
        }
      });

    if (logError) {
      console.error('Failed to log notification:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResponse.data?.id,
        message: 'Notification sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to send notification email'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateSLABreachEmail(data: any, recipientName?: string): string {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hello,';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SLA Breach Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .alert-box { background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 6px; margin: 16px 0; }
        .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .details { background: white; padding: 16px; border-radius: 6px; margin: 16px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 SLA Breach Alert</h1>
        </div>
        <div class="content">
          <p>${greeting}</p>
          
          <div class="alert-box">
            <strong>URGENT:</strong> An SLA breach has been detected that requires immediate attention.
          </div>

          <div class="details">
            <h3>Incident Details:</h3>
            <ul>
              <li><strong>Incident:</strong> ${data.incident_title || 'N/A'}</li>
              <li><strong>Severity:</strong> ${data.severity || 'N/A'}</li>
              <li><strong>Breach Type:</strong> ${data.breach_type || 'N/A'}</li>
              <li><strong>Time Elapsed:</strong> ${data.time_elapsed || 'N/A'}</li>
              <li><strong>SLA Limit:</strong> ${data.sla_limit || 'N/A'}</li>
              <li><strong>Escalation Level:</strong> ${data.escalation_level || 'N/A'}</li>
            </ul>
          </div>

          <p><strong>Action Required:</strong> ${data.action_required || 'Please review and take immediate action on this incident.'}</p>

          <p>
            <a href="${data.incident_url || '#'}" class="button">View Incident Details</a>
          </p>

          <p>This alert was automatically generated by the Risk Management System.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePolicyReviewEmail(data: any, recipientName?: string): string {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hello,';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Policy Review Required</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 6px; margin: 16px 0; }
        .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .details { background: white; padding: 16px; border-radius: 6px; margin: 16px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Policy Review Required</h1>
        </div>
        <div class="content">
          <p>${greeting}</p>
          
          <div class="info-box">
            A policy review is due and requires your attention.
          </div>

          <div class="details">
            <h3>Policy Details:</h3>
            <ul>
              <li><strong>Policy Name:</strong> ${data.policy_name || 'N/A'}</li>
              <li><strong>Framework:</strong> ${data.framework_name || 'N/A'}</li>
              <li><strong>Current Version:</strong> ${data.version || 'N/A'}</li>
              <li><strong>Last Review:</strong> ${data.last_review_date || 'N/A'}</li>
              <li><strong>Review Due:</strong> ${data.review_due_date || 'N/A'}</li>
              <li><strong>Priority:</strong> ${data.priority || 'Medium'}</li>
            </ul>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Review the current policy content</li>
            <li>Check for regulatory updates or changes</li>
            <li>Update the policy if necessary</li>
            <li>Submit for approval workflow</li>
          </ul>

          <p>
            <a href="${data.policy_url || '#'}" class="button">Review Policy</a>
          </p>

          <p>This notification was automatically generated based on your review schedule.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateExecutiveSummaryEmail(data: any, recipientName?: string): string {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hello,';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Weekly Executive Summary</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .metric-card { background: white; padding: 16px; margin: 16px 0; border-radius: 6px; border-left: 4px solid #059669; }
        .metric-value { font-size: 24px; font-weight: bold; color: #059669; }
        .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .alert { background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; margin: 8px 0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Weekly Executive Summary</h1>
          <p>Week of ${data.week_of || new Date().toLocaleDateString()}</p>
        </div>
        <div class="content">
          <p>${greeting}</p>
          
          <p>Here's your weekly risk management summary:</p>

          <div class="grid">
            <div class="metric-card">
              <h3>Risk Incidents</h3>
              <div class="metric-value">${data.total_incidents || 0}</div>
              <p>${data.new_incidents || 0} new this week</p>
            </div>
            
            <div class="metric-card">
              <h3>KRI Status</h3>
              <div class="metric-value">${data.kri_breaches || 0}</div>
              <p>appetite breaches</p>
            </div>
            
            <div class="metric-card">
              <h3>Control Tests</h3>
              <div class="metric-value">${data.control_tests || 0}</div>
              <p>completed this week</p>
            </div>
            
            <div class="metric-card">
              <h3>Third Parties</h3>
              <div class="metric-value">${data.vendor_reviews || 0}</div>
              <p>reviews due soon</p>
            </div>
          </div>

          ${data.critical_alerts && data.critical_alerts.length > 0 ? `
            <h3>🚨 Critical Alerts</h3>
            ${data.critical_alerts.map((alert: any) => `
              <div class="alert">
                <strong>${alert.title}</strong><br>
                ${alert.description}
              </div>
            `).join('')}
          ` : ''}

          <h3>📈 Key Trends</h3>
          <ul>
            <li>Incident response time: ${data.avg_response_time || 'N/A'}</li>
            <li>Control effectiveness: ${data.control_effectiveness || 'N/A'}%</li>
            <li>Policy compliance: ${data.policy_compliance || 'N/A'}%</li>
            <li>Risk appetite variance: ${data.risk_variance || 'N/A'}%</li>
          </ul>

          <h3>🎯 Recommended Actions</h3>
          <ul>
            ${data.recommendations?.map((rec: string) => `<li>${rec}</li>`).join('') || '<li>Continue monitoring current risk posture</li>'}
          </ul>

          <p>
            <a href="${data.dashboard_url || '#'}" class="button">View Full Dashboard</a>
          </p>

          <p>This summary was automatically generated from your risk management system data.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}