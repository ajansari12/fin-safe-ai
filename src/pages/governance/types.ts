
export interface GovernanceStructure {
  id: string;
  framework_id: string;
  name: string;
  type: 'committee' | 'sponsor';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface GovernanceRole {
  id: string;
  framework_id: string;
  title: string;
  description: string | null;
  responsibilities: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface GovernancePolicy {
  id: string;
  framework_id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  file_type: string | null;
  version: number;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface GovernanceReviewSchedule {
  id: string;
  policy_id: string;
  review_frequency_months: number;
  last_review_date: string | null;
  next_review_date: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface GovernanceChangeLog {
  id: string;
  framework_id: string | null;
  policy_id: string | null;
  change_type: 'created' | 'updated' | 'reviewed';
  description: string | null;
  previous_version: number | null;
  new_version: number | null;
  changed_by: string | null;
  created_at: string;
}

export interface GovernanceFramework {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  version: number;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  structures?: GovernanceStructure[];
  roles?: GovernanceRole[];
  policies?: GovernancePolicy[];
}
