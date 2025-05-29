
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createIncident, updateIncident, getIncidents } from '@/services/incident';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    })),
    auth: {
      getUser: vi.fn()
    }
  }
}));

// Mock error handler
vi.mock('@/lib/error-handling', () => ({
  ErrorHandler: {
    handle: vi.fn()
  }
}));

describe('Incident Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createIncident', () => {
    it('should create an incident successfully', async () => {
      const mockIncident = {
        id: '123',
        title: 'Test Incident',
        severity: 'high',
        status: 'open',
        org_id: 'org-123'
      };

      const mockSupabase = await import('@/integrations/supabase/client');
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockIncident,
              error: null
            })
          })
        })
      } as any);

      const incidentData = {
        title: 'Test Incident',
        severity: 'high' as const,
        status: 'open' as const,
        org_id: 'org-123'
      };

      const result = await createIncident(incidentData);
      expect(result).toEqual(mockIncident);
    });

    it('should handle creation errors', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' }
            })
          })
        })
      } as any);

      const incidentData = {
        title: 'Test Incident',
        severity: 'high' as const,
        status: 'open' as const,
        org_id: 'org-123'
      };

      await expect(createIncident(incidentData)).rejects.toThrow();
    });
  });

  describe('getIncidents', () => {
    it('should fetch incidents successfully', async () => {
      const mockIncidents = [
        { id: '1', title: 'Incident 1', severity: 'high' },
        { id: '2', title: 'Incident 2', severity: 'medium' }
      ];

      const mockSupabase = await import('@/integrations/supabase/client');
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockIncidents,
            error: null
          })
        })
      } as any);

      const result = await getIncidents();
      expect(result).toEqual(mockIncidents);
    });
  });
});
