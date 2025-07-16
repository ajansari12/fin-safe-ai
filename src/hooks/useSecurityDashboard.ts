import { useState, useEffect } from 'react';
import { securityIncidentMonitor, SecurityMetrics, SecurityIncident } from '@/services/security/security-incident-monitor';
import { runSecurityValidation } from '@/utils/security-validator';

// Define the interface locally since it's not exported
interface SecurityValidationResult {
  category: string;
  test: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  impact: string;
}
import { logger } from '@/lib/logger';

export interface SecurityDashboardData {
  metrics: SecurityMetrics;
  activeIncidents: SecurityIncident[];
  validationResults: SecurityValidationResult[];
  loading: boolean;
  error: string | null;
}

export const useSecurityDashboard = (orgId: string | null) => {
  const [data, setData] = useState<SecurityDashboardData>({
    metrics: {
      total_incidents: 0,
      critical_incidents: 0,
      resolved_incidents: 0,
      average_resolution_time: 0,
      incident_trend: 'stable',
      top_incident_types: []
    },
    activeIncidents: [],
    validationResults: [],
    loading: true,
    error: null
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (!orgId) return;

    const fetchSecurityData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch security metrics, active incidents, and validation results in parallel
        const [metrics, activeIncidents, validationResults] = await Promise.all([
          securityIncidentMonitor.getSecurityMetrics(orgId, '7d'),
          securityIncidentMonitor.getActiveIncidents(orgId),
          Promise.resolve(runSecurityValidation())
        ]);

        setData({
          metrics,
          activeIncidents,
          validationResults,
          loading: false,
          error: null
        });

        logger.info('Security dashboard data loaded', {
          module: 'security-dashboard',
          metadata: {
            total_incidents: metrics.total_incidents,
            critical_incidents: metrics.critical_incidents,
            active_incidents: activeIncidents.length,
            validation_issues: validationResults.filter(r => r.status !== 'pass').length
          }
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load security data';
        setData(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));

        logger.error('Error loading security dashboard data', {
          module: 'security-dashboard',
          metadata: { error: errorMessage }
        });
      }
    };

    fetchSecurityData();
  }, [orgId, refreshTrigger]);

  const resolveIncident = async (incidentId: string, resolution: {
    status: 'resolved' | 'false_positive';
    notes: string;
    resolved_by: string;
  }) => {
    try {
      await securityIncidentMonitor.resolveIncident(incidentId, resolution);
      refreshData();
      
      logger.info('Security incident resolved', {
        module: 'security-dashboard',
        metadata: { incidentId, status: resolution.status }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resolve incident';
      logger.error('Error resolving security incident', {
        module: 'security-dashboard',
        metadata: { error: errorMessage, incidentId }
      });
      throw error;
    }
  };

  const logSecurityIncident = async (incident: {
    type: 'authentication_failure' | 'authorization_violation' | 'data_breach' | 'suspicious_activity' | 'policy_violation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    details: Record<string, any>;
    user_id?: string;
  }) => {
    try {
      await securityIncidentMonitor.logIncident(incident);
      refreshData();
      
      logger.info('Security incident logged', {
        module: 'security-dashboard',
        metadata: { type: incident.type, severity: incident.severity }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to log incident';
      logger.error('Error logging security incident', {
        module: 'security-dashboard',
        metadata: { error: errorMessage, incident }
      });
      throw error;
    }
  };

  const getSecurityScore = (): number => {
    const { validationResults } = data;
    if (validationResults.length === 0) return 0;

    const totalTests = validationResults.length;
    const passedTests = validationResults.filter(r => r.status === 'pass').length;
    const warningTests = validationResults.filter(r => r.status === 'warning').length;
    const criticalTests = validationResults.filter(r => r.status === 'fail').length;

    // Calculate weighted score
    const score = (passedTests * 100 + warningTests * 50 + criticalTests * 0) / totalTests;
    return Math.round(score);
  };

  const getSecurityStatus = (): 'excellent' | 'good' | 'warning' | 'critical' => {
    const score = getSecurityScore();
    const { metrics } = data;

    if (metrics.critical_incidents > 0) return 'critical';
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'critical';
  };

  const getCriticalIssues = (): SecurityValidationResult[] => {
    return data.validationResults.filter(r => r.status === 'fail');
  };

  const getRecommendations = (): string[] => {
    const criticalIssues = getCriticalIssues();
    const recommendations: string[] = [];

    if (criticalIssues.length > 0) {
      recommendations.push('Address critical security vulnerabilities immediately');
    }

    if (data.metrics.critical_incidents > 0) {
      recommendations.push('Review and resolve all critical security incidents');
    }

    if (data.metrics.incident_trend === 'increasing') {
      recommendations.push('Investigate the increasing trend in security incidents');
    }

    if (data.activeIncidents.length > 10) {
      recommendations.push('Reduce the number of active security incidents');
    }

    const warningIssues = data.validationResults.filter(r => r.status === 'warning');
    if (warningIssues.length > 5) {
      recommendations.push('Address warning-level security issues to prevent escalation');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current security posture and continue monitoring');
    }

    return recommendations;
  };

  return {
    ...data,
    refreshData,
    resolveIncident,
    logSecurityIncident,
    getSecurityScore,
    getSecurityStatus,
    getCriticalIssues,
    getRecommendations
  };
};