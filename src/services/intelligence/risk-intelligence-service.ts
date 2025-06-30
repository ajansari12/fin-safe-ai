
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface ExternalDataSource {
  id: string;
  org_id: string;
  source_name: string;
  source_type: 'credit_rating' | 'regulatory' | 'cyber_threat' | 'economic' | 'industry';
  endpoint_url: string;
  authentication_config: any;
  is_active: boolean;
  last_sync_at?: string;
  sync_frequency_hours: number;
  data_quality_score: number;
  created_at: string;
  updated_at: string;
}

export interface RiskIntelligence {
  id: string;
  org_id: string;
  vendor_id: string;
  source_id: string;
  intelligence_type: string;
  risk_score: number;
  risk_level: string;
  confidence_score: number;
  data_freshness_hours: number;
  raw_data: any;
  processed_data: any;
  attribution: string;
  collected_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RiskAlert {
  id: string;
  org_id: string;
  vendor_id: string;
  alert_type: 'rating_change' | 'regulatory_action' | 'cyber_incident' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  current_value: any;
  previous_value: any;
  change_magnitude: number;
  description: string;
  source_attribution: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  triggered_at: string;
  created_at: string;
  updated_at: string;
}

class RiskIntelligenceService {
  private dataSources = {
    creditRating: [
      { name: "Moody's", type: 'credit_rating', endpoint: 'https://api.moodys.com/v1/ratings' },
      { name: "S&P Global", type: 'credit_rating', endpoint: 'https://api.spglobal.com/v1/ratings' },
      { name: "Fitch Ratings", type: 'credit_rating', endpoint: 'https://api.fitchratings.com/v1/ratings' }
    ],
    regulatory: [
      { name: "OSFI", type: 'regulatory', endpoint: 'https://api.osfi-bsif.gc.ca/v1/institutions' },
      { name: "SEC EDGAR", type: 'regulatory', endpoint: 'https://www.sec.gov/api/v1/company' },
      { name: "FinCEN", type: 'regulatory', endpoint: 'https://api.fincen.gov/v1/sanctions' }
    ],
    cyberThreat: [
      { name: "ThreatConnect", type: 'cyber_threat', endpoint: 'https://api.threatconnect.com/v3/intelligence' },
      { name: "Recorded Future", type: 'cyber_threat', endpoint: 'https://api.recordedfuture.com/v2/threat' }
    ],
    economic: [
      { name: "Bank of Canada", type: 'economic', endpoint: 'https://www.bankofcanada.ca/valet/observations' },
      { name: "Federal Reserve", type: 'economic', endpoint: 'https://api.stlouisfed.org/fred/series' }
    ]
  };

