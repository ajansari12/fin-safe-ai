import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";

// Mock environment variables
Deno.env.set("RESEND_API_KEY", "re_test_key_123");
Deno.env.set("SUPABASE_URL", "https://test.supabase.co");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");

// Mock fetch for Resend API
const originalFetch = globalThis.fetch;
globalThis.fetch = (url: string | URL | Request, init?: RequestInit) => {
  const urlStr = typeof url === 'string' ? url : url.toString();
  
  if (urlStr.includes('api.resend.com/emails')) {
    return Promise.resolve(new Response(JSON.stringify({
      id: 'email-test-id',
      from: 'notifications@test.com',
      to: ['test@example.com'],
      created_at: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
  // Mock Supabase calls
  if (urlStr.includes('supabase.co')) {
    return Promise.resolve(new Response(JSON.stringify({
      data: { id: 'notification-test-id' },
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

Deno.test("Send Notification Email Edge Function", async (t) => {
  await t.step("should send SLA breach notification", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "sla_breach",
        recipient_email: "admin@test.com",
        recipient_name: "Admin User",
        org_id: "test-org-id",
        data: {
          incident_title: "Critical System Down",
          severity: "critical",
          breach_type: "response_time",
          time_elapsed: "2 hours",
          sla_limit: "1 hour",
          escalation_level: 2,
          action_required: "Immediate response required",
          incident_url: "https://app.test.com/incidents/123"
        }
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertEquals(data.success, true);
    assertExists(data.email_id);
  });

  await t.step("should send policy review notification", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "policy_review",
        recipient_email: "manager@test.com",
        recipient_name: "Policy Manager",
        org_id: "test-org-id",
        data: {
          policy_name: "Data Protection Policy",
          framework_name: "GDPR Framework",
          version: "2.1",
          last_review_date: "2023-01-01",
          review_due_date: "2024-01-01",
          priority: "High",
          policy_url: "https://app.test.com/policies/456"
        }
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertEquals(data.success, true);
    assertExists(data.email_id);
  });

  await t.step("should send executive summary", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "executive_summary",
        recipient_email: "ceo@test.com",
        recipient_name: "CEO",
        org_id: "test-org-id",
        data: {
          week_of: "2024-01-01",
          total_incidents: 15,
          new_incidents: 3,
          kri_breaches: 2,
          control_tests: 12,
          vendor_reviews: 5,
          avg_response_time: "2.5 hours",
          control_effectiveness: 94.5,
          policy_compliance: 98.2,
          risk_variance: 8.5,
          recommendations: [
            "Review vendor risk assessments",
            "Update incident response procedures"
          ],
          dashboard_url: "https://app.test.com/dashboard"
        }
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertEquals(data.success, true);
    assertExists(data.email_id);
  });

  await t.step("should handle CORS preflight request", async () => {
    const request = new Request("http://localhost", {
      method: "OPTIONS"
    });

    const response = await handler(request);
    assertEquals(response.status, 200);
    assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  });

  await t.step("should validate notification type", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "invalid_type",
        recipient_email: "test@example.com",
        org_id: "test-org-id",
        data: {}
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 500);
    
    const data = await response.json();
    assertExists(data.error);
  });

  await t.step("should handle missing required fields", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Missing type and recipient_email
        org_id: "test-org-id",
        data: {}
      })
    });

    const response = await handler(request);
    assertEquals(response.status, 500);
  });
});

// Cleanup
globalThis.fetch = originalFetch;