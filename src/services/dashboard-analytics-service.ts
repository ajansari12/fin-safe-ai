
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
