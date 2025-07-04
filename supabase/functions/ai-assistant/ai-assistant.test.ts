import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Mock environment variables
Deno.env.set("OPENAI_API_KEY", "sk-test-key-123");
Deno.env.set("SUPABASE_URL", "https://test.supabase.co");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");

// Mock fetch for OpenAI API
const originalFetch = globalThis.fetch;
globalThis.fetch = (url: string | URL | Request, init?: RequestInit) => {
  const urlStr = typeof url === 'string' ? url : url.toString();
  
  if (urlStr.includes('api.openai.com/v1/chat/completions')) {
    return Promise.resolve(new Response(JSON.stringify({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4o-mini',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'This is a test response from the AI assistant.'
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
  // Mock Supabase calls
  if (urlStr.includes('supabase.co')) {
    return Promise.resolve(new Response(JSON.stringify({
      data: [{ id: 'test-user', organization_id: 'test-org' }],
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

Deno.test("AI Assistant Edge Function", async (t) => {
  await t.step("should handle valid chat request", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "What is risk management?",
        user_id: "test-user-id",
        context: { module: "dashboard" }
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertExists(data.response);
    assertEquals(typeof data.response, "string");
  });

  await t.step("should handle CORS preflight request", async () => {
    const request = new Request("http://localhost", {
      method: "OPTIONS"
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  });

  await t.step("should validate required fields", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Missing required message field
        user_id: "test-user-id"
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 400);
    
    const data = await response.json();
    assertExists(data.error);
  });

  await t.step("should handle missing OpenAI API key", async () => {
    // Temporarily remove the API key
    const originalKey = Deno.env.get("OPENAI_API_KEY");
    Deno.env.delete("OPENAI_API_KEY");

    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Test message",
        user_id: "test-user-id"
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 500);
    
    // Restore the API key
    if (originalKey) {
      Deno.env.set("OPENAI_API_KEY", originalKey);
    }
  });

  await t.step("should handle malformed JSON", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json"
    });

    const response = await handler(request);
    assertEquals(response.status, 500);
  });
});

// Cleanup
globalThis.fetch = originalFetch;