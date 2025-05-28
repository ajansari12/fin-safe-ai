
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

    const { userId, organizationId } = await req.json();

    if (!userId || !organizationId) {
      return new Response(
        JSON.stringify({ error: "Missing userId or organizationId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch user profile: ${profileError.message}`);
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabaseClient
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    if (orgError) {
      throw new Error(`Failed to fetch organization: ${orgError.message}`);
    }

    // Get user email from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId);

    if (userError || !user) {
      throw new Error(`Failed to fetch user: ${userError?.message}`);
    }

    const welcomeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ResilientFI</h1>
        </div>
        
        <div style="padding: 40px 20px; background: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${profile?.full_name || 'there'}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to ResilientFI! Your organization <strong>${organization?.name}</strong> has been successfully set up.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            You can now access your operational risk management dashboard and start building your resilience framework.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.vercel.app') || 'https://resilientfi.com'}/dashboard" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
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
    `;

    // Send welcome email
    await resend.emails.send({
      from: "ResilientFI <welcome@resilientfi.com>",
      to: [user.email || ''],
      subject: `Welcome to ResilientFI - ${organization?.name}`,
      html: welcomeEmailHtml,
    });

    console.log(`Welcome email sent to ${user.email} for organization ${organization?.name}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Welcome email sent successfully" 
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
    console.error("Error in send-welcome-email function:", error);
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
