
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { varianceId } = await req.json()

    // Get variance details
    const { data: variance, error: varianceError } = await supabaseClient
      .from('kri_appetite_variance')
      .select(`
        *,
        kri_definitions!inner(
          name,
          description,
          org_id,
          profiles!inner(organization_id)
        )
      `)
      .eq('id', varianceId)
      .single()

    if (varianceError) {
      throw varianceError
    }

    // Only send alerts for warning and breach statuses
    if (!['warning', 'breach'].includes(variance.variance_status)) {
      return new Response(
        JSON.stringify({ message: 'No alert needed for this variance status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get organization details and admin users
    const { data: orgProfiles, error: orgError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, organization_id')
      .eq('organization_id', variance.kri_definitions.profiles.organization_id)
      .eq('role', 'admin')

    if (orgError) {
      throw orgError
    }

    // Get organization details
    const { data: org, error: orgDetailsError } = await supabaseClient
      .from('organizations')
      .select('name')
      .eq('id', variance.kri_definitions.profiles.organization_id)
      .single()

    if (orgDetailsError) {
      throw orgDetailsError
    }

    // Get user emails from auth.users for notifications
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers()
    
    if (authError) {
      throw authError
    }

    const adminEmails = orgProfiles
      .map(profile => {
        const authUser = authUsers.users.find(user => user.id === profile.id)
        return authUser?.email
      })
      .filter(email => email) as string[]

    if (adminEmails.length === 0) {
      console.log('No admin emails found for organization')
      return new Response(
        JSON.stringify({ message: 'No admin emails found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare email content
    const subject = `KRI Appetite ${variance.variance_status === 'breach' ? 'Breach' : 'Warning'}: ${variance.kri_definitions.name}`
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${variance.variance_status === 'breach' ? '#fee2e2' : '#fef3c7'}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: ${variance.variance_status === 'breach' ? '#dc2626' : '#d97706'}; margin: 0;">
            KRI Appetite ${variance.variance_status === 'breach' ? 'Breach' : 'Warning'}
          </h2>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">KRI Details</h3>
          <p><strong>KRI Name:</strong> ${variance.kri_definitions.name}</p>
          <p><strong>Measurement Date:</strong> ${new Date(variance.measurement_date).toLocaleDateString()}</p>
          <p><strong>Actual Value:</strong> ${variance.actual_value}</p>
          <p><strong>Appetite Threshold:</strong> ${variance.appetite_threshold || 'Not set'}</p>
          <p><strong>Variance:</strong> ${variance.variance_percentage ? `${variance.variance_percentage.toFixed(2)}%` : 'N/A'}</p>
          <p><strong>Status:</strong> <span style="color: ${variance.variance_status === 'breach' ? '#dc2626' : '#d97706'};">${variance.variance_status.toUpperCase()}</span></p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0;">Next Steps</h3>
          <ul>
            <li>Review the KRI measurement and validate the data</li>
            <li>Assess the impact on organizational risk appetite</li>
            <li>Consider implementing additional controls if necessary</li>
            <li>Document any actions taken in the KRI log</li>
          </ul>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p>This is an automated notification from your Risk Management System</p>
          <p>Organization: ${org.name}</p>
        </div>
      </div>
    `

    // Send email to each admin
    const emailPromises = adminEmails.map(email => 
      supabaseClient.functions.invoke('send-email-notification', {
        body: {
          to: email,
          subject: subject,
          html: htmlContent
        }
      })
    )

    await Promise.all(emailPromises)

    console.log(`KRI appetite ${variance.variance_status} alert sent for variance ${varianceId}`)

    return new Response(
      JSON.stringify({ 
        message: `Alert sent successfully to ${adminEmails.length} administrators`,
        variance_status: variance.variance_status,
        kri_name: variance.kri_definitions.name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending KRI appetite breach alert:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
