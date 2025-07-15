import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Dashboard from '@/pages/Dashboard';
import { EnhancedAuthProvider } from '@/contexts/EnhancedAuthContext';
import { Toaster } from '@/components/ui/sonner';
import { WorkflowTestSuite } from '../integration/WorkflowTestSuite';
import { RealDataFlowValidator } from '../integration/RealDataFlowValidator';
import React from 'react';

// Mock external dependencies
vi.mock('@/integrations/supabase/client');
vi.mock('@/lib/performance-utils');

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    getSession: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
    insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    update: vi.fn(() => Promise.resolve({ data: [], error: null })),
  })),
  functions: {
    invoke: vi.fn(),
  },
};

(supabase as any).mockImplementation(() => mockSupabase);

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(
      BrowserRouter,
      {},
      React.createElement(
        EnhancedAuthProvider,
        {},
        children,
        React.createElement(Toaster, {})
      )
    )
  );
};

describe('E2E Workflow Tests', () => {
  let workflowTestSuite: WorkflowTestSuite;
  let realDataValidator: RealDataFlowValidator;

  beforeEach(() => {
    workflowTestSuite = new WorkflowTestSuite();
    realDataValidator = new RealDataFlowValidator();
    
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { 
        user: { 
          id: 'test-user-id', 
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' }
        } 
      },
      error: null
    });

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: { 
            id: 'test-user-id', 
            email: 'test@example.com' 
          },
          access_token: 'mock-token'
        } 
      },
      error: null
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Workflow: Login → NLP Query → AI Response → Breach Trigger → Email → PDF', () => {
    it('should complete full workflow within performance thresholds', async () => {
      const startTime = performance.now();
      
      // Step 1: Login simulation
      console.log('Step 1: Testing login workflow...');
      const loginResult = await workflowTestSuite.testLogin('test@example.com', 'password');
      expect(loginResult.success).toBe(true);
      expect(loginResult.latency).toBeLessThan(2000); // less than 2s login
      
      // Step 2: Dashboard render with real data
      console.log('Step 2: Rendering dashboard with mock data...');
      const mockKriData = realDataValidator.generateMockKriData(1000);
      mockSupabase.from.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: mockKriData, error: null }),
            }),
          }),
        }),
      });

      render(
        React.createElement(
          TestWrapper,
          {},
          React.createElement(Dashboard, {})
        )
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Step 3: NLP Query simulation
      console.log('Step 3: Testing NLP query processing...');
      const nlpQuery = 'Forecast risks for next quarter';
      
      // Mock OpenAI response
      const mockAIResponse = {
        data: {
          generatedText: 'Based on current risk indicators, we forecast elevated operational risks in Q2 2024...',
          responseTime: 2500,
          tokensUsed: 150
        }
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce(mockAIResponse);

      // Simulate AI assistant query
      const aiResult = await workflowTestSuite.testAIQuery(nlpQuery);
      expect(aiResult.success).toBe(true);
      expect(aiResult.responseTime).toBeLessThan(3000); // less than 3s AI response
      expect(aiResult.response).toContain('forecast');

      // Step 4: Breach detection simulation
      console.log('Step 4: Testing breach detection...');
      const breachData = realDataValidator.generateMockBreachData();
      const breachResult = await workflowTestSuite.testBreachDetection(breachData);
      expect(breachResult.triggered).toBe(true);
      expect(breachResult.severity).toBe('high');

      // Step 5: Email notification simulation
      console.log('Step 5: Testing email notification...');
      const emailResult = await workflowTestSuite.testEmailNotification({
        to: 'admin@example.com',
        subject: 'Risk Threshold Breach Alert',
        template: 'breach_notification'
      });
      expect(emailResult.sent).toBe(true);
      expect(emailResult.deliveryTime).toBeLessThan(5000); // less than 5s email delivery

      // Step 6: PDF report generation
      console.log('Step 6: Testing PDF report generation...');
      const pdfResult = await workflowTestSuite.testPDFGeneration({
        reportType: 'risk_breach_summary',
        data: breachData
      });
      expect(pdfResult.generated).toBe(true);
      expect(pdfResult.fileSize).toBeGreaterThan(0);

      const totalTime = performance.now() - startTime;
      console.log('Total workflow time: ' + totalTime + 'ms');
      expect(totalTime).toBeLessThan(15000); // less than 15s total workflow
    });

    it('should handle large dataset queries efficiently', async () => {
      console.log('Testing large dataset performance...');
      
      // Generate 10,000 mock records
      const largeDataset = realDataValidator.generateMockKriData(10000);
      
      mockSupabase.from.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: largeDataset, error: null }),
            }),
          }),
        }),
      });

      const startTime = performance.now();
      
      render(
        React.createElement(
          TestWrapper,
          {},
          React.createElement(Dashboard, {})
        )
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      console.log('Large dataset render time: ' + renderTime + 'ms');
      expect(renderTime).toBeLessThan(5000); // less than 5s for large dataset
    });

    it('should detect and handle mock data appropriately', async () => {
      console.log('Testing mock data detection...');
      
      const mockData = realDataValidator.generateMockKriData(100);
      const detectionResult = realDataValidator.detectMockData(mockData);
      
      expect(detectionResult.isMockData).toBe(true);
      expect(detectionResult.confidence).toBeGreaterThan(0.8);
      expect(detectionResult.indicators).toContain('sequential_ids');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle authentication failures gracefully', async () => {
      mockSupabase.auth.getUser.mockRejectedValueOnce(new Error('Authentication failed'));
      
      const loginResult = await workflowTestSuite.testLogin('invalid@example.com', 'wrong-password');
      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toContain('Authentication failed');
    });

    it('should handle API timeouts properly', async () => {
      mockSupabase.functions.invoke.mockImplementationOnce(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      );
      
      const timeoutResult = await workflowTestSuite.testAIQuery('Test query', { timeout: 5000 });
      expect(timeoutResult.success).toBe(false);
      expect(timeoutResult.error).toContain('Timeout');
    });

    it('should handle database connection errors', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.reject(new Error('Database connection failed')),
            }),
          }),
        }),
      });

      const dbResult = await workflowTestSuite.testDatabaseQuery('kri_logs');
      expect(dbResult.success).toBe(false);
      expect(dbResult.error).toContain('Database connection failed');
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet response time requirements', async () => {
      const benchmarks = await workflowTestSuite.runPerformanceBenchmarks();
      
      expect(benchmarks.loginTime).toBeLessThan(2000);
      expect(benchmarks.dashboardRenderTime).toBeLessThan(3000);
      expect(benchmarks.aiResponseTime).toBeLessThan(5000);
      expect(benchmarks.emailDeliveryTime).toBeLessThan(3000);
      expect(benchmarks.pdfGenerationTime).toBeLessThan(4000);
    });

    it('should handle concurrent users', async () => {
      const concurrentUsers = 10;
      const promises = Array.from({ length: concurrentUsers }, (_, i) => 
        workflowTestSuite.testLogin(`user${i}@example.com`, 'password')
      );
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      
      expect(successCount).toBeGreaterThan(concurrentUsers * 0.8); // 80% success rate
    });
  });
});