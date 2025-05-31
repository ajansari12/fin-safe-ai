
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface IncidentForecast {
  category: string;
  currentMonthly: number;
  predictedNextMonth: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  rollingAverage: number;
}

export interface KRIBreach {
  kriId: string;
  kriName: string;
  currentValue: number;
  threshold: number;
  breachProbability: number;
  daysToBreach: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskScorecard {
  overallScore: number;
  categories: {
    operational: number;
    cyber: number;
    compliance: number;
    financial: number;
    reputational: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

class PredictiveAnalyticsService {
  async generateIncidentForecast(orgId: string): Promise<IncidentForecast[]> {
    try {
      // Get incident data for the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const { data: incidents, error } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', orgId)
        .gte('reported_at', twelveMonthsAgo.toISOString())
        .order('reported_at', { ascending: true });

      if (error) throw error;

      // Group incidents by category and month
      const categoryData = this.groupIncidentsByCategory(incidents || []);
      
      // Calculate forecasts using rolling averages
      return Object.entries(categoryData).map(([category, monthlyData]) => {
        const rollingAverage = this.calculateRollingAverage(monthlyData, 3);
        const trend = this.calculateTrend(monthlyData);
        const predicted = this.predictNextMonth(monthlyData, rollingAverage, trend);
        
        return {
          category,
          currentMonthly: monthlyData[monthlyData.length - 1] || 0,
          predictedNextMonth: Math.round(predicted),
          confidence: this.calculateConfidence(monthlyData),
          trend,
          rollingAverage
        };
      });
    } catch (error) {
      console.error('Error generating incident forecast:', error);
      return [];
    }
  }

  async predictKRIBreaches(orgId: string): Promise<KRIBreach[]> {
    try {
      // Get KRI data with recent logs
      const { data: kriData, error } = await supabase
        .from('kri_definitions')
        .select(`
          *,
          kri_logs!inner(actual_value, measurement_date),
          risk_thresholds!inner(
            risk_appetite_statements!inner(org_id)
          )
        `)
        .eq('risk_thresholds.risk_appetite_statements.org_id', orgId)
        .gte('kri_logs.measurement_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('kri_logs.measurement_date', { ascending: true });

      if (error) throw error;

      const breachPredictions: KRIBreach[] = [];

      kriData?.forEach(kri => {
        const logs = kri.kri_logs || [];
        if (logs.length < 3) return; // Need at least 3 data points

        const values = logs.map(log => log.actual_value);
        const trend = this.calculateTrend(values);
        const currentValue = values[values.length - 1];
        const threshold = parseFloat(kri.warning_threshold || '0');
        
        if (threshold > 0) {
          const { probability, daysToBreach } = this.calculateBreachProbability(
            values, 
            threshold, 
            trend
          );
          
          if (probability > 0.1) { // Only include if >10% chance
            breachPredictions.push({
              kriId: kri.id,
              kriName: kri.name,
              currentValue,
              threshold,
              breachProbability: probability,
              daysToBreach,
              severity: this.calculateBreachSeverity(probability, daysToBreach)
            });
          }
        }
      });

      return breachPredictions.sort((a, b) => b.breachProbability - a.breachProbability);
    } catch (error) {
      console.error('Error predicting KRI breaches:', error);
      return [];
    }
  }

  async generateRiskScorecard(orgId: string): Promise<RiskScorecard> {
    try {
      const [incidents, findings, kriBreaches] = await Promise.all([
        this.getRecentIncidents(orgId),
        this.getComplianceFindings(orgId),
        this.getKRIBreaches(orgId)
      ]);

      const scores = {
        operational: this.calculateOperationalScore(incidents),
        cyber: this.calculateCyberScore(incidents),
        compliance: this.calculateComplianceScore(findings),
        financial: this.calculateFinancialScore(incidents),
        reputational: this.calculateReputationalScore(incidents, findings)
      };

      const overallScore = Object.values(scores).reduce((sum, score) => sum + Number(score), 0) / 5;
      
      // Store insight in analytics_insights table
      await this.storeAnalyticsInsight(orgId, 'risk_scorecard', {
        scores,
        overallScore,
        timestamp: new Date().toISOString()
      });

      return {
        overallScore: Math.round(overallScore),
        categories: scores,
        trend: this.calculateScorecardTrend(scores),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating risk scorecard:', error);
      return {
        overallScore: 0,
        categories: { operational: 0, cyber: 0, compliance: 0, financial: 0, reputational: 0 },
        trend: 'stable',
        lastUpdated: new Date().toISOString()
      };
    }
  }

  private groupIncidentsByCategory(incidents: any[]): Record<string, number[]> {
    const categoryData: Record<string, number[]> = {};
    const monthlyGroups: Record<string, Record<string, number>> = {};

    // Group by month and category
    incidents.forEach(incident => {
      const monthKey = new Date(incident.reported_at).toISOString().substring(0, 7);
      const category = incident.category || 'other';
      
      if (!monthlyGroups[monthKey]) monthlyGroups[monthKey] = {};
      if (!monthlyGroups[monthKey][category]) monthlyGroups[monthKey][category] = 0;
      monthlyGroups[monthKey][category]++;
    });

    // Convert to arrays for each category
    const months = Object.keys(monthlyGroups).sort();
    const categories = new Set(incidents.map(i => i.category || 'other'));

    categories.forEach(category => {
      categoryData[category] = months.map(month => monthlyGroups[month][category] || 0);
    });

    return categoryData;
  }

  private calculateRollingAverage(data: number[], window: number): number {
    if (data.length < window) return data.reduce((sum, val) => sum + val, 0) / data.length;
    const recent = data.slice(-window);
    return recent.reduce((sum, val) => sum + val, 0) / window;
  }

  private calculateTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const first = data.slice(0, Math.ceil(data.length / 2));
    const second = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = first.reduce((sum, val) => sum + val, 0) / first.length;
    const secondAvg = second.reduce((sum, val) => sum + val, 0) / second.length;
    
    const change = firstAvg === 0 ? 0 : (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private predictNextMonth(monthlyData: number[], rollingAverage: number, trend: string): number {
    const trendMultiplier = trend === 'increasing' ? 1.1 : trend === 'decreasing' ? 0.9 : 1.0;
    return rollingAverage * trendMultiplier;
  }

  private calculateConfidence(data: number[]): number {
    if (data.length < 3) return 0.3;
    
    const variance = this.calculateVariance(data);
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const cv = mean === 0 ? 0 : Math.sqrt(variance) / mean;
    
    // Lower coefficient of variation = higher confidence
    return Math.max(0.1, Math.min(0.9, 1 - cv));
  }

  private calculateVariance(data: number[]): number {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  }

  private calculateBreachProbability(values: number[], threshold: number, trend: string): { probability: number; daysToBreach: number } {
    const currentValue = values[values.length - 1];
    const changeRate = this.calculateChangeRate(values);
    
    if (currentValue >= threshold) {
      return { probability: 1.0, daysToBreach: 0 };
    }
    
    const distanceToThreshold = threshold - currentValue;
    const daysToBreach = changeRate > 0 ? Math.ceil(distanceToThreshold / changeRate) : Infinity;
    
    let probability = 0;
    if (daysToBreach <= 30) probability = 0.8;
    else if (daysToBreach <= 60) probability = 0.5;
    else if (daysToBreach <= 90) probability = 0.2;
    else probability = 0.1;
    
    return { probability, daysToBreach: Math.min(daysToBreach, 365) };
  }

  private calculateChangeRate(values: number[]): number {
    if (values.length < 2) return 0;
    
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push(values[i] - values[i - 1]);
    }
    
    return changes.reduce((sum, change) => sum + change, 0) / changes.length;
  }

  private calculateBreachSeverity(probability: number, daysToBreach: number): 'low' | 'medium' | 'high' | 'critical' {
    if (probability > 0.7 || daysToBreach <= 7) return 'critical';
    if (probability > 0.5 || daysToBreach <= 30) return 'high';
    if (probability > 0.3 || daysToBreach <= 60) return 'medium';
    return 'low';
  }

  private async getRecentIncidents(orgId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .gte('reported_at', thirtyDaysAgo.toISOString());
    return data || [];
  }

  private async getComplianceFindings(orgId: string) {
    const { data } = await supabase
      .from('compliance_findings')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'open');
    return data || [];
  }

  private async getKRIBreaches(orgId: string) {
    const { data } = await supabase
      .from('kri_logs')
      .select('*')
      .neq('threshold_breached', 'none')
      .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    return data || [];
  }

  private calculateOperationalScore(incidents: any[]): number {
    const operationalIncidents = incidents.filter(i => i.category === 'operational').length;
    return Math.max(0, 100 - (operationalIncidents * 10));
  }

  private calculateCyberScore(incidents: any[]): number {
    const cyberIncidents = incidents.filter(i => i.category === 'cyber').length;
    return Math.max(0, 100 - (cyberIncidents * 15));
  }

  private calculateComplianceScore(findings: any[]): number {
    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const highFindings = findings.filter(f => f.severity === 'high').length;
    return Math.max(0, 100 - (criticalFindings * 20 + highFindings * 10));
  }

  private calculateFinancialScore(incidents: any[]): number {
    const highImpactIncidents = incidents.filter(i => i.impact_rating >= 4).length;
    return Math.max(0, 100 - (highImpactIncidents * 12));
  }

  private calculateReputationalScore(incidents: any[], findings: any[]): number {
    const publicIncidents = incidents.filter(i => i.category === 'reputational').length;
    const regulatoryFindings = findings.filter(f => f.severity === 'critical').length;
    return Math.max(0, 100 - (publicIncidents * 15 + regulatoryFindings * 10));
  }

  private calculateScorecardTrend(scores: any): 'improving' | 'stable' | 'declining' {
    const scoreValues = Object.values(scores) as number[];
    const avgScore = scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
    if (avgScore >= 80) return 'improving';
    if (avgScore >= 60) return 'stable';
    return 'declining';
  }

  private async storeAnalyticsInsight(orgId: string, type: string, data: any) {
    try {
      await supabase
        .from('analytics_insights')
        .insert({
          org_id: orgId,
          insight_type: type,
          insight_data: data,
          confidence_score: 0.85,
          valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });
    } catch (error) {
      console.error('Error storing analytics insight:', error);
    }
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService();
