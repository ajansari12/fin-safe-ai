
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Starting SLA breach check...");

    // Call the database function to check for SLA breaches
    const { data, error } = await supabase.rpc('check_incident_sla_breaches');

    if (error) {
      throw new Error(`Failed to check SLA breaches: ${error.message}`);
    }

    console.log("SLA breach check completed successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "SLA breach check completed successfully", 
      result: data 
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
  } catch (error: any) {
    console.error("Error in check-incident-sla-breaches function:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
  }
};

serve(handler);
