
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SLAAlert {
  id: string;
  vendor_profile_id: string;
  alert_type: string;
  alert_date: string;
  days_before_alert: number;
  vendor_profile: {
    vendor_name: string;
    service_provided: string;
    contact_email: string;
    sla_expiry_date: string;
    contract_end_date: string;
  };
}

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

    // Get pending alerts that are due
    const today = new Date().toISOString().split('T')[0];
    
    const { data: alerts, error: alertsError } = await supabaseClient
      .from('vendor_sla_alerts')
      .select(`
        *,
        vendor_profile:third_party_profiles(
          vendor_name,
          service_provided,
          contact_email,
          sla_expiry_date,
          contract_end_date
        )
      `)
      .eq('status', 'pending')
      .lte('alert_date', today);

    if (alertsError) {
      throw alertsError;
    }

    console.log(`Found ${alerts?.length || 0} pending alerts`);

    for (const alert of alerts || []) {
      try {
        const vendor = alert.vendor_profile;
        const alertType = alert.alert_type.replace('_', ' ');
        
        let subject = `SLA Alert: ${alertType} for ${vendor.vendor_name}`;
        let expiryDate = '';
        
        if (alert.alert_type === 'sla_expiry' && vendor.sla_expiry_date) {
          expiryDate = new Date(vendor.sla_expiry_date).toLocaleDateString();
          subject = `SLA Expiring Soon: ${vendor.vendor_name}`;
        } else if (alert.alert_type === 'contract_renewal' && vendor.contract_end_date) {
          expiryDate = new Date(vendor.contract_end_date).toLocaleDateString();
          subject = `Contract Renewal Required: ${vendor.vendor_name}`;
        }

        const emailContent = `
          <h2>Third-Party Risk Alert</h2>
          <p><strong>Vendor:</strong> ${vendor.vendor_name}</p>
          <p><strong>Service:</strong> ${vendor.service_provided}</p>
          <p><strong>Alert Type:</strong> ${alertType}</p>
          ${expiryDate ? `<p><strong>Expiry Date:</strong> ${expiryDate}</p>` : ''}
          <p><strong>Days Before Alert:</strong> ${alert.days_before_alert}</p>
          
          <h3>Action Required</h3>
          <p>Please review this vendor's ${alert.alert_type.includes('sla') ? 'SLA' : 'contract'} and take appropriate action.</p>
          
          <p>Login to your ResilientFI dashboard to manage this alert.</p>
        `;

        // Send email to vendor contact if available
        if (vendor.contact_email) {
          await resend.emails.send({
            from: "ResilientFI <alerts@resend.dev>",
            to: [vendor.contact_email],
            subject: subject,
            html: emailContent,
          });
        }

        // Also send to internal team (you might want to get organization admin emails)
        // For now, sending to a placeholder email
        await resend.emails.send({
          from: "ResilientFI <alerts@resend.dev>",
          to: ["admin@company.com"], // Replace with actual admin email logic
          subject: `Internal Alert: ${subject}`,
          html: emailContent,
        });

        // Update alert status to sent
        await supabaseClient
          .from('vendor_sla_alerts')
          .update({
            status: 'sent',
            email_sent_at: new Date().toISOString()
          })
          .eq('id', alert.id);

        console.log(`Alert sent for vendor: ${vendor.vendor_name}`);
      } catch (emailError) {
        console.error(`Failed to send alert for vendor ${alert.vendor_profile?.vendor_name}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alertsSent: alerts?.length || 0 
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
    console.error("Error in send-sla-alerts function:", error);
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
