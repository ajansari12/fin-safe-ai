
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

    // Define the reminder window (2 weeks before review)
    const now = new Date()
    const twoWeeksFromNow = new Date()
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)

    // Find policies that need review in the next two weeks and haven't had reminders sent
    const { data: upcomingReviews, error } = await supabase
      .from('governance_review_schedule')
      .select(`
        id,
        next_review_date,
        reminder_sent,
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
      .lt('next_review_date', twoWeeksFromNow.toISOString())
      .gt('next_review_date', now.toISOString())

    if (error) {
      throw error
    }

    // Process each upcoming review
    const results = []
    for (const review of upcomingReviews || []) {
      try {
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
        const reviewDate = new Date(review.next_review_date)
        const formattedDate = reviewDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

        // Send reminder email
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'Operational Resilience <notifications@resilienceportal.com>',
          to: userEmails.map(u => u.email),
          subject: `Governance Policy Review Reminder: ${review.governance_policies.title}`,
          html: `
            <h2>Governance Policy Review Reminder</h2>
            <p>This is a reminder that the following governance policy is due for review:</p>
            <ul>
              <li><strong>Policy:</strong> ${review.governance_policies.title}</li>
              <li><strong>Framework:</strong> ${review.governance_policies.governance_frameworks.title}</li>
              <li><strong>Review Due:</strong> ${formattedDate}</li>
            </ul>
            <p>Please complete the review before the due date to ensure compliance with your governance review cycle.</p>
            <p><a href="${supabaseUrl}/governance-framework/${review.governance_policies.framework_id}">Review Policy</a></p>
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
