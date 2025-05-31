
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface ContinuityPlan {
  id: string;
  org_id: string;
  business_function_id: string;
  plan_name: string;
  plan_description?: string;
  rto_hours: number;
  rpo_hours?: number;
  fallback_steps: string;
  plan_document_path?: string;
  plan_document_name?: string;
  file_size?: number;
  mime_type?: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  last_tested_date?: string;
  next_test_date?: string;
  created_by?: string;
  created_by_name?: string;
  updated_by?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
  business_functions?: {
    name: string;
    criticality: string;
  };
}

export interface ContinuityImpactScore {
  id: string;
  org_id: string;
  continuity_plan_id: string;
  assessment_date: string;
  business_impact_score: number;
  financial_impact_estimate: number;
  operational_impact_score: number;
  compliance_impact_score: number;
  reputational_impact_score: number;
  overall_risk_score: number;
  dependencies_affected: string[];
  recovery_complexity_score: number;
  resource_availability_score: number;
  assessment_notes?: string;
  assessed_by?: string;
  assessed_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DRSimulationWorkflow {
  id: string;
  org_id: string;
  workflow_name: string;
  description?: string;
  trigger_conditions: {
    dependency_failures?: string[];
    severity_threshold?: string;
    business_function_impact?: string[];
    automated_trigger?: boolean;
  };
  simulation_steps: {
    step_order: number;
    step_name: string;
    step_type: 'dependency_test' | 'communication' | 'system_check' | 'recovery_action';
    step_description: string;
    expected_duration_minutes: number;
    success_criteria: string;
    automated: boolean;
  }[];
  status: 'active' | 'paused' | 'draft';
  last_executed?: string;
  execution_frequency_hours?: number;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ContinuityTestOutcome {
  id: string;
  org_id: string;
  continuity_test_id: string;
  dr_simulation_id?: string;
  test_date: string;
  overall_score: number;
  rto_achieved: boolean;
  rpo_achieved: boolean;
  actual_rto_hours: number;
  actual_rpo_hours: number;
  communication_effectiveness: number;
  resource_availability_score: number;
  system_recovery_score: number;
  stakeholder_response_score: number;
  lessons_learned: string;
  improvement_actions: string[];
  next_test_recommendations: string;
  scorecard_data: {
    technical_readiness: number;
    process_effectiveness: number;
    team_preparedness: number;
    documentation_quality: number;
  };
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export const continuityService = {
  // Continuity Plans - existing methods from business-continuity-service.ts
  async getContinuityPlans(orgId: string): Promise<ContinuityPlan[]> {
    const { data, error } = await supabase
      .from('continuity_plans')
      .select(`
        *,
        business_functions:business_function_id(name, criticality)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'draft' | 'active' | 'archived'
    }));
  },

  // Impact Score Calculator
  async calculateBusinessImpact(planId: string, assessmentData: {
    financial_impact_estimate: number;
    operational_disruption_hours: number;
    dependencies_affected: string[];
  }): Promise<ContinuityImpactScore> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    // Get dependencies data for impact calculation
    const { data: dependencies } = await supabase
      .from('dependencies')
      .select('*')
      .in('id', assessmentData.dependencies_affected);

    // Calculate scores based on various factors
    const businessImpactScore = this.calculateBusinessImpactScore(assessmentData, dependencies || []);
    const operationalImpactScore = Math.min(10, assessmentData.operational_disruption_hours / 2);
    const complianceImpactScore = this.calculateComplianceImpact(dependencies || []);
    const reputationalImpactScore = this.calculateReputationalImpact(assessmentData.financial_impact_estimate);
    const recoveryComplexityScore = this.calculateRecoveryComplexity(dependencies || []);
    
    const overallRiskScore = (
      businessImpactScore * 0.3 +
      operationalImpactScore * 0.25 +
      complianceImpactScore * 0.2 +
      reputationalImpactScore * 0.15 +
      recoveryComplexityScore * 0.1
    );

    const impactScore = {
      org_id: profile.organization_id,
      continuity_plan_id: planId,
      assessment_date: new Date().toISOString(),
      business_impact_score: businessImpactScore,
      financial_impact_estimate: assessmentData.financial_impact_estimate,
      operational_impact_score: operationalImpactScore,
      compliance_impact_score: complianceImpactScore,
      reputational_impact_score: reputationalImpactScore,
      overall_risk_score: overallRiskScore,
      dependencies_affected: assessmentData.dependencies_affected,
      recovery_complexity_score: recoveryComplexityScore,
      resource_availability_score: 8, // Default, should be calculated based on actual resources
    };

    const { data, error } = await supabase
      .from('continuity_impact_scores')
      .insert(impactScore)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  calculateBusinessImpactScore(assessmentData: any, dependencies: any[]): number {
    const criticalDeps = dependencies.filter(d => d.criticality === 'critical').length;
    const highDeps = dependencies.filter(d => d.criticality === 'high').length;
    
    let score = 0;
    score += criticalDeps * 3;
    score += highDeps * 2;
    score += assessmentData.operational_disruption_hours > 24 ? 3 : 1;
    
    return Math.min(10, score);
  },

  calculateComplianceImpact(dependencies: any[]): number {
    // Simple calculation - in reality this would be more sophisticated
    const hasComplianceCriticalSystems = dependencies.some(d => 
      d.dependency_type === 'system' && d.criticality === 'critical'
    );
    return hasComplianceCriticalSystems ? 8 : 4;
  },

  calculateReputationalImpact(financialImpact: number): number {
    if (financialImpact > 1000000) return 9;
    if (financialImpact > 500000) return 7;
    if (financialImpact > 100000) return 5;
    return 3;
  },

  calculateRecoveryComplexity(dependencies: any[]): number {
    const uniqueTypes = new Set(dependencies.map(d => d.dependency_type)).size;
    const totalDeps = dependencies.length;
    
    return Math.min(10, (uniqueTypes * 2) + (totalDeps * 0.5));
  },

  // DR Simulation Workflows
  async createDRSimulation(workflow: Omit<DRSimulationWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<DRSimulationWorkflow> {
    const { data, error } = await supabase
      .from('dr_simulation_workflows')
      .insert(workflow)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async executeDRSimulation(simulationId: string): Promise<void> {
    // Integrate with dependency_logs for real-time testing
    const { data: simulation } = await supabase
      .from('dr_simulation_workflows')
      .select('*')
      .eq('id', simulationId)
      .single();

    if (!simulation) throw new Error('Simulation not found');

    // Create dependency log entries for each simulated failure
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('Organization not found');

    for (const depId of simulation.trigger_conditions.dependency_failures || []) {
      await supabase
        .from('dependency_logs')
        .insert({
          dependency_id: depId,
          business_function_id: simulation.trigger_conditions.business_function_impact?.[0] || '',
          event_type: 'breach_detected',
          new_status: 'failed',
          previous_status: 'operational',
          impact_level: 'high',
          tolerance_breached: true,
          notes: `DR simulation test - ${simulation.workflow_name}`,
          org_id: profile.organization_id
        });
    }

    // Update simulation last executed time
    await supabase
      .from('dr_simulation_workflows')
      .update({ last_executed: new Date().toISOString() })
      .eq('id', simulationId);
  },

  // Test Outcome Dashboard
  async getContinuityTestOutcomes(orgId: string): Promise<ContinuityTestOutcome[]> {
    const { data, error } = await supabase
      .from('continuity_test_outcomes')
      .select(`
        *,
        continuity_tests:continuity_test_id(test_name, status)
      `)
      .eq('org_id', orgId)
      .order('test_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async generateTestScorecard(testId: string, outcomes: {
    rto_achieved: boolean;
    rpo_achieved: boolean;
    actual_rto_hours: number;
    actual_rpo_hours: number;
    communication_effectiveness: number;
    resource_availability_score: number;
    system_recovery_score: number;
    stakeholder_response_score: number;
  }): Promise<ContinuityTestOutcome> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('Organization not found');

    // Calculate overall score
    const overallScore = (
      (outcomes.rto_achieved ? 25 : 0) +
      (outcomes.rpo_achieved ? 25 : 0) +
      (outcomes.communication_effectiveness * 0.15) +
      (outcomes.resource_availability_score * 0.15) +
      (outcomes.system_recovery_score * 0.10) +
      (outcomes.stakeholder_response_score * 0.10)
    );

    const scorecardData = {
      technical_readiness: (outcomes.system_recovery_score + (outcomes.rto_achieved ? 10 : 5)) / 2,
      process_effectiveness: (outcomes.communication_effectiveness + outcomes.stakeholder_response_score) / 2,
      team_preparedness: outcomes.resource_availability_score,
      documentation_quality: outcomes.stakeholder_response_score, // Placeholder
    };

    const testOutcome = {
      org_id: profile.organization_id,
      continuity_test_id: testId,
      test_date: new Date().toISOString(),
      overall_score: overallScore,
      ...outcomes,
      scorecard_data: scorecardData,
      lessons_learned: '',
      improvement_actions: [],
      next_test_recommendations: '',
    };

    const { data, error } = await supabase
      .from('continuity_test_outcomes')
      .insert(testOutcome)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Real-time Dependency Integration
  async getActiveDependencyBreaches(orgId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('dependency_logs')
      .select(`
        *,
        dependencies:dependency_id(dependency_name, criticality),
        business_functions:business_function_id(name)
      `)
      .eq('org_id', orgId)
      .eq('tolerance_breached', true)
      .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
