
// This edge function checks for upcoming governance policy reviews and sends email reminders

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client - using service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY') as string
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is required')
    }
    const resend = new Resend(resendApiKey)

    // Get the current date
    const now = new Date()
    
    // Find policies that need review based on their reminder_days_before setting
    const { data: upcomingReviews, error } = await supabase
      .from('governance_review_schedule')
      .select(`
        id,
        next_review_date,
        reminder_sent,
        reminder_days_before,
        governance_policies!inner (
          id,
          title,
          framework_id,
          governance_frameworks!inner (
            id,
            title,
            org_id,
            profiles!inner (
              id,
              full_name,
              organization_id
            )
          )
        )
      `)
      .eq('reminder_sent', false)

    if (error) {
      throw error
    }

    // Process each upcoming review
    const results = []
    for (const review of upcomingReviews || []) {
      try {
        // Calculate if it's time to send a reminder based on reminder_days_before
        const reviewDate = new Date(review.next_review_date)
        const reminderDaysBefore = review.reminder_days_before || 14 // Default to 14 days if not specified
        
        const reminderDate = new Date(reviewDate)
        reminderDate.setDate(reviewDate.getDate() - reminderDaysBefore)
        
        // Check if today is the day to send the reminder (or if we're past due and reminder wasn't sent)
        if (now >= reminderDate) {
          // Get user emails for this organization
          const { data: users } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('organization_id', review.governance_policies.governance_frameworks.org_id)
          
          if (!users || users.length === 0) {
            results.push({
              reviewId: review.id,
              status: 'error',
              message: 'No users found for organization'
            })
            continue
          }

          // Get user emails
          const userEmails = []
          for (const user of users) {
            const { data: userData } = await supabase.auth.admin.getUserById(user.id)
            if (userData?.user?.email) {
              userEmails.push({
                email: userData.user.email,
                name: user.full_name || userData.user.email
              })
            }
          }

          if (userEmails.length === 0) {
            results.push({
              reviewId: review.id,
              status: 'error',
              message: 'No valid email addresses found'
            })
            continue
          }
          
          // Format the review date
          const formattedDate = reviewDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          
          // Calculate days until review is due
          const timeUntilReview = Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          const daysUntilMessage = timeUntilReview <= 0 
            ? "OVERDUE! Review was due today" 
            : `${timeUntilReview} day${timeUntilReview !== 1 ? 's' : ''} until due date`

          // Send reminder email
          const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'Operational Resilience <notifications@resilienceportal.com>',
            to: userEmails.map(u => u.email),
            subject: `Governance Policy Review Reminder: ${review.governance_policies.title}`,
            html: `
              <h2>Governance Policy Review Reminder</h2>
              <p>This is a reminder that the following governance policy is due for review:</p>
              <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 15px; margin: 20px 0; background-color: #f8fafc;">
                <p><strong>Policy:</strong> ${review.governance_policies.title}</p>
                <p><strong>Framework:</strong> ${review.governance_policies.governance_frameworks.title}</p>
                <p><strong>Review Due:</strong> ${formattedDate}</p>
                <p><strong>Status:</strong> <span style="color: ${timeUntilReview <= 0 ? 'red' : 'orange'}; font-weight: bold;">${daysUntilMessage}</span></p>
              </div>
              <p>Please complete the review before the due date to ensure compliance with your governance review cycle.</p>
              <p><a href="${supabaseUrl}/governance-framework/${review.governance_policies.framework_id}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Review Policy Now</a></p>
              <p>Thank you,<br>Operational Resilience Portal</p>
            `
          })

          if (emailError) {
            throw emailError
          }

          // Mark reminder as sent
          await supabase
            .from('governance_review_schedule')
            .update({ reminder_sent: true })
            .eq('id', review.id)

          results.push({
            reviewId: review.id,
            status: 'success',
            message: 'Reminder sent successfully',
            emailId: emailData?.id
          })
        } else {
          // Not yet time to send reminder
          results.push({
            reviewId: review.id,
            status: 'skipped',
            message: `Reminder scheduled for ${reminderDate.toISOString()}`
          })
        }
      } catch (err) {
        results.push({
          reviewId: review.id,
          status: 'error',
          message: err.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        count: results.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
