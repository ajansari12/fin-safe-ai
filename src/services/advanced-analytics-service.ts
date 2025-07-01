
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface PredictiveModel {
  id: string;
  org_id: string;
  model_name: string;
  model_type: string;
  target_variable: string;
  feature_variables: any;
  model_parameters: any;
  training_data_period?: any;
  model_accuracy?: number;
  last_trained_at?: string;
  model_status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AnomalyDetection {
  id: string;
  org_id: string;
  detection_source: string;
  anomaly_type: string;
  severity_score: number;
  confidence_score: number;
  detected_values: any;
  baseline_values: any;
  deviation_metrics: any;
  investigation_status: string;
  investigation_notes?: string;
  detected_at: string;
  resolved_at?: string;
  created_at: string;
}

export interface RiskCorrelation {
  id: string;
  org_id: string;
  factor_a_type: string;
  factor_a_id?: string;
  factor_b_type: string;
  factor_b_id?: string;
  correlation_coefficient: number;
  correlation_strength: string;
  statistical_significance?: number;
  analysis_period: any;
  correlation_context: any;
  created_at: string;
  updated_at: string;
}

class AdvancedAnalyticsService {
  // Anomaly detection using isolation forest algorithm
  async detectAnomalies(dataSource: string, analysisWindow: number = 30): Promise<AnomalyDetection[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    // Get historical data for analysis
    const historicalData = await this.getHistoricalData(dataSource, analysisWindow);
    
    // Perform anomaly detection
    const anomalies = this.performIsolationForest(historicalData);
    
    // Store detected anomalies
    const anomalyRecords = [];
    for (const anomaly of anomalies) {
      const anomalyData = {
        org_id: profile.organization_id,
        detection_source: dataSource,
        anomaly_type: anomaly.type,
        severity_score: anomaly.severity,
        confidence_score: anomaly.confidence,
        detected_values: anomaly.detectedValues,
        baseline_values: anomaly.baselineValues,
        deviation_metrics: anomaly.deviationMetrics,
        investigation_status: 'new'
      };

      const { data, error } = await supabase
        .from('anomaly_detections')
        .insert([anomalyData])
        .select()
        .single();

      if (!error && data) {
        anomalyRecords.push(data);
      }
    }

    return anomalyRecords;
  }

  // Isolation Forest implementation for anomaly detection
  private performIsolationForest(data: any[]): any[] {
    if (data.length < 10) return []; // Need minimum data points

    const anomalies = [];
    const features = this.extractFeatures(data);
    
    // Build isolation trees
    const trees = this.buildIsolationTrees(features, 100); // 100 trees
    
    // Calculate anomaly scores
    for (let i = 0; i < data.length; i++) {
      const point = features[i];
      const pathLengths = trees.map(tree => this.getPathLength(tree, point, 0));
      const avgPathLength = pathLengths.reduce((sum, len) => sum + len, 0) / pathLengths.length;
      
      // Normalize score (shorter paths = more anomalous)
      const anomalyScore = Math.pow(2, -avgPathLength / this.calculateC(data.length));
      
      if (anomalyScore > 0.6) { // Threshold for anomaly
        anomalies.push({
          type: this.classifyAnomalyType(point, data),
          severity: Math.min(100, anomalyScore * 100),
          confidence: Math.min(1, anomalyScore + 0.2),
          detectedValues: point,
          baselineValues: this.calculateBaseline(features),
          deviationMetrics: this.calculateDeviation(point, features),
          dataIndex: i
        });
      }
    }

    return anomalies;
  }

  private extractFeatures(data: any[]): number[][] {
    // Extract numerical features from data
    return data.map(item => {
      const features = [];
      
      // Example feature extraction (would be customized per data source)
      if (typeof item.value === 'number') features.push(item.value);
      if (typeof item.trend === 'number') features.push(item.trend);
      if (typeof item.volatility === 'number') features.push(item.volatility);
      if (item.timestamp) {
        const date = new Date(item.timestamp);
        features.push(date.getHours()); // Time-based features
        features.push(date.getDay());
      }
      
      return features.length > 0 ? features : [Math.random()]; // Fallback
    });
  }

  private buildIsolationTrees(features: number[][], numTrees: number): any[] {
    const trees = [];
    const subsampleSize = Math.min(256, features.length); // Standard subsampling
    
    for (let i = 0; i < numTrees; i++) {
      // Random subsampling
      const subsample = this.randomSubsample(features, subsampleSize);
      const tree = this.buildTree(subsample, 0, Math.ceil(Math.log2(subsampleSize)));
      trees.push(tree);
    }
    
    return trees;
  }

  private buildTree(data: number[][], depth: number, maxDepth: number): any {
    if (data.length <= 1 || depth >= maxDepth) {
      return { type: 'leaf', size: data.length };
    }
    
    // Random feature selection
    const featureIndex = Math.floor(Math.random() * data[0].length);
    const featureValues = data.map(point => point[featureIndex]);
    const minVal = Math.min(...featureValues);
    const maxVal = Math.max(...featureValues);
    
    if (minVal === maxVal) {
      return { type: 'leaf', size: data.length };
    }
    
    // Random split point
    const splitValue = minVal + Math.random() * (maxVal - minVal);
    
    const leftData = data.filter(point => point[featureIndex] < splitValue);
    const rightData = data.filter(point => point[featureIndex] >= splitValue);
    
    return {
      type: 'internal',
      featureIndex,
      splitValue,
      left: this.buildTree(leftData, depth + 1, maxDepth),
      right: this.buildTree(rightData, depth + 1, maxDepth)
    };
  }

  private getPathLength(tree: any, point: number[], depth: number): number {
    if (tree.type === 'leaf') {
      return depth + this.calculateC(tree.size);
    }
    
    const featureValue = point[tree.featureIndex];
    if (featureValue < tree.splitValue) {
      return this.getPathLength(tree.left, point, depth + 1);
    } else {
      return this.getPathLength(tree.right, point, depth + 1);
    }
  }

  private calculateC(n: number): number {
    if (n <= 1) return 0;
    return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n);
  }

  private randomSubsample(data: any[], size: number): any[] {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, size);
  }

  private classifyAnomalyType(point: number[], allData: number[][]): string {
    // Simple classification based on deviation patterns
    const baseline = this.calculateBaseline(allData);
    const deviations = point.map((val, idx) => Math.abs(val - baseline[idx]));
    const maxDeviationIdx = deviations.indexOf(Math.max(...deviations));
    
    // Map feature index to anomaly type (would be customized per domain)
    const anomalyTypes = ['value_spike', 'trend_anomaly', 'volatility_anomaly', 'temporal_anomaly'];
    return anomalyTypes[maxDeviationIdx] || 'unknown';
  }

  private calculateBaseline(features: number[][]): number[] {
    if (features.length === 0) return [];
    
    const numFeatures = features[0].length;
    const baseline = [];
    
    for (let i = 0; i < numFeatures; i++) {
      const values = features.map(point => point[i]);
      baseline.push(values.reduce((sum, val) => sum + val, 0) / values.length);
    }
    
    return baseline;
  }

  private calculateDeviation(point: number[], allFeatures: number[][]): any {
    const baseline = this.calculateBaseline(allFeatures);
    const standardDeviations = this.calculateStandardDeviations(allFeatures);
    
    return {
      absolute_deviations: point.map((val, idx) => Math.abs(val - baseline[idx])),
      z_scores: point.map((val, idx) => 
        standardDeviations[idx] > 0 ? (val - baseline[idx]) / standardDeviations[idx] : 0
      ),
      percentage_deviations: point.map((val, idx) => 
        baseline[idx] !== 0 ? ((val - baseline[idx]) / baseline[idx]) * 100 : 0
      )
    };
  }

  private calculateStandardDeviations(features: number[][]): number[] {
    const baseline = this.calculateBaseline(features);
    const numFeatures = features[0].length;
    const stdDevs = [];
    
    for (let i = 0; i < numFeatures; i++) {
      const values = features.map(point => point[i]);
      const variance = values.reduce((sum, val) => sum + Math.pow(val - baseline[i], 2), 0) / values.length;
      stdDevs.push(Math.sqrt(variance));
    }
    
    return stdDevs;
  }

  // Correlation analysis between risk factors
  async analyzeRiskCorrelations(analysisWindow: number = 90): Promise<RiskCorrelation[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    // Get various risk data sources
    const riskDataSources = await this.getRiskDataSources();
    const correlations = [];
    
    // Analyze correlations between all pairs of risk factors
    for (let i = 0; i < riskDataSources.length; i++) {
      for (let j = i + 1; j < riskDataSources.length; j++) {
        const sourceA = riskDataSources[i];
        const sourceB = riskDataSources[j];
        
        const correlation = await this.calculateCorrelation(sourceA, sourceB, analysisWindow);
        
        if (Math.abs(correlation.coefficient) > 0.3) { // Only store significant correlations
          const correlationData = {
            org_id: profile.organization_id,
            factor_a_type: sourceA.type,
            factor_a_id: sourceA.id,
            factor_b_type: sourceB.type,
            factor_b_id: sourceB.id,
            correlation_coefficient: correlation.coefficient,
            correlation_strength: this.getCorrelationStrength(correlation.coefficient),
            statistical_significance: correlation.pValue,
            analysis_period: `[${new Date(Date.now() - analysisWindow * 24 * 60 * 60 * 1000).toISOString()}, ${new Date().toISOString()}]`,
            correlation_context: correlation.context
          };

          const { data, error } = await supabase
            .from('risk_correlations')
            .insert([correlationData])
            .select()
            .single();

          if (!error && data) {
            correlations.push(data);
          }
        }
      }
    }

    return correlations;
  }

  private async getRiskDataSources(): Promise<any[]> {
    // Get various risk metrics from different modules
    const sources = [
      { type: 'kri', data: await this.getKRIData() },
      { type: 'incident', data: await this.getIncidentData() },
      { type: 'vendor_risk', data: await this.getVendorRiskData() },
      { type: 'operational_risk', data: await this.getOperationalRiskData() }
    ];

    return sources.filter(source => source.data.length > 0);
  }

  private async calculateCorrelation(sourceA: any, sourceB: any, windowDays: number): Promise<any> {
    // Align time series data
    const alignedData = this.alignTimeSeries(sourceA.data, sourceB.data);
    
    if (alignedData.length < 3) {
      return { coefficient: 0, pValue: 1, context: { insufficient_data: true } };
    }

    // Calculate Pearson correlation coefficient
    const valuesA = alignedData.map(d => d.valueA);
    const valuesB = alignedData.map(d => d.valueB);
    
    const correlation = this.pearsonCorrelation(valuesA, valuesB);
    const pValue = this.calculatePValue(correlation, alignedData.length);
    
    return {
      coefficient: correlation,
      pValue,
      context: {
        sample_size: alignedData.length,
        analysis_period_days: windowDays,
        data_quality: this.assessDataQuality(alignedData),
        potential_causality: this.assessCausality(sourceA.type, sourceB.type)
      }
    };
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculatePValue(correlation: number, sampleSize: number): number {
    // Simplified p-value calculation using t-distribution approximation
    if (sampleSize <= 2) return 1;
    
    const t = correlation * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
    // This is a simplified approximation - in production would use proper t-distribution
    return Math.min(1, Math.max(0, 1 - Math.abs(t) / 3));
  }

  private getCorrelationStrength(coefficient: number): string {
    const abs = Math.abs(coefficient);
    if (abs >= 0.8) return 'very_strong';
    if (abs >= 0.6) return 'strong';
    if (abs >= 0.4) return 'moderate';
    if (abs >= 0.2) return 'weak';
    return 'very_weak';
  }

  // Predictive modeling for risk forecasting
  async trainPredictiveModel(modelConfig: Partial<PredictiveModel>): Promise<PredictiveModel> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Get training data
    const trainingData = await this.getTrainingData(modelConfig.target_variable!, modelConfig.feature_variables);
    
    // Train model (simplified linear regression for this example)
    const model = this.trainLinearRegression(trainingData);
    
    const modelData = {
      org_id: profile.organization_id,
      model_name: modelConfig.model_name || 'Risk Prediction Model',
      model_type: modelConfig.model_type || 'linear_regression',
      target_variable: modelConfig.target_variable!,
      feature_variables: modelConfig.feature_variables || {},
      model_parameters: model.parameters,
      training_data_period: `[${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()}, ${new Date().toISOString()}]`,
      model_accuracy: model.accuracy,
      last_trained_at: new Date().toISOString(),
      model_status: 'active',
      created_by: profile.id
    };

    const { data, error } = await supabase
      .from('predictive_models')
      .insert([modelData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private trainLinearRegression(trainingData: any[]): any {
    if (trainingData.length < 2) {
      return { parameters: {}, accuracy: 0 };
    }

    // Simple linear regression: y = mx + b
    const x = trainingData.map((d, i) => i); // Use index as x for simplicity
    const y = trainingData.map(d => d.target);
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const residualSumSquares = y.reduce((sum, val, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    return {
      parameters: { slope, intercept },
      accuracy: Math.max(0, rSquared)
    };
  }

  // Generate natural language insights
  async generateInsights(): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    // Get recent anomalies
    const { data: anomalies } = await supabase
      .from('anomaly_detections')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('severity_score', { ascending: false })
      .limit(10);

    // Get recent correlations
    const { data: correlations } = await supabase
      .from('risk_correlations')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Generate insights
    const insights = {
      summary: this.generateExecutiveSummary(anomalies || [], correlations || []),
      anomaly_insights: this.generateAnomalyInsights(anomalies || []),
      correlation_insights: this.generateCorrelationInsights(correlations || []),
      recommendations: this.generateRecommendations(anomalies || [], correlations || []),
      risk_trends: await this.analyzeRiskTrends()
    };

    return insights;
  }

  private generateExecutiveSummary(anomalies: any[], correlations: any[]): string {
    const highSeverityAnomalies = anomalies.filter(a => a.severity_score > 70).length;
    const strongCorrelations = correlations.filter(c => Math.abs(c.correlation_coefficient) > 0.7).length;
    
    let summary = `In the past week, our risk analytics detected ${anomalies.length} anomalies across various risk factors`;
    
    if (highSeverityAnomalies > 0) {
      summary += `, with ${highSeverityAnomalies} classified as high severity`;
    }
    
    summary += `. We identified ${strongCorrelations} strong correlations between different risk factors`;
    
    if (anomalies.length > 10) {
      summary += `. The elevated number of anomalies suggests increased risk volatility requiring attention.`;
    } else {
      summary += `, indicating relatively stable risk conditions.`;
    }
    
    return summary;
  }

  private generateAnomalyInsights(anomalies: any[]): string[] {
    const insights = [];
    
    const anomalyTypes = this.groupBy(anomalies, 'anomaly_type');
    for (const [type, typeAnomalies] of Object.entries(anomalyTypes)) {
      const count = (typeAnomalies as any[]).length;
      const avgSeverity = (typeAnomalies as any[]).reduce((sum, a) => sum + a.severity_score, 0) / count;
      
      insights.push(
        `${count} ${type.replace('_', ' ')} anomalies detected with average severity of ${avgSeverity.toFixed(1)}%`
      );
    }
    
    return insights;
  }

  private generateCorrelationInsights(correlations: any[]): string[] {
    const insights = [];
    
    for (const correlation of correlations) {
      const strength = correlation.correlation_strength;
      const direction = correlation.correlation_coefficient > 0 ? 'positive' : 'negative';
      
      insights.push(
        `${strength} ${direction} correlation (${(correlation.correlation_coefficient * 100).toFixed(1)}%) detected between ${correlation.factor_a_type} and ${correlation.factor_b_type}`
      );
    }
    
    return insights;
  }

  private generateRecommendations(anomalies: any[], correlations: any[]): string[] {
    const recommendations = [];
    
    const highSeverityAnomalies = anomalies.filter(a => a.severity_score > 80);
    if (highSeverityAnomalies.length > 0) {
      recommendations.push('Investigate high-severity anomalies immediately to prevent potential risk materialization');
    }
    
    const strongCorrelations = correlations.filter(c => Math.abs(c.correlation_coefficient) > 0.8);
    if (strongCorrelations.length > 0) {
      recommendations.push('Review risk management strategies considering newly identified strong correlations');
    }
    
    if (anomalies.length > 15) {
      recommendations.push('Consider reviewing risk monitoring thresholds due to increased anomaly frequency');
    }
    
    return recommendations;
  }

  // Helper methods
  private async getHistoricalData(source: string, days: number): Promise<any[]> {
    // Simulate getting historical data - in production would query actual data sources
    const data = [];
    for (let i = 0; i < days; i++) {
      data.push({
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        value: Math.random() * 100 + (Math.random() > 0.95 ? 50 : 0), // Occasional spikes
        trend: Math.random() * 10 - 5,
        volatility: Math.random() * 20
      });
    }
    return data;
  }

  private async getKRIData(): Promise<any[]> {
    // Get KRI data for correlation analysis
    const { data } = await supabase
      .from('kri_logs')
      .select('actual_value, measurement_date')
      .gte('measurement_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('measurement_date');
    
    return (data || []).map(d => ({ value: d.actual_value, timestamp: d.measurement_date }));
  }

  private async getIncidentData(): Promise<any[]> {
    // Get incident data for correlation analysis
    const { data } = await supabase
      .from('incident_logs')
      .select('severity, reported_at')
      .gte('reported_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('reported_at');
    
    return (data || []).map(d => ({ 
      value: this.severityToNumber(d.severity), 
      timestamp: d.reported_at 
    }));
  }

  private async getVendorRiskData(): Promise<any[]> {
    // Get vendor risk data for correlation analysis
    const { data } = await supabase
      .from('vendor_assessments')
      .select('overall_risk_score, assessment_date')
      .gte('assessment_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('assessment_date');
    
    return (data || []).map(d => ({ value: d.overall_risk_score, timestamp: d.assessment_date }));
  }

  private async getOperationalRiskData(): Promise<any[]> {
    // Simulate operational risk data
    return [];
  }

  private severityToNumber(severity: string): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private alignTimeSeries(dataA: any[], dataB: any[]): any[] {
    // Simple alignment by date - in production would use more sophisticated alignment
    const aligned = [];
    const mapB = new Map(dataB.map(d => [d.timestamp, d.value]));
    
    for (const itemA of dataA) {
      const valueB = mapB.get(itemA.timestamp);
      if (valueB !== undefined) {
        aligned.push({ valueA: itemA.value, valueB });
      }
    }
    
    return aligned;
  }

  private assessDataQuality(data: any[]): string {
    if (data.length < 5) return 'poor';
    if (data.length < 15) return 'fair';
    if (data.length < 30) return 'good';
    return 'excellent';
  }

  private assessCausality(typeA: string, typeB: string): string {
    // Simple causality assessment - would be more sophisticated in production
    const causalPairs = [
      ['incident', 'kri'],
      ['vendor_risk', 'operational_risk'],
      ['kri', 'incident']
    ];
    
    return causalPairs.some(pair => 
      (pair[0] === typeA && pair[1] === typeB) || 
      (pair[1] === typeA && pair[0] === typeB)
    ) ? 'possible' : 'unlikely';
  }

  private async getTrainingData(targetVariable: string, features: any): Promise<any[]> {
    // Simulate training data - would get real data in production
    return Array.from({ length: 100 }, (_, i) => ({
      target: Math.random() * 100,
      features: Array.from({ length: 5 }, () => Math.random() * 50)
    }));
  }

  private async analyzeRiskTrends(): Promise<any> {
    return {
      overall_trend: 'stable',
      key_drivers: ['operational_risk', 'cyber_risk'],
      forecasted_direction: 'slightly_increasing',
      confidence_level: 0.75
    };
  }

  private groupBy(array: any[], key: string): { [key: string]: any[] } {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = groups[value] || [];
      groups[value].push(item);
      return groups;
    }, {});
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
