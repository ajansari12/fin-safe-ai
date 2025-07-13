import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BreachEvent {
  toleranceId: string;
  operationName: string;
  breachType: 'rto' | 'rpo' | 'service_level';
  severity: 'low' | 'medium' | 'high' | 'critical';
  actualValue: number;
  thresholdValue: number;
  variance: number;
  detectedAt: string;
}

interface OrganizationalProfile {
  employee_count: number;
  size: string;
  sector: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { 
      breachEvent, 
      orgProfile, 
      osfiCitation, 
      disclaimer, 
      proportionalityMode 
    }: {
      breachEvent: BreachEvent;
      orgProfile: OrganizationalProfile;
      osfiCitation: string;
      disclaimer: string;
      proportionalityMode: 'small_frfi' | 'large_bank';
    } = await req.json();

    // Get organization details and admin users
    const { data: profiles, error: profilesError } = await supabaseClient.auth.admin.listUsers();
    
    if (profilesError) {
      throw profilesError;
    }

    // Get admin users for the organization
    const { data: adminProfiles, error: adminError } = await supabaseClient
      .from('user_roles')
      .select(`
        user_id,
        profiles!inner(full_name, organization_id)
      `)
      .eq('role', 'admin')
      .eq('profiles.organization_id', breachEvent.toleranceId); // This would need the actual org_id

    if (adminError) {
      console.error('Error getting admin profiles:', adminError);
    }

    // Extract admin emails
    const adminEmails = profiles.users
      .filter(user => adminProfiles?.some(admin => admin.user_id === user.id))
      .map(user => user.email)
      .filter(email => email) as string[];

    // Create E-21 compliant email content
    const severityColor = breachEvent.severity === 'critical' ? '#dc2626' : 
                         breachEvent.severity === 'high' ? '#ea580c' : 
                         breachEvent.severity === 'medium' ? '#d97706' : '#059669';

    const subject = `OSFI E-21 ${breachEvent.severity.toUpperCase()} Alert: ${breachEvent.operationName} Tolerance Breach`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">OSFI E-21 Tolerance Breach Alert</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Operational Risk Management & Resilience Framework</p>
        </div>
        
        <!-- Alert Badge -->
        <div style="background-color: ${breachEvent.severity === 'critical' ? '#fee2e2' : breachEvent.severity === 'high' ? '#fed7aa' : '#fef3c7'}; padding: 20px; margin: 0;">
          <div style="display: flex; align-items: center; justify-content: center;">
            <span style="background-color: ${severityColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
              ${breachEvent.severity.toUpperCase()} BREACH DETECTED
            </span>
          </div>
        </div>
        
        <!-- OSFI E-21 Citation -->
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 0;">
          <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px;">📋 OSFI E-21 Regulatory Context</h3>
          <p style="margin: 0; color: #1e40af; font-weight: 500;">
            ${osfiCitation}
          </p>
        </div>
        
        <!-- Breach Details -->
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 20px 0; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
            Breach Details
          </h2>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <p style="margin: 0 0 8px 0;"><strong>Critical Operation:</strong></p>
                <p style="margin: 0; color: #374151;">${breachEvent.operationName}</p>
              </div>
              <div>
                <p style="margin: 0 0 8px 0;"><strong>Breach Type:</strong></p>
                <p style="margin: 0; color: #374151;">${breachEvent.breachType.toUpperCase()} Tolerance</p>
              </div>
              <div>
                <p style="margin: 0 0 8px 0;"><strong>Detected:</strong></p>
                <p style="margin: 0; color: #374151;">${new Date(breachEvent.detectedAt).toLocaleString()}</p>
              </div>
              <div>
                <p style="margin: 0 0 8px 0;"><strong>Severity Level:</strong></p>
                <p style="margin: 0; color: ${severityColor}; font-weight: bold;">${breachEvent.severity.toUpperCase()}</p>
              </div>
            </div>
          </div>
          
