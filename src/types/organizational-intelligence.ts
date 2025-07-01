
export interface OrganizationalProfile {
  id: string;
  organization_id: string;
  
  // Basic Info
  sub_sector?: string;
  employee_count?: number;
  asset_size?: number;
  geographic_scope?: 'local' | 'regional' | 'national' | 'international';
  customer_base?: 'retail' | 'commercial' | 'institutional' | 'mixed';
  
  // Risk Profile
  risk_maturity?: 'basic' | 'developing' | 'advanced' | 'sophisticated';
  risk_culture?: 'risk-averse' | 'balanced' | 'risk-taking';
  compliance_maturity?: 'basic' | 'developing' | 'mature' | 'advanced';
  previous_incidents?: number;
  regulatory_history?: 'clean' | 'minor-issues' | 'significant-issues';
  
  // Operational Complexity
  business_lines?: string[];
  geographic_locations?: number;
  third_party_dependencies?: number;
  technology_maturity?: 'basic' | 'developing' | 'advanced' | 'cutting-edge';
  digital_transformation?: 'early' | 'progressing' | 'advanced' | 'leader';
  
  // Regulatory Environment
  primary_regulators?: string[];
  applicable_frameworks?: string[];
  upcoming_regulations?: string[];
  international_exposure?: boolean;
  
  // Strategic Objectives
  growth_strategy?: 'conservative' | 'moderate' | 'aggressive';
  digital_strategy?: 'follower' | 'fast-follower' | 'leader' | 'innovator';
  market_position?: 'niche' | 'regional' | 'national' | 'international';
  competitive_strategy?: 'cost-leader' | 'differentiator' | 'focused';
  
  // Profile Metadata
  profile_score?: number;
  completeness_percentage?: number;
  last_assessment_date?: string;
  next_assessment_date?: string;
  
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireQuestion {
  id: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'range';
  text: string;
  description?: string;
  options?: string[];
  required?: boolean;
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
  help?: string;
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

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  description?: string;
  target_sector?: string;
  target_size?: string;
  version: string;
  is_active: boolean;
  questions: QuestionnaireSection[];
  branching_logic: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireResponse {
  id: string;
  organization_id: string;
  template_id: string;
  responses: Record<string, any>;
  completion_percentage: number;
  current_section?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RiskFrameworkTemplate {
  id: string;
  name: string;
  description?: string;
  target_profile: Record<string, any>;
  framework_components: {
    risk_categories: Array<{
      name: string;
      weight: number;
      controls: string[];
      description?: string;
    }>;
    kris: Array<{
      name: string;
      threshold: number;
      frequency: string;
      description?: string;
    }>;
    policies?: Array<{
      name: string;
      category: string;
      priority: string;
    }>;
    controls?: Array<{
      name: string;
      type: string;
      frequency: string;
    }>;
  };
  implementation_roadmap: Array<{
    phase: string;
    duration: string;
    activities: string[];
    dependencies?: string[];
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedFramework {
  id: string;
  organization_id: string;
  profile_id: string;
  template_id?: string;
  framework_data: Record<string, any>;
  customizations: Record<string, any>;
  implementation_status: 'draft' | 'in-progress' | 'implemented' | 'under-review';
  effectiveness_score?: number;
  last_updated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileAssessment {
  score: number;
  completeness: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  maturity_level: 'basic' | 'developing' | 'advanced' | 'sophisticated';
  next_steps: string[];
}
