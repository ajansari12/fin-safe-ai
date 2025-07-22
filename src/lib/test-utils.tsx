
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EnhancedAuthProvider } from '@/contexts/EnhancedAuthContext';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedAuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </BrowserRouter>
      </EnhancedAuthProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data generators for testing
export const mockPerformanceMetrics = () => ({
  id: 'test-metric-1',
  org_id: 'test-org-1',
  service_name: 'test-service',
  metric_timestamp: new Date().toISOString(),
  response_time_ms: 150,
  throughput_rps: 100,
  error_rate: 0.5,
  cpu_usage: 45,
  memory_usage: 60,
  disk_usage: 30,
  network_latency_ms: 20,
  database_connections: 10,
  queue_depth: 5,
  cache_hit_rate: 85,
  user_experience_metrics: {},
  system_metrics: {},
  custom_metrics: {},
  created_at: new Date().toISOString(),
  region: 'us-east-1'
});

export const mockIntegration = () => ({
  id: 'test-integration-1',
  org_id: 'test-org-1',
  name: 'Test Integration',
  type: 'api',
  status: 'active',
  config: {},
  last_sync_at: new Date().toISOString(),
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

export const mockAutomatedReporting = () => ({
  id: 'test-report-1',
  org_id: 'test-org-1',
  rule_name: 'Test Report',
  report_type: 'performance',
  frequency: 'daily',
  schedule_config: {},
  data_sources: [],
  template_config: {},
  recipients: [],
  output_format: 'pdf',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});
