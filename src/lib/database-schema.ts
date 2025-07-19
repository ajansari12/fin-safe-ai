
// Database schema definitions for new tables needed for prompts 1.2-1.6

export interface RiskAppetiteStatement {
  id: string;
  organization_id: string;
  statement_name: string;
  description?: string;
  effective_date: string;
  review_date: string;
  next_review_date: string;
  approval_status: 'draft' | 'pending' | 'approved' | 'expired';
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RiskCategory {
  id: string;
  statement_id: string;
  category_name: string;
  category_type: 'operational' | 'financial' | 'compliance' | 'strategic';
  appetite_level: 'averse' | 'minimal' | 'cautious' | 'open' | 'seeking';
  description: string;
  rationale?: string;
  created_at: string;
  updated_at: string;
}

export interface QuantitativeLimit {
  id: string;
  statement_id: string;
  category_id: string;
  metric_name: string;
  limit_value: number;
  limit_unit: string;
  warning_threshold: number;
  critical_threshold: number;
  measurement_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  data_source: string;
  calculation_method?: string;
  created_at: string;
  updated_at: string;
}

export interface QualitativeStatement {
  id: string;
  statement_id: string;
  category: 'culture' | 'conduct' | 'compliance' | 'reputation';
  statement_text: string;
  acceptance_criteria: string[];
  rationale?: string;
  created_at: string;
  updated_at: string;
}

export interface KRI {
  id: string;
  org_id: string;
  name: string;
  description: string;
  category: 'operational' | 'financial' | 'compliance' | 'strategic';
  subcategory: string;
  owner: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  data_source: string;
  calculation_method: string;
  unit: string;
  target_value?: number;
  warning_threshold: number;
  critical_threshold: number;
  current_value?: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  last_updated: string;
  status: 'active' | 'inactive' | 'under_review';
  tags: string[];
  related_controls: string[];
  escalation_procedure: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface KRIDataPoint {
  id: string;
  kri_id: string;
  value: number;
  record_date: string;
  data_quality: 'high' | 'medium' | 'low';
  source: string;
  comments?: string;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
}

export interface KRIBreach {
  id: string;
  kri_id: string;
  breach_date: string;
  breach_level: 'warning' | 'critical';
  breach_value: number;
  threshold_value: number;
  root_cause?: string;
  impact_assessment?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assigned_to: string;
  resolved_date?: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedInsight {
  id: string;
  org_id: string;
  type: 'predictive' | 'diagnostic' | 'prescriptive' | 'descriptive';
  category: 'operational' | 'compliance' | 'strategic' | 'financial';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data_sources: string[];
  generated_at: string;
  expires_at: string;
  created_by: string;
}

export interface InsightRecommendation {
  id: string;
  insight_id: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  estimated_impact: string;
  timeframe: string;
  assigned_to?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export interface DetailViewLog {
  id: string;
  user_id: string;
  entity_type: 'compliance' | 'kri' | 'control' | 'incident' | 'risk';
  entity_id: string;
  view_type: 'modal' | 'page';
  accessed_at: string;
  duration_seconds?: number;
}
