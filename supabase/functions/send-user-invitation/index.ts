import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: string;
  invitation_token: string;
  invited_by_name: string;
  organization_name: string;
  isResend?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      role, 
      invitation_token, 
      invited_by_name, 
      organization_name,
      isResend = false 
    }: InvitationRequest = await req.json();

    console.log(`Sending ${isResend ? 'resend' : 'new'} invitation to ${email} for role ${role}`);

    // Create the invitation accept URL
    const baseUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/accept-invitation?token=${invitation_token}`;

    // Generate role description
    const getRoleDescription = (role: string) => {
      switch (role) {
        case 'admin': return 'full administrative access to manage users, settings, and all organizational data';
        case 'analyst': return 'access to view and analyze risk data, generate reports, and manage assessments';
        case 'reviewer': return 'access to review and approve governance policies, audit findings, and compliance documentation';
        default: return 'user-level access to the platform';
      }
    };

    const roleDescription = getRoleDescription(role);

    const emailResponse = await resend.emails.send({
      from: "RiskGuard <noreply@yourdomain.com>",
      to: [email],
      subject: `${isResend ? '[Reminder] ' : ''}You're invited to join ${organization_name} on RiskGuard`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Organization Invitation</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 18px; color: #374151; margin-bottom: 24px; }
              .invitation-details { background-color: #f8fafc; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #3b82f6; }
              .role-badge { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 16px; font-size: 14px; font-weight: 500; margin: 8px 0; }
              .cta-button { display: inline-block; background-color: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
              .cta-button:hover { background-color: #2563eb; }
              .footer { background-color: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              .expiry-notice { color: #dc2626; font-weight: 500; margin-top: 16px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ RiskGuard</h1>
              </div>
              
              <div class="content">
                <div class="greeting">
                  Hello there!
                </div>
                
                <p><strong>${invited_by_name}</strong> has invited you to join <strong>${organization_name}</strong> on RiskGuard.</p>
                
                <div class="invitation-details">
                  <h3 style="margin-top: 0; color: #374151;">Your Invitation Details</h3>
                  <p><strong>Organization:</strong> ${organization_name}</p>
                  <p><strong>Role:</strong> <span class="role-badge">${role.charAt(0).toUpperCase() + role.slice(1)}</span></p>
                  <p><strong>Access Level:</strong> You'll have ${roleDescription}.</p>
                </div>
                
                <p>RiskGuard is a comprehensive risk management platform that helps organizations manage operational risk, compliance, and governance effectively.</p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${inviteUrl}" class="cta-button">Accept Invitation</a>
                </div>
                
                <p class="expiry-notice">⏰ This invitation expires in 7 days. Please accept it soon!</p>
                
                <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
                  If you're unable to click the button above, you can copy and paste this link into your browser:<br>
                  <a href="${inviteUrl}" style="color: #3b82f6; word-break: break-all;">${inviteUrl}</a>
                </p>
              </div>
              
              <div class="footer">
                <p>This invitation was sent by ${invited_by_name} from ${organization_name}.</p>
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                <p>© 2024 RiskGuard. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: `Invitation ${isResend ? 'resent' : 'sent'} successfully`,
      messageId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-user-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send invitation email'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);