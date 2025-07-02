import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationEmailRequest {
  to: string;
  subject: string;
  type: 'incident' | 'kri_breach' | 'audit_finding' | 'system_alert';
  data: Record<string, any>;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data, urgency }: NotificationEmailRequest = await req.json();

    // Set up Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate email content based on type
    let htmlContent = '';
    let textContent = '';

    switch (type) {
      case 'incident':
        htmlContent = generateIncidentEmail(data);
        textContent = `Incident Alert: ${data.title}\nSeverity: ${data.severity}\nStatus: ${data.status}\nReported: ${data.reported_at}`;
        break;
      
      case 'kri_breach':
        htmlContent = generateKRIBreachEmail(data);
        textContent = `KRI Breach Alert: ${data.kri_name}\nCurrent Value: ${data.current_value}\nThreshold: ${data.threshold}\nSeverity: ${data.severity}`;
        break;
      
      case 'audit_finding':
        htmlContent = generateAuditFindingEmail(data);
        textContent = `Audit Finding: ${data.finding_title}\nSeverity: ${data.severity}\nStatus: ${data.status}`;
        break;
      
      case 'system_alert':
        htmlContent = generateSystemAlertEmail(data);
        textContent = `System Alert: ${data.message}\nComponent: ${data.component}\nTime: ${data.timestamp}`;
        break;
    }

    // Log notification (for audit trail)
    await supabase.from('notification_logs').insert({
      recipient: to,
      subject,
      type,
      urgency,
      sent_at: new Date().toISOString(),
      status: 'sent'
    });

    // In a production environment, you would integrate with an email service like SendGrid, AWS SES, etc.
    // For now, we'll simulate sending the email
    console.log(`Email notification sent to ${to}:`, { subject, type, urgency });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        recipient: to,
        type,
        urgency
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Notification error:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notification', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

function generateIncidentEmail(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
        <h1>🚨 Incident Alert</h1>
      </div>
      <div style="padding: 20px; background: #f9fafb;">
        <h2>${data.title}</h2>
        <p><strong>Severity:</strong> <span style="color: ${getSeverityColor(data.severity)}">${data.severity.toUpperCase()}</span></p>
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Category:</strong> ${data.category || 'Uncategorized'}</p>
        <p><strong>Reported:</strong> ${new Date(data.reported_at).toLocaleString()}</p>
        
        ${data.description ? `<div style="margin: 20px 0; padding: 15px; background: white; border-left: 4px solid #dc2626;">
          <h3>Description</h3>
          <p>${data.description}</p>
        </div>` : ''}
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${Deno.env.get('SUPABASE_URL')}/app/incident-log" 
             style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            View Incident Details
          </a>
        </div>
      </div>
    </div>
  `;
}

function generateKRIBreachEmail(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #ea580c; color: white; padding: 20px; text-align: center;">
        <h1>⚠️ KRI Breach Alert</h1>
      </div>
      <div style="padding: 20px; background: #f9fafb;">
        <h2>${data.kri_name}</h2>
        <p><strong>Current Value:</strong> ${data.current_value}</p>
        <p><strong>Threshold Breached:</strong> ${data.threshold}</p>
        <p><strong>Severity:</strong> <span style="color: ${getSeverityColor(data.severity)}">${data.severity.toUpperCase()}</span></p>
        <p><strong>Detected:</strong> ${new Date(data.detected_at).toLocaleString()}</p>
        
        <div style="margin: 20px 0; padding: 15px; background: white; border-left: 4px solid #ea580c;">
          <h3>Risk Assessment</h3>
          <p>This KRI breach indicates potential operational risk exposure that requires immediate attention.</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${Deno.env.get('SUPABASE_URL')}/app/controls-and-kri" 
             style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Review KRI Dashboard
          </a>
        </div>
      </div>
    </div>
  `;
}

function generateAuditFindingEmail(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
        <h1>📋 Audit Finding</h1>
      </div>
      <div style="padding: 20px; background: #f9fafb;">
        <h2>${data.finding_title}</h2>
        <p><strong>Severity:</strong> <span style="color: ${getSeverityColor(data.severity)}">${data.severity.toUpperCase()}</span></p>
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Framework:</strong> ${data.regulatory_framework || 'General'}</p>
        <p><strong>Identified:</strong> ${new Date(data.identified_date).toLocaleString()}</p>
        
        ${data.finding_description ? `<div style="margin: 20px 0; padding: 15px; background: white; border-left: 4px solid #7c3aed;">
          <h3>Finding Details</h3>
          <p>${data.finding_description}</p>
        </div>` : ''}
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${Deno.env.get('SUPABASE_URL')}/app/audit-and-compliance" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
             View Audit Dashboard
          </a>
        </div>
      </div>
    </div>
  `;
}

function generateSystemAlertEmail(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #059669; color: white; padding: 20px; text-align: center;">
        <h1>🔔 System Alert</h1>
      </div>
      <div style="padding: 20px; background: #f9fafb;">
        <h2>System Notification</h2>
        <p><strong>Component:</strong> ${data.component}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
        
        <div style="margin: 20px 0; padding: 15px; background: white; border-left: 4px solid #059669;">
          <h3>Action Required</h3>
          <p>${data.action_required || 'Please review the system status and take appropriate action if necessary.'}</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${Deno.env.get('SUPABASE_URL')}/app/dashboard" 
             style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
             View Dashboard
          </a>
        </div>
      </div>
    </div>
  `;
}

function getSeverityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case 'critical': return '#dc2626';
    case 'high': return '#ea580c';
    case 'medium': return '#ca8a04';
    case 'low': return '#059669';
    default: return '#6b7280';
  }
}