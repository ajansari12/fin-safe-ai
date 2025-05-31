
export interface AppetiteBreachLog {
  id: string;
  org_id: string;
  risk_category_id?: string;
  statement_id?: string;
  threshold_id?: string;
  breach_date: string;
  breach_severity: 'warning' | 'breach' | 'critical';
  actual_value: number;
  threshold_value: number;
  variance_percentage?: number;
  escalation_level: number;
  escalated_at?: string;
  escalated_to?: string;
  escalated_to_name?: string;
  resolution_status: 'open' | 'acknowledged' | 'in_progress' | 'resolved';
  resolution_date?: string;
  resolution_notes?: string;
  alert_sent: boolean;
  board_reported: boolean;
  business_impact?: string;
  remediation_actions?: string;
  created_at: string;
  updated_at: string;
}

export interface EscalationRule {
  id: string;
  org_id: string;
  rule_name: string;
  rule_description?: string;
  trigger_condition: 'single_breach' | 'multiple_breaches' | 'aggregated_score';
  threshold_value: number;
  escalation_level: number;
  escalation_delay_hours: number;
  notification_recipients: any[];
  auto_escalate: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardReport {
  id: string;
  org_id: string;
  report_period_start: string;
  report_period_end: string;
  report_type: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  report_data: any;
  executive_summary?: string;
  key_findings?: string;
  recommendations?: string;
  risk_posture_score?: number;
  trend_analysis?: string;
  generated_by?: string;
  generated_by_name?: string;
  approved_by?: string;
  approved_by_name?: string;
  approval_date?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published';
  created_at: string;
  updated_at: string;
}
