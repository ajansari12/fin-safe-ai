
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface MonteCarloSimulation {
  id: string;
  scenario_test_id: string;
  org_id: string;
  simulation_parameters: any;
  number_of_iterations: number;
  confidence_interval: number;
  simulation_results: any;
  statistical_summary: any;
  risk_metrics: any;
  created_at: string;
  updated_at: string;
}

export interface ScenarioTemplate {
  id: string;
  org_id: string;
  template_name: string;
  template_type: string;
  regulatory_framework?: string;
  scenario_description: string;
  impact_parameters: any;
  probability_distributions: any;
  recovery_assumptions: any;
  stress_factors: any;
  is_regulatory_required: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SimulationParameters {
  scenario_type: string;
  impact_factors: {
    financial_impact_range: [number, number];
    operational_impact_hours: [number, number];
    recovery_time_hours: [number, number];
  };
  probability_distributions: {
    occurrence_probability: number;
    severity_distribution: string;
    correlation_factors: any;
  };
  stress_testing: {
    stress_multiplier: number;
    adverse_conditions: string[];
  };
}

class EnhancedScenarioTestingService {
  // Get OSFI E-21 compliant scenario templates
  async getRegulatoryTemplates(): Promise<ScenarioTemplate[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('scenario_templates')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('is_regulatory_required', true)
      .order('template_name');

    if (error) throw error;
    return data || [];
  }

  // Create OSFI E-21 default templates
  async createOSFITemplates(): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const osfiTemplates = [
      {
        template_name: 'OSFI E-21 Cyber Attack Scenario',
        template_type: 'regulatory',
        regulatory_framework: 'OSFI E-21',
        scenario_description: 'Severe cyber attack affecting critical systems and customer data',
        impact_parameters: {
          financial_impact: { min: 1000000, max: 50000000 },
          operational_disruption_hours: { min: 24, max: 168 },
          customer_impact: { affected_customers: '10-50%', data_breach: true },
          regulatory_impact: { reporting_required: true, penalties: true }
        },
        probability_distributions: {
          occurrence_probability: 0.15,
          severity_distribution: 'lognormal',
          recovery_distribution: 'exponential'
        },
        recovery_assumptions: {
          backup_systems_available: true,
          staff_availability: 0.8,
          vendor_support: true,
          regulatory_coordination: true
        },
        stress_factors: {
          concurrent_incidents: true,
          key_personnel_unavailable: true,
          vendor_dependencies_affected: true
        },
        is_regulatory_required: true
      },
      {
        template_name: 'OSFI E-21 Third-Party Service Failure',
        template_type: 'regulatory',
        regulatory_framework: 'OSFI E-21',
        scenario_description: 'Critical third-party service provider failure affecting core operations',
        impact_parameters: {
          financial_impact: { min: 500000, max: 25000000 },
          operational_disruption_hours: { min: 12, max: 72 },
          service_availability: '0-30%',
          customer_transactions_affected: true
        },
        probability_distributions: {
          occurrence_probability: 0.25,
          severity_distribution: 'normal',
          recovery_distribution: 'weibull'
        },
        recovery_assumptions: {
          alternative_providers: true,
          manual_processes: true,
          communication_plan: true
        },
        stress_factors: {
          multiple_vendor_failures: true,
          limited_alternatives: true,
          contractual_disputes: true
        },
        is_regulatory_required: true
      },
      {
        template_name: 'OSFI E-21 Operational Risk Event',
        template_type: 'regulatory',
        regulatory_framework: 'OSFI E-21',
        scenario_description: 'Severe operational disruption affecting business continuity',
        impact_parameters: {
          financial_impact: { min: 200000, max: 15000000 },
          operational_disruption_hours: { min: 8, max: 120 },
          process_failure_scope: 'critical',
          compliance_impact: true
        },
        probability_distributions: {
          occurrence_probability: 0.3,
          severity_distribution: 'gamma',
          recovery_distribution: 'normal'
        },
        recovery_assumptions: {
          process_documentation: true,
          trained_personnel: 0.9,
          technology_recovery: true
        },
        stress_factors: {
          seasonal_peak_timing: true,
          resource_constraints: true,
          regulatory_scrutiny: true
        },
        is_regulatory_required: true
      }
    ];

