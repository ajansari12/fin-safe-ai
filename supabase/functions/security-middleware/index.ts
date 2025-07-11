import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

const defaultRateLimits: Record<string, RateLimitConfig> = {
  '/auth': { maxRequests: 5, windowMinutes: 15 },
  '/admin': { maxRequests: 100, windowMinutes: 60 },
  '/api': { maxRequests: 1000, windowMinutes: 60 },
  'default': { maxRequests: 500, windowMinutes: 60 },
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const endpoint = url.pathname;
    const method = req.method;
    
    // Get client IP and user info
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const authHeader = req.headers.get('authorization');
    const userId = authHeader ? await getUserFromToken(authHeader, supabase) : null;
    
    // Rate limiting check
    const rateLimitResult = await checkRateLimit(supabase, clientIP, userId, endpoint);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          retryAfter: rateLimitResult.retryAfter 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders,
            'Retry-After': rateLimitResult.retryAfter.toString()
          }
        }
      );
    }

    // CSRF protection for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const csrfToken = req.headers.get('x-csrf-token');
      if (!csrfToken || !(await validateCSRFToken(supabase, csrfToken, userId))) {
        return new Response(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { status: 403, headers: corsHeaders }
        );
      }
    }

    // Input validation
    if (req.method !== 'GET') {
      const body = await req.clone().text();
      if (body) {
        try {
          const data = JSON.parse(body);
          const validationResult = validateInput(data, endpoint);
          if (!validationResult.valid) {
            return new Response(
              JSON.stringify({ 
                error: 'Validation failed', 
                details: validationResult.errors 
              }),
              { status: 400, headers: corsHeaders }
            );
          }
        } catch {
          return new Response(
            JSON.stringify({ error: 'Invalid JSON' }),
            { status: 400, headers: corsHeaders }
          );
        }
      }
    }

    // Generate CSRF token for GET requests
    if (method === 'GET' && userId) {
      const csrfToken = await generateCSRFToken(supabase, userId);
      return new Response(
        JSON.stringify({ 
          success: true, 
          csrfToken,
          message: 'Security middleware check passed' 
        }),
        { 
          status: 200, 
          headers: {
            ...corsHeaders,
            'X-CSRF-Token': csrfToken
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Security check passed' }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Security middleware error:', error);
    return new Response(
      JSON.stringify({ error: 'Security check failed' }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function getUserFromToken(authHeader: string, supabase: any): Promise<string | null> {
  try {
    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabase.auth.getUser(token);
    return error ? null : data.user?.id;
  } catch {
    return null;
  }
}

async function checkRateLimit(
  supabase: any, 
  clientIP: string, 
  userId: string | null, 
  endpoint: string
): Promise<{ allowed: boolean; retryAfter: number }> {
  const identifier = userId || clientIP;
  const identifierType = userId ? 'user' : 'ip';
  
  // Get rate limit config for endpoint
  const config = Object.entries(defaultRateLimits).find(([path]) => 
    endpoint.startsWith(path)
  )?.[1] || defaultRateLimits.default;

  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - config.windowMinutes);

  // Check current rate limit
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString())
    .single();

  if (existing) {
    if (existing.request_count >= config.maxRequests) {
      const retryAfter = Math.ceil(
        (new Date(existing.window_start).getTime() + config.windowMinutes * 60000 - Date.now()) / 1000
      );
      return { allowed: false, retryAfter };
    }

    // Increment counter
    await supabase
      .from('rate_limits')
      .update({ request_count: existing.request_count + 1 })
      .eq('id', existing.id);
  } else {
    // Create new rate limit entry
    await supabase
      .from('rate_limits')
      .insert({
        identifier,
        identifier_type: identifierType,
        endpoint,
        request_count: 1,
        window_start: new Date().toISOString(),
        window_size_minutes: config.windowMinutes,
        max_requests: config.maxRequests
      });
  }

  return { allowed: true, retryAfter: 0 };
}

async function generateCSRFToken(supabase: any, userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await supabase
    .from('csrf_tokens')
    .insert({
      token,
      user_id: userId,
      expires_at: expiresAt.toISOString()
    });

  return token;
}

async function validateCSRFToken(supabase: any, token: string, userId: string | null): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabase
    .from('csrf_tokens')
    .select('*')
    .eq('token', token)
    .eq('user_id', userId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return false;

  // Mark token as used
  await supabase
    .from('csrf_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id);

  return true;
}

function validateInput(data: any, endpoint: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic sanitization and validation
  function sanitizeString(str: string): string {
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
             .replace(/javascript:/gi, '')
             .replace(/on\w+\s*=/gi, '');
  }

  function validateObject(obj: any, path = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        if (value.length > 10000) {
          errors.push(`${fullPath}: String too long (max 10000 characters)`);
        }
        // Sanitize strings in place
        obj[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        validateObject(value, fullPath);
      } else if (typeof value === 'number' && !isFinite(value)) {
        errors.push(`${fullPath}: Invalid number`);
      }
    }
  }

  validateObject(data);

  // Endpoint-specific validations
  if (endpoint.includes('/admin') && data.role) {
    const validRoles = ['admin', 'analyst', 'reviewer', 'auditor', 'executive'];
    if (!validRoles.includes(data.role)) {
      errors.push('Invalid role specified');
    }
  }

  return { valid: errors.length === 0, errors };
}