          <!-- Performance Metrics -->
          <div style="background-color: #fff7ed; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #ea580c;">⚡ Performance Metrics</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; text-align: center;">
              <div>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Actual Value</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #dc2626;">${breachEvent.actualValue}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Threshold</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #059669;">${breachEvent.thresholdValue}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Variance</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ea580c;">+${breachEvent.variance}%</p>
              </div>
            </div>
          </div>
          
          <!-- Proportional Response Actions -->
          <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #0369a1;">
              🎯 ${proportionalityMode === 'small_frfi' ? 'Small FRFI' : 'Large Bank'} Response Actions
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              ${proportionalityMode === 'small_frfi' ? `
                <li style="margin-bottom: 8px;">Acknowledge breach in tolerance monitoring system</li>
                <li style="margin-bottom: 8px;">Assess immediate operational impact</li>
                <li style="margin-bottom: 8px;">Implement containment measures per E-21 Principle 7</li>
                <li style="margin-bottom: 8px;">Document remediation actions</li>
                <li style="margin-bottom: 0;">Review tolerance levels for adequacy</li>
              ` : `
                <li style="margin-bottom: 8px;"><strong>Immediate:</strong> Activate incident response team (E-21 Principle 5)</li>
                <li style="margin-bottom: 8px;"><strong>Assessment:</strong> Conduct detailed impact analysis per Principle 6</li>
                <li style="margin-bottom: 8px;"><strong>Containment:</strong> Implement emergency procedures and backup systems</li>
                <li style="margin-bottom: 8px;"><strong>Communication:</strong> Notify stakeholders and customers as required</li>
                <li style="margin-bottom: 8px;"><strong>Escalation:</strong> Alert senior management and board (Principle 1)</li>
                <li style="margin-bottom: 8px;"><strong>Recovery:</strong> Execute business continuity plans</li>
                <li style="margin-bottom: 0;"><strong>Analysis:</strong> Conduct post-incident review and scenario testing updates</li>
              `}
            </ul>
          </div>
          
          <!-- OSFI E-21 Principles Reference -->
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #475569;">📚 Relevant OSFI E-21 Principles</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
              <div>• <strong>Principle 1:</strong> Governance & Oversight</div>
              <div>• <strong>Principle 5:</strong> Monitoring & Reporting</div>
              <div>• <strong>Principle 6:</strong> Critical Operations Mapping</div>
              <div>• <strong>Principle 7:</strong> Disruption Tolerances</div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
            <strong>Regulatory Disclaimer:</strong>
          </p>
          <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
            ${disclaimer}
          </p>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #d1d5db;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              This automated alert was generated by your ResilientFI OSFI E-21 Compliance System<br>
              Organization Size: ${orgProfile.size} • Sector: ${orgProfile.sector} • Employee Count: ${orgProfile.employee_count}
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email alerts (if admin emails found)
    if (adminEmails.length > 0) {
      const emailPromises = adminEmails.map(email => 
        supabaseClient.functions.invoke('send-email-notification', {
          body: {
            to: [email],
            subject: subject,
            html: htmlContent
          }
        })
      );

      await Promise.all(emailPromises);
    }

    // TODO: Add SMS capability here using a service like Twilio
    // This would follow the same pattern as email notifications

    console.log(`OSFI E-21 tolerance breach alert sent: ${breachEvent.severity} - ${breachEvent.operationName}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Enhanced tolerance breach alert sent to ${adminEmails.length} administrators`,
        breachDetails: {
          operation: breachEvent.operationName,
          severity: breachEvent.severity,
          variance: breachEvent.variance,
          proportionalityMode
        },
        osfiCompliance: {
          citation: osfiCitation,
          principlesReferenced: ['1', '5', '6', '7']
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error sending tolerance breach alert:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        context: 'OSFI E-21 tolerance breach notification system'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
};

serve(handler);