  async configureDataSource(config: {
    source_name: string;
    source_type: string;
    endpoint_url: string;
    authentication_config: any;
    sync_frequency_hours?: number;
  }): Promise<ExternalDataSource> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('external_data_sources')
      .insert({
        org_id: profile.organization_id,
        source_name: config.source_name,
        source_type: config.source_type,
        endpoint_url: config.endpoint_url,
        authentication_config: config.authentication_config,
        sync_frequency_hours: config.sync_frequency_hours || 24,
        data_quality_score: 0,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data as ExternalDataSource;
  }

  async collectRiskIntelligence(vendorId: string, forceRefresh: boolean = false): Promise<RiskIntelligence[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    // Get active data sources
    const { data: sources } = await supabase
      .from('external_data_sources')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('is_active', true);

    if (!sources) return [];

    const intelligence: RiskIntelligence[] = [];

    for (const source of sources as ExternalDataSource[]) {
      try {
        const data = await this.fetchFromExternalSource(source, vendorId);
        const processed = await this.processRiskData(data, source);
        
        const intelligenceRecord = await this.storeRiskIntelligence({
          org_id: profile.organization_id,
          vendor_id: vendorId,
          source_id: source.id,
          intelligence_type: source.source_type,
          risk_score: processed.risk_score,
          risk_level: processed.risk_level,
          confidence_score: processed.confidence_score,
          data_freshness_hours: processed.data_freshness_hours,
          raw_data: data,
          processed_data: processed,
          attribution: source.source_name,
          collected_at: new Date().toISOString()
        });

        intelligence.push(intelligenceRecord);
      } catch (error) {
        console.error(`Failed to collect intelligence from ${source.source_name}:`, error);
      }
    }

    // Check for risk changes and trigger alerts
    await this.checkForRiskChanges(vendorId, intelligence);

    return intelligence;
  }

  private async fetchFromExternalSource(source: ExternalDataSource, vendorId: string): Promise<any> {
    // Simulate external API calls - in production, this would make real API calls
    // Each source would have its own authentication and data format
    
    const mockData: { [key: string]: any } = {
      'credit_rating': {
        rating: 'BBB+',
        outlook: 'Stable',
        score: 7.5,
        last_updated: new Date().toISOString(),
        methodology: 'Standard & Poor\'s Rating Scale'
      },
      'regulatory': {
        sanctions_status: 'Clear',
        regulatory_actions: [],
        compliance_score: 8.2,
        last_checked: new Date().toISOString()
      },
      'cyber_threat': {
        threat_level: 'Medium',
        recent_incidents: 2,
        vulnerability_score: 6.3,
        threat_actors: ['APT29', 'Lazarus Group']
      },
      'economic': {
        gdp_growth: 2.1,
        inflation_rate: 3.2,
        unemployment_rate: 5.8,
        currency_stability: 'Stable'
      }
    };

    return mockData[source.source_type] || {};
  }

  private async processRiskData(rawData: any, source: ExternalDataSource): Promise<any> {
    let risk_score = 5; // Default medium risk
    let risk_level = 'medium';
    let confidence_score = 0.8;

    switch (source.source_type) {
      case 'credit_rating':
        risk_score = this.convertCreditRatingToScore(rawData.rating);
        risk_level = this.scoreToRiskLevel(risk_score);
        confidence_score = 0.9;
        break;
      
      case 'regulatory':
        risk_score = rawData.sanctions_status === 'Clear' ? 2 : 9;
        risk_level = this.scoreToRiskLevel(risk_score);
        confidence_score = 0.95;
        break;
      
      case 'cyber_threat':
        risk_score = Math.min(10, rawData.vulnerability_score + rawData.recent_incidents);
        risk_level = this.scoreToRiskLevel(risk_score);
        confidence_score = 0.7;
        break;
      
      case 'economic':
        const economicRisk = (rawData.inflation_rate > 4 ? 2 : 0) + 
                           (rawData.unemployment_rate > 8 ? 2 : 0) +
                           (rawData.gdp_growth < 1 ? 2 : 0);
        risk_score = Math.min(10, 3 + economicRisk);
        risk_level = this.scoreToRiskLevel(risk_score);
        confidence_score = 0.85;
        break;
    }

    return {
      risk_score,
      risk_level,
      confidence_score,
      data_freshness_hours: 1,
      processed_at: new Date().toISOString()
    };
  }

  private convertCreditRatingToScore(rating: string): number {
    const ratingMap: { [key: string]: number } = {
      'AAA': 1, 'AA+': 1.5, 'AA': 2, 'AA-': 2.5,
      'A+': 3, 'A': 3.5, 'A-': 4,
      'BBB+': 4.5, 'BBB': 5, 'BBB-': 5.5,
      'BB+': 6, 'BB': 6.5, 'BB-': 7,
      'B+': 7.5, 'B': 8, 'B-': 8.5,
      'CCC+': 9, 'CCC': 9.5, 'D': 10
    };
    return ratingMap[rating] || 5;
  }

  private scoreToRiskLevel(score: number): string {
    if (score <= 2) return 'low';
    if (score <= 4) return 'low-medium';
    if (score <= 6) return 'medium';
    if (score <= 8) return 'high';
    return 'critical';
  }

  private async storeRiskIntelligence(intelligence: Omit<RiskIntelligence, 'id' | 'created_at' | 'updated_at'>): Promise<RiskIntelligence> {
    const { data, error } = await supabase
      .from('risk_intelligence')
      .insert(intelligence)
      .select()
      .single();

    if (error) throw error;
    return data as RiskIntelligence;
  }

  private async checkForRiskChanges(vendorId: string, newIntelligence: RiskIntelligence[]): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    // Get previous intelligence for comparison
    const { data: previousIntelligence } = await supabase
      .from('risk_intelligence')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('vendor_id', vendorId)
      .gte('collected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('collected_at', { ascending: false });

    if (!previousIntelligence) return;

    const previousIntel = previousIntelligence as RiskIntelligence[];

    for (const current of newIntelligence) {
      const previous = previousIntel.find(p => 
        p.source_id === current.source_id && 
        p.intelligence_type === current.intelligence_type
      );

      if (previous && this.isSignificantChange(previous, current)) {
        await this.createRiskAlert({
          org_id: profile.organization_id,
          vendor_id: vendorId,
          alert_type: this.determineAlertType(current.intelligence_type),
          severity: this.calculateAlertSeverity(previous.risk_score, current.risk_score),
          current_value: current.risk_score,
          previous_value: previous.risk_score,
          change_magnitude: Math.abs(current.risk_score - previous.risk_score),
          description: `${current.intelligence_type} risk score changed from ${previous.risk_score} to ${current.risk_score}`,
          source_attribution: current.attribution,
          acknowledged: false,
          triggered_at: new Date().toISOString()
        });
      }
    }
  }

  private isSignificantChange(previous: RiskIntelligence, current: RiskIntelligence): boolean {
    const threshold = 1.0; // Minimum change to trigger alert
    return Math.abs(current.risk_score - previous.risk_score) >= threshold;
  }

  private determineAlertType(intelligenceType: string): 'rating_change' | 'regulatory_action' | 'cyber_incident' | 'compliance_violation' {
    switch (intelligenceType) {
      case 'credit_rating': return 'rating_change';
      case 'regulatory': return 'regulatory_action';
      case 'cyber_threat': return 'cyber_incident';
      default: return 'compliance_violation';
    }
  }

  private calculateAlertSeverity(previousScore: number, currentScore: number): 'low' | 'medium' | 'high' | 'critical' {
    const change = Math.abs(currentScore - previousScore);
    if (change >= 3) return 'critical';
    if (change >= 2) return 'high';
    if (change >= 1) return 'medium';
    return 'low';
  }

  private async createRiskAlert(alert: Omit<RiskAlert, 'id' | 'created_at' | 'updated_at'>): Promise<RiskAlert> {
    const { data, error } = await supabase
      .from('risk_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) throw error;
    return data as RiskAlert;
  }

  async getRiskIntelligence(vendorId?: string, limit: number = 100): Promise<RiskIntelligence[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    let query = supabase
      .from('risk_intelligence')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('collected_at', { ascending: false })
      .limit(limit);

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching risk intelligence:', error);
      return [];
    }

    return (data || []) as RiskIntelligence[];
  }

  async getRiskAlerts(acknowledged: boolean = false, limit: number = 50): Promise<RiskAlert[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('risk_alerts')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('acknowledged', acknowledged)
      .order('triggered_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching risk alerts:', error);
      return [];
    }

    return (data || []) as RiskAlert[];
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile) return;

