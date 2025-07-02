
import { supabase } from '@/integrations/supabase/client';

export interface FrameworkDependency {
  id: string;
  org_id: string;
  source_framework_id: string;
  source_framework_type: string;
  dependent_framework_id: string;
  dependent_framework_type: string;
  dependency_type: 'requires' | 'influences' | 'blocks' | 'enhances';
  dependency_strength: 'weak' | 'medium' | 'strong' | 'critical';
  dependency_description?: string;
  impact_analysis?: Record<string, any>;
  validation_rules?: any[];
  is_active: boolean;
}

export interface FrameworkVersion {
  id: string;
  org_id: string;
  framework_id: string;
  framework_type: string;
  version_number: string;
  version_description?: string;
  change_summary?: string[];
  framework_data: Record<string, any>;
  created_by?: string;
  created_by_name?: string;
  approval_status: 'draft' | 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  deployment_status: 'pending' | 'deployed' | 'failed' | 'rolled_back';
  deployed_at?: string;
  rollback_data?: Record<string, any>;
  is_current_version: boolean;
}

export interface FrameworkEffectivenessMetric {
  id: string;
  org_id: string;
  framework_id: string;
  framework_type: string;
  metric_name: string;
  metric_category: string;
  measurement_date: string;
  metric_value: number;
  target_value?: number;
  variance_percentage?: number;
  trend_direction?: 'up' | 'down' | 'stable';
  measurement_method?: string;
  data_sources?: any[];
  quality_score?: number;
  notes?: string;
}

export interface ImplementationFeedback {
  id: string;
  org_id: string;
  framework_id: string;
  framework_type: string;
  feedback_type: string;
  feedback_category: string;
  feedback_content: string;
  feedback_rating?: number;
  implementation_phase?: string;
  user_role?: string;
  submitted_by?: string;
  submitted_by_name?: string;
  implementation_date?: string;
  lessons_learned?: string[];
  improvement_suggestions?: string[];
  would_recommend?: boolean;
  follow_up_required: boolean;
  follow_up_notes?: string;
  status: 'active' | 'resolved' | 'archived';
}

export class Phase8UnifiedFrameworkService {

