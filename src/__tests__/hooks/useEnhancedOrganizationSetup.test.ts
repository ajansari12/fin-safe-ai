import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEnhancedOrganizationSetup } from '@/hooks/useEnhancedOrganizationSetup';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      refreshSession: vi.fn()
    },
    rpc: vi.fn(),
    functions: {
      invoke: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

// Mock other services
vi.mock('@/services/organization-service', () => ({
  createUserRole: vi.fn()
}));

vi.mock('@/contexts/OnboardingContext', () => ({
  useOnboarding: () => ({
    completeStep: vi.fn()
  })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('useEnhancedOrganizationSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrganizationRecord', () => {
    it('should create organization atomically with profile linking', async () => {
      // Mock authenticated user
      const mockUser = { 
        id: 'user-123',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z'
      } as User;
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock no existing organization
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { organization_id: null },
              error: null
            })
          }))
        }))
      } as any);

      // Mock successful RPC call
      const mockOrgId = 'org-456';
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ organization_id: mockOrgId, profile_updated: true }],
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      const { result } = renderHook(() => useEnhancedOrganizationSetup());

      // Set organization data
      act(() => {
        result.current.handleChange('name', 'Test Org');
        result.current.handleChange('sector', 'banking');
        result.current.handleChange('size', 'medium');
        result.current.handleChange('regulatoryFrameworks', ['E-21']);
        result.current.handleChange('userRole', 'admin');
      });

      // Call createOrganizationRecord
      let organizationId: string;
      await act(async () => {
        organizationId = await result.current.createOrganizationRecord();
      });

      // Verify atomic function was called correctly
      expect(supabase.rpc).toHaveBeenCalledWith('create_organization_with_profile', {
        p_org_name: 'Test Org',
        p_sector: 'banking',
        p_size: 'medium',
        p_regulatory_guidelines: ['E-21'],
        p_user_id: 'user-123'
      });

      expect(organizationId!).toBe(mockOrgId);
    });

    it('should handle existing organization correctly', async () => {
      const mockUser = { 
        id: 'user-123',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z'
      } as User;
      const existingOrgId = 'existing-org-456';

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock existing organization
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { organization_id: existingOrgId },
              error: null
            })
          }))
        }))
      } as any);

      const { result } = renderHook(() => useEnhancedOrganizationSetup());

      let organizationId: string;
      await act(async () => {
        organizationId = await result.current.createOrganizationRecord();
      });

      // Should not call RPC for existing organization
      expect(supabase.rpc).not.toHaveBeenCalled();
      expect(organizationId!).toBe(existingOrgId);
    });

    it('should handle database errors gracefully', async () => {
      const mockUser = { 
        id: 'user-123',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z'
      } as User;
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock no existing organization
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { organization_id: null },
              error: null
            })
          }))
        }))
      } as any);

      // Mock RPC error
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { 
          message: 'Database constraint violation',
          details: '',
          hint: '',
          code: '',
          name: 'PostgrestError'
        },
        count: null,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const { result } = renderHook(() => useEnhancedOrganizationSetup());

      act(() => {
        result.current.handleChange('name', 'Test Org');
        result.current.handleChange('sector', 'banking');
        result.current.handleChange('size', 'medium');
      });

      await act(async () => {
        await expect(result.current.createOrganizationRecord()).rejects.toThrow(
          'Organization creation failed: Database constraint violation'
        );
      });
    });

    it('should handle unauthenticated user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      });

      const { result } = renderHook(() => useEnhancedOrganizationSetup());

      await act(async () => {
        await expect(result.current.createOrganizationRecord()).rejects.toThrow(
          'User not authenticated'
        );
      });
    });
  });

  describe('handleEnrichOrganization', () => {
    it('should handle setup mode enrichment correctly', async () => {
      const mockUser = { 
        id: 'user-123',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z'
      } as User;

      // Mock authenticated user
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock no existing organization (setup mode)
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { organization_id: null },
              error: null
            })
          }))
        }))
      } as any);

      // Mock successful enrichment function call
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          mode: 'setup',
          enriched_data: {
            sector: 'banking',
            org_type: 'banking-schedule-i',
            employee_count: 500,
            geographic_scope: 'National'
          }
        },
        error: null
      });

      const { result } = renderHook(() => useEnhancedOrganizationSetup());

      // Set organization name
      act(() => {
        result.current.handleChange('name', 'Test Bank');
      });

      // Call enrichment
      await act(async () => {
        await result.current.handleEnrichOrganization();
      });

      // Verify function called correctly
      expect(supabase.functions.invoke).toHaveBeenCalledWith('enrich-organization-data', {
        body: {
          org_id: null,
          company_name: 'Test Bank',
          domain: undefined,
          mode: 'setup'
        }
      });
    });

    it('should handle update mode enrichment correctly', async () => {
      const mockUser = { 
        id: 'user-123',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z'
      } as User;
      const existingOrgId = 'existing-org-456';

      // Mock authenticated user
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock existing organization (update mode)
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { organization_id: existingOrgId },
              error: null
            })
          }))
        }))
      } as any);

      // Mock successful enrichment function call
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          mode: 'update',
          message: 'Organization updated'
        },
        error: null
      });

      const { result } = renderHook(() => useEnhancedOrganizationSetup());

      // Set organization name
      act(() => {
        result.current.handleChange('name', 'Test Bank');
      });

      // Call enrichment
      await act(async () => {
        await result.current.handleEnrichOrganization();
      });

      // Verify function called correctly
      expect(supabase.functions.invoke).toHaveBeenCalledWith('enrich-organization-data', {
        body: {
          org_id: existingOrgId,
          company_name: 'Test Bank',
          domain: undefined,
          mode: 'update'
        }
      });
    });
  });

  describe('data validation', () => {
    it('should validate required fields correctly', () => {
      const { result } = renderHook(() => useEnhancedOrganizationSetup());

      // Test step 1 validation (organization name required)
      expect(result.current.validateCurrentStep()).toBe(false);

      act(() => {
        result.current.handleChange('name', 'Test Org');
      });

      expect(result.current.validateCurrentStep()).toBe(true);
    });

    it('should update completion estimate based on complexity', () => {
      const { result } = renderHook(() => useEnhancedOrganizationSetup());

      const initialEstimate = result.current.completionEstimate;

      act(() => {
        result.current.handleChange('frameworkGenerationMode', 'manual');
        result.current.handleChange('policyFiles', [new File(['test'], 'test.pdf')]);
        result.current.handleChange('applicableFrameworks', ['Framework1', 'Framework2', 'Framework3', 'Framework4']);
      });

      // Should increase estimate for manual mode, policy files, and multiple frameworks
      expect(result.current.completionEstimate).toBeGreaterThan(initialEstimate);
    });
  });
});