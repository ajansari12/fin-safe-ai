
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

// Main service object that combines all services for backward compatibility
export const enhancedRiskAppetiteService = {
  // Risk appetite logs
  getRiskAppetiteLogs: () => riskAppetiteLogsService.getRiskAppetiteLogs(),
  createRiskAppetiteLog: (log: any) => riskAppetiteLogsService.createRiskAppetiteLog(log),
  
  // Appetite breaches - use existing appetite_breach_logs table
  getAppetiteBreaches: () => appetiteBreachesService.getAppetiteBreaches(),
  escalateBreach: (breachId: string, escalationLevel: number, escalatedTo?: string) => 
    appetiteBreachesService.escalateBreach(breachId, escalationLevel, escalatedTo),
  updateBreachStatus: (breachId: string, status: string, notes?: string) => 
    appetiteBreachesService.updateBreachStatus(breachId, status, notes),
  
  // Trend data
  getTrendData: () => trendDataService.getTrendData(),
  
  // Risk posture
  getRiskPostureHeatmap: () => riskPostureService.getRiskPostureHeatmap()
};
