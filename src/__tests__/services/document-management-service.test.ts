
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { documentManagementService } from '@/services/document-management-service';

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
      textSearch: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('Document Management Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRepository', () => {
    it('should create a document repository successfully', async () => {
      const mockRepository = {
        id: 'test-repo-id',
        org_id: 'test-org-id',
        name: 'Test Repository',
        document_type: 'policy' as const,
        access_level: 'internal' as const,
        retention_years: 7,
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockRepository,
              error: null,
            }),
          }),
        }),
      } as any);

      const repositoryData = {
        name: 'Test Repository',
        document_type: 'policy' as const,
        access_level: 'internal' as const,
        retention_years: 7,
      };

      const result = await documentManagementService.createRepository(repositoryData);
      expect(result).toEqual(mockRepository);
    });

    it('should handle repository creation errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      } as any);

      const repositoryData = {
        name: 'Test Repository',
        document_type: 'policy' as const,
        access_level: 'internal' as const,
        retention_years: 7,
      };

      await expect(documentManagementService.createRepository(repositoryData)).rejects.toThrow();
    });
  });

  describe('searchDocuments', () => {
    it('should search documents successfully', async () => {
      const mockDocuments = [
        { id: '1', title: 'Document 1', status: 'approved' },
        { id: '2', title: 'Document 2', status: 'draft' },
      ];

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            textSearch: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockDocuments,
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await documentManagementService.searchDocuments('test query');
      expect(result).toEqual(mockDocuments);
    });
  });

  describe('getDocumentAnalytics', () => {
    it('should return analytics data', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await documentManagementService.getDocumentAnalytics('month');
      expect(result).toHaveProperty('totalDocuments');
      expect(result).toHaveProperty('totalAccesses');
      expect(result).toHaveProperty('documentsByStatus');
    });
  });
});
