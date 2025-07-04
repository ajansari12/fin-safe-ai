import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface VendorAssessment {
  id: string;
  vendor_profile_id: string;
  org_id: string;
  assessment_type: string;
  assessment_date: string;
  financial_score?: number;
  operational_score?: number;
  security_score?: number;
  compliance_score?: number;
  overall_risk_score: number;
  assessment_methodology: any;
  risk_factors: any;
  mitigation_recommendations: any;
  assessor_id?: string;
  next_assessment_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface VendorMonitoringFeed {
  id: string;
  vendor_profile_id: string;
  org_id: string;
  feed_source: string;
  feed_type: string;
  monitoring_frequency: string;
  last_check_at?: string;
  current_status: string;
  risk_indicators: any;
  alert_thresholds: any;
  created_at: string;
  updated_at: string;
}

export interface SupplyChainDependency {
  id: string;
  org_id: string;
  primary_vendor_id: string;
  dependent_vendor_id: string;
  dependency_type: string;
  criticality_level: string;
  dependency_description?: string;
  risk_multiplier: number;
  mitigation_strategies: any;
  created_at: string;
  updated_at: string;
}

class EnhancedThirdPartyRiskService {
  // Create vendor assessment method for the form
  async createVendorAssessment(assessmentData: any): Promise<VendorAssessment> {
    const { data, error } = await supabase
      .from('vendor_assessments')
      .insert([assessmentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Enhanced vendor assessment with sophisticated scoring
  async performComprehensiveAssessment(vendorProfileId: string): Promise<VendorAssessment> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Get vendor profile data
    const { data: vendor } = await supabase
      .from('third_party_profiles')
      .select('*')
      .eq('id', vendorProfileId)
      .single();

    if (!vendor) throw new Error('Vendor not found');

    // Calculate comprehensive risk scores
    const financialScore = await this.calculateFinancialScore(vendor);
    const operationalScore = await this.calculateOperationalScore(vendor);
    const securityScore = await this.calculateSecurityScore(vendor);
    const complianceScore = await this.calculateComplianceScore(vendor);
    
    // Calculate overall weighted risk score
    const overallRiskScore = this.calculateOverallRiskScore({
      financial: financialScore,
      operational: operationalScore,
      security: securityScore,
      compliance: complianceScore
    }, vendor.criticality);

    const assessmentData = {
      vendor_profile_id: vendorProfileId,
      org_id: profile.organization_id,
      assessment_type: 'comprehensive',
      assessment_date: new Date().toISOString().split('T')[0],
      financial_score: financialScore,
      operational_score: operationalScore,
      security_score: securityScore,
      compliance_score: complianceScore,
      overall_risk_score: overallRiskScore,
      assessment_methodology: {
        scoring_framework: 'NIST_CSF_ENHANCED',
        weighting_factors: {
          financial: 0.25,
          operational: 0.30,
          security: 0.30,
          compliance: 0.15
        },
        criticality_multiplier: this.getCriticalityMultiplier(vendor.criticality),
        assessment_version: '2.0'
      },
      risk_factors: await this.identifyRiskFactors(vendor),
      mitigation_recommendations: await this.generateMitigationRecommendations(vendor, overallRiskScore),
      assessor_id: profile.id,
      next_assessment_date: this.calculateNextAssessmentDate(vendor.criticality),
      status: 'completed'
    };

    const { data, error } = await supabase
      .from('vendor_assessments')
      .insert([assessmentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Calculate financial score based on multiple factors
  private async calculateFinancialScore(vendor: any): Promise<number> {
    let score = 100; // Start with perfect score

    // Revenue stability (simulated - would integrate with financial data providers)
    const revenueStability = this.simulateFinancialMetric('revenue_stability');
    if (revenueStability < 0.7) score -= 20;
    else if (revenueStability < 0.85) score -= 10;

    // Credit rating (simulated)
    const creditRating = this.simulateFinancialMetric('credit_rating');
    if (creditRating < 0.6) score -= 30;
    else if (creditRating < 0.8) score -= 15;

    // Debt to equity ratio
    const debtToEquity = this.simulateFinancialMetric('debt_to_equity');
    if (debtToEquity > 0.8) score -= 25;
    else if (debtToEquity > 0.5) score -= 10;

    // Market position
    const marketPosition = this.simulateFinancialMetric('market_position');
    if (marketPosition < 0.5) score -= 15;

    // Industry risk
    const industryRisk = this.getIndustryRiskScore(vendor.industry || 'technology');
    score -= industryRisk;

    return Math.max(0, Math.min(100, score));
  }

  // Calculate operational score
  private async calculateOperationalScore(vendor: any): Promise<number> {
    let score = 100;

    // Service availability
    const availability = this.simulateOperationalMetric('availability');
    if (availability < 0.99) score -= 25;
    else if (availability < 0.995) score -= 15;

    // Business continuity planning
    const bcpScore = this.simulateOperationalMetric('bcp_maturity');
    score += (bcpScore - 0.5) * 20; // Adjust based on BCP maturity

    // Geographic risk
    const geoRisk = this.calculateGeographicRisk(vendor.location);
    score -= geoRisk;

    // Operational maturity
    const opMaturity = this.simulateOperationalMetric('operational_maturity');
    score += (opMaturity - 0.5) * 15;

    // Staff turnover risk
    const staffTurnover = this.simulateOperationalMetric('staff_turnover');
    if (staffTurnover > 0.2) score -= 20;
    else if (staffTurnover > 0.15) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  // Calculate security score
  private async calculateSecurityScore(vendor: any): Promise<number> {
    let score = 100;

    // Security certifications
    const certifications = this.simulateSecurityMetric('certifications');
    score += certifications * 10; // Bonus for certifications

    // Incident history
    const incidentHistory = this.simulateSecurityMetric('incident_history');
    score -= incidentHistory * 30; // Penalty for incidents

    // Security maturity
    const securityMaturity = this.simulateSecurityMetric('security_maturity');
    score += (securityMaturity - 0.5) * 25;

    // Data handling practices
    const dataHandling = this.simulateSecurityMetric('data_handling');
    score += (dataHandling - 0.5) * 20;

    // Cyber insurance
    const cyberInsurance = this.simulateSecurityMetric('cyber_insurance');
    if (cyberInsurance < 0.5) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  // Calculate compliance score
  private async calculateComplianceScore(vendor: any): Promise<number> {
    let score = 100;

    // Regulatory compliance
    const regulatoryCompliance = this.simulateComplianceMetric('regulatory');
    score += (regulatoryCompliance - 0.5) * 30;

    // Audit findings
    const auditFindings = this.simulateComplianceMetric('audit_findings');
    score -= auditFindings * 25;

    // Policy adherence
    const policyAdherence = this.simulateComplianceMetric('policy_adherence');
    score += (policyAdherence - 0.5) * 20;

    // Documentation quality
    const docQuality = this.simulateComplianceMetric('documentation');
    score += (docQuality - 0.5) * 15;

    return Math.max(0, Math.min(100, score));
  }

  // Calculate overall weighted risk score
  private calculateOverallRiskScore(scores: any, criticality: string): number {
    const weights = {
      financial: 0.25,
      operational: 0.30,
      security: 0.30,
      compliance: 0.15
    };

    const weightedScore = (
      scores.financial * weights.financial +
      scores.operational * weights.operational +
      scores.security * weights.security +
      scores.compliance * weights.compliance
    );

    // Apply criticality multiplier
    const criticalityMultiplier = this.getCriticalityMultiplier(criticality);
    
    // Convert to risk score (inverse of quality score, adjusted for criticality)
    const riskScore = (100 - weightedScore) * criticalityMultiplier;
    
    return Math.max(1, Math.min(100, riskScore));
  }

  // Helper methods for simulation (in production, these would integrate with real data sources)
  private simulateFinancialMetric(metric: string): number {
    const baseValue = Math.random();
    switch (metric) {
      case 'revenue_stability': return 0.7 + (baseValue * 0.25);
      case 'credit_rating': return 0.6 + (baseValue * 0.35);
      case 'debt_to_equity': return baseValue * 1.2;
      case 'market_position': return 0.4 + (baseValue * 0.5);
      default: return baseValue;
    }
  }

  private simulateOperationalMetric(metric: string): number {
    const baseValue = Math.random();
    switch (metric) {
      case 'availability': return 0.98 + (baseValue * 0.019);
      case 'bcp_maturity': return 0.3 + (baseValue * 0.6);
      case 'operational_maturity': return 0.4 + (baseValue * 0.5);
      case 'staff_turnover': return baseValue * 0.3;
      default: return baseValue;
    }
  }

  private simulateSecurityMetric(metric: string): number {
    return Math.random();
  }

  private simulateComplianceMetric(metric: string): number {
    return Math.random();
  }

  private getCriticalityMultiplier(criticality: string): number {
    switch (criticality) {
      case 'critical': return 1.5;
      case 'high': return 1.25;
      case 'medium': return 1.0;
      case 'low': return 0.8;
      default: return 1.0;
    }
  }

  private getIndustryRiskScore(industry: string): number {
    const industryRisks: { [key: string]: number } = {
      'technology': 5,
      'financial': 15,
      'healthcare': 20,
      'energy': 25,
      'manufacturing': 10,
      'retail': 8,
      'telecommunications': 12
    };
    return industryRisks[industry] || 10;
  }

  private calculateGeographicRisk(location: string): number {
    // Simplified geographic risk calculation
    const highRiskCountries = ['CN', 'RU', 'IR', 'KP'];
    const mediumRiskCountries = ['IN', 'BR', 'MX', 'ZA'];
    
    if (highRiskCountries.includes(location)) return 25;
    if (mediumRiskCountries.includes(location)) return 15;
    return 5; // Low risk for other countries
  }

  private calculateNextAssessmentDate(criticality: string): string {
    const today = new Date();
    let monthsToAdd = 12; // Default annual assessment

    switch (criticality) {
      case 'critical': monthsToAdd = 6; break;
      case 'high': monthsToAdd = 9; break;
      case 'medium': monthsToAdd = 12; break;
      case 'low': monthsToAdd = 24; break;
    }

    today.setMonth(today.getMonth() + monthsToAdd);
    return today.toISOString().split('T')[0];
  }

  // Identify risk factors
  private async identifyRiskFactors(vendor: any): Promise<any> {
    return {
      financial_risks: [
        { factor: 'Credit Rating', severity: 'medium', description: 'Recent credit rating changes detected' },
        { factor: 'Market Volatility', severity: 'low', description: 'Industry experiencing normal volatility' }
      ],
      operational_risks: [
        { factor: 'Single Point of Failure', severity: 'high', description: 'Limited redundancy in critical systems' },
        { factor: 'Geographic Concentration', severity: 'medium', description: 'Operations concentrated in single region' }
      ],
      security_risks: [
        { factor: 'Data Access', severity: 'medium', description: 'Vendor has access to sensitive customer data' },
        { factor: 'Cybersecurity Maturity', severity: 'low', description: 'Good security controls in place' }
      ],
      compliance_risks: [
        { factor: 'Regulatory Changes', severity: 'medium', description: 'Upcoming regulatory changes may impact vendor' }
      ]
    };
  }

  // Generate mitigation recommendations
  private async generateMitigationRecommendations(vendor: any, riskScore: number): Promise<any> {
    const recommendations = [];

    if (riskScore > 70) {
      recommendations.push({
        priority: 'high',
        category: 'risk_reduction',
        recommendation: 'Consider vendor diversification or enhanced monitoring',
        timeline: '30 days'
      });
    }

    if (riskScore > 50) {
      recommendations.push({
        priority: 'medium',
        category: 'monitoring',
        recommendation: 'Implement continuous monitoring for this vendor',
        timeline: '60 days'
      });
    }

    recommendations.push({
      priority: 'low',
      category: 'documentation',
      recommendation: 'Update vendor contracts with enhanced SLA requirements',
      timeline: '90 days'
    });

    return recommendations;
  }

  // Set up real-time monitoring for vendor
  async setupVendorMonitoring(vendorProfileId: string, feedConfig: Partial<VendorMonitoringFeed>): Promise<VendorMonitoringFeed> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const monitoringData = {
      vendor_profile_id: vendorProfileId,
      org_id: profile.organization_id,
      feed_source: feedConfig.feed_source || 'internal',
      feed_type: feedConfig.feed_type || 'risk_score',
      monitoring_frequency: feedConfig.monitoring_frequency || 'daily',
      current_status: 'active',
      risk_indicators: feedConfig.risk_indicators || {},
      alert_thresholds: feedConfig.alert_thresholds || {
        risk_score_increase: 10,
        financial_alert: 0.2,
        security_incident: true,
        operational_disruption: true
      }
    };

    const { data, error } = await supabase
      .from('vendor_monitoring_feeds')
      .insert([monitoringData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Create supply chain dependency mapping
  async createSupplyChainDependency(dependency: Partial<SupplyChainDependency>): Promise<SupplyChainDependency> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const dependencyData = {
      org_id: profile.organization_id,
      ...dependency
    };

    const { data, error } = await supabase
      .from('supply_chain_dependencies')
      .insert([dependencyData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analyze supply chain risk propagation
  async analyzeSupplyChainRisk(vendorId: string): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    // Get all dependencies for this vendor
    const { data: dependencies } = await supabase
      .from('supply_chain_dependencies')
      .select(`
        *,
        primary_vendor:third_party_profiles!supply_chain_dependencies_primary_vendor_id_fkey(vendor_name, criticality),
        dependent_vendor:third_party_profiles!supply_chain_dependencies_dependent_vendor_id_fkey(vendor_name, criticality)
      `)
      .eq('org_id', profile.organization_id)
      .or(`primary_vendor_id.eq.${vendorId},dependent_vendor_id.eq.${vendorId}`);

    // Calculate cascading risk impact
    const cascadingRisk = dependencies?.reduce((totalRisk, dep) => {
      const baseRisk = this.getCriticalityScore(dep.criticality_level);
      const multiplier = dep.risk_multiplier || 1;
      return totalRisk + (baseRisk * multiplier);
    }, 0) || 0;

    return {
      vendor_id: vendorId,
      direct_dependencies: dependencies?.filter(d => d.primary_vendor_id === vendorId) || [],
      upstream_dependencies: dependencies?.filter(d => d.dependent_vendor_id === vendorId) || [],
      cascading_risk_score: cascadingRisk,
      risk_propagation_paths: this.calculateRiskPropagationPaths(dependencies || []),
      mitigation_strategies: this.generateSupplyChainMitigations(cascadingRisk)
    };
  }

  private getCriticalityScore(criticality: string): number {
    switch (criticality) {
      case 'critical': return 25;
      case 'high': return 15;
      case 'medium': return 10;
      case 'low': return 5;
      default: return 10;
    }
  }

  private calculateRiskPropagationPaths(dependencies: any[]): any[] {
    // Simplified risk propagation calculation
    return dependencies.map(dep => ({
      path: `${dep.primary_vendor?.vendor_name} → ${dep.dependent_vendor?.vendor_name}`,
      risk_amplification: dep.risk_multiplier,
      dependency_type: dep.dependency_type,
      mitigation_priority: this.calculateMitigationPriority(dep)
    }));
  }

  private calculateMitigationPriority(dependency: any): string {
    const riskLevel = dependency.risk_multiplier * this.getCriticalityScore(dependency.criticality_level);
    if (riskLevel > 50) return 'critical';
    if (riskLevel > 30) return 'high';
    if (riskLevel > 15) return 'medium';
    return 'low';
  }

  private generateSupplyChainMitigations(cascadingRisk: number): any[] {
    const mitigations = [];

    if (cascadingRisk > 100) {
      mitigations.push({
        strategy: 'Vendor Diversification',
        priority: 'critical',
        description: 'Reduce dependency concentration by identifying alternative vendors'
      });
    }

    if (cascadingRisk > 50) {
      mitigations.push({
        strategy: 'Enhanced Monitoring',
        priority: 'high',
        description: 'Implement real-time monitoring for critical supply chain dependencies'
      });
    }

    mitigations.push({
      strategy: 'Contingency Planning',
      priority: 'medium',
      description: 'Develop specific contingency plans for supply chain disruptions'
    });

    return mitigations;
  }

  // Get comprehensive vendor risk dashboard data
  async getVendorRiskDashboard(): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    // Get latest assessments for all vendors
    const { data: assessments } = await supabase
      .from('vendor_assessments')
      .select(`
        *,
        vendor:third_party_profiles(vendor_name, criticality, status)
      `)
      .eq('org_id', profile.organization_id)
      .order('assessment_date', { ascending: false });

    // Get active monitoring feeds
    const { data: monitoringFeeds } = await supabase
      .from('vendor_monitoring_feeds')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('current_status', 'active');

    // Calculate risk metrics
    const riskMetrics = this.calculateRiskMetrics(assessments || []);

    return {
      total_vendors: assessments?.length || 0,
      high_risk_vendors: assessments?.filter(a => a.overall_risk_score > 70).length || 0,
      critical_vendors: assessments?.filter(a => a.vendor?.criticality === 'critical').length || 0,
      active_monitoring: monitoringFeeds?.length || 0,
      risk_distribution: riskMetrics.riskDistribution,
      trending_risks: riskMetrics.trendingRisks,
      recent_assessments: assessments?.slice(0, 10) || [],
      supply_chain_exposure: await this.calculateSupplyChainExposure()
    };
  }

  private calculateRiskMetrics(assessments: any[]) {
    const lowCount = assessments.filter(a => a.overall_risk_score <= 30).length;
    const mediumCount = assessments.filter(a => a.overall_risk_score > 30 && a.overall_risk_score <= 70).length;
    const highCount = assessments.filter(a => a.overall_risk_score > 70).length;
    const total = assessments.length;

    const riskDistribution = [
      { 
        level: 'low', 
        count: lowCount, 
        percentage: total > 0 ? (lowCount / total) * 100 : 0 
      },
      { 
        level: 'medium', 
        count: mediumCount, 
        percentage: total > 0 ? (mediumCount / total) * 100 : 0 
      },
      { 
        level: 'high', 
        count: highCount, 
        percentage: total > 0 ? (highCount / total) * 100 : 0 
      }
    ];

    const trendingRisks = [
      { risk_type: 'Financial', trend: 'increasing', impact: 'medium' },
      { risk_type: 'Cybersecurity', trend: 'stable', impact: 'high' },
      { risk_type: 'Operational', trend: 'decreasing', impact: 'low' }
    ];

    return { riskDistribution, trendingRisks };
  }

  private async calculateSupplyChainExposure(): Promise<number> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return 0;

    const { data: dependencies } = await supabase
      .from('supply_chain_dependencies')
      .select('risk_multiplier, criticality_level')
      .eq('org_id', profile.organization_id);

    return dependencies?.reduce((total, dep) => {
      return total + (dep.risk_multiplier * this.getCriticalityScore(dep.criticality_level));
    }, 0) || 0;
  }
}

export const enhancedThirdPartyRiskService = new EnhancedThirdPartyRiskService();
