
export interface RiskCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskAppetiteStatement {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  version: number;
  status: 'draft' | 'active' | 'archived';
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskThreshold {
  id: string;
  statement_id: string;
  category_id: string;
  tolerance_level: 'low' | 'medium' | 'high';
  description: string | null;
  escalation_trigger: string | null;
  created_at: string;
  updated_at: string;
  category?: RiskCategory; // For joined data
}

export interface KRIDefinition {
  id: string;
  threshold_id: string;
  name: string;
  description: string | null;
  measurement_frequency: string | null;
  target_value: string | null;
  warning_threshold: string | null;
  critical_threshold: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskAppetiteFormData {
  statement: Partial<RiskAppetiteStatement>;
  thresholds: Partial<RiskThreshold>[];
  kris: Record<string, Partial<KRIDefinition>[]>; // Keyed by threshold ID
}

export interface RiskAppetiteComplete extends RiskAppetiteStatement {
  thresholds: (RiskThreshold & {
    category: RiskCategory;
    kris: KRIDefinition[];
  })[];
}
