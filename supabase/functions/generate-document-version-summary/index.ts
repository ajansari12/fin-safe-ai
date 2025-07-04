import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VersionSummaryRequest {
  document_id: string;
  new_version_id: string;
  org_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_id, new_version_id, org_id }: VersionSummaryRequest = await req.json();

    if (!document_id || !new_version_id || !org_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: document_id, new_version_id, org_id' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Set up Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Generating summary for document:', document_id, 'new version:', new_version_id);

    // Get the new version details
    const { data: newVersion, error: newVersionError } = await supabase
      .from('document_versions')
      .select('*')
      .eq('id', new_version_id)
      .eq('org_id', org_id)
      .single();

    if (newVersionError || !newVersion) {
      console.error('New version fetch error:', newVersionError);
      return new Response(
        JSON.stringify({ error: 'New version not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get the previous version (if exists)
    const { data: previousVersions } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', document_id)
      .lt('version_number', newVersion.version_number)
      .order('version_number', { ascending: false })
      .limit(1);

    const previousVersion = previousVersions?.[0];

    // Get document details
    const { data: document } = await supabase
      .from('documents')
      .select('title, document_type')
      .eq('id', document_id)
      .single();

    let summary = '';

    if (!previousVersion) {
      // This is the first version
      summary = `Initial version of ${document?.title || 'document'} uploaded. Document type: ${document?.document_type || 'unknown'}.`;
    } else {
      // Compare versions using OpenAI
      try {
        const prompt = `You are analyzing changes between two versions of a document. Generate a concise summary of what changed between the versions.

Document Title: ${document?.title || 'Unknown'}
Document Type: ${document?.document_type || 'Unknown'}

Previous Version (v${previousVersion.version_number}):
- File size: ${previousVersion.file_size ? `${(previousVersion.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
- Upload date: ${new Date(previousVersion.created_at).toLocaleDateString()}
- Description: ${previousVersion.description || 'No description'}
- Uploaded by: ${previousVersion.uploaded_by_name || 'Unknown'}

New Version (v${newVersion.version_number}):
- File size: ${newVersion.file_size ? `${(newVersion.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
- Upload date: ${new Date(newVersion.created_at).toLocaleDateString()}
- Description: ${newVersion.description || 'No description'}
- Uploaded by: ${newVersion.uploaded_by_name || 'Unknown'}

Generate a concise, professional summary (maximum 200 characters) describing what likely changed between these versions. Focus on:
- File size changes (if significant)
- Time gap between versions
- Any description differences
- Context clues about the nature of changes

Example format: "Version 3 significantly increased file size (+2.3MB), suggesting new content additions. Updated 5 days after previous version with enhanced security clauses."`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a document management assistant that creates concise summaries of document version changes. Keep responses under 200 characters and professional.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 100,
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          summary = data.choices[0]?.message?.content?.trim() || 
            `Version ${newVersion.version_number} updated. File size: ${newVersion.file_size ? `${(newVersion.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}.`;
        } else {
          console.error('OpenAI API error:', await response.text());
          summary = `Version ${newVersion.version_number} updated from version ${previousVersion.version_number}.`;
        }
      } catch (openaiError) {
        console.error('Error calling OpenAI:', openaiError);
        summary = `Version ${newVersion.version_number} updated from version ${previousVersion.version_number}.`;
      }
    }

    // Update the document version with the AI summary
    const { error: updateError } = await supabase
      .from('document_versions')
      .update({
        ai_summary: summary,
        ai_analysis_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', new_version_id);

    if (updateError) {
      console.error('Error updating version summary:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save summary' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Successfully generated summary:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        version_id: new_version_id,
        summary: summary,
        has_previous_version: !!previousVersion
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-document-version-summary function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});