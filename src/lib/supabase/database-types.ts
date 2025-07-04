
// Simplified database types to prevent excessive type instantiation
export interface DatabaseRow {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRow extends DatabaseRow {
  name: string;
  sector?: string;
  size?: string;
  org_type?: string;
  sub_sector?: string;
  employee_count?: number;
  asset_size?: number;
  capital_tier?: string;
  onboarding_status?: string;
  onboarding_completed_at?: string;
  geographic_scope?: string;
  regulatory_classification?: string[];
}

export interface ProfileRow extends DatabaseRow {
  full_name?: string;
  avatar_url?: string;
  role: string;
  organization_id?: string;
  onboarding_status?: string;
}

export interface SecurityLogRow extends DatabaseRow {
  org_id: string;
  user_id: string;
  action_type: string;
  event_category: string;
  outcome: string;
  risk_score?: number;
  ip_address?: string;
  user_agent?: string;
}

export interface DeviceFingerprintRow extends DatabaseRow {
  user_id: string;
  org_id: string;
  device_id: string;
  fingerprint_hash: string;
  device_info: any;
  is_trusted: boolean;
  risk_score: number;
  last_seen_at: string;
}

// Type guards for runtime type checking
export function isValidProfile(data: any): data is ProfileRow {
  return data && typeof data.id === 'string' && typeof data.role === 'string';
}

export function isValidOrganization(data: any): data is OrganizationRow {
  return data && typeof data.id === 'string' && typeof data.name === 'string';
}

export function isValidSecurityLog(data: any): data is SecurityLogRow {
  return data && 
         typeof data.org_id === 'string' && 
         typeof data.user_id === 'string' && 
         typeof data.action_type === 'string';
}
