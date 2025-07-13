
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
  from?: string;
  priority?: 'normal' | 'high' | 'urgent' | 'critical';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const resend = new Resend(resendApiKey);
    const { to, subject, html, from, priority = 'normal' }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !Array.isArray(to) || to.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing 'to' field. Must be a non-empty array." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: 'subject' and 'html'" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Format subject with priority indicators
    const priorityPrefix = {
      'critical': '🚨 CRITICAL',
      'urgent': '⚠️ URGENT',
      'high': '🔴 HIGH PRIORITY',
      'normal': ''
    }[priority];

    const formattedSubject = priorityPrefix ? `${priorityPrefix} - ${subject}` : subject;

    console.log(`Sending ${priority} priority email to: ${to.join(', ')}, Subject: ${formattedSubject}`);

    // Enhanced HTML with priority styling
    const styledHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${priority !== 'normal' ? `
          <div style="background-color: ${
            priority === 'critical' ? '#dc2626' : 
            priority === 'urgent' ? '#ea580c' : 
            '#d97706'
          }; color: white; padding: 16px; text-align: center; font-weight: bold; margin-bottom: 20px; border-radius: 8px;">
            ${priorityPrefix} NOTIFICATION
          </div>
        ` : ''}
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          ${html}
        </div>
        <div style="margin-top: 20px; padding: 16px; background-color: #f3f4f6; border-radius: 8px; font-size: 12px; color: #6b7280;">
          <p><strong>Mobile Optimized:</strong> This email is optimized for mobile viewing for immediate response.</p>
          <p><strong>Regulatory Notice:</strong> This notification may contain OSFI E-21 and B-10 compliance information. Consult qualified professionals for regulatory guidance.</p>
        </div>
      </div>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: from || "ResilientFI <no-reply@resilientfi.com>",
      to,
      subject: formattedSubject,
      html: styledHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: emailResponse.data?.id,
        message: "Email sent successfully" 
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
    console.error("Error in send-email-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
