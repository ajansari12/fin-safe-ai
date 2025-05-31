
// Re-export all types and functions for backward compatibility
export type { AppetiteBreachLog, EscalationRule, BoardReport } from './appetite-breach/types';

export {
  getAppetiteBreachLogs,
  updateBreachLog,
  escalateBreach
} from './appetite-breach/breach-logs-service';

export {
  getEscalationRules,
  createEscalationRule
} from './appetite-breach/escalation-rules-service';

export {
  getBoardReports,
  generateBoardReport
} from './appetite-breach/board-reports-service';

export {
  checkAggregatedKRIScore
} from './appetite-breach/risk-posture-service';
