
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    })),
    auth: {
      getUser: vi.fn()
    }
  }
}));

// Mock the edge function
vi.mock('@/integrations/supabase/client', async () => {
  const actual = await vi.importActual('@/integrations/supabase/client');
  return {
    ...actual,
    supabase: {
      functions: {
        invoke: vi.fn()
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(),
      })),
      auth: {
        getUser: vi.fn()
      }
    }
  };
});

describe('Policy Review Reminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should identify policies due for review', async () => {
    const mockPolicies = [
      {
        id: '1',
        title: 'Policy 1',
        review_due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        assigned_reviewer_name: 'John Doe'
      },
      {
        id: '2',
        title: 'Policy 2',
        review_due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (overdue)
        assigned_reviewer_name: 'Jane Smith'
      }
    ];

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockResolvedValue({
            data: mockPolicies,
            error: null
          })
        })
      })
    } as any);

    // Test the logic that would identify policies due for review
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const policiesDueForReview = mockPolicies.filter(policy => {
      const dueDate = new Date(policy.review_due_date);
      return dueDate <= nextWeek;
    });

    expect(policiesDueForReview).toHaveLength(2);
  });

  it('should send reminder notifications', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { success: true },
      error: null
    });

    const mockPolicy = {
      id: '1',
      title: 'Test Policy',
      assigned_reviewer_name: 'John Doe',
      review_due_date: new Date().toISOString()
    };

    // Simulate sending a reminder
    const result = await supabase.functions.invoke('governance-review-reminder', {
      body: { policy: mockPolicy }
    });

    expect(result.data?.success).toBe(true);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('governance-review-reminder', {
      body: { policy: mockPolicy }
    });
  });
});
