import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query_embedding, match_threshold, match_count, org_filter } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Perform vector similarity search using SQL query
    const { data, error } = await supabase
      .from('knowledge_base')
      .select(`
        id,
        title,
        category,
        content,
        tags,
        visibility,
        created_at,
        updated_at,
        (embedding <=> '[${query_embedding.join(',')}]'::vector) as similarity
      `)
      .eq('org_id', org_filter)
      .lt('embedding <=> `[${query_embedding.join(',')}]`::vector', 1 - match_threshold)
      .order('similarity', { ascending: true })
      .limit(match_count);

    if (error) {
      console.error('Vector search error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify(data || []),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Match knowledge base error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});