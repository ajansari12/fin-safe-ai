import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface RiskPrediction {
  riskId: string;
  riskName: string;
  currentScore: number;
  predictedScore: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  timeHorizon: 'week' | 'month' | 'quarter';
  factors: Array<{
    factor: string;
    impact: number;
    confidence: number;
  }>;
  recommendedActions: string[];
}

export interface AnomalyDetection {
  metric: string;
  value: number;
  expectedRange: {
    min: number;
    max: number;
  };
  anomalyScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  suggestedInvestigation: string[];
}

export interface RiskCorrelation {
  primaryRisk: string;
  correlatedRisks: Array<{
    riskName: string;
    correlationStrength: number;
    causality: 'cause' | 'effect' | 'bidirectional';
  }>;
  networkEffect: number;
  cascadeRisk: boolean;
}

class PredictiveRiskModelingService {
  async generateRiskPredictions(orgId: string, timeHorizon: 'week' | 'month' | 'quarter' = 'month'): Promise<RiskPrediction[]> {
    try {
      // Get historical incident and KRI data
      const [incidents, kriLogs, controls] = await Promise.all([
        this.getHistoricalIncidents(orgId),
        this.getKRITrends(orgId),
        this.getControlEffectiveness(orgId)
      ]);

      // Simulate ML model predictions based on historical data
      const predictions: RiskPrediction[] = [];

      // Analyze incident trends with proper type casting
      const incidentCategories = this.groupIncidentsByCategory(incidents as any[]);
      for (const [category, categoryIncidents] of Object.entries(incidentCategories)) {
        const incidentArray = categoryIncidents as any[];
        const trend = this.calculateTrend(incidentArray.map(i => Number(i.impact_rating) || 3));
        const prediction = this.predictRiskScore(incidentArray, trend, timeHorizon);
        
        predictions.push({
          riskId: `risk-${category}`,
          riskName: `${category} Risk`,
          currentScore: this.calculateCurrentScore(incidentArray),
          predictedScore: prediction.score,
          confidenceInterval: prediction.confidence,
          timeHorizon,
          factors: this.identifyRiskFactors(incidentArray, kriLogs as any[]),
          recommendedActions: this.generateRecommendations(category, prediction.score)
        });
      }

      return predictions;
    } catch (error) {
      console.error('Error generating risk predictions:', error);
      return [];
    }
  }