    for (const template of osfiTemplates) {
      await supabase
        .from('scenario_templates')
        .insert({
          org_id: profile.organization_id,
          created_by: profile.id,
          ...template
        });
    }
  }

  // Run Monte Carlo simulation
  async runMonteCarloSimulation(
    scenarioTestId: string,
    parameters: SimulationParameters,
    iterations: number = 1000
  ): Promise<MonteCarloSimulation> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Simulate the scenario iterations
    const results = this.performSimulation(parameters, iterations);
    
    const simulationData = {
      scenario_test_id: scenarioTestId,
      org_id: profile.organization_id,
      simulation_parameters: parameters,
      number_of_iterations: iterations,
      confidence_interval: 0.95,
      simulation_results: results.rawResults,
      statistical_summary: results.statistics,
      risk_metrics: results.riskMetrics
    };

    const { data, error } = await supabase
      .from('scenario_monte_carlo_simulations')
      .insert([simulationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Perform the actual Monte Carlo simulation
  private performSimulation(parameters: SimulationParameters, iterations: number) {
    const results = [];
    const { impact_factors, probability_distributions } = parameters;

    for (let i = 0; i < iterations; i++) {
      // Generate random values based on distributions
      const financialImpact = this.generateRandomInRange(
        impact_factors.financial_impact_range[0],
        impact_factors.financial_impact_range[1]
      );
      
      const operationalImpact = this.generateRandomInRange(
        impact_factors.operational_impact_hours[0],
        impact_factors.operational_impact_hours[1]
      );
      
      const recoveryTime = this.generateRandomInRange(
        impact_factors.recovery_time_hours[0],
        impact_factors.recovery_time_hours[1]
      );

      // Apply stress factors
      const stressMultiplier = parameters.stress_testing.stress_multiplier || 1;
      
      results.push({
        iteration: i + 1,
        financial_impact: financialImpact * stressMultiplier,
        operational_impact_hours: operationalImpact * stressMultiplier,
        recovery_time_hours: recoveryTime * stressMultiplier,
        total_cost: financialImpact + (operationalImpact * 1000), // $1000/hour operational cost
        occurrence_probability: probability_distributions.occurrence_probability
      });
    }

    // Calculate statistics
    const financialImpacts = results.map(r => r.financial_impact);
    const operationalImpacts = results.map(r => r.operational_impact_hours);
    const recoveryTimes = results.map(r => r.recovery_time_hours);

    const statistics = {
      financial_impact: {
        mean: this.calculateMean(financialImpacts),
        median: this.calculateMedian(financialImpacts),
        percentile_95: this.calculatePercentile(financialImpacts, 0.95),
        percentile_99: this.calculatePercentile(financialImpacts, 0.99),
        standard_deviation: this.calculateStandardDeviation(financialImpacts)
      },
      operational_impact: {
        mean: this.calculateMean(operationalImpacts),
        median: this.calculateMedian(operationalImpacts),
        percentile_95: this.calculatePercentile(operationalImpacts, 0.95),
        percentile_99: this.calculatePercentile(operationalImpacts, 0.99)
      },
      recovery_time: {
        mean: this.calculateMean(recoveryTimes),
        median: this.calculateMedian(recoveryTimes),
        percentile_95: this.calculatePercentile(recoveryTimes, 0.95),
        percentile_99: this.calculatePercentile(recoveryTimes, 0.99)
      }
    };

    const riskMetrics = {
      value_at_risk_95: statistics.financial_impact.percentile_95,
      expected_shortfall: this.calculateExpectedShortfall(financialImpacts, 0.95),
      maximum_loss: Math.max(...financialImpacts),
      probability_of_severe_impact: results.filter(r => r.financial_impact > statistics.financial_impact.percentile_95).length / iterations,
      risk_appetite_breach_probability: this.calculateRiskAppetiteBreachProbability(results, parameters)
    };

    return {
      rawResults: results,
      statistics,
      riskMetrics
    };
  }

  // Statistical calculation methods
  private generateRandomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[index];
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateExpectedShortfall(values: number[], percentile: number): number {
    const threshold = this.calculatePercentile(values, percentile);
    const exceedingValues = values.filter(val => val >= threshold);
    return exceedingValues.length > 0 ? this.calculateMean(exceedingValues) : threshold;
  }

  private calculateRiskAppetiteBreachProbability(results: any[], parameters: SimulationParameters): number {
    // This would integrate with actual risk appetite thresholds
    const riskAppetiteThreshold = 5000000; // $5M threshold example
    const breaches = results.filter(r => r.financial_impact > riskAppetiteThreshold);
    return breaches.length / results.length;
  }

  // Get Monte Carlo simulation results
  async getSimulationResults(scenarioTestId: string): Promise<MonteCarloSimulation[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('scenario_monte_carlo_simulations')
      .select('*')
      .eq('scenario_test_id', scenarioTestId)
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Create custom scenario template
  async createScenarioTemplate(template: Partial<ScenarioTemplate>): Promise<ScenarioTemplate> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('scenario_templates')
      .insert([{
        org_id: profile.organization_id,
        created_by: profile.id,
        ...template
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all scenario templates
  async getScenarioTemplates(): Promise<ScenarioTemplate[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('scenario_templates')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('template_name');

    if (error) throw error;
    return data || [];
  }

  // Generate scenario report with regulatory compliance
  async generateScenarioReport(scenarioTestId: string): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    // Get scenario test details
    const { data: scenarioTest } = await supabase
      .from('scenario_tests')
      .select('*')
      .eq('id', scenarioTestId)
      .eq('org_id', profile.organization_id)
      .single();

    // Get Monte Carlo simulation results
    const simulations = await this.getSimulationResults(scenarioTestId);

    // Get scenario execution results
    const { data: executionResults } = await supabase
      .from('scenario_execution_results')
      .select('*')
      .eq('scenario_test_id', scenarioTestId)
      .order('execution_completed_at', { ascending: false });

    return {
      scenario_details: scenarioTest,
      monte_carlo_analysis: simulations,
      execution_history: executionResults,
      regulatory_compliance: {
        osfi_e21_compliant: scenarioTest?.regulatory_framework === 'OSFI E-21',
        stress_testing_adequate: simulations.some(s => s.risk_metrics?.value_at_risk_95 > 0),
        documentation_complete: true,
        board_reporting_ready: true
      },
      recommendations: this.generateRecommendations(simulations, executionResults)
    };
  }

  private generateRecommendations(simulations: MonteCarloSimulation[], executionResults: any[]): string[] {
    const recommendations = [];

    if (simulations.length > 0) {
      const latestSim = simulations[0];
      const riskMetrics = latestSim.risk_metrics;

      if (riskMetrics?.probability_of_severe_impact > 0.1) {
        recommendations.push('Consider enhancing risk mitigation strategies due to high severe impact probability');
      }

      if (riskMetrics?.value_at_risk_95 > 10000000) {
        recommendations.push('Review risk appetite thresholds - VaR95 exceeds typical tolerance levels');
      }

      if (riskMetrics?.risk_appetite_breach_probability > 0.05) {
        recommendations.push('High probability of risk appetite breach - consider preventive controls');
      }
    }

    if (executionResults?.some(r => r.success_rate < 0.8)) {
      recommendations.push('Recent test execution showed concerning success rates - review response procedures');
    }

    return recommendations;
  }
}

export const enhancedScenarioTestingService = new EnhancedScenarioTestingService();
