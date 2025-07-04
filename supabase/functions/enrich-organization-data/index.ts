import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EnrichmentRequest {
  org_id?: string | null
  company_name: string
  domain?: string
  mode?: 'setup' | 'update'
}

interface EnrichmentData {
  sector?: string
  sub_sector?: string
  org_type?: string
  employee_count?: number
  asset_size?: number
  capital_tier?: string
  geographic_scope?: string
  regulatory_classification?: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { org_id, company_name, domain, mode = 'update' }: EnrichmentRequest = await req.json()

    if (!company_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: company_name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine operation mode
    const isSetupMode = !org_id || mode === 'setup'
    
    console.log(`Starting enrichment for: ${company_name} (mode: ${isSetupMode ? 'setup' : 'update'}, org_id: ${org_id || 'none'})`)

    // For update mode, verify user has access to the organization
    if (!isSetupMode && org_id) {
      const { data: orgData, error: orgError } = await supabaseClient
        .from('organizations')
        .select('id, name')
        .eq('id', org_id)
        .single()

      if (orgError || !orgData) {
        console.error('Organization access validation failed:', orgError)
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Cannot access this organization' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Call Gemini API with enhanced error handling
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not configured')
      return new Response(
        JSON.stringify({ 
          fallback: true, 
          error: 'API configuration missing',
          message: 'Gemini API key not configured. Please add your Gemini API key to Edge Function Secrets.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sanitize company name
    const sanitizedCompanyName = company_name.trim().replace(/[^\w\s&.-]/g, '')
    if (!sanitizedCompanyName) {
      return new Response(
        JSON.stringify({ 
          fallback: true, 
          error: 'Invalid input',
          message: 'Company name contains invalid characters'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `Find real public details about "${sanitizedCompanyName}"${domain ? ` (domain: ${domain})` : ''}. 

Provide the response as a JSON object with these exact fields:
{
  "sector": "banking|insurance|fintech|other",
  "sub_sector": "retail|commercial|investment|other",
  "org_type": "banking-schedule-i|banking-schedule-ii|banking-schedule-iii|credit-union|trust-company|insurance|fintech|other",
  "employee_count": number or null,
  "asset_size": number in millions or null,
  "capital_tier": "Tier 1|Tier 2|Tier 3|Not Applicable",
  "geographic_scope": "Local|Regional|National|International",
  "regulatory_classification": ["OSFI", "Basel III", "other relevant frameworks"]
}

Only return the JSON object. If you cannot find specific information, use null for that field.`

    console.log(`Making Gemini API request for: ${sanitizedCompanyName}`)
    
    // Implement retry logic for Gemini API
    let geminiResponse: Response | null = null
    let lastError: string = ''
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Gemini API attempt ${attempt}/3`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              topK: 1,
              topP: 1,
              maxOutputTokens: 2048,
            }
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (geminiResponse.ok) {
          console.log(`Gemini API success on attempt ${attempt}`)
          break
        } else {
          const errorText = await geminiResponse.text()
          lastError = `HTTP ${geminiResponse.status}: ${errorText}`
          console.error(`Gemini API error on attempt ${attempt}:`, lastError)
          
          // Don't retry on certain error codes
          if (geminiResponse.status === 401 || geminiResponse.status === 403) {
            break
          }
        }
      } catch (error) {
        lastError = error.message
        console.error(`Gemini API attempt ${attempt} failed:`, error)
        
        if (attempt < 3) {
          // Exponential backoff: wait 1s, then 2s, then 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
        }
      }
    }

    if (!geminiResponse || !geminiResponse.ok) {
      console.error('All Gemini API attempts failed:', lastError)
      return new Response(
        JSON.stringify({ 
          fallback: true, 
          error: 'External API error',
          message: `Gemini API failed: ${lastError}`,
          details: 'Please check your API key and try again'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini API response structure:', JSON.stringify(geminiData, null, 2))

    let enrichmentData: EnrichmentData = {}

    try {
      // Extract text from Gemini response
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
      if (responseText) {
        // Try to parse JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          enrichmentData = JSON.parse(jsonMatch[0])
          console.log('Parsed enrichment data:', enrichmentData)
        } else {
          console.log('No JSON found in Gemini response')
        }
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError)
      return new Response(
        JSON.stringify({ 
          fallback: true, 
          error: 'Data parsing error',
          message: 'Failed to parse enrichment data'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle data storage based on mode
    if (!isSetupMode && org_id && Object.keys(enrichmentData).length > 0) {
      // Update mode: Save to database
      const updateData: any = {}
      
      if (enrichmentData.sector) updateData.sector = enrichmentData.sector
      if (enrichmentData.sub_sector) updateData.sub_sector = enrichmentData.sub_sector
      if (enrichmentData.org_type) updateData.org_type = enrichmentData.org_type
      if (enrichmentData.employee_count) updateData.employee_count = enrichmentData.employee_count
      if (enrichmentData.asset_size) updateData.asset_size = enrichmentData.asset_size
      if (enrichmentData.capital_tier) updateData.capital_tier = enrichmentData.capital_tier
      if (enrichmentData.geographic_scope) updateData.geographic_scope = enrichmentData.geographic_scope
      if (enrichmentData.regulatory_classification) updateData.regulatory_classification = enrichmentData.regulatory_classification

      const { error: updateError } = await supabaseClient
        .from('organizations')
        .update(updateData)
        .eq('id', org_id)

      if (updateError) {
        console.error('Failed to update organization:', updateError)
        return new Response(
          JSON.stringify({ 
            fallback: true, 
            error: 'Database update error',
            message: 'Failed to save enriched data'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Successfully updated organization ${org_id} with enriched data`)
    } else {
      console.log(`Setup mode: Returning enriched data for client-side handling`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        mode: isSetupMode ? 'setup' : 'update',
        enriched_data: enrichmentData,
        updated_fields: isSetupMode ? [] : Object.keys(enrichmentData).filter(key => enrichmentData[key] !== null)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in enrich-organization-data:', error)
    return new Response(
      JSON.stringify({ 
        fallback: true, 
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})