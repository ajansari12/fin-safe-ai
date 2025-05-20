
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Replace with your Resend API key during deployment or set in Supabase dashboard
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "re_123456789";
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { name, email, company, message }: ContactFormData = await req.json();

    // Validate required fields
    if (!name || !email || !company || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "ResilientFI <no-reply@resilientfi.com>",
      to: ["admin@resilientfi.com"],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "ResilientFI <no-reply@resilientfi.com>",
      to: [email],
      subject: "Thank you for contacting ResilientFI",
      html: `
        <h2>Thank you for reaching out to ResilientFI!</h2>
        <p>Hello ${name},</p>
        <p>We've received your message and will get back to you shortly. A member of our team will review your inquiry and follow up with you within 1-2 business days.</p>
        <p>For your reference, here's a copy of your message:</p>
        <p>${message}</p>
        <p>Best regards,<br/>The ResilientFI Team</p>
      `,
    });

    console.log("Emails sent successfully:", {
      admin: adminEmailResponse,
      user: userEmailResponse,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
