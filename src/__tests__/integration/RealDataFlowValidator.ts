// Mock RealDataFlowValidator for E2E testing
export class RealDataFlowValidator {
  generateMockKriData(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `kri-${i}`,
      kri_name: `Risk Indicator ${i}`,
      actual_value: Math.random() * 100,
      threshold_value: 75,
      measurement_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }));
  }

  generateMockBreachData() {
    return {
      id: 'breach-001',
      threshold_breached: 'high',
      actual_value: 85,
      threshold_value: 70,
      severity: 'high',
      breach_date: new Date().toISOString()
    };
  }

  generateMockVendorAlerts(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `vendor-alert-${i}`,
      vendor_name: `Vendor ${i}`,
      risk_level: i % 3 === 0 ? 'high' : 'medium',
      alert_type: 'contract_expiry',
      created_at: new Date().toISOString()
    }));
  }

  detectMockData(data: any[]) {
    return {
      isMockData: true,
      confidence: 0.95,
      indicators: ['sequential_ids', 'uniform_patterns', 'test_prefixes'],
      realDataPercentage: 0.05
    };
  }
}