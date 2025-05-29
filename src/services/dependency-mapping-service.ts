
import { supabase } from "@/integrations/supabase/client";

export interface DependencyRisk {
  id: string;
  dependency_id: string;
  org_id: string;
  risk_category: 'operational' | 'financial' | 'reputational' | 'compliance' | 'strategic';
  likelihood_score: number;
  impact_score: number;
  risk_rating: 'very_low' | 'low' | 'medium' | 'high' | 'critical';
  mitigation_strategy?: string;
  contingency_plan?: string;
  last_assessment_date: string;
  next_assessment_date?: string;
  assessor_id?: string;
  assessor_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DependencyMap {
  id: string;
  org_id: string;
  source_dependency_id: string;
  target_dependency_id: string;
  relationship_type: 'depends_on' | 'supports' | 'feeds_into' | 'backed_by' | 'redundant_with';
  relationship_strength: 'weak' | 'medium' | 'strong' | 'critical';
  failure_propagation_likelihood: number;
  propagation_delay_minutes: number;
  description?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  source_dependency?: any;
  target_dependency?: any;
}

export interface FailureScenario {
  id: string;
  org_id: string;
  scenario_name: string;
  scenario_description?: string;
  trigger_dependency_id: string;
  scenario_type: 'operational' | 'cyber' | 'natural_disaster' | 'vendor_failure' | 'data_breach';
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration_hours?: number;
  business_impact_description?: string;
  affected_functions?: any;
  simulation_results?: any;
  mitigation_effectiveness?: number;
  created_by?: string;
  created_by_name?: string;
  last_simulated_at?: string;
  created_at: string;
  updated_at: string;
  trigger_dependency?: any;
}

export interface EnhancedDependency {
  id: string;
  business_function_id: string;
  dependency_type: 'vendor' | 'system' | 'staff' | 'data' | 'location';
  dependency_name: string;
  dependency_id?: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  status: 'operational' | 'degraded' | 'failed' | 'maintenance';
  recovery_time_objective_hours?: number;
  maximum_tolerable_downtime_hours?: number;
  monitoring_status: 'monitored' | 'partially_monitored' | 'not_monitored' | 'unknown';
  escalation_contacts?: any;
  sla_requirements?: string;
  geographic_location?: string;
  redundancy_level: 'none' | 'basic' | 'full' | 'distributed';
  created_at: string;
  updated_at: string;
  org_id: string;
}

export const dependencyMappingService = {
  // Enhanced Dependencies
  async getEnhancedDependencies(businessFunctionId?: string): Promise<EnhancedDependency[]> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.organization_id) {
        return [];
      }

      let query = supabase
        .from('dependencies')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('dependency_name', { ascending: true });

