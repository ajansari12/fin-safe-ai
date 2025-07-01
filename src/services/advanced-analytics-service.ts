import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface QueryResult {
  query: string;
  results: any[];
  insights: string[];
  visualization_suggestions: string[];
  execution_time_ms: number;
  data: any[];
  metadata: {
    total_rows: number;
    columns: string[];
    execution_time: number;
  };
}

export interface AnalyticsInsight {
  id: string;
  insight_type: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  confidence: number;
  recommendations: string[];
  data_points: any[];
  created_at: string;
}

class AdvancedAnalyticsService {
  // Process natural language queries
  async processNaturalLanguageQuery(query: string, orgId?: string): Promise<QueryResult> {
    const startTime = Date.now();
    
    try {
      // Simulate natural language processing
      const results = await this.executeQuery(query);
      const insights = this.generateQueryInsights(query, results);
      const visualizationSuggestions = this.suggestVisualizations(results);
      
      return {
        query,
        results,
        insights,
        visualization_suggestions: visualizationSuggestions,
        execution_time_ms: Date.now() - startTime,
        data: results,
        metadata: {
          total_rows: results.length,
          columns: results.length > 0 ? Object.keys(results[0]) : [],
          execution_time: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('Error processing natural language query:', error);
      throw error;
    }
  }

  // Generate automated insights
  async generateAutomatedInsights(orgId?: string): Promise<AnalyticsInsight[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    try {
      // Get insights from anomaly detection
      const anomalyInsights = await this.getAnomalyInsights(profile.organization_id);
      
      // Get correlation insights
      const correlationInsights = await this.getCorrelationInsights(profile.organization_id);
      
      // Get predictive insights
      const predictiveInsights = await this.getPredictiveInsights(profile.organization_id);

      return [
        ...anomalyInsights,
        ...correlationInsights,
        ...predictiveInsights
      ];
    } catch (error) {
      console.error('Error generating automated insights:', error);
      return [];
    }
  }

  async detectAnomalies(dataSource: string): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    console.log(`Detecting anomalies in ${dataSource} for org ${profile.organization_id}`);
    
    // Simulate anomaly detection
    const anomalies = await this.performAnomalyDetection(dataSource, profile.organization_id);
    
    // Store detected anomalies
    if (anomalies.length > 0) {
      await this.storeAnomalies(anomalies, profile.organization_id);
    }
    
    return {
      data_source: dataSource,
      anomalies_detected: anomalies.length,
      anomalies: anomalies,
      detection_timestamp: new Date().toISOString()
    };
  }

  async analyzeRiskCorrelations(): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    console.log(`Analyzing risk correlations for org ${profile.organization_id}`);
    
    // Simulate correlation analysis
    const correlations = await this.performCorrelationAnalysis(profile.organization_id);
    
    // Store correlation results
    if (correlations.length > 0) {
      await this.storeCorrelations(correlations, profile.organization_id);
    }
    
    return {
      correlations_found: correlations.length,
      correlations: correlations,
      analysis_timestamp: new Date().toISOString()
    };
  }

  async generateInsights(): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    try {
      // Get recent anomalies
      const { data: anomalies } = await supabase
        .from('anomaly_detections')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('detected_at', { ascending: false })
        .limit(10);

      // Get recent correlations
      const { data: correlations } = await supabase
        .from('risk_correlations')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(5);

      const anomalyInsights = (anomalies || []).map(a => 
        `${a.anomaly_type} anomaly detected with ${a.severity_score > 0.7 ? 'high' : 'medium'} severity`
      );

      const correlationInsights = (correlations || []).map(c => 
        `${c.correlation_strength} correlation found between ${c.factor_a_type} and ${c.factor_b_type}`
      );

      const recommendations = this.generateGeneralRecommendations(anomalies || [], correlations || []);

      return {
        anomaly_insights: anomalyInsights,
        correlation_insights: correlationInsights,
        recommendations: recommendations,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating insights:', error);
      return null;
    }
  }

