
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

    const { breachId } = await req.json()

    // Get breach details with related information
    const { data: breach, error: breachError } = await supabaseClient
      .from('appetite_breach_logs')
      .select(`
        *,
        risk_categories(name),
        risk_appetite_statements(title),
        risk_thresholds(tolerance_level, description)
      `)
      .eq('id', breachId)
      .single()

    if (breachError) {
      throw breachError
    }

    // Get organization details and admin users
    const { data: orgProfiles, error: orgError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, organization_id')
      .eq('organization_id', breach.org_id)
      .eq('role', 'admin')

    if (orgError) {
      throw orgError
    }

    // Get organization name
    const { data: org, error: orgDetailsError } = await supabaseClient
      .from('organizations')
      .select('name')
      .eq('id', breach.org_id)
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
    const severityLabel = breach.breach_severity === 'critical' ? 'CRITICAL' : 
                         breach.breach_severity === 'breach' ? 'BREACH' : 'WARNING'
    
    const subject = `Risk Appetite ${severityLabel}: ${breach.risk_categories?.name || 'Risk Category'}`
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${breach.breach_severity === 'critical' ? '#fee2e2' : breach.breach_severity === 'breach' ? '#fed7aa' : '#fef3c7'}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: ${breach.breach_severity === 'critical' ? '#dc2626' : breach.breach_severity === 'breach' ? '#ea580c' : '#d97706'}; margin: 0;">
            Risk Appetite ${severityLabel}
          </h2>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">Breach Details</h3>
          <p><strong>Risk Category:</strong> ${breach.risk_categories?.name || 'Unknown'}</p>
          <p><strong>Statement:</strong> ${breach.risk_appetite_statements?.title || 'N/A'}</p>
          <p><strong>Breach Date:</strong> ${new Date(breach.breach_date).toLocaleDateString()}</p>
          <p><strong>Severity:</strong> <span style="color: ${breach.breach_severity === 'critical' ? '#dc2626' : breach.breach_severity === 'breach' ? '#ea580c' : '#d97706'};">${severityLabel}</span></p>
          <p><strong>Actual Value:</strong> ${breach.actual_value}</p>
          <p><strong>Threshold Value:</strong> ${breach.threshold_value}</p>
          <p><strong>Variance:</strong> ${breach.variance_percentage ? `${breach.variance_percentage.toFixed(2)}%` : 'N/A'}</p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0;">Required Actions</h3>
          <ul>
            <li>Acknowledge this breach in the Risk Appetite Management system</li>
            <li>Assess the impact on organizational objectives</li>
            <li>Implement immediate containment measures if necessary</li>
            <li>Review and update risk controls as appropriate</li>
            <li>Document remediation actions taken</li>
            ${breach.breach_severity === 'critical' ? '<li><strong>CRITICAL:</strong> Notify senior management and board immediately</li>' : ''}
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
          to: [email],
          subject: subject,
          html: htmlContent
        }
      })
    )

    await Promise.all(emailPromises)

    // Mark alert as sent
    await supabaseClient
      .from('appetite_breach_logs')
      .update({ alert_sent: true })
      .eq('id', breachId)

    console.log(`Risk appetite ${breach.breach_severity} alert sent for breach ${breachId}`)

    return new Response(
      JSON.stringify({ 
        message: `Alert sent successfully to ${adminEmails.length} administrators`,
        breach_severity: breach.breach_severity,
        category: breach.risk_categories?.name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending risk appetite breach alert:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
