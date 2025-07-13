import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  to: string[];
  message: string;
  priority?: 'normal' | 'high' | 'urgent';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFromNumber = Deno.env.get("TWILIO_FROM_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
      return new Response(
        JSON.stringify({ 
          error: "Missing Twilio configuration. Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER." 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { to, message, priority = 'normal' }: SMSRequest = await req.json();

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

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Missing required field: 'message'" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Prepare Twilio API credentials
    const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    console.log(`Sending SMS to: ${to.join(', ')}, Priority: ${priority}`);

    // Add priority prefix to message
    const priorityPrefix = priority === 'urgent' ? '🚨 URGENT: ' : 
                          priority === 'high' ? '⚠️ HIGH: ' : '';
    const finalMessage = `${priorityPrefix}${message}`;

    // Send SMS to each recipient
    const smsPromises = to.map(async (phoneNumber) => {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioFromNumber,
            To: phoneNumber,
            Body: finalMessage,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Twilio API error for ${phoneNumber}: ${error}`);
      }

      return await response.json();
    });

    const results = await Promise.all(smsPromises);
    
    console.log("SMS sent successfully:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: results.length,
        message: "SMS notifications sent successfully",
        results: results.map(r => ({ sid: r.sid, status: r.status }))
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
    console.error("Error in send-sms-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send SMS",
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