  async detectAnomalies(orgId: string): Promise<AnomalyDetection[]> {
    try {
      const [recentKRIs, recentIncidents] = await Promise.all([
        this.getRecentKRIData(orgId),
        this.getRecentIncidentData(orgId)
      ]);

      const anomalies: AnomalyDetection[] = [];

      // Detect KRI anomalies
      for (const kri of recentKRIs as any[]) {
        const historicalData = await this.getKRIHistoricalData(kri.kri_id);
        const anomaly = this.detectKRIAnomaly(kri, historicalData as any[]);
        if (anomaly) {
          anomalies.push(anomaly);
        }
      }

      // Detect incident pattern anomalies
      const incidentAnomaly = this.detectIncidentPatternAnomalies(recentIncidents as any[]);
      if (incidentAnomaly) {
        anomalies.push(incidentAnomaly);
      }

      return anomalies;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  }

  async analyzeRiskCorrelations(orgId: string): Promise<RiskCorrelation[]> {
    try {
      const [incidents, kriData] = await Promise.all([
        this.getHistoricalIncidents(orgId),
        this.getKRITrends(orgId)
      ]);

      const correlations: RiskCorrelation[] = [];
      const riskCategories = [...new Set((incidents as any[]).map(i => i.category).filter(Boolean))];

      for (const primaryRisk of riskCategories) {
        const correlatedRisks = this.findCorrelatedRisks(primaryRisk, incidents as any[], kriData as any[]);
        const networkEffect = this.calculateNetworkEffect(correlatedRisks);
        
        correlations.push({
          primaryRisk,
          correlatedRisks,
          networkEffect,
          cascadeRisk: networkEffect > 0.7
        });
      }

      return correlations;
    } catch (error) {
      console.error('Error analyzing risk correlations:', error);
      return [];
    }
  }

  private async getHistoricalIncidents(orgId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .gte('reported_at', sixMonthsAgo.toISOString())
      .order('reported_at', { ascending: true });

    return data || [];
  }

  private async getKRITrends(orgId: string) {
    const { data, error } = await supabase
      .from('kri_logs')
      .select(`
        *,
        kri_definitions!inner(org_id, name)
      `)
      .eq('kri_definitions.org_id', orgId)
      .gte('measurement_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('measurement_date', { ascending: true });

    return data || [];
  }

  private async getControlEffectiveness(orgId: string) {
    const { data, error } = await supabase
      .from('control_tests')
      .select('*')
      .eq('org_id', orgId)
      .gte('test_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    return data || [];
  }

  private groupIncidentsByCategory(incidents: any[]) {
    return incidents.reduce((acc, incident) => {
      const category = incident.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(incident);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private predictRiskScore(incidents: any[], trend: string, timeHorizon: string) {
    const currentScore = this.calculateCurrentScore(incidents);
    const trendMultiplier = trend === 'increasing' ? 1.2 : trend === 'decreasing' ? 0.8 : 1.0;
    const timeMultiplier = timeHorizon === 'week' ? 1.1 : timeHorizon === 'month' ? 1.2 : 1.4;
    
    const predictedScore = Math.min(10, currentScore * trendMultiplier * timeMultiplier);
    const confidence = this.calculateConfidence(incidents);
    
    return {
      score: Math.round(predictedScore * 10) / 10,
      confidence: {
        lower: Math.max(0, predictedScore - confidence),
        upper: Math.min(10, predictedScore + confidence)
      }
    };
  }

  private calculateCurrentScore(incidents: any[]): number {
    if (incidents.length === 0) return 1;
    
    const recentIncidents = incidents.filter(i => {
      const incidentDate = new Date(i.reported_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return incidentDate >= thirtyDaysAgo;
    });
    
    const severity = recentIncidents.reduce((sum, incident) => {
      const severityScore = { low: 1, medium: 2, high: 3, critical: 4 }[incident.severity] || 2;
      return sum + severityScore;
    }, 0);
    
    return Math.min(10, Math.max(1, severity / 2));
  }

  private calculateConfidence(incidents: any[]): number {
    // Simple confidence calculation based on data volume and consistency
    const dataPoints = incidents.length;
    const baseConfidence = Math.min(2, dataPoints / 10);
    return baseConfidence;
  }

  private identifyRiskFactors(incidents: any[], kriLogs: any[]) {
    const factors = [];
    
    // Analyze incident patterns
    const severityDistribution = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    if (severityDistribution.critical > 0) {
      factors.push({
        factor: 'Critical Incidents',
        impact: 0.8,
        confidence: 0.9
      });
    }
    
    // Analyze KRI trends
    const kriTrends = this.analyzeKRITrends(kriLogs);
    factors.push(...kriTrends);
    
    return factors;
  }

  private analyzeKRITrends(kriLogs: any[]) {
    const factors = [];
    const kriGroups = kriLogs.reduce((acc, log) => {
      const kriName = log.kri_definitions?.name || 'Unknown';
      if (!acc[kriName]) acc[kriName] = [];
      acc[kriName].push(Number(log.actual_value) || 0);
      return acc;
    }, {} as Record<string, number[]>);
    
    for (const [kriName, values] of Object.entries(kriGroups)) {
      // Ensure values is a number array before passing to calculateTrend
      const numericValues = Array.isArray(values) ? values : [];
      const trend = this.calculateTrend(numericValues);
      if (trend === 'increasing') {
        factors.push({
          factor: `${kriName} Trend`,
          impact: 0.6,
          confidence: 0.7
        });
      }
    }
    
    return factors;
  }

  private generateRecommendations(category: string, predictedScore: number): string[] {
    const recommendations = [];
    
    if (predictedScore > 7) {
      recommendations.push(`Implement immediate risk mitigation measures for ${category} risks`);
      recommendations.push(`Increase monitoring frequency for ${category} indicators`);
      recommendations.push(`Review and update ${category} risk response procedures`);
    } else if (predictedScore > 5) {
      recommendations.push(`Enhance preventive controls for ${category} risks`);
      recommendations.push(`Conduct additional ${category} risk assessments`);
    } else {
      recommendations.push(`Maintain current ${category} risk management practices`);
      recommendations.push(`Continue monitoring ${category} risk indicators`);
    }
    
    return recommendations;
  }

  private async getRecentKRIData(orgId: string) {
    const { data, error } = await supabase
      .from('kri_logs')
      .select(`
        *,
        kri_definitions!inner(org_id, name, warning_threshold, critical_threshold)
      `)
      .eq('kri_definitions.org_id', orgId)
      .gte('measurement_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('measurement_date', { ascending: false });

    return data || [];
  }

  private async getRecentIncidentData(orgId: string) {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .gte('reported_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('reported_at', { ascending: false });

    return data || [];
  }

  private async getKRIHistoricalData(kriId: string) {
    const { data, error } = await supabase
      .from('kri_logs')
      .select('actual_value, measurement_date')
      .eq('kri_id', kriId)
      .gte('measurement_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('measurement_date', { ascending: true });

    return data || [];
  }

  private detectKRIAnomaly(currentKRI: any, historicalData: any[]): AnomalyDetection | null {
    if (historicalData.length < 5) return null;
    
    const values = historicalData.map(d => Number(d.actual_value) || 0);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    
    const currentValue = Number(currentKRI.actual_value) || 0;
    const zScore = Math.abs((currentValue - mean) / (stdDev || 1));
    
    if (zScore > 2) {
      const severity = zScore > 3 ? 'critical' : zScore > 2.5 ? 'high' : 'medium';
      
      return {
        metric: currentKRI.kri_definitions?.name || 'Unknown KRI',
        value: currentValue,
        expectedRange: {
          min: mean - 2 * stdDev,
          max: mean + 2 * stdDev
        },
        anomalyScore: Math.min(1, zScore / 4),
        severity,
        explanation: `Value ${currentValue} is ${zScore.toFixed(1)} standard deviations from the expected range`,
        suggestedInvestigation: [
          'Review data collection methodology',
          'Investigate underlying business processes',
          'Check for external factors affecting this metric'
        ]
      };
    }
    
    return null;
  }

  private detectIncidentPatternAnomalies(incidents: any[]): AnomalyDetection | null {
    const dailyCounts = incidents.reduce((acc, incident) => {
      const date = new Date(incident.reported_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const counts: number[] = Object.values(dailyCounts);
    if (counts.length === 0) return null;
    
    const mean: number = counts.reduce((sum: number, count: number) => sum + count, 0) / counts.length;
    const maxCount: number = Math.max(...counts);
    
    if (maxCount > mean * 3) {
      return {
        metric: 'Daily Incident Count',
        value: maxCount,
        expectedRange: {
          min: 0,
          max: mean * 2
        },
        anomalyScore: Math.min(1, maxCount / (mean * 4)),
        severity: maxCount > mean * 5 ? 'critical' : 'high',
        explanation: `Unusual spike in daily incidents: ${maxCount} vs expected ${mean.toFixed(1)}`,
        suggestedInvestigation: [
          'Review incident categorization accuracy',
          'Investigate potential system issues',
          'Check for coordinated events or external factors'
        ]
      };
    }
    
    return null;
  }

  private findCorrelatedRisks(primaryRisk: string, incidents: any[], kriData: any[]) {
    const correlatedRisks = [];
    const primaryIncidents = incidents.filter(i => i.category === primaryRisk);
    
    if (primaryIncidents.length === 0) return correlatedRisks;
    
    const allCategories = [...new Set(incidents.map(i => i.category).filter(Boolean))];
    
    for (const category of allCategories) {
      if (category === primaryRisk) continue;
      
      const correlation = this.calculateCorrelation(primaryRisk, category, incidents);
      if (correlation.strength > 0.3) {
        correlatedRisks.push({
          riskName: category,
          correlationStrength: correlation.strength,
          causality: correlation.causality
        });
      }
    }
    
    return correlatedRisks;
  }

  private calculateCorrelation(risk1: string, risk2: string, incidents: any[]) {
    const risk1Incidents = incidents.filter(i => i.category === risk1);
    const risk2Incidents = incidents.filter(i => i.category === risk2);
    
    // Simple temporal correlation analysis
    let temporalCorrelation = 0;
    let causalityScore = 0;
    
    for (const incident1 of risk1Incidents) {
      // Ensure proper type casting for date operations
      const incident1Time = new Date(incident1.reported_at || Date.now()).getTime();
      
      for (const incident2 of risk2Incidents) {
        // Ensure proper type casting for date operations
        const incident2Time = new Date(incident2.reported_at || Date.now()).getTime();
        const timeDiff = Math.abs(incident2Time - incident1Time);
        
        // If incidents occur within 24 hours of each other
        if (timeDiff < 24 * 60 * 60 * 1000) {
          temporalCorrelation += 1;
          
          // Simple causality detection based on timing
          if (incident1Time < incident2Time) {
            causalityScore += 1;
          } else if (incident2Time < incident1Time) {
            causalityScore -= 1;
          }
        }
      }
    }
    
    const maxPossibleCorrelations = Math.min(risk1Incidents.length, risk2Incidents.length);
    const strength = maxPossibleCorrelations > 0 ? temporalCorrelation / maxPossibleCorrelations : 0;
    
    let causality: 'cause' | 'effect' | 'bidirectional' = 'bidirectional';
    if (Math.abs(causalityScore) > temporalCorrelation * 0.6) {
      causality = causalityScore > 0 ? 'cause' : 'effect';
    }
    
    return { strength, causality };
  }

  private calculateNetworkEffect(correlatedRisks: Array<{ correlationStrength: number }>): number {
    const totalCorrelations: number = correlatedRisks.length;
    if (totalCorrelations === 0) return 0;
    
    // Calculate average strength with explicit number handling
    let totalStrength: number = 0;
    for (const risk of correlatedRisks) {
      const correlationValue = risk.correlationStrength;
      const strength: number = (typeof correlationValue === 'number' && !isNaN(correlationValue)) ? correlationValue : 0;
      totalStrength = totalStrength + strength;
    }
    
    const avgStrength: number = totalStrength / totalCorrelations;
    
    // Network effect increases with number of correlations and their strength
    const networkCalculation: number = totalCorrelations * avgStrength;
    const finalResult: number = networkCalculation / 5;
    return Math.min(1, finalResult);
  }
}

export const predictiveRiskModelingService = new PredictiveRiskModelingService();