import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRequest {
  org_id: string;
  integration_type: 'core_banking' | 'erp' | 'all';
  force_sync?: boolean;
}

interface MockAPIResponse {
  status: 'success' | 'partial' | 'failed';
  records_processed: number;
  records_success: number;
  records_failed: number;
  data: any;
  error_details?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const { org_id, integration_type, force_sync = false }: SyncRequest = await req.json();

      console.log(`Starting data sync for org: ${org_id}, type: ${integration_type}`);

      // Get active integrations for the organization
      const { data: integrations, error: integrationsError } = await supabase
        .from('integrations')
        .select('*')
        .eq('org_id', org_id)
        .eq('is_active', true);

      if (integrationsError) {
        throw new Error(`Failed to fetch integrations: ${integrationsError.message}`);
      }

      const syncResults = [];

      for (const integration of integrations || []) {
        // Skip if specific type requested and doesn't match
        if (integration_type !== 'all' && integration.integration_type !== integration_type) {
          continue;
        }

        console.log(`Syncing ${integration.integration_type} integration: ${integration.integration_name}`);

        try {
          let mockResponse: MockAPIResponse;

          // Simulate different integration sync scenarios
          if (integration.integration_type === 'core_banking') {
            mockResponse = await simulateCoreBankingSync();
          } else if (integration.integration_type === 'erp') {
            mockResponse = await simulateERPSync();
          } else {
            mockResponse = await simulateGenericSync();
          }

          // Log the sync event
          const { error: syncLogError } = await supabase
            .from('sync_events')
            .insert({
              org_id,
              entity_type: `${integration.integration_type}_data`,
              event_type: 'automated_sync',
              source_module: integration.integration_type,
              target_modules: ['risk_management', 'compliance'],
              sync_status: mockResponse.status,
              event_data: {
                integration_id: integration.id,
                integration_name: integration.integration_name,
                records_processed: mockResponse.records_processed,
                records_success: mockResponse.records_success,
                records_failed: mockResponse.records_failed,
                force_sync,
                timestamp: new Date().toISOString()
              },
              error_details: mockResponse.error_details ? { message: mockResponse.error_details } : null
            });

          if (syncLogError) {
            console.error('Failed to log sync event:', syncLogError);
          }

          // Update integration last sync timestamp
          await supabase
            .from('integrations')
            .update({
              last_sync_at: new Date().toISOString(),
              sync_status: mockResponse.status
            })
            .eq('id', integration.id);

          syncResults.push({
            integration_id: integration.id,
            integration_name: integration.integration_name,
            integration_type: integration.integration_type,
            ...mockResponse
          });

          // If this is an automated cron job, send notifications for failures
          if (!force_sync && mockResponse.status === 'failed') {
            await sendFailureNotification(supabase, org_id, integration, mockResponse);
          }

        } catch (syncError) {
          console.error(`Sync failed for ${integration.integration_name}:`, syncError);
          
          const failedResult = {
            integration_id: integration.id,
            integration_name: integration.integration_name,
            integration_type: integration.integration_type,
            status: 'failed' as const,
            records_processed: 0,
            records_success: 0,
            records_failed: 0,
            error_details: syncError.message
          };

          syncResults.push(failedResult);

          // Log failed sync
          await supabase
            .from('sync_events')
            .insert({
              org_id,
              entity_type: `${integration.integration_type}_data`,
              event_type: 'automated_sync',
              source_module: integration.integration_type,
              target_modules: ['risk_management', 'compliance'],
              sync_status: 'failed',
              event_data: {
                integration_id: integration.id,
                integration_name: integration.integration_name,
                force_sync,
                timestamp: new Date().toISOString()
              },
              error_details: { message: syncError.message, stack: syncError.stack }
            });
        }
      }

