import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityAnalytic {
  metric_name: string;
  metric_value: number;
  metric_trend: 'increasing' | 'decreasing' | 'stable';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface SecurityCompliance {
  category: string;
  compliant_count: number;
  non_compliant_count: number;
  compliance_percentage: number;
  critical_issues: number;
  high_issues: number;
  recommendations: string[];
}

export function useAdvancedSecurityAnalytics(timeRange: string = '24 hours') {
  const [analytics, setAnalytics] = useState<SecurityAnalytic[]>([]);
  const [compliance, setCompliance] = useState<SecurityCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {

    try {
      setLoading(true);
      setError(null);

      // Fetch security analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .rpc('get_advanced_security_analytics', {
          p_time_range: timeRange,
        });

      if (analyticsError) {
        throw analyticsError;
      }

      // Fetch compliance data
      const { data: complianceData, error: complianceError } = await supabase
        .rpc('check_security_baseline_compliance');

      if (complianceError) {
        throw complianceError;
      }

      setAnalytics(analyticsData || []);
      setCompliance(complianceData || []);
    } catch (err) {
      console.error('Error fetching security analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch security analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  const getOverallRiskLevel = (): 'low' | 'medium' | 'high' | 'critical' => {
    if (analytics.length === 0) return 'low';

    const criticalCount = analytics.filter(a => a.risk_level === 'critical').length;
    const highCount = analytics.filter(a => a.risk_level === 'high').length;
    const mediumCount = analytics.filter(a => a.risk_level === 'medium').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 1) return 'high';
    if (highCount > 0 || mediumCount > 2) return 'medium';
    return 'low';
  };

  const getComplianceScore = (): number => {
    if (compliance.length === 0) return 0;

    const totalCompliant = compliance.reduce((sum, c) => sum + c.compliant_count, 0);
    const totalNonCompliant = compliance.reduce((sum, c) => sum + c.non_compliant_count, 0);
    const total = totalCompliant + totalNonCompliant;

    return total > 0 ? Math.round((totalCompliant / total) * 100) : 0;
  };

  const getCriticalIssuesCount = (): number => {
    return compliance.reduce((sum, c) => sum + c.critical_issues, 0);
  };

  const getHighIssuesCount = (): number => {
    return compliance.reduce((sum, c) => sum + c.high_issues, 0);
  };

  const getAllRecommendations = (): string[] => {
    const analyticsRecs = analytics.flatMap(a => a.recommendations);
    const complianceRecs = compliance.flatMap(c => c.recommendations);
    
    return [...new Set([...analyticsRecs, ...complianceRecs])].filter(Boolean);
  };

  const getSecurityTrend = (): 'improving' | 'stable' | 'declining' => {
    if (analytics.length === 0) return 'stable';

    const increasingCount = analytics.filter(a => a.metric_trend === 'increasing').length;
    const decreasingCount = analytics.filter(a => a.metric_trend === 'decreasing').length;

    if (increasingCount > decreasingCount) return 'declining';
    if (decreasingCount > increasingCount) return 'improving';
    return 'stable';
  };

  const getMetricByName = (name: string): SecurityAnalytic | undefined => {
    return analytics.find(a => a.metric_name === name);
  };

  const getComplianceByCategory = (category: string): SecurityCompliance | undefined => {
    return compliance.find(c => c.category === category);
  };

  return {
    analytics,
    compliance,
    loading,
    error,
    refreshAnalytics,
    
    // Computed values
    overallRiskLevel: getOverallRiskLevel(),
    complianceScore: getComplianceScore(),
    criticalIssuesCount: getCriticalIssuesCount(),
    highIssuesCount: getHighIssuesCount(),
    allRecommendations: getAllRecommendations(),
    securityTrend: getSecurityTrend(),
    
    // Helper functions
    getMetricByName,
    getComplianceByCategory,
  };
}