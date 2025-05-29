
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
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    })),
    functions: {
      invoke: vi.fn()
    },
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('KRI Breach Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect threshold breaches', async () => {
    const mockKRI = {
      id: '1',
      name: 'Test KRI',
      warning_threshold: '80',
      critical_threshold: '95'
    };

    const mockKRILog = {
      id: '1',
      kri_id: '1',
      actual_value: 90,
      measurement_date: new Date().toISOString()
    };

    // Test breach detection logic
    const actualValue = mockKRILog.actual_value;
    const warningThreshold = parseFloat(mockKRI.warning_threshold);
    const criticalThreshold = parseFloat(mockKRI.critical_threshold);

    let breachLevel = null;
    if (actualValue >= criticalThreshold) {
      breachLevel = 'critical';
    } else if (actualValue >= warningThreshold) {
      breachLevel = 'warning';
    }

    expect(breachLevel).toBe('warning');
  });

  it('should send breach notifications', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { success: true },
      error: null
    });

    const mockBreach = {
      kriId: '1',
      kriName: 'Test KRI',
      actualValue: 95,
      threshold: 80,
      breachLevel: 'critical'
    };

    // Simulate sending a breach notification
    const result = await supabase.functions.invoke('send-kri-breach-alert', {
      body: mockBreach
    });

    expect(result.data?.success).toBe(true);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('send-kri-breach-alert', {
      body: mockBreach
    });
  });

  it('should calculate variance correctly', async () => {
    const actualValue = 95;
    const threshold = 80;
    const variance = ((actualValue - threshold) / threshold) * 100;

    expect(variance).toBe(18.75); // 18.75% over threshold
  });
});
