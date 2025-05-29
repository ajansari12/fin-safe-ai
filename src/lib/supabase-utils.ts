
// Re-export all utilities from the modular structure
export type { QueryOptions, PaginatedResult } from "./supabase/types";

export {
  getCurrentUserProfile,
  getUserOrganization
} from "./supabase/user-utils";

export {
  getIncidentsWithPagination,
  getPoliciesWithPagination,
  getKRILogsWithPagination
} from "./supabase/pagination-utils";

export {
  safeGetSingleIncident,
  safeGetSinglePolicy,
  safeDeleteIncident,
  safeDeletePolicy,
  safeDeleteKRILog
} from "./supabase/safe-queries";