      if (businessFunctionId) {
        query = query.eq('business_function_id', businessFunctionId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching enhanced dependencies:', error);
        throw error;
      }
      
      return (data || []) as EnhancedDependency[];
    } catch (error) {
      console.error('Error in getEnhancedDependencies:', error);
      return [];
    }
  },

  async updateDependencyEnhancements(id: string, updates: Partial<EnhancedDependency>): Promise<EnhancedDependency> {
    try {
      const { data, error } = await supabase
        .from('dependencies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating dependency enhancements:', error);
        throw error;
      }

      return data as EnhancedDependency;
    } catch (error) {
      console.error('Error in updateDependencyEnhancements:', error);
      throw error;
    }
  },

  // Risk Assessment
  async getDependencyRisks(dependencyId?: string): Promise<DependencyRisk[]> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.organization_id) {
        return [];
      }

      let query = supabase
        .from('dependency_risks')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('risk_rating', { ascending: false });

      if (dependencyId) {
        query = query.eq('dependency_id', dependencyId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching dependency risks:', error);
        throw error;
      }
      
      return (data || []) as DependencyRisk[];
    } catch (error) {
      console.error('Error in getDependencyRisks:', error);
      return [];
    }
  },

  async createDependencyRisk(risk: Omit<DependencyRisk, 'id' | 'created_at' | 'updated_at' | 'risk_rating'>): Promise<DependencyRisk> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('No organization found for user');
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('dependency_risks')
        .insert({
          ...risk,
          org_id: profile.organization_id,
          assessor_id: user?.id,
          assessor_name: userProfile?.full_name || 'Unknown User'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating dependency risk:', error);
        throw error;
      }

      return data as DependencyRisk;
    } catch (error) {
      console.error('Error in createDependencyRisk:', error);
      throw error;
    }
  },

  async updateDependencyRisk(id: string, updates: Partial<DependencyRisk>): Promise<DependencyRisk> {
    try {
      const { data, error } = await supabase
        .from('dependency_risks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating dependency risk:', error);
        throw error;
      }

      return data as DependencyRisk;
    } catch (error) {
      console.error('Error in updateDependencyRisk:', error);
      throw error;
    }
  },

  // Dependency Mapping
  async getDependencyMaps(): Promise<DependencyMap[]> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.organization_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('dependency_maps')
        .select(`
          *,
          source_dependency:source_dependency_id(dependency_name, dependency_type, status),
          target_dependency:target_dependency_id(dependency_name, dependency_type, status)
        `)
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching dependency maps:', error);
        throw error;
      }
      
      return (data || []) as DependencyMap[];
    } catch (error) {
      console.error('Error in getDependencyMaps:', error);
      return [];
    }
  },

  async createDependencyMap(map: Omit<DependencyMap, 'id' | 'created_at' | 'updated_at'>): Promise<DependencyMap> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('No organization found for user');
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('dependency_maps')
        .insert({
          ...map,
          org_id: profile.organization_id,
          created_by: user?.id,
          created_by_name: userProfile?.full_name || 'Unknown User'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating dependency map:', error);
        throw error;
      }

      return data as DependencyMap;
    } catch (error) {
      console.error('Error in createDependencyMap:', error);
      throw error;
    }
  },

  async deleteDependencyMap(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('dependency_maps')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting dependency map:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteDependencyMap:', error);
      throw error;
    }
  },

  // Failure Scenarios
  async getFailureScenarios(): Promise<FailureScenario[]> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.organization_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('failure_scenarios')
        .select(`
          *,
          trigger_dependency:trigger_dependency_id(dependency_name, dependency_type, criticality)
        `)
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching failure scenarios:', error);
        throw error;
      }
      
      return (data || []) as FailureScenario[];
    } catch (error) {
      console.error('Error in getFailureScenarios:', error);
      return [];
    }
  },

  async createFailureScenario(scenario: Omit<FailureScenario, 'id' | 'created_at' | 'updated_at'>): Promise<FailureScenario> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('No organization found for user');
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('failure_scenarios')
        .insert({
          ...scenario,
          org_id: profile.organization_id,
          created_by: user?.id,
          created_by_name: userProfile?.full_name || 'Unknown User'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating failure scenario:', error);
        throw error;
      }

      return data as FailureScenario;
    } catch (error) {
      console.error('Error in createFailureScenario:', error);
      throw error;
    }
  },

  // Simulation Engine
  async runFailureSimulation(scenarioId: string): Promise<any> {
    try {
      // Get the scenario
      const { data: scenario, error: scenarioError } = await supabase
        .from('failure_scenarios')
        .select('*')
        .eq('id', scenarioId)
        .single();

      if (scenarioError || !scenario) {
        throw new Error('Scenario not found');
      }

      // Get all dependency maps for propagation analysis
      const maps = await this.getDependencyMaps();
      const dependencies = await this.getEnhancedDependencies();

      // Run simulation algorithm
      const simulationResults = this.simulateFailurePropagation(
        scenario.trigger_dependency_id,
        maps,
        dependencies,
        scenario.severity_level
      );

      // Update scenario with results
      const { data, error } = await supabase
        .from('failure_scenarios')
        .update({
          simulation_results: simulationResults,
          last_simulated_at: new Date().toISOString()
        })
        .eq('id', scenarioId)
        .select()
        .single();

      if (error) {
        console.error('Error updating simulation results:', error);
        throw error;
      }

      return simulationResults;
    } catch (error) {
      console.error('Error in runFailureSimulation:', error);
      throw error;
    }
  },

  simulateFailurePropagation(
    triggerDependencyId: string,
    maps: DependencyMap[],
    dependencies: EnhancedDependency[],
    severityLevel: string
  ): any {
    const propagationPath: any[] = [];
    const visited = new Set<string>();
    const queue = [{ id: triggerDependencyId, time: 0, severity: severityLevel }];

    // Severity multipliers for propagation
    const severityMultipliers = {
      'low': 0.3,
      'medium': 0.6,
      'high': 0.8,
      'critical': 1.0
    };

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      const dependency = dependencies.find(d => d.id === current.id);
      if (!dependency) continue;

      propagationPath.push({
        dependency_id: current.id,
        dependency_name: dependency.dependency_name,
        affected_at_minutes: current.time,
        severity: current.severity,
        estimated_downtime_hours: dependency.maximum_tolerable_downtime_hours || 1
      });

      // Find connected dependencies
      const connections = maps.filter(m => m.source_dependency_id === current.id);
      
      for (const connection of connections) {
        if (!visited.has(connection.target_dependency_id)) {
          const propagationLikelihood = connection.failure_propagation_likelihood || 0.5;
          const severityMultiplier = severityMultipliers[severityLevel as keyof typeof severityMultipliers] || 0.6;
          
          // Calculate if failure propagates based on likelihood and severity
          if (Math.random() < (propagationLikelihood * severityMultiplier)) {
            const newTime = current.time + (connection.propagation_delay_minutes || 0);
            
            // Reduce severity as it propagates (unless critical)
            let newSeverity = current.severity;
            if (current.severity !== 'critical' && Math.random() > 0.7) {
              const severityLevels = ['low', 'medium', 'high', 'critical'];
              const currentIndex = severityLevels.indexOf(current.severity);
              newSeverity = severityLevels[Math.max(0, currentIndex - 1)];
            }

            queue.push({
              id: connection.target_dependency_id,
              time: newTime,
              severity: newSeverity
            });
          }
        }
      }
    }

    return {
      propagation_path: propagationPath,
      total_affected_dependencies: propagationPath.length,
      estimated_total_downtime_hours: propagationPath.reduce((sum, p) => sum + (p.estimated_downtime_hours || 0), 0),
      simulation_timestamp: new Date().toISOString(),
      critical_path: propagationPath.filter(p => p.severity === 'critical'),
      recovery_sequence: propagationPath.sort((a, b) => a.affected_at_minutes - b.affected_at_minutes)
    };
  }
};
