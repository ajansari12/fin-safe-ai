import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Running weekly executive summary generation...');

    // Call the stored procedure to generate and send executive summaries
    const { error } = await supabase.rpc('send_weekly_executive_summary');

    if (error) {
      console.error('Error generating executive summaries:', error);
      throw new Error(`Failed to generate executive summaries: ${error.message}`);
    }

    console.log('Weekly executive summaries sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Weekly executive summaries sent successfully',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in weekly summary function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate weekly executive summaries'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});