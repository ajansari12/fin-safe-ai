
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

    const { kriLogId } = await req.json();

    if (!kriLogId) {
      return new Response(
        JSON.stringify({ error: "Missing kriLogId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get KRI log with breach details
    const { data: kriLog, error: logError } = await supabaseClient
      .from('kri_logs')
      .select(`
        *,
        kri_definitions!inner (
          name,
          warning_threshold,
          critical_threshold,
          org_id
        )
      `)
      .eq('id', kriLogId)
      .single();

    if (logError || !kriLog) {
      throw new Error(`Failed to fetch KRI log: ${logError?.message}`);
    }

    // Only send alert if there's a threshold breach
    if (!kriLog.threshold_breached || kriLog.threshold_breached === 'none') {
      return new Response(
        JSON.stringify({ message: "No threshold breach detected, no alert sent" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const breachType = kriLog.threshold_breached;
    const severityColor = breachType === 'critical' ? '#dc3545' : '#ffc107';
    const severityText = breachType === 'critical' ? 'CRITICAL' : 'WARNING';

    // Get organization admin emails
    const { data: adminProfiles, error: adminError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('organization_id', kriLog.kri_definitions.org_id);

    if (adminError || !adminProfiles) {
      throw new Error(`Failed to fetch admin profiles: ${adminError?.message}`);
    }

    // Get admin user emails from auth
    const adminEmails = [];
    for (const profile of adminProfiles) {
      const { data: { user } } = await supabaseClient.auth.admin.getUserById(profile.id);
      if (user?.email) {
        adminEmails.push(user.email);
      }
    }

    if (adminEmails.length === 0) {
      console.log("No admin emails found for KRI breach notification");
      return new Response(
        JSON.stringify({ message: "No admin emails found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${severityColor}; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚨 KRI ${severityText} Breach</h1>
        </div>
        
        <div style="padding: 30px 20px; background: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Immediate Attention Required</h2>
          
          <div style="background: ${breachType === 'critical' ? '#f8d7da' : '#fff3cd'}; border: 1px solid ${breachType === 'critical' ? '#f5c6cb' : '#ffeaa7'}; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: ${breachType === 'critical' ? '#721c24' : '#856404'}; font-weight: bold;">
              ${severityText} threshold breach detected
            </p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">KRI Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${kriLog.kri_definitions.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Actual Value:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${kriLog.actual_value}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Threshold:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${breachType === 'critical' ? kriLog.kri_definitions.critical_threshold : kriLog.kri_definitions.warning_threshold}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Date:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${new Date(kriLog.measurement_date).toLocaleDateString()}</td>
            </tr>
          </table>
          
          <p style="color: #666; line-height: 1.6;">
            Please investigate this breach and take appropriate corrective action.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.vercel.app') || 'https://resilientfi.com'}/controls-and-kri" style="background: ${severityColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View KRI Dashboard
            </a>
          </div>
        </div>
      </div>
    `;

    // Send breach notification
    await resend.emails.send({
      from: "ResilientFI Alerts <alerts@resilientfi.com>",
      to: adminEmails,
      subject: `KRI ${severityText} Breach: ${kriLog.kri_definitions.name}`,
      html: emailHtml,
    });

    console.log(`KRI breach alert sent for ${kriLog.kri_definitions.name} to ${adminEmails.length} recipients`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "KRI breach alert sent successfully",
        recipients: adminEmails.length
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
    console.error("Error in send-kri-breach-alert function:", error);
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
