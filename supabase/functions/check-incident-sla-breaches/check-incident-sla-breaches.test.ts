import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";

// Mock environment variables
Deno.env.set("SUPABASE_URL", "https://test.supabase.co");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");

// Mock fetch for Supabase API
const originalFetch = globalThis.fetch;
globalThis.fetch = (url: string | URL | Request, init?: RequestInit) => {
  const urlStr = typeof url === 'string' ? url : url.toString();
  
  if (urlStr.includes('supabase.co') && urlStr.includes('rpc')) {
    const body = init?.body ? JSON.parse(init.body as string) : {};
    
    // Mock RPC response for check_incident_sla_breaches
    return Promise.resolve(new Response(JSON.stringify({
      data: {
        incidents_checked: 15,
        breaches_found: 3,
        escalations_created: 2,
        notifications_sent: 5
      },
      error: null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
  return originalFetch(url, init);
};

// Import the function after setting up mocks
const { default: handler } = await import('./index.ts');

Deno.test("Check Incident SLA Breaches Edge Function", async (t) => {
  await t.step("should check SLA breaches successfully", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertEquals(data.success, true);
    assertEquals(data.message, "SLA breach check completed successfully");
    assertExists(data.result);
    assertEquals(data.result.incidents_checked, 15);
    assertEquals(data.result.breaches_found, 3);
  });

  await t.step("should handle CORS preflight request", async () => {
    const request = new Request("http://localhost", {
      method: "OPTIONS"
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  });

  await t.step("should handle missing environment variables", async () => {
    const originalUrl = Deno.env.get("SUPABASE_URL");
    const originalKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    Deno.env.delete("SUPABASE_URL");
    Deno.env.delete("SUPABASE_SERVICE_ROLE_KEY");

    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    const response = await handler(request);
    assertEquals(response.status, 500);
    
    const data = await response.json();
    assertEquals(data.success, false);
    assertExists(data.error);

    // Restore environment variables
    if (originalUrl) Deno.env.set("SUPABASE_URL", originalUrl);
    if (originalKey) Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", originalKey);
  });

  await t.step("should handle database errors", async () => {
    // Mock failed database response
    globalThis.fetch = (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      
      if (urlStr.includes('supabase.co') && urlStr.includes('rpc')) {
        return Promise.resolve(new Response(JSON.stringify({
          data: null,
          error: {
            message: "Database connection failed",
            code: "PGRST301"
          }
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
      
      return originalFetch(url, init);
    };

    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    const response = await handler(request);
    assertEquals(response.status, 500);
    
    const data = await response.json();
    assertEquals(data.success, false);
    assertExists(data.error);
  });

  await t.step("should handle GET requests", async () => {
    const request = new Request("http://localhost", {
      method: "GET"
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertEquals(data.success, true);
  });
});

// Cleanup
globalThis.fetch = originalFetch;