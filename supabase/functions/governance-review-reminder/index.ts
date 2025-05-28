
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewReminder {
  id: string;
  policy_id: string;
  policy_title: string;
  framework_title: string;
  next_review_date: string;
  reminder_days_before: number;
  assigned_reviewer: string;
  reviewer_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for governance review reminders...");

    // Get policies that need review reminders
    const { data: reviewsNeedingReminders, error: reviewsError } = await supabase
      .from('governance_review_schedule')
      .select(`
        id,
        policy_id,
        next_review_date,
        reminder_days_before,
        reminder_sent,
        governance_policies!inner (
          id,
          title,
          governance_frameworks!inner (
            title
          )
        )
      `)
      .eq('reminder_sent', false)
      .gte('next_review_date', new Date().toISOString())
      .lte('next_review_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

    if (reviewsError) {
      throw reviewsError;
    }

    console.log(`Found ${reviewsNeedingReminders?.length || 0} reviews needing reminders`);

    let emailsSent = 0;

    for (const review of reviewsNeedingReminders || []) {
      const nextReviewDate = new Date(review.next_review_date);
      const reminderDate = new Date(nextReviewDate);
      reminderDate.setDate(reminderDate.getDate() - (review.reminder_days_before || 14));

      const now = new Date();
      const shouldSendReminder = now >= reminderDate && now < nextReviewDate;

      if (shouldSendReminder && resendApiKey) {
        try {
          await resend.emails.send({
            from: "Governance <governance@yourdomain.com>",
            to: ["admin@yourdomain.com"], // In production, get actual reviewer emails
            subject: `Policy Review Due: ${review.governance_policies.title}`,
            html: `
              <h2>Policy Review Reminder</h2>
              <p>The following policy is due for review:</p>
              <ul>
                <li><strong>Policy:</strong> ${review.governance_policies.title}</li>
                <li><strong>Framework:</strong> ${review.governance_policies.governance_frameworks.title}</li>
                <li><strong>Due Date:</strong> ${nextReviewDate.toLocaleDateString()}</li>
              </ul>
              <p>Please complete your review before the due date.</p>
              <p><a href="${supabaseUrl.replace('supabase.co', 'vercel.app')}/governance-framework">Review Now</a></p>
            `,
          });

          // Mark reminder as sent
          await supabase
            .from('governance_review_schedule')
            .update({ reminder_sent: true })
            .eq('id', review.id);

          emailsSent++;
          console.log(`Sent reminder for policy: ${review.governance_policies.title}`);
        } catch (emailError) {
          console.error(`Failed to send email for policy ${review.governance_policies.title}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        message: `Processed ${reviewsNeedingReminders?.length || 0} reviews, sent ${emailsSent} reminders` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in governance review reminder function:", error);
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
