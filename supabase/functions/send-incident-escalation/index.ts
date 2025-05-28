
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { incidentId, escalationId, escalationReason } = await req.json();

    if (!incidentId || !escalationId) {
      return new Response(
        JSON.stringify({ error: "Missing incidentId or escalationId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get incident details
    const { data: incident, error: incidentError } = await supabaseClient
      .from('incident_logs')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (incidentError || !incident) {
      throw new Error(`Failed to fetch incident: ${incidentError?.message}`);
    }

    // Get escalation details
    const { data: escalation, error: escalationError } = await supabaseClient
      .from('incident_escalations')
      .select('*')
      .eq('id', escalationId)
      .single();

    if (escalationError || !escalation) {
      throw new Error(`Failed to fetch escalation: ${escalationError?.message}`);
    }

    // Determine supervisor emails based on escalation level and severity
    let supervisorEmails: string[] = [];
    
    // Get organization users by role/level
    const { data: orgUsers } = await supabaseClient
      .from('profiles')
      .select('id, full_name, role')
      .eq('organization_id', incident.org_id);

    if (escalation.escalation_level === 1) {
      // Escalate to managers
      supervisorEmails = orgUsers?.filter(u => u.role === 'manager').map(u => `${u.full_name}@company.com`) || [];
    } else if (escalation.escalation_level >= 2) {
      // Escalate to executives
      supervisorEmails = orgUsers?.filter(u => u.role === 'admin').map(u => `${u.full_name}@company.com`) || [];
    }

    // Fallback to a default supervisor email if none found
    if (supervisorEmails.length === 0) {
      supervisorEmails = ['supervisor@company.com'];
    }

    const severityColors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    
    const severityColor = severityColors[incident.severity as keyof typeof severityColors] || '#6c757d';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${severityColor}; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Incident Escalation</h1>
        </div>
        
        <div style="padding: 30px 20px; background: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Incident Requires Immediate Attention</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            An incident has been escalated to level ${escalation.escalation_level} and requires your immediate attention:
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Escalation Details</h3>
            <p style="margin: 10px 0; color: #666;"><strong>Reason:</strong> ${escalationReason}</p>
            <p style="margin: 10px 0; color: #666;"><strong>Escalation Level:</strong> ${escalation.escalation_level}</p>
            <p style="margin: 10px 0; color: #666;"><strong>Escalation Type:</strong> ${escalation.escalation_type.replace('_', ' ').toUpperCase()}</p>
          </div>
          
          <div style="background: #e9ecef; border-left: 4px solid ${severityColor}; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">${incident.title}</h3>
            <p style="margin: 10px 0; color: #666;"><strong>Incident ID:</strong> ${incident.id.substring(0, 8)}</p>
            <p style="margin: 10px 0; color: #666;"><strong>Severity:</strong> <span style="background: ${severityColor}; color: white; padding: 2px 8px; border-radius: 3px; text-transform: uppercase; font-size: 12px;">${incident.severity}</span></p>
            <p style="margin: 10px 0; color: #666;"><strong>Status:</strong> ${incident.status.replace('_', ' ').toUpperCase()}</p>
            <p style="margin: 10px 0; color: #666;"><strong>Reported:</strong> ${new Date(incident.reported_at).toLocaleString()}</p>
            ${incident.max_response_time_hours ? `<p style="margin: 10px 0; color: #666;"><strong>Response SLA:</strong> ${incident.max_response_time_hours} hours</p>` : ''}
            ${incident.max_resolution_time_hours ? `<p style="margin: 10px 0; color: #666;"><strong>Resolution SLA:</strong> ${incident.max_resolution_time_hours} hours</p>` : ''}
          </div>
          
          ${incident.description ? `
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">Description:</h4>
            <p style="color: #666; line-height: 1.6; margin: 0;">${incident.description}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.vercel.app') || 'https://resilientfi.com'}/incident-log" style="background: ${severityColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Incident Details
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Please review this incident immediately and take appropriate action.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The ResilientFI Incident Management System
          </p>
        </div>
      </div>
    `;

    // Send escalation notification to supervisors
    for (const email of supervisorEmails) {
      await resend.emails.send({
        from: "ResilientFI Incidents <incidents@resilientfi.com>",
        to: [email],
        subject: `ESCALATED: ${incident.severity.toUpperCase()} - ${incident.title}`,
        html: emailHtml,
      });
    }

    console.log(`Incident escalation email sent to ${supervisorEmails.join(', ')} for incident ${incident.title}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Incident escalation email sent successfully",
        recipients: supervisorEmails
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-incident-escalation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
