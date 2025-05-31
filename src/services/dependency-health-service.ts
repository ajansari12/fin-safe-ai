
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface DependencyStatus {
  id: string;
  dependency_id: string;
  org_id: string;
  status_timestamp: string;
  health_score: number;
  response_time_ms?: number;
  availability_percentage?: number;
  error_rate_percentage?: number;
  last_successful_check?: string;
  failure_reason?: string;
  monitoring_source: string;
  created_at: string;
}

export interface PropagationChain {
  id: string;
  org_id: string;
  source_dependency_id: string;
  target_dependency_id: string;
  business_function_id?: string;
  propagation_type: string;
  propagation_delay_minutes: number;
  impact_multiplier: number;
  failure_probability: number;
  business_impact_description?: string;
  mitigation_actions?: string;
  last_simulated?: string;
  simulation_results: any;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  source_dependency?: {
    dependency_name: string;
    criticality: string;
  };
  target_dependency?: {
    dependency_name: string;
    criticality: string;
  };
  business_functions?: {
    name: string;
  };
}

export interface FailureSimulationResult {
  chain_id: string;
  affected_dependencies: string[];
  total_impact_score: number;
  propagation_timeline: Array<{
    dependency_id: string;
    failure_time_minutes: number;
    impact_level: string;
  }>;
  business_functions_affected: string[];
  recommended_actions: string[];
}

export const dependencyHealthService = {
  async getDependencyStatuses(dependencyId?: string): Promise<DependencyStatus[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('dependency_status')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('status_timestamp', { ascending: false });

      if (dependencyId) {
        query = query.eq('dependency_id', dependencyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching dependency statuses:', error);
      return [];
    }
  },

  async createDependencyStatus(status: Omit<DependencyStatus, 'id' | 'created_at'>): Promise<DependencyStatus> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('dependency_status')
        .insert({
          ...status,
          org_id: profile.organization_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating dependency status:', error);
      throw error;
    }
  },

  async simulateHealthPolling(dependencyId: string): Promise<DependencyStatus> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      // Simulate health check with random values
      const healthScore = Math.floor(Math.random() * 100) + 1;
      const responseTime = Math.floor(Math.random() * 1000) + 50;
      const availability = Math.random() * 10 + 90;
      const errorRate = Math.random() * 5;

      const statusData = {
        dependency_id: dependencyId,
        org_id: profile.organization_id,
        status_timestamp: new Date().toISOString(),
        health_score: healthScore,
        response_time_ms: responseTime,
        availability_percentage: availability,
        error_rate_percentage: errorRate,
        last_successful_check: healthScore > 70 ? new Date().toISOString() : undefined,
        failure_reason: healthScore < 30 ? 'Simulated service degradation' : undefined,
        monitoring_source: 'simulation'
      };

      const { data, error } = await supabase
        .from('dependency_status')
        .insert(statusData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error simulating health polling:', error);
      throw error;
    }
  },

  async getPropagationChains(): Promise<PropagationChain[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('propagation_chains')
        .select(`
          *,
          source_dependency:source_dependency_id(dependency_name, criticality),
          target_dependency:target_dependency_id(dependency_name, criticality),
          business_functions:business_function_id(name)
        `)
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching propagation chains:', error);
      return [];
    }
  },

  async createPropagationChain(chain: Omit<PropagationChain, 'id' | 'created_at' | 'updated_at'>): Promise<PropagationChain> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data: user } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.user?.id)
        .single();

      const { data, error } = await supabase
        .from('propagation_chains')
        .insert({
          ...chain,
          org_id: profile.organization_id,
          created_by: user.user?.id,
          created_by_name: userProfile?.full_name || 'Unknown User'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating propagation chain:', error);
      throw error;
    }
  },

  async simulateFailurePropagation(sourceDependencyId: string): Promise<FailureSimulationResult> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      // Get all propagation chains starting from this dependency
      const { data: chains, error } = await supabase
        .from('propagation_chains')
        .select(`
          *,
          source_dependency:source_dependency_id(dependency_name, criticality),
          target_dependency:target_dependency_id(dependency_name, criticality),
          business_functions:business_function_id(name)
        `)
        .eq('org_id', profile.organization_id)
        .eq('source_dependency_id', sourceDependencyId);

      if (error) throw error;

      const affectedDependencies = [sourceDependencyId];
      const propagationTimeline = [{
        dependency_id: sourceDependencyId,
        failure_time_minutes: 0,
        impact_level: 'critical'
      }];
      const businessFunctionsAffected: string[] = [];
      let totalImpactScore = 10; // Base impact for source failure

      // Simulate cascade through chains
      for (const chain of chains || []) {
        if (Math.random() < chain.failure_probability) {
          affectedDependencies.push(chain.target_dependency_id);
          propagationTimeline.push({
            dependency_id: chain.target_dependency_id,
            failure_time_minutes: chain.propagation_delay_minutes,
            impact_level: chain.impact_multiplier > 1.5 ? 'critical' : 'high'
          });
          totalImpactScore += chain.impact_multiplier * 5;

          if (chain.business_functions?.name) {
            businessFunctionsAffected.push(chain.business_functions.name);
          }
        }
      }

      // Update simulation results
      const simulationResult = {
        executed_at: new Date().toISOString(),
        affected_count: affectedDependencies.length,
        total_impact: totalImpactScore,
        timeline: propagationTimeline
      };

      await supabase
        .from('propagation_chains')
        .update({
          last_simulated: new Date().toISOString(),
          simulation_results: simulationResult
        })
        .eq('source_dependency_id', sourceDependencyId);

      return {
        chain_id: `simulation-${Date.now()}`,
        affected_dependencies: affectedDependencies,
        total_impact_score: totalImpactScore,
        propagation_timeline: propagationTimeline,
        business_functions_affected: businessFunctionsAffected,
        recommended_actions: [
          'Activate backup systems immediately',
          'Notify affected business function owners',
          'Implement emergency communication procedures',
          'Begin incident response protocol'
        ]
      };
    } catch (error) {
      console.error('Error simulating failure propagation:', error);
      throw error;
    }
  },

  async checkBreachThresholds(dependencyId: string, healthScore: number): Promise<boolean> {
    try {
      // Check if health score breaches critical threshold (< 30)
      if (healthScore < 30) {
        // Get dependency details for incident creation
        const { data: dependency } = await supabase
          .from('dependencies')
          .select('dependency_name, business_function_id, criticality')
          .eq('id', dependencyId)
          .single();

        if (dependency && dependency.criticality === 'critical') {
          console.log(`Critical dependency ${dependency.dependency_name} has breached threshold with health score: ${healthScore}`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking breach thresholds:', error);
      return false;
    }
  }
};
