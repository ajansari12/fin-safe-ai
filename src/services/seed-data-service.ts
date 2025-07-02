import { supabase } from "@/integrations/supabase/client";

export const seedDataService = {
  async createSampleData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) return;

    // Create sample incidents
    const incidents = [
      {
        org_id: profile.organization_id,
        title: 'Trading System Outage',
        description: 'Primary trading platform experienced 2-hour outage',
        severity: 'critical',
        status: 'resolved',
        category: 'operational',
        reported_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        org_id: profile.organization_id,
        title: 'Network Security Alert',
        description: 'Unusual network traffic detected',
        severity: 'medium',
        status: 'open',
        category: 'cyber',
        reported_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    await supabase.from('incident_logs').upsert(incidents);

    // Create sample business functions
    const businessFunctions = [
      {
        org_id: profile.organization_id,
        function_name: 'Trading Operations',
        criticality: 'critical',
        description: 'Primary trading and market making activities'
      },
      {
        org_id: profile.organization_id,
        function_name: 'Technology Infrastructure',
        criticality: 'critical',
        description: 'Core banking systems and IT infrastructure'
      }
    ];

    await supabase.from('business_functions').upsert(businessFunctions);

    return true;
  }
};