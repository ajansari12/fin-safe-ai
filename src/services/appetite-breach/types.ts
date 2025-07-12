export interface AppetiteBreachLog {
  id: string;
  org_id: string;
  risk_category_id: string;
  statement_id?: string;
  threshold_id?: string;
  breach_date: string;
  breach_severity: 'warning' | 'breach' | 'critical';
  actual_value: number;
  threshold_value: number;
  variance_percentage?: number;
  escalation_level?: number;
  escalated_at?: string;
  escalated_to?: string;
  escalated_to_name?: string;
  resolution_status: 'open' | 'acknowledged' | 'in_progress' | 'resolved';
  resolution_date?: string;
  resolution_notes?: string;
  business_impact?: string;
  remediation_actions?: string;
  alert_sent?: boolean;
  board_reported?: boolean;
  created_at: string;
  updated_at: string;
  risk_category?: {
    name: string;
  };
}

export interface EscalationRule {
  id: string;
  org_id: string;
  rule_name: string;
  trigger_condition: string;
  escalation_level: number;
  threshold_value: number;
  auto_escalate?: boolean;
  escalation_delay_hours?: number;
  notification_recipients?: any[];
  rule_description?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardReport {
  id: string;
  org_id: string;
  report_period_start: string;
  report_period_end: string;
  report_type: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published';
  report_data: any;
  executive_summary?: string;
  key_findings?: string;
  recommendations?: string;
  trend_analysis?: string;
  risk_posture_score?: number;
  generated_by?: string;
  generated_by_name?: string;
  approved_by?: string;
  approved_by_name?: string;
  approval_date?: string;
  created_at: string;
  updated_at: string;
}

export interface KRIAppetiteVariance {
  id: string;
  kri_id: string;
  measurement_date: string;
  actual_value: number;
  appetite_threshold?: number;
  variance_percentage?: number;
  variance_status: 'within_appetite' | 'warning' | 'breach';
  created_at: string;
  updated_at: string;
}