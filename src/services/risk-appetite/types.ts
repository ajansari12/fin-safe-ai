
export interface RiskAppetiteLog {
  id: string;
  org_id: string;
  risk_category_id: string;
  statement_id: string;
  threshold_id: string;
  log_date: string;
  appetite_value: number;
  actual_value: number;
  variance_percentage: number;
  variance_status: 'within_appetite' | 'warning' | 'breach';
  kri_data: any;
  notes?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  risk_category?: {
    name: string;
  };
}

export interface AppetiteBreach {
  id: string;
  org_id: string;
  risk_category_id: string;
  statement_id: string;
  threshold_id: string;
  breach_date: string;
  breach_severity: 'warning' | 'breach' | 'critical';
  actual_value: number;
  appetite_value: number;
  variance_percentage: number;
  escalation_level: number;
  escalated_at?: string;
  escalated_to?: string;
  escalated_to_name?: string;
  resolution_status: 'open' | 'acknowledged' | 'in_progress' | 'resolved';
  resolution_date?: string;
  resolution_notes?: string;
  business_impact?: string;
  remediation_plan?: string;
  board_notified: boolean;
  board_notification_date?: string;
  auto_escalated: boolean;
  created_at: string;
  updated_at: string;
  risk_category?: {
    name: string;
  };
}

export interface KRILogEntry {
  id: string;
  org_id: string;
  kri_id: string;
  measurement_date: string;
  actual_value: number;
  target_value?: number;
  warning_threshold?: number;
  critical_threshold?: number;
  variance_from_target?: number;
  variance_percentage?: number;
  status: 'normal' | 'warning' | 'critical';
  measurement_source: string;
  measurement_notes?: string;
  measured_by?: string;
  measured_by_name?: string;
  created_at: string;
  updated_at: string;
  kri_definition?: {
    name: string;
    description?: string;
  };
}

export interface RiskPostureData {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  variance_percentage: number;
}

export interface TrendData {
  date: string;
  category: string;
  appetite_value: number;
  actual_value: number;
  variance_percentage: number;
}