      console.log(`Completed data sync for org: ${org_id}. Results:`, syncResults);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Completed sync for ${syncResults.length} integrations`,
          results: syncResults,
          summary: {
            total_integrations: syncResults.length,
            successful: syncResults.filter(r => r.status === 'success').length,
            partial: syncResults.filter(r => r.status === 'partial').length,
            failed: syncResults.filter(r => r.status === 'failed').length,
            total_records: syncResults.reduce((sum, r) => sum + r.records_processed, 0)
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Handle GET request for sync status
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const org_id = url.searchParams.get('org_id');

      if (!org_id) {
        throw new Error('org_id parameter is required');
      }

      // Get recent sync events
      const { data: recentSyncs, error: syncsError } = await supabase
        .from('sync_events')
        .select('*')
        .eq('org_id', org_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (syncsError) {
        throw new Error(`Failed to fetch sync events: ${syncsError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          recent_syncs: recentSyncs,
          last_sync: recentSyncs?.[0] || null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );

  } catch (error) {
    console.error('Data sync automation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to execute data sync automation'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function simulateCoreBankingSync(): Promise<MockAPIResponse> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const success_rate = Math.random();
  
  if (success_rate > 0.9) {
    // 10% chance of failure
    return {
      status: 'failed',
      records_processed: 0,
      records_success: 0,
      records_failed: 0,
      data: null,
      error_details: 'Core banking API timeout - connection failed'
    };
  } else if (success_rate > 0.8) {
    // 10% chance of partial success
    const processed = Math.floor(Math.random() * 1000) + 500;
    const failed = Math.floor(processed * 0.1);
    return {
      status: 'partial',
      records_processed: processed,
      records_success: processed - failed,
      records_failed: failed,
      data: {
        customers: processed * 0.3,
        accounts: processed * 0.4,
        transactions: processed * 0.3
      }
    };
  } else {
    // 80% chance of full success
    const processed = Math.floor(Math.random() * 2000) + 1000;
    return {
      status: 'success',
      records_processed: processed,
      records_success: processed,
      records_failed: 0,
      data: {
        customers: Math.floor(processed * 0.2),
        accounts: Math.floor(processed * 0.3),
        transactions: Math.floor(processed * 0.5)
      }
    };
  }
}

async function simulateERPSync(): Promise<MockAPIResponse> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));
  
  const success_rate = Math.random();
  
  if (success_rate > 0.95) {
    // 5% chance of failure
    return {
      status: 'failed',
      records_processed: 0,
      records_success: 0,
      records_failed: 0,
      data: null,
      error_details: 'ERP authentication failed - invalid token'
    };
  } else if (success_rate > 0.85) {
    // 10% chance of partial success
    const processed = Math.floor(Math.random() * 800) + 200;
    const failed = Math.floor(processed * 0.05);
    return {
      status: 'partial',
      records_processed: processed,
      records_success: processed - failed,
      records_failed: failed,
      data: {
        financials: Math.floor(processed * 0.3),
        procurement: Math.floor(processed * 0.25),
        employees: Math.floor(processed * 0.25),
        riskEvents: Math.floor(processed * 0.2)
      }
    };
  } else {
    // 85% chance of full success
    const processed = Math.floor(Math.random() * 1500) + 500;
    return {
      status: 'success',
      records_processed: processed,
      records_success: processed,
      records_failed: 0,
      data: {
        financials: Math.floor(processed * 0.35),
        procurement: Math.floor(processed * 0.25),
        employees: Math.floor(processed * 0.25),
        riskEvents: Math.floor(processed * 0.15)
      }
    };
  }
}

async function simulateGenericSync(): Promise<MockAPIResponse> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  const processed = Math.floor(Math.random() * 500) + 100;
  return {
    status: 'success',
    records_processed: processed,
    records_success: processed,
    records_failed: 0,
    data: { generic_records: processed }
  };
}

async function sendFailureNotification(supabase: any, org_id: string, integration: any, result: MockAPIResponse) {
  try {
    // Get organization admin users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('organization_id', org_id)
      .in('role', ['admin', 'manager']);

    if (profilesError) {
      console.error('Failed to fetch admin profiles:', profilesError);
      return;
    }

    // Create notifications for admins
    const notifications = (profiles || []).map(profile => ({
      user_id: profile.id,
      org_id,
      notification_type: 'integration_failure',
      title: `Integration Sync Failed: ${integration.integration_name}`,
      message: `The ${integration.integration_type} integration failed to sync data. Error: ${result.error_details}`,
      priority: 'high',
      metadata: {
        integration_id: integration.id,
        integration_type: integration.integration_type,
        error_details: result.error_details
      }
    }));

    if (notifications.length > 0) {
      await supabase
        .from('notifications')
        .insert(notifications);

      console.log(`Sent failure notifications to ${notifications.length} admins`);
    }
  } catch (error) {
    console.error('Failed to send failure notification:', error);
  }
}