    await supabase
      .from('risk_alerts')
      .update({
        acknowledged: true,
        acknowledged_by: profile.id,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', alertId);
  }

  async calculateEnhancedRiskScore(vendorId: string, internalScore: number): Promise<{
    enhancedScore: number;
    confidence: number;
    contributors: any[];
  }> {
    const intelligence = await this.getRiskIntelligence(vendorId);
    
    if (intelligence.length === 0) {
      return {
        enhancedScore: internalScore,
        confidence: 0.5,
        contributors: [{ source: 'internal', score: internalScore, weight: 1.0 }]
      };
    }

    const contributors = [
      { source: 'internal', score: internalScore, weight: 0.4, confidence: 0.8 }
    ];

    let totalWeightedScore = internalScore * 0.4;
    let totalWeight = 0.4;
    let totalConfidence = 0.8 * 0.4;

    for (const intel of intelligence) {
      const weight = this.getSourceWeight(intel.intelligence_type);
      const freshnessFactor = this.calculateFreshnessFactor(intel.data_freshness_hours);
      const adjustedWeight = weight * freshnessFactor;
      
      contributors.push({
        source: intel.attribution,
        type: intel.intelligence_type,
        score: intel.risk_score,
        weight: adjustedWeight,
        confidence: intel.confidence_score,
        freshness: freshnessFactor
      });

      totalWeightedScore += intel.risk_score * adjustedWeight;
      totalWeight += adjustedWeight;
      totalConfidence += intel.confidence_score * adjustedWeight;
    }

    const enhancedScore = totalWeightedScore / totalWeight;
    const confidence = totalConfidence / totalWeight;

    return {
      enhancedScore: Math.round(enhancedScore * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      contributors
    };
  }

  private getSourceWeight(intelligenceType: string): number {
    const weights = {
      'credit_rating': 0.25,
      'regulatory': 0.20,
      'cyber_threat': 0.10,
      'economic': 0.05,
      'industry': 0.15
    };
    return weights[intelligenceType as keyof typeof weights] || 0.1;
  }

  private calculateFreshnessFactor(freshnessHours: number): number {
    // Reduce weight for stale data
    if (freshnessHours <= 24) return 1.0;
    if (freshnessHours <= 72) return 0.8;
    if (freshnessHours <= 168) return 0.6; // 1 week
    return 0.4;
  }

  async generateIntelligenceReport(vendorId: string): Promise<any> {
    const intelligence = await this.getRiskIntelligence(vendorId);
    const alerts = await this.getRiskAlerts().then(alerts => 
      alerts.filter(alert => alert.vendor_id === vendorId)
    );

    const enhancedRisk = await this.calculateEnhancedRiskScore(vendorId, 5);

    return {
      vendor_id: vendorId,
      report_generated_at: new Date().toISOString(),
      enhanced_risk_score: enhancedRisk,
      intelligence_summary: this.summarizeIntelligence(intelligence),
      recent_alerts: alerts.slice(0, 10),
      risk_trends: this.calculateRiskTrends(intelligence),
      recommendations: this.generateRecommendations(intelligence, alerts)
    };
  }

  private summarizeIntelligence(intelligence: RiskIntelligence[]): any {
    const byType = intelligence.reduce((acc, intel) => {
      if (!acc[intel.intelligence_type]) {
        acc[intel.intelligence_type] = [];
      }
      acc[intel.intelligence_type].push(intel);
      return acc;
    }, {} as { [key: string]: RiskIntelligence[] });

    return Object.entries(byType).map(([type, data]) => ({
      type,
      count: data.length,
      average_risk_score: data.reduce((sum, d) => sum + d.risk_score, 0) / data.length,
      latest_update: data[0]?.collected_at,
      confidence: data.reduce((sum, d) => sum + d.confidence_score, 0) / data.length
    }));
  }

  private calculateRiskTrends(intelligence: RiskIntelligence[]): any {
    // Group by week and calculate trend
    const weeklyData = intelligence.reduce((acc, intel) => {
      const week = new Date(intel.collected_at).toISOString().slice(0, 10);
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(intel.risk_score);
      return acc;
    }, {} as { [key: string]: number[] });

    return Object.entries(weeklyData).map(([week, scores]) => ({
      week,
      average_score: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      data_points: scores.length
    }));
  }

  private generateRecommendations(intelligence: RiskIntelligence[], alerts: RiskAlert[]): string[] {
    const recommendations = [];

    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('Immediate review required due to critical risk alerts');
    }

    const highRiskIntel = intelligence.filter(intel => intel.risk_score >= 8);
    if (highRiskIntel.length > 0) {
      recommendations.push('Consider enhanced due diligence for high-risk intelligence indicators');
    }

    const staleData = intelligence.filter(intel => intel.data_freshness_hours > 168);
    if (staleData.length > 0) {
      recommendations.push('Update external intelligence data - some sources are stale');
    }

    if (recommendations.length === 0) {
      recommendations.push('Risk profile appears stable - continue regular monitoring');
    }

    return recommendations;
  }
}

export const riskIntelligenceService = new RiskIntelligenceService();
