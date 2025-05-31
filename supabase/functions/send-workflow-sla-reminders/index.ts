
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowStep {
  id: string;
  workflow_instance_id: string;
  step_name: string;
  assigned_to: string;
  assigned_to_name: string;
  due_date: string;
  sla_hours: number;
  workflow_instance: {
    name: string;
    org_id: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for overdue workflow steps...");

    // Get workflow steps that are overdue and haven't had reminders sent recently
    const { data: overdueSteps, error: stepsError } = await supabase
      .from('workflow_steps')
      .select(`
        id,
        workflow_instance_id,
        step_name,
        assigned_to,
        assigned_to_name,
        due_date,
        sla_hours,
        workflow_instances!inner(
          name,
          org_id
        )
      `)
      .eq('status', 'pending')
      .lt('due_date', new Date().toISOString())
      .not('sla_hours', 'is', null)
      .or('reminder_sent_at.is.null,reminder_sent_at.lt.' + 
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (stepsError) {
      console.error('Error fetching overdue steps:', stepsError);
      throw stepsError;
    }

    console.log(`Found ${overdueSteps?.length || 0} overdue workflow steps`);

    if (!overdueSteps || overdueSteps.length === 0) {
      return new Response(
        JSON.stringify({ message: "No overdue workflow steps found" }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Process each overdue step
    for (const step of overdueSteps) {
      try {
        // Get user email for the assigned person
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', step.assigned_to)
          .single();

        if (profileError || !profile) {
          console.log(`No profile found for user ${step.assigned_to}`);
          continue;
        }

        // Get user email from auth.users
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(step.assigned_to);

        if (userError || !user?.email) {
          console.log(`No email found for user ${step.assigned_to}`);
          continue;
        }

        const hoursOverdue = Math.floor(
          (Date.now() - new Date(step.due_date).getTime()) / (1000 * 60 * 60)
        );

        // Send reminder email
        const emailResponse = await resend.emails.send({
          from: "Workflow System <noreply@resend.dev>",
          to: [user.email],
          subject: `Workflow Step Overdue: ${step.step_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #dc2626;">Workflow Step Overdue</h1>
              
              <p>Hello ${step.assigned_to_name},</p>
              
              <p>You have a workflow step that is overdue and requires your attention:</p>
              
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin: 0 0 10px 0;">Overdue Step Details</h3>
                <p><strong>Workflow:</strong> ${step.workflow_instance.name}</p>
                <p><strong>Step:</strong> ${step.step_name}</p>
                <p><strong>Due Date:</strong> ${new Date(step.due_date).toLocaleDateString()}</p>
                <p><strong>Hours Overdue:</strong> ${hoursOverdue} hours</p>
                <p><strong>SLA:</strong> ${step.sla_hours} hours</p>
              </div>
              
              <p>Please log into the system to complete this step as soon as possible.</p>
              
              <p style="margin-top: 30px;">
                <a href="${Deno.env.get("SITE_URL") || "https://your-app.com"}/workflow-center" 
                   style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Workflow
                </a>
              </p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated reminder. Please do not reply to this email.
              </p>
            </div>
          `,
        });

        console.log(`Reminder sent for step ${step.id}:`, emailResponse);

        // Update reminder_sent_at timestamp
        await supabase
          .from('workflow_steps')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', step.id);

        // Call the SLA breach function to log the breach
        await supabase.rpc('check_workflow_step_sla_breaches');

      } catch (stepError) {
        console.error(`Error processing step ${step.id}:`, stepError);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${overdueSteps.length} overdue workflow steps`,
        processed_steps: overdueSteps.length
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error("Error in send-workflow-sla-reminders function:", error);
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
