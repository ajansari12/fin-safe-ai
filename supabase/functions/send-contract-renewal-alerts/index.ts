
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContractAlert {
  id: string;
  contract_id: string;
  days_until_expiry: number;
  vendor_contracts: {
    contract_name: string;
    responsible_user_name: string;
    responsible_user_id: string;
    third_party_profiles: {
      vendor_name: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting contract renewal alert check...");

    // First, run the function to check for expiring contracts
    const { error: checkError } = await supabase.rpc('check_expiring_contracts');
    
    if (checkError) {
      console.error('Error checking expiring contracts:', checkError);
      throw checkError;
    }

    // Get pending contract renewal alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('contract_renewal_alerts')
      .select(`
        id,
        contract_id,
        days_until_expiry,
        vendor_contracts!inner (
          contract_name,
          responsible_user_name,
          responsible_user_id,
          third_party_profiles!inner (
            vendor_name
          )
        )
      `)
      .eq('status', 'pending')
      .is('email_sent_at', null);

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      throw alertsError;
    }

    console.log(`Found ${alerts?.length || 0} pending contract alerts`);

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending contract alerts found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let emailsSent = 0;

    // Send email alerts
    for (const alert of alerts as ContractAlert[]) {
      try {
        const contract = alert.vendor_contracts;
        const vendorName = contract.third_party_profiles.vendor_name;
        
        // Construct recipient email (fallback to a default if user name not available)
        const recipientEmail = contract.responsible_user_name 
          ? `${contract.responsible_user_name.toLowerCase().replace(/\s+/g, '.')}@company.com`
          : 'contracts@company.com';

        const urgencyLevel = alert.days_until_expiry <= 30 ? 'URGENT' : 'NOTICE';
        const urgencyColor = alert.days_until_expiry <= 30 ? '#dc2626' : '#f59e0b';

        await resend.emails.send({
          from: "Risk Management <risk@company.com>",
          to: [recipientEmail],
          subject: `${urgencyLevel}: Contract Renewal Required - ${vendorName}`,
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <div style="background-color: ${urgencyColor}; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">${urgencyLevel}: Contract Renewal Required</h1>
              </div>
              
              <div style="padding: 30px; background-color: #f9f9f9;">
                <h2 style="color: #333; margin-top: 0;">Contract Expiring Soon</h2>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Contract Details</h3>
                  <p><strong>Vendor:</strong> ${vendorName}</p>
                  <p><strong>Contract:</strong> ${contract.contract_name}</p>
                  <p><strong>Days Until Expiry:</strong> <span style="color: ${urgencyColor}; font-weight: bold;">${alert.days_until_expiry} days</span></p>
                  <p><strong>Responsible Person:</strong> ${contract.responsible_user_name || 'Not assigned'}</p>
                </div>

                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Required Actions</h3>
                  <ul style="color: #555; line-height: 1.6;">
                    <li>Review the current contract terms</li>
                    <li>Contact the vendor to initiate renewal discussions</li>
                    <li>Prepare any amendments or updates needed</li>
                    <li>Ensure budget approval for contract renewal</li>
                    <li>Update the contract management system once renewed</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${supabaseUrl}/dashboard/third-party-risk" 
                     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    View in Risk Management System
                  </a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  This is an automated alert from the Risk Management System. Please do not reply to this email.
                </p>
              </div>
            </div>
          `,
        });

        // Update alert status
        await supabase
          .from('contract_renewal_alerts')
          .update({
            status: 'sent',
            email_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', alert.id);

        emailsSent++;
        console.log(`Sent contract renewal alert for ${vendorName} to ${recipientEmail}`);

      } catch (emailError) {
        console.error(`Failed to send email for alert ${alert.id}:`, emailError);
        
        // Mark as failed (you might want to add a 'failed' status to your schema)
        await supabase
          .from('contract_renewal_alerts')
          .update({
            status: 'pending', // Keep as pending to retry later
            updated_at: new Date().toISOString()
          })
          .eq('id', alert.id);
      }
    }

    console.log(`Contract renewal alert job completed. Sent ${emailsSent} emails.`);

    return new Response(
      JSON.stringify({ 
        message: `Contract renewal alerts processed successfully. Sent ${emailsSent} emails.`,
        alertsProcessed: alerts.length,
        emailsSent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in contract renewal alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
