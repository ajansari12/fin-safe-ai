import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { summaryType, orgId, startDate, endDate } = await req.json();

    let result;

    switch (summaryType) {
      case 'incidents':
        if (!orgId) {
          throw new Error('Organization ID is required for incidents summary');
        }
        const { data: incidentsData, error: incidentsError } = await supabase
          .rpc('get_incidents_summary', { org_id_param: orgId });
        
        if (incidentsError) throw incidentsError;
        result = incidentsData;
        break;

      case 'kri':
        const { data: kriData, error: kriError } = await supabase
          .rpc('get_kri_summary', { 
            start_date_param: startDate || null,
            end_date_param: endDate || null
          });
        
        if (kriError) throw kriError;
        result = kriData;
        break;

      case 'analytics':
        if (!orgId) {
          throw new Error('Organization ID is required for analytics summary');
        }
        const { data: analyticsData, error: analyticsError } = await supabase
          .rpc('get_analytics_summary', { org_id_param: orgId });
        
        if (analyticsError) throw analyticsError;
        result = analyticsData;
        break;

      default:
        throw new Error('Invalid summary type. Use: incidents, kri, or analytics');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in optimization-sql-functions:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Failed to execute database optimization function'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});