import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateRoleRequest {
  user_id: string
  new_role: 'admin' | 'analyst' | 'reviewer'
  organization_id: string
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
    const { user_id, new_role, organization_id }: UpdateRoleRequest = await req.json()

    if (!user_id || !new_role || !organization_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, new_role, organization_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate role
    if (!['admin', 'analyst', 'reviewer'].includes(new_role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Must be admin, analyst, or reviewer' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Updating role for user ${user_id} to ${new_role} in organization ${organization_id}`)

    // Verify user authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('Failed to get authenticated user:', userError)
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use the database function to safely update the role
    const { data: result, error: updateError } = await supabaseClient.rpc(
      'update_user_role_safe',
      {
        p_user_id: user_id,
        p_new_role: new_role,
        p_organization_id: organization_id
      }
    )

    if (updateError) {
      console.error('Database function error:', updateError)
      return new Response(
        JSON.stringify({ error: `Database error: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!result || !result.success) {
      console.error('Function returned error:', result)
      return new Response(
        JSON.stringify({ error: result?.error || 'Unknown error occurred' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully updated user ${user_id} role to ${new_role}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: result.message,
        user_id: result.user_id,
        new_role: result.new_role
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in update-user-role:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})