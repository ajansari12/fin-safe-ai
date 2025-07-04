import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";

// Mock environment variables
Deno.env.set("OPENAI_API_KEY", "sk-test-key-123");
Deno.env.set("SUPABASE_URL", "https://test.supabase.co");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");

// Mock fetch for OpenAI and Supabase APIs
const originalFetch = globalThis.fetch;
globalThis.fetch = (url: string | URL | Request, init?: RequestInit) => {
  const urlStr = typeof url === 'string' ? url : url.toString();
  
  if (urlStr.includes('api.openai.com/v1/embeddings')) {
    return Promise.resolve(new Response(JSON.stringify({
      object: 'list',
      data: [{
        object: 'embedding',
        embedding: Array.from({length: 1536}, () => Math.random()),
        index: 0
      }],
      model: 'text-embedding-3-small',
      usage: {
        prompt_tokens: 8,
        total_tokens: 8
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
  // Mock Supabase update call
  if (urlStr.includes('supabase.co') && init?.method === 'PATCH') {
    return Promise.resolve(new Response(JSON.stringify({
      data: { id: 'test-knowledge-id' },
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

Deno.test("Generate Embeddings Edge Function", async (t) => {
  await t.step("should generate embeddings for text", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Risk management is the process of identifying, assessing, and controlling threats to an organization's capital and earnings.",
        knowledgeBaseId: "test-knowledge-id"
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertEquals(data.success, true);
    assertExists(data.embedding);
    assertEquals(Array.isArray(data.embedding), true);
    assertEquals(data.embedding.length, 1536);
  });

  await t.step("should generate embeddings without knowledge base update", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Compliance monitoring involves regular assessment of adherence to regulations."
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertEquals(data.success, true);
    assertExists(data.embedding);
  });

  await t.step("should handle CORS preflight request", async () => {
    const request = new Request("http://localhost", {
      method: "OPTIONS"
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  });

  await t.step("should handle missing OpenAI API key", async () => {
    const originalKey = Deno.env.get("OPENAI_API_KEY");
    Deno.env.delete("OPENAI_API_KEY");

    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Test text"
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 500);
    
    const data = await response.json();
    assertExists(data.error);

    // Restore API key
    if (originalKey) {
      Deno.env.set("OPENAI_API_KEY", originalKey);
    }
  });

  await t.step("should handle OpenAI API errors", async () => {
    // Mock failed OpenAI response
    globalThis.fetch = (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      
      if (urlStr.includes('api.openai.com/v1/embeddings')) {
        return Promise.resolve(new Response(JSON.stringify({
          error: {
            message: "Invalid API key",
            type: "invalid_api_key"
          }
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
      
      return originalFetch(url, init);
    };

    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Test text"
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 500);
    
    const data = await response.json();
    assertExists(data.error);
  });

  await t.step("should handle missing text parameter", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        knowledgeBaseId: "test-id"
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 500);
  });
});

// Cleanup
globalThis.fetch = originalFetch;