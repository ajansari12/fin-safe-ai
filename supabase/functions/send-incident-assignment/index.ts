
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { incidentId, assigneeId, reportedById } = await req.json();

    if (!incidentId || !assigneeId) {
      return new Response(
        JSON.stringify({ error: "Missing incidentId or assigneeId" }),
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

    // Get assignee email
    const { data: { user: assignee }, error: assigneeError } = await supabaseClient.auth.admin.getUserById(assigneeId);
    if (assigneeError || !assignee?.email) {
      throw new Error(`Failed to fetch assignee: ${assigneeError?.message}`);
    }

    // Get assignee profile for name
    const { data: assigneeProfile } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', assigneeId)
      .single();

    // Get reporter name if provided
    let reporterName = 'Unknown';
    if (reportedById) {
      const { data: reporterProfile } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('id', reportedById)
        .single();
      
      reporterName = reporterProfile?.full_name || 'Unknown';
    }

    const severityColors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    
    const severityColor = severityColors[incident.severity as keyof typeof severityColors] || '#6c757d';
    const assigneeName = assigneeProfile?.full_name || 'there';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${severityColor}; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎯 Incident Assignment</h1>
        </div>
        
        <div style="padding: 30px 20px; background: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${assigneeName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You have been assigned to handle the following incident:
          </p>
          
          <div style="background: #e9ecef; border-left: 4px solid ${severityColor}; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">${incident.title}</h3>
            <p style="margin: 10px 0; color: #666;"><strong>Incident ID:</strong> ${incident.id.substring(0, 8)}</p>
            <p style="margin: 10px 0; color: #666;"><strong>Severity:</strong> <span style="background: ${severityColor}; color: white; padding: 2px 8px; border-radius: 3px; text-transform: uppercase; font-size: 12px;">${incident.severity}</span></p>
            <p style="margin: 10px 0; color: #666;"><strong>Reported by:</strong> ${reporterName}</p>
            <p style="margin: 10px 0; color: #666;"><strong>Category:</strong> ${incident.category || 'Not specified'}</p>
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
            Please review the incident details and begin your response as soon as possible.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The ResilientFI Team
          </p>
        </div>
      </div>
    `;

    // Send assignment notification
    await resend.emails.send({
      from: "ResilientFI Incidents <incidents@resilientfi.com>",
      to: [assignee.email],
      subject: `Incident Assigned: ${incident.title}`,
      html: emailHtml,
    });

    console.log(`Incident assignment email sent to ${assignee.email} for incident ${incident.title}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Incident assignment email sent successfully" 
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
    console.error("Error in send-incident-assignment function:", error);
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