  private async executeQuery(query: string): Promise<any[]> {
    // Simulate query execution based on natural language
    const queryType = this.classifyQuery(query);
    
    switch (queryType) {
      case 'risk_overview':
        return await this.getRiskOverviewData();
      case 'vendor_analysis':
        return await this.getVendorAnalysisData();
      case 'incident_trends':
        return await this.getIncidentTrendsData();
      default:
        return [];
    }
  }

  private classifyQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('risk') && (lowerQuery.includes('overview') || lowerQuery.includes('summary'))) {
      return 'risk_overview';
    }
    if (lowerQuery.includes('vendor') || lowerQuery.includes('third party')) {
      return 'vendor_analysis';
    }
    if (lowerQuery.includes('incident') || lowerQuery.includes('event')) {
      return 'incident_trends';
    }
    
    return 'general';
  }

  private generateQueryInsights(query: string, results: any[]): string[] {
    const insights = [];
    
    if (results.length === 0) {
      insights.push('No data found matching your query criteria');
    } else {
      insights.push(`Found ${results.length} relevant data points`);
      
      if (results.length > 100) {
        insights.push('Large dataset detected - consider filtering for better performance');
      }
    }
    
    return insights;
  }

  private suggestVisualizations(results: any[]): string[] {
    const suggestions = [];
    
    if (results.length > 0) {
      if (results.every(r => r.date || r.timestamp)) {
        suggestions.push('Time series chart');
        suggestions.push('Trend analysis');
      }
      
      if (results.some(r => r.category || r.type)) {
        suggestions.push('Bar chart by category');
        suggestions.push('Pie chart distribution');
      }
      
      if (results.some(r => typeof r.value === 'number')) {
        suggestions.push('Histogram');
        suggestions.push('Box plot');
      }
    }
    
    return suggestions;
  }

  private async getRiskOverviewData(): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    // Simulate risk overview data
    return [
      { category: 'Operational', risk_score: 65, trend: 'increasing' },
      { category: 'Financial', risk_score: 45, trend: 'stable' },
      { category: 'Cybersecurity', risk_score: 78, trend: 'decreasing' },
      { category: 'Regulatory', risk_score: 52, trend: 'stable' }
    ];
  }

  private async getVendorAnalysisData(): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    // Get actual vendor data
    const { data: vendors } = await supabase
      .from('third_party_profiles')
      .select('vendor_name, criticality, risk_rating')
      .eq('org_id', profile.organization_id)
      .limit(50);

    return vendors || [];
  }

  private async getIncidentTrendsData(): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    // Get actual incident data
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('severity, status, reported_at')
      .eq('org_id', profile.organization_id)
      .order('reported_at', { ascending: false })
      .limit(100);

    return incidents || [];
  }

  private async getAnomalyInsights(orgId: string): Promise<AnalyticsInsight[]> {
    const { data: anomalies } = await supabase
      .from('anomaly_detections')
      .select('*')
      .eq('org_id', orgId)
      .eq('investigation_status', 'new')
      .order('detected_at', { ascending: false })
      .limit(10);

    return (anomalies || []).map(anomaly => ({
      id: anomaly.id,
      insight_type: 'anomaly',
      type: 'anomaly',
      title: `Anomaly Detected: ${anomaly.anomaly_type}`,
      description: `Detected unusual pattern in ${anomaly.detection_source} with ${anomaly.confidence_score}% confidence`,
      severity: this.mapSeverityScore(anomaly.severity_score),
      impact: this.mapSeverityScore(anomaly.severity_score),
      confidence_score: anomaly.confidence_score,
      confidence: anomaly.confidence_score / 100,
      recommendations: this.generateAnomalyRecommendations(anomaly),
      data_points: [anomaly.detected_values],
      created_at: anomaly.detected_at
    }));
  }

  private async getCorrelationInsights(orgId: string): Promise<AnalyticsInsight[]> {
    const { data: correlations } = await supabase
      .from('risk_correlations')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5);

    return (correlations || []).map(correlation => ({
      id: correlation.id,
      insight_type: 'correlation',
      type: 'correlation',
      title: `Risk Correlation Identified`,
      description: `Strong ${correlation.correlation_strength} correlation (${(correlation.correlation_coefficient * 100).toFixed(1)}%) between ${correlation.factor_a_type} and ${correlation.factor_b_type}`,
      severity: this.mapCorrelationSeverity(Math.abs(correlation.correlation_coefficient)),
      impact: this.mapCorrelationSeverity(Math.abs(correlation.correlation_coefficient)),
      confidence_score: correlation.statistical_significance * 100,
      confidence: correlation.statistical_significance,
      recommendations: this.generateCorrelationRecommendations(correlation),
      data_points: [correlation.correlation_context],
      created_at: correlation.created_at
    }));
  }

  private async getPredictiveInsights(orgId: string): Promise<AnalyticsInsight[]> {
    const { data: models } = await supabase
      .from('predictive_models')
      .select('*')
      .eq('org_id', orgId)
      .eq('model_status', 'active')
      .order('last_trained_at', { ascending: false })
      .limit(3);

    return (models || []).map(model => ({
      id: model.id,
      insight_type: 'prediction',
      type: 'prediction',
      title: `Predictive Model Update: ${model.model_name}`,
      description: `Model accuracy: ${(model.model_accuracy * 100).toFixed(1)}% for ${model.target_variable}`,
      severity: this.mapAccuracySeverity(model.model_accuracy),
      impact: this.mapAccuracySeverity(model.model_accuracy),
      confidence_score: model.model_accuracy * 100,
      confidence: model.model_accuracy,
      recommendations: this.generatePredictiveRecommendations(model),
      data_points: [model.model_parameters],
      created_at: model.last_trained_at || model.created_at
    }));
  }

  private mapSeverityScore(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  private mapCorrelationSeverity(coefficient: number): 'low' | 'medium' | 'high' | 'critical' {
    if (coefficient >= 0.8) return 'critical';
    if (coefficient >= 0.6) return 'high';
    if (coefficient >= 0.4) return 'medium';
    return 'low';
  }

  private mapAccuracySeverity(accuracy: number): 'low' | 'medium' | 'high' | 'critical' {
    if (accuracy < 0.7) return 'critical';
    if (accuracy < 0.8) return 'high';
    if (accuracy < 0.9) return 'medium';
    return 'low';
  }

  private generateAnomalyRecommendations(anomaly: any): string[] {
    const recommendations = [];
    
    if (anomaly.severity_score > 0.7) {
      recommendations.push('Immediate investigation required');
      recommendations.push('Consider implementing additional monitoring');
    }
    
    recommendations.push('Review historical patterns for similar anomalies');
    recommendations.push('Update baseline metrics if this becomes the new normal');
    
    return recommendations;
  }

  private generateCorrelationRecommendations(correlation: any): string[] {
    const recommendations = [];
    
    if (Math.abs(correlation.correlation_coefficient) > 0.7) {
      recommendations.push('Strong correlation detected - consider joint risk management');
      recommendations.push('Monitor both factors together for early warning signals');
    }
    
    recommendations.push('Validate correlation with additional data sources');
    recommendations.push('Consider correlation in risk appetite setting');
    
    return recommendations;
  }

  private generatePredictiveRecommendations(model: any): string[] {
    const recommendations = [];
    
    if (model.model_accuracy < 0.8) {
      recommendations.push('Model accuracy below threshold - consider retraining');
      recommendations.push('Review feature selection and data quality');
    } else {
      recommendations.push('Model performing well - continue monitoring');
    }
    
    recommendations.push('Schedule regular model validation');
    recommendations.push('Consider A/B testing new model versions');
    
    return recommendations;
  }

  async detectAnomalies(dataSource: string): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    console.log(`Detecting anomalies in ${dataSource} for org ${profile.organization_id}`);
    
    // Simulate anomaly detection
    const anomalies = await this.performAnomalyDetection(dataSource, profile.organization_id);
    
    // Store detected anomalies
    if (anomalies.length > 0) {
      await this.storeAnomalies(anomalies, profile.organization_id);
    }
    
    return {
      data_source: dataSource,
      anomalies_detected: anomalies.length,
      anomalies: anomalies,
      detection_timestamp: new Date().toISOString()
    };
  }

  async analyzeRiskCorrelations(): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    console.log(`Analyzing risk correlations for org ${profile.organization_id}`);
    
    // Simulate correlation analysis
    const correlations = await this.performCorrelationAnalysis(profile.organization_id);
    
    // Store correlation results
    if (correlations.length > 0) {
      await this.storeCorrelations(correlations, profile.organization_id);
    }
    
    return {
      correlations_found: correlations.length,
      correlations: correlations,
      analysis_timestamp: new Date().toISOString()
    };
  }

  async generateInsights(): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    try {
      // Get recent anomalies
      const { data: anomalies } = await supabase
        .from('anomaly_detections')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('detected_at', { ascending: false })
        .limit(10);

      // Get recent correlations
      const { data: correlations } = await supabase
        .from('risk_correlations')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(5);

      const anomalyInsights = (anomalies || []).map(a => 
        `${a.anomaly_type} anomaly detected with ${a.severity_score > 0.7 ? 'high' : 'medium'} severity`
      );

      const correlationInsights = (correlations || []).map(c => 
        `${c.correlation_strength} correlation found between ${c.factor_a_type} and ${c.factor_b_type}`
      );

      const recommendations = this.generateGeneralRecommendations(anomalies || [], correlations || []);

      return {
        anomaly_insights: anomalyInsights,
        correlation_insights: correlationInsights,
        recommendations: recommendations,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating insights:', error);
      return null;
    }
  }

  private async performAnomalyDetection(dataSource: string, orgId: string): Promise<any[]> {
    // Simulate anomaly detection logic
    const anomalies = [];
    
    // Generate some sample anomalies
    if (Math.random() > 0.7) {
      anomalies.push({
        detection_source: dataSource,
        anomaly_type: 'statistical_outlier',
        severity_score: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
        confidence_score: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
        detected_values: { value: Math.random() * 100 + 50 },
        baseline_values: { average: 75, std_dev: 15 },
        deviation_metrics: { z_score: Math.random() * 3 + 2 }
      });
    }
    
    return anomalies;
  }

  private async storeAnomalies(anomalies: any[], orgId: string): Promise<void> {
    for (const anomaly of anomalies) {
      await supabase
        .from('anomaly_detections')
        .insert({
          org_id: orgId,
          ...anomaly
        });
    }
  }

  private async performCorrelationAnalysis(orgId: string): Promise<any[]> {
    // Simulate correlation analysis
    const correlations = [];
    
    const factorTypes = ['kri_score', 'vendor_risk', 'incident_frequency', 'control_effectiveness'];
    
    for (let i = 0; i < factorTypes.length - 1; i++) {
      for (let j = i + 1; j < factorTypes.length; j++) {
        const coefficient = (Math.random() - 0.5) * 2; // -1 to 1
        
        if (Math.abs(coefficient) > 0.3) { // Only store significant correlations
          correlations.push({
            factor_a_type: factorTypes[i],
            factor_b_type: factorTypes[j],
            correlation_coefficient: coefficient,
            correlation_strength: Math.abs(coefficient) > 0.7 ? 'strong' : 'moderate',
            statistical_significance: Math.random() * 0.05 + 0.95, // 0.95 to 1.0
            analysis_period: `[${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]},${new Date().toISOString().split('T')[0]}]`,
            correlation_context: {
              sample_size: Math.floor(Math.random() * 500 + 100),
              analysis_method: 'pearson'
            }
          });
        }
      }
    }
    
    return correlations;
  }

  private async storeCorrelations(correlations: any[], orgId: string): Promise<void> {
    for (const correlation of correlations) {
      await supabase
        .from('risk_correlations')
        .insert({
          org_id: orgId,
          ...correlation
        });
    }
  }

  private generateGeneralRecommendations(anomalies: any[], correlations: any[]): string[] {
    const recommendations = [];
    
    if (anomalies.length > 3) {
      recommendations.push('Multiple anomalies detected - consider system-wide investigation');
    }
    
    if (correlations.some(c => Math.abs(c.correlation_coefficient) > 0.8)) {
      recommendations.push('Strong correlations found - review risk interdependencies');
    }
    
    if (anomalies.some(a => a.severity_score > 0.8)) {
      recommendations.push('High-severity anomalies require immediate attention');
    }
    
    recommendations.push('Continue monitoring patterns and update baselines regularly');
    
    return recommendations;
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
