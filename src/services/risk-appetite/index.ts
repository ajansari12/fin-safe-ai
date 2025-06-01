
// Re-export all types and services for easy access
export type { 
  RiskAppetiteLog, 
  AppetiteBreach, 
  KRILogEntry, 
  RiskPostureData, 
  TrendData 
} from './types';

export { riskAppetiteLogsService } from './risk-appetite-logs-service';
export { appetiteBreachesService } from './appetite-breaches-service';
export { trendDataService } from './trend-data-service';
export { riskPostureService } from './risk-posture-service';

// Import services for the main service object
import { riskAppetiteLogsService } from './risk-appetite-logs-service';
import { appetiteBreachesService } from './appetite-breaches-service';
import { trendDataService } from './trend-data-service';
import { riskPostureService } from './risk-posture-service';

// Main service object that combines all services for backward compatibility
export const enhancedRiskAppetiteService = {
  // Risk appetite logs
  getRiskAppetiteLogs: riskAppetiteLogsService.getRiskAppetiteLogs,
  createRiskAppetiteLog: riskAppetiteLogsService.createRiskAppetiteLog,
  
  // Appetite breaches 
  getAppetiteBreaches: appetiteBreachesService.getAppetiteBreaches,
  escalateBreach: appetiteBreachesService.escalateBreach,
  updateBreachStatus: appetiteBreachesService.updateBreachStatus,
  
  // Trend data
  getTrendData: trendDataService.getTrendData,
  
  // Risk posture
  getRiskPostureHeatmap: riskPostureService.getRiskPostureHeatmap
};
