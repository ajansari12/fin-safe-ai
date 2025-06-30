
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { recipients, subject, reportName, generatedDate, reportId, reportType } = await req.json();
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }

    const emailTemplate = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Regulatory Report Available</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Regulatory Report Available</h2>
            
            <p>A new regulatory report has been generated and is available for review:</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af;">Report Details</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Report Name:</strong> ${reportName}</li>
                <li><strong>Generated Date:</strong> ${new Date(generatedDate).toLocaleDateString()}</li>
                <li><strong>Report Type:</strong> ${reportType || 'Regulatory Compliance'}</li>
                <li><strong>Report ID:</strong> ${reportId}</li>
              </ul>
            </div>
            
            <p>Please log into the system to review and approve this report.</p>
            
            <div style="margin: 30px 0;">
              <a href="https://your-app-url.com/reporting" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                View Report
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6b7280;">
              This is an automated notification from your Regulatory Reporting System.
              If you have any questions, please contact your system administrator.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send emails to all recipients
    const emailPromises = recipients.map(async (email: string) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Regulatory Reports <reports@your-domain.com>',
          to: [email],
          subject: subject,
          html: emailTemplate,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send email to ${email}: ${error}`);
      }

      return response.json();
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successful} emails successfully${failed > 0 ? `, ${failed} failed` : ''}`,
        details: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending regulatory report emails:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
