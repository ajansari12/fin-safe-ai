export type MaturityLevel = 'basic' | 'developing' | 'advanced' | 'sophisticated';

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  target_sector: string;
  questions: QuestionnaireSection[];
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireSection {
  id: string;
  section: string;
  description?: string;
  questions: QuestionnaireQuestion[];
  conditional?: {
    dependsOn: string;
    condition: string;
    value: any;
  };
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  required: boolean;
  order: number;
  template_id: string;
}

export interface QuestionnaireQuestion {
  id: string;
  text: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'range';
  options?: string[];
  required: boolean;
  order: number;
  help?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditional?: {
    dependsOn: string;
    condition: string;
    value: any;
  };
}

export interface QuestionnaireResponse {
  id: string;
  organization_id: string;
  template_id: string;
  responses: Record<string, any>;
  completion_percentage: number;
  current_section?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationalProfile {
  id: string;
  org_id: string;
  organization_id: string;
  name: string;
  sub_sector: string;
  employee_count: number;
  asset_size: number;
  geographic_scope: string;
  customer_base?: string;
  risk_maturity: MaturityLevel;
  compliance_maturity: MaturityLevel;
  technology_maturity: MaturityLevel;
  digital_transformation: MaturityLevel;
  risk_culture: string;
  regulatory_history: string;
  previous_incidents: number;
  third_party_dependencies: number;
  geographic_locations: number;
  business_lines: string[];
  primary_regulators: string[];
  applicable_frameworks: string[];
  profile_score: number;
  completeness_percentage: number;
  growth_strategy: string;
  digital_strategy?: string;
  market_position: string;
  competitive_strategy?: string;
  international_exposure?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileAssessment {
  id: string;
  profile_id: string;
  risk_level: string;
  maturity_level: string;
  score: number;
  completeness: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  next_steps: string[];
  created_at: string;
}

export interface GeneratedFramework {
  id: string;
  profile_id: string;
  name: string;
  description: string;
  framework_data: any;
  effectiveness_score: number;
  implementation_status: string;
  created_at: string;
  updated_at: string;
}

export interface RiskFrameworkTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  framework_components: any;
  target_profile: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectorThreshold {
  id: string;
  sector: string;
  metric: string;
  recommendedValue: string;
  rationale: string;
}

export interface WorkflowAnalysis {
  module: string;
  totalSteps: number;
  completedSteps: number;
  completionPercentage: number;
  recommendations: string[];
}

export interface RiskSummary {
  category: string;
  level: string;
  count: number;
  topRisks: {
    name: string;
    impact: string;
  }[];
}

// Enhanced AI Intelligence Types
export interface PredictiveInsight {
  id: string;
  type: 'risk_trend' | 'compliance_gap' | 'opportunity' | 'threat';
  title: string;
  description: string;
  confidence: number; // 0-1
  timeframe: '1_month' | '3_months' | '6_months' | '12_months';
  impact: 'low' | 'medium' | 'high' | 'critical';
  predicted_values: {
    date: string;
    value: number;
    metric: string;
  }[];
  factors: string[];
  created_at: string;
}

export interface IntelligentRecommendation {
  id: string;
  category: 'risk_management' | 'compliance' | 'technology' | 'governance' | 'operations';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  rationale: string;
  implementation_steps: string[];
  estimated_effort: '1_month' | '2_months' | '3_months' | '6_months' | '12_months';
  expected_impact: string;
  success_metrics: string[];
  resources_required: string[];
  created_at: string;
}

export interface RiskPrediction {
  id: string;
  risk_category: 'operational' | 'compliance' | 'technology' | 'strategic';
  current_score: number;
  predicted_scores: {
    timeframe: '1_month' | '3_months' | '6_months';
    score: number;
    confidence: number;
  }[];
  key_drivers: string[];
  mitigation_impact: {
    high_investment: number;
    medium_investment: number;
    low_investment: number;
  };
  created_at: string;
}

export interface MaturityProgression {
  id: string;
  dimension: 'risk_management' | 'compliance' | 'technology' | 'governance';
  current_level: MaturityLevel;
  target_level: MaturityLevel;
  progression_path: {
    level: MaturityLevel;
    requirements: string[];
    estimated_timeline: string;
    investment_required: 'low' | 'medium' | 'high' | 'very_high';
  }[];
  key_milestones: string[];
  success_indicators: string[];
  created_at: string;
}

// AI-Powered Analytics Types
export interface IntelligenceMetrics {
  prediction_accuracy: number;
  insights_generated: number;
  recommendations_implemented: number;
  risk_reduction_achieved: number;
  maturity_improvement: number;
}

export interface AIAnalysisResult {
  analysis_id: string;
  analysis_type: 'predictive' | 'prescriptive' | 'diagnostic';
  insights: PredictiveInsight[];
  recommendations: IntelligentRecommendation[];
  risk_predictions: RiskPrediction[];
  maturity_analysis: MaturityProgression[];
  confidence_score: number;
  generated_at: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_conditions: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
  }[];
  actions: {
    type: 'alert' | 'escalate' | 'remediate' | 'report';
    parameters: Record<string, any>;
  }[];
  is_active: boolean;
  created_at: string;
}

// Intelligence Dashboard Types
export interface IntelligenceDashboardData {
  profile_health_score: number;
  risk_trend_direction: 'improving' | 'stable' | 'deteriorating';
  key_insights: PredictiveInsight[];
  priority_recommendations: IntelligentRecommendation[];
  automation_status: {
    rules_active: number;
    actions_executed: number;
    efficiency_gained: number;
  };
  maturity_trajectory: {
    dimension: string;
    current_score: number;
    projected_score: number;
    improvement_rate: number;
  }[];
}

// API Response Types
export interface IntelligenceResponse<T = any> {
  success: boolean;
  data: T;
  metadata?: {
    processing_time: number;
    confidence_level: number;
    model_version: string;
  };
  error?: string;
}

// Add missing test-related types
export interface TestResult {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'performance' | 'security';
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: number;
  coverage?: number;
  lastRun: string;
  error?: string;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  totalCoverage: number;
  passRate: number;
}
