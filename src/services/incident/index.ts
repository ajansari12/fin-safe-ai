
// Export all types
export type {
  Incident,
  IncidentEscalation,
  IncidentResponse,
  CreateIncidentData,
  UpdateIncidentData,
  IncidentMetrics
} from './types';

// Export incident queries
export {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident
} from './incident-queries';

// Export incident responses
export {
  getIncidentResponses,
  createIncidentResponse,
  sendAlert
} from './incident-responses';

// Export incident escalations
export {
  getIncidentEscalations,
  escalateIncident
} from './incident-escalations';

// Export SLA functions
export {
  checkSLABreaches,
  getIncidentMetrics
} from './incident-sla';