  // Framework Dependencies Management
  async getFrameworkDependencies(orgId: string): Promise<FrameworkDependency[]> {
    const { data, error } = await supabase
      .from('framework_dependencies')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createFrameworkDependency(dependency: Omit<FrameworkDependency, 'id'>): Promise<FrameworkDependency> {
    const { data, error } = await supabase
      .from('framework_dependencies')
      .insert([dependency])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async analyzeDependencyImpact(dependencyId: string): Promise<any> {
    const dependency = await supabase
      .from('framework_dependencies')
      .select('*')
      .eq('id', dependencyId)
      .single();

    if (!dependency.data) return {};

    // Mock dependency impact analysis
    const impactAnalysis = {
      change_propagation: [],
      affected_frameworks: [],
      risk_assessment: {},
      recommended_actions: []
    };

    // Analyze potential impact of changes
    if (dependency.data.dependency_strength === 'critical') {
      impactAnalysis.risk_assessment = {
        impact_level: 'high',
        change_complexity: 'complex',
        testing_required: true,
        approval_needed: true
      };
    }

    return impactAnalysis;
  }

  // Framework Version Management
  async getFrameworkVersions(orgId: string): Promise<FrameworkVersion[]> {
    const { data, error } = await supabase
      .from('framework_versions')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createFrameworkVersion(version: Omit<FrameworkVersion, 'id'>): Promise<FrameworkVersion> {
    const { data, error } = await supabase
      .from('framework_versions')
      .insert([version])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async approveFrameworkVersion(versionId: string, approvedBy: string, approverName: string): Promise<FrameworkVersion> {
    const { data, error } = await supabase
      .from('framework_versions')
      .update({
        approval_status: 'approved',
        approved_by: approvedBy,
        approved_by_name: approverName,
        approved_at: new Date().toISOString()
      })
      .eq('id', versionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deployFrameworkVersion(versionId: string): Promise<FrameworkVersion> {
    // First, set all other versions of this framework to not current
    const version = await supabase
      .from('framework_versions')
      .select('framework_id')
      .eq('id', versionId)
      .single();

    if (version.data) {
      await supabase
        .from('framework_versions')
        .update({ is_current_version: false })
        .eq('framework_id', version.data.framework_id);
    }

    // Deploy the new version
    const { data, error } = await supabase
      .from('framework_versions')
      .update({
        deployment_status: 'deployed',
        deployed_at: new Date().toISOString(),
        is_current_version: true
      })
      .eq('id', versionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Framework Effectiveness Monitoring
  async getFrameworkEffectivenessMetrics(orgId: string): Promise<FrameworkEffectivenessMetric[]> {
    const { data, error } = await supabase
      .from('framework_effectiveness_metrics')
      .select('*')
      .eq('org_id', orgId)
      .order('measurement_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async recordEffectivenessMetric(metric: Omit<FrameworkEffectivenessMetric, 'id'>): Promise<FrameworkEffectivenessMetric> {
    const { data, error } = await supabase
      .from('framework_effectiveness_metrics')
      .insert([metric])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async calculateEffectivenessScore(frameworkId: string, frameworkType: string): Promise<number> {
    const { data } = await supabase
      .from('framework_effectiveness_metrics')
      .select('metric_value, target_value')
      .eq('framework_id', frameworkId)
      .eq('framework_type', frameworkType)
      .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (!data || data.length === 0) return 0;

    // Calculate weighted effectiveness score
    let totalScore = 0;
    let validMetrics = 0;

    data.forEach(metric => {
      if (metric.target_value && metric.target_value > 0) {
        const achievement = Math.min(metric.metric_value / metric.target_value, 1.0);
        totalScore += achievement * 100;
        validMetrics++;
      }
    });

    return validMetrics > 0 ? totalScore / validMetrics : 0;
  }

  // Implementation Feedback Management
  async getImplementationFeedback(orgId: string): Promise<ImplementationFeedback[]> {
    const { data, error } = await supabase
      .from('implementation_feedback')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async submitImplementationFeedback(feedback: Omit<ImplementationFeedback, 'id'>): Promise<ImplementationFeedback> {
    const { data, error } = await supabase
      .from('implementation_feedback')
      .insert([feedback])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async analyzeFeedbackTrends(orgId: string): Promise<any> {
    const { data } = await supabase
      .from('implementation_feedback')
      .select('feedback_rating, feedback_type, framework_type, created_at')
      .eq('org_id', orgId)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    if (!data) return {};

    // Analyze feedback trends
    const trends = {
      average_rating: 0,
      rating_trend: 'stable',
      common_issues: [],
      framework_performance: {},
      improvement_areas: []
    };

    // Calculate average rating
    const ratings = data.filter(f => f.feedback_rating).map(f => f.feedback_rating);
    if (ratings.length > 0) {
      trends.average_rating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    }

    // Group by framework type
    const frameworkGroups = data.reduce((groups, feedback) => {
      if (!groups[feedback.framework_type]) {
        groups[feedback.framework_type] = [];
      }
      groups[feedback.framework_type].push(feedback);
      return groups;
    }, {} as Record<string, any[]>);

    // Analyze each framework type
    Object.keys(frameworkGroups).forEach(frameworkType => {
      const feedbacks = frameworkGroups[frameworkType];
      const avgRating = feedbacks
        .filter(f => f.feedback_rating)
        .reduce((sum, f, _, arr) => sum + f.feedback_rating / arr.length, 0);
      
      trends.framework_performance[frameworkType] = {
        average_rating: avgRating,
        feedback_count: feedbacks.length,
        recent_issues: feedbacks.filter(f => f.feedback_type === 'issue').length
      };
    });

    return trends;
  }

  // Continuous Learning & Improvement
  async generateImprovementRecommendations(orgId: string): Promise<any[]> {
    const feedback = await this.getImplementationFeedback(orgId);
    const effectiveness = await this.getFrameworkEffectivenessMetrics(orgId);
    
    const recommendations = [];

    // Analyze low-rated frameworks
    const lowRatedFeedback = feedback.filter(f => f.feedback_rating && f.feedback_rating < 3);
    if (lowRatedFeedback.length > 0) {
      recommendations.push({
        type: 'framework_improvement',
        priority: 'high',
        title: 'Address Low User Satisfaction',
        description: 'Several frameworks have received low user ratings',
        affected_frameworks: [...new Set(lowRatedFeedback.map(f => f.framework_type))],
        recommended_actions: [
          'Conduct user interviews',
          'Review framework complexity',
          'Simplify user interfaces',
          'Provide additional training'
        ]
      });
    }

    // Analyze effectiveness metrics
    const underperformingMetrics = effectiveness.filter(m => 
      m.target_value && m.metric_value < m.target_value * 0.8
    );
    
    if (underperformingMetrics.length > 0) {
      recommendations.push({
        type: 'performance_improvement',
        priority: 'medium',
        title: 'Improve Framework Performance',
        description: 'Some frameworks are not meeting effectiveness targets',
        affected_frameworks: [...new Set(underperformingMetrics.map(m => m.framework_type))],
        recommended_actions: [
          'Review framework parameters',
          'Adjust success criteria',
          'Enhance monitoring capabilities',
          'Provide additional resources'
        ]
      });
    }

    return recommendations;
  }

  // Framework Orchestration
  async orchestrateFrameworkChanges(changeRequest: any): Promise<any> {
    // Mock framework change orchestration
    const orchestrationPlan = {
      change_id: `CHG-${Date.now()}`,
      affected_frameworks: [],
      execution_order: [],
      rollback_plan: {},
      validation_steps: [],
      approval_required: false
    };

    // Analyze dependencies to determine execution order
    const dependencies = await this.getFrameworkDependencies(changeRequest.org_id);
    
    // Build execution plan based on dependencies
    const affectedDependencies = dependencies.filter(d => 
      d.source_framework_id === changeRequest.framework_id ||
      d.dependent_framework_id === changeRequest.framework_id
    );

    orchestrationPlan.affected_frameworks = affectedDependencies.map(d => ({
      framework_id: d.source_framework_id === changeRequest.framework_id ? d.dependent_framework_id : d.source_framework_id,
      framework_type: d.source_framework_id === changeRequest.framework_id ? d.dependent_framework_type : d.source_framework_type,
      dependency_strength: d.dependency_strength
    }));

    // Critical dependencies require approval
    if (affectedDependencies.some(d => d.dependency_strength === 'critical')) {
      orchestrationPlan.approval_required = true;
    }

    return orchestrationPlan;
  }
}

export const phase8UnifiedFrameworkService = new Phase8UnifiedFrameworkService();
