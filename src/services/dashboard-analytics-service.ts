
// Re-export all analytics functions for backward compatibility
export {
  getIncidentAnalytics,
  getUnresolvedIncidentsCount,
  type IncidentAnalytics
} from './incident-analytics-service';

export {
  getKRIBreaches,
  getKRIBreachesData,
  type KRIBreach
} from './kri-analytics-service';

export {
  getOverduePolicyReviews,
  type PolicyReview
} from './governance-analytics-service';

export {
  getThirdPartyReviewsDue,
  type ThirdPartyReview
} from './third-party-analytics-service';

export {
  getMostSensitiveCBFs,
  type SensitiveCBF
} from './business-function-analytics-service';

// Mock getDashboardMetrics for backward compatibility
export const getDashboardMetrics = async (orgId: string) => {
  return {
    total_incidents: 0,
    high_severity_incidents: 0,
    active_controls: 0,
    total_controls: 0,
    total_kris: 0,
    total_vendors: 0,
    high_risk_vendors: 0
  };
};
