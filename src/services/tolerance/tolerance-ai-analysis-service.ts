import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { ProportionalityService } from "./proportionality-service";
import { logger } from "@/lib/logger";

export interface ToleranceBreachAnalysis {
  breachId: string;
  severityAssessment: 'low' | 'medium' | 'high' | 'critical';
  impactAssessment: {
    currentImpact: string;
    estimatedDuration: number;
    affectedSystems: string[];
    customerImpact: string;
  };
  escalationRecommendation: {
    required: boolean;
    level: number;
    timeline: 'immediate' | 'within_1_hour' | 'within_4_hours' | 'next_business_day';
    reason: string;
  };
  recoveryRecommendations: string[];
  osfiPrinciplesCited: string[];
  boardEscalationRequired: boolean;
  nextActions: string[];
  riskMitigation: string[];
  proportionalityNotes: string;
}

export interface BreachPrediction {
  likelihood: 'low' | 'medium' | 'high';
  timeframe: string;
  triggerFactors: string[];
  preventiveActions: string[];
}

/**
 * OSFI E-21 Tolerance Breach AI Analysis Service
 * Provides intelligent analysis of tolerance breaches with regulatory compliance
 */
export class ToleranceAIAnalysisService {
  
  /**
   * Perform comprehensive AI analysis of a tolerance breach
   */
  static async analyzeToleranceBreach(
    breachId: string,
    operationName: string,
    breachType: 'rto' | 'rpo' | 'service_level' | 'multiple',
    actualValue: number,
    thresholdValue: number,
    variance: number,
    currentStatus: string
  ): Promise<ToleranceBreachAnalysis> {
    try {
      const profile = await getCurrentUserProfile();
      const config = await ProportionalityService.getOrganizationalConfig();
      
      if (!profile?.organization_id || !config) {
        throw new Error('Unable to load organizational context');
      }

      // Calculate proportional severity assessment
      const severityAssessment = ProportionalityService.calculateBreachSeverity(variance, config);
      
      // Get proportional thresholds for context
      const proportionalThresholds = ProportionalityService.getProportionalThresholds(config);
      
      // Generate impact assessment based on breach type and severity
      const impactAssessment = this.generateImpactAssessment(
        operationName,
        breachType,
        severityAssessment,
        actualValue,
        thresholdValue,
        config
      );

      // Generate escalation recommendation
      const escalationRecommendation = this.generateEscalationRecommendation(
        severityAssessment,
        impactAssessment.estimatedDuration,
        config
      );

      // Generate recovery recommendations
      const recoveryRecommendations = this.generateRecoveryRecommendations(
        breachType,
        severityAssessment,
        operationName
      );

      // Determine OSFI principles
      const osfiPrinciplesCited = this.getRelevantOSFIPrinciples(severityAssessment, breachType);

      // Determine board escalation requirement
      const boardEscalationRequired = this.requiresBoardEscalation(
        severityAssessment,
        impactAssessment.estimatedDuration,
        config
      );

      // Generate next actions
      const nextActions = this.generateNextActions(
        severityAssessment,
        breachType,
        escalationRecommendation.required,
        boardEscalationRequired
      );

      // Generate risk mitigation steps
      const riskMitigation = this.generateRiskMitigation(breachType, operationName, config);

      // Generate proportionality notes
      const proportionalityNotes = this.generateProportionalityNotes(config, proportionalThresholds);

      const analysis: ToleranceBreachAnalysis = {
        breachId,
        severityAssessment,
        impactAssessment,
        escalationRecommendation,
        recoveryRecommendations,
        osfiPrinciplesCited,
        boardEscalationRequired,
        nextActions,
        riskMitigation,
        proportionalityNotes
      };

      // Log analysis for audit trail
      await this.logAnalysis(breachId, analysis);

      return analysis;
    } catch (error) {
      logger.error('Error analyzing tolerance breach', {
        component: 'ToleranceAIAnalysisService',
        module: 'tolerance-monitoring',
        metadata: { breachId, operationName }
      }, error);
      
      // Return fallback analysis
      return this.getFallbackAnalysis(breachId, operationName, variance);
    }
  }

  /**
   * Generate escalation recommendations based on breach analysis
   */
  static generateEscalationRecommendations(
    breachAnalysis: ToleranceBreachAnalysis,
    organizationalContext: any
  ): string[] {
    const recommendations = [];

    if (breachAnalysis.boardEscalationRequired) {
      recommendations.push(
        `🔴 **Board Escalation Required** - Per OSFI E-21 Principle 1, this ${breachAnalysis.severityAssessment} breach requires immediate board notification`
      );
    }

    if (breachAnalysis.escalationRecommendation.required) {
      recommendations.push(
        `⬆️ **Escalate to Level ${breachAnalysis.escalationRecommendation.level}** - Timeline: ${breachAnalysis.escalationRecommendation.timeline.replace('_', ' ')}`
      );
    }

    recommendations.push(
      `📋 **OSFI Compliance** - This breach relates to Principles: ${breachAnalysis.osfiPrinciplesCited.join(', ')}`
    );

    if (breachAnalysis.riskMitigation.length > 0) {
      recommendations.push(
        `🛡️ **Risk Mitigation** - Implement: ${breachAnalysis.riskMitigation.slice(0, 2).join(', ')}`
      );
    }

    return recommendations;
  }

  /**
   * Assess breach impact for escalation decisions
   */
  static async assessBreachImpact(
    breachId: string,
    recoveryTimeActual: number,
    toleranceThreshold: number
  ): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    businessImpact: string;
    customerImpact: string;
    regulatoryImpact: string;
    recommendedActions: string[];
  }> {
    try {
      const config = await ProportionalityService.getOrganizationalConfig();
      if (!config) throw new Error('Configuration not available');

      const variance = ((recoveryTimeActual - toleranceThreshold) / toleranceThreshold) * 100;
      const riskLevel = ProportionalityService.calculateBreachSeverity(variance, config);

      const assessment = {
        riskLevel,
        businessImpact: this.assessBusinessImpact(riskLevel, recoveryTimeActual, config),
        customerImpact: this.assessCustomerImpact(riskLevel, config),
        regulatoryImpact: this.assessRegulatoryImpact(riskLevel, config),
        recommendedActions: this.generateImpactBasedActions(riskLevel, config)
      };

      // Log impact assessment
      await this.logImpactAssessment(breachId, assessment);

      return assessment;
    } catch (error) {
      logger.error('Error assessing breach impact', {
        component: 'ToleranceAIAnalysisService',
        module: 'tolerance-monitoring',
        metadata: { breachId }
      }, error);

      return {
        riskLevel: 'medium',
        businessImpact: 'Impact assessment required',
        customerImpact: 'Customer impact evaluation needed',
        regulatoryImpact: 'Regulatory assessment pending',
        recommendedActions: ['Complete detailed impact analysis', 'Implement immediate containment']
      };
    }
  }

  /**
   * Predict potential future breaches based on historical data
   */
  static async predictPotentialBreaches(
    organizationId: string,
    timeframeDays: number = 30
  ): Promise<BreachPrediction[]> {
    try {
      // Query historical breach patterns
      const { data: historicalBreaches } = await supabase
        .from('appetite_breach_logs')
        .select('*')
        .eq('org_id', organizationId)
        .gte('breach_date', new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)).toISOString())
        .order('breach_date', { ascending: false });

      if (!historicalBreaches || historicalBreaches.length === 0) {
        return [];
      }

      // Analyze patterns and generate predictions
      const predictions = this.analyzeBreachPatterns(historicalBreaches, timeframeDays);
      
      return predictions;
    } catch (error) {
      logger.error('Error predicting potential breaches', {
        component: 'ToleranceAIAnalysisService',
        module: 'tolerance-monitoring',
        metadata: { organizationId, timeframeDays }
      }, error);
      return [];
    }
  }

  // Private helper methods

  private static generateImpactAssessment(
    operationName: string,
    breachType: string,
    severity: string,
    actualValue: number,
    thresholdValue: number,
    config: any
  ) {
    const estimatedDuration = this.calculateEstimatedDuration(severity, actualValue, thresholdValue);
    
    return {
      currentImpact: `${operationName} ${breachType.toUpperCase()} breach: ${actualValue} vs threshold ${thresholdValue}`,
      estimatedDuration,
      affectedSystems: this.identifyAffectedSystems(operationName),
      customerImpact: this.assessCustomerImpact(severity, config)
    };
  }

  private static generateEscalationRecommendation(
    severity: string,
    estimatedDuration: number,
    config: any
  ) {
    const thresholds = ProportionalityService.getProportionalThresholds(config);
    
    const required = severity === 'critical' || estimatedDuration > thresholds.breachToleranceMinutes;
    const level = severity === 'critical' ? 3 : severity === 'high' ? 2 : 1;
    
    let timeline: 'immediate' | 'within_1_hour' | 'within_4_hours' | 'next_business_day';
    
    if (severity === 'critical') timeline = 'immediate';
    else if (severity === 'high') timeline = 'within_1_hour';
    else if (severity === 'medium') timeline = 'within_4_hours';
    else timeline = 'next_business_day';

    return {
      required,
      level,
      timeline,
      reason: `${severity.charAt(0).toUpperCase() + severity.slice(1)} breach requiring ${config.escalationTimeline} escalation per organizational size`
    };
  }

  private static generateRecoveryRecommendations(
    breachType: string,
    severity: string,
    operationName: string
  ): string[] {
    const recommendations = [];

    switch (breachType) {
      case 'rto':
        recommendations.push('Activate backup systems immediately');
        recommendations.push('Implement emergency recovery procedures');
        recommendations.push('Establish alternate service channels');
        break;
      case 'rpo':
        recommendations.push('Initiate data recovery from last known good backup');
        recommendations.push('Assess data integrity and completeness');
        recommendations.push('Implement data reconciliation procedures');
        break;
      case 'service_level':
        recommendations.push('Scale up system resources');
        recommendations.push('Implement load balancing');
        recommendations.push('Activate performance monitoring');
        break;
      default:
        recommendations.push('Comprehensive system assessment required');
        recommendations.push('Multi-vector recovery approach needed');
    }

    if (severity === 'critical') {
      recommendations.unshift('Execute crisis management protocols');
      recommendations.push('Prepare public communications');
    }

    return recommendations;
  }

  private static getRelevantOSFIPrinciples(severity: string, breachType: string): string[] {
    const principles = ['7']; // Always include Principle 7 for tolerance breaches

    if (severity === 'critical') {
      principles.push('1', '5'); // Board oversight and crisis management
    }

    if (breachType === 'multiple') {
      principles.push('3', '6'); // Risk management and monitoring
    }

    return principles;
  }

  private static requiresBoardEscalation(
    severity: string,
    estimatedDuration: number,
    config: any
  ): boolean {
    if (severity === 'critical') return true;
    if (config.size === 'enterprise' && severity === 'high') return true;
    if (estimatedDuration > 480) return true; // 8+ hours
    return false;
  }

  private static generateNextActions(
    severity: string,
    breachType: string,
    escalationRequired: boolean,
    boardEscalationRequired: boolean
  ): string[] {
    const actions = [];

    if (boardEscalationRequired) {
      actions.push('Notify board immediately per OSFI E-21 Principle 1');
    }

    if (escalationRequired) {
      actions.push('Escalate to appropriate response team');
    }

    actions.push('Complete root cause analysis per Principle 6');
    actions.push('Update tolerance thresholds if necessary per Principle 7');
    actions.push('Document lessons learned for continuous improvement');

    return actions;
  }

  private static generateRiskMitigation(
    breachType: string,
    operationName: string,
    config: any
  ): string[] {
    const mitigations = [];

    mitigations.push('Implement immediate containment measures');
    mitigations.push('Assess cascade risk to dependent systems');
    mitigations.push('Review and update contingency plans');

    if (config.size === 'enterprise') {
      mitigations.push('Conduct real-time stress testing');
      mitigations.push('Evaluate systemic risk implications');
    }

    return mitigations;
  }

  private static generateProportionalityNotes(config: any, thresholds: any): string {
    return `${ProportionalityService.getOSFIComplianceMessage(config)} Adjusted thresholds: RTO×${thresholds.rtoMultiplier}, RPO×${thresholds.rpoMultiplier}, Escalation delay: ${thresholds.escalationDelayMinutes}min.`;
  }

  private static calculateEstimatedDuration(
    severity: string,
    actualValue: number,
    thresholdValue: number
  ): number {
    const variance = Math.abs(actualValue - thresholdValue) / thresholdValue;
    const baseTime = severity === 'critical' ? 480 : severity === 'high' ? 240 : 120;
    return Math.round(baseTime * (1 + variance));
  }

  private static identifyAffectedSystems(operationName: string): string[] {
    // This would ideally query a dependency mapping service
    return [`${operationName} primary systems`, `${operationName} backup systems`];
  }

  private static assessBusinessImpact(severity: string, duration: number, config: any): string {
    if (severity === 'critical') {
      return `Severe business disruption expected. Revenue impact estimated at high levels for ${config.size} FRFI.`;
    }
    return `Moderate business impact. Duration: ${duration} minutes estimated.`;
  }

  private static assessCustomerImpact(severity: string, config: any): string {
    const customerBase = config.size === 'enterprise' ? 'millions' : config.size === 'large' ? 'hundreds of thousands' : 'thousands';
    return `Potential impact to ${customerBase} of customers. ${severity.charAt(0).toUpperCase() + severity.slice(1)} service degradation.`;
  }

  private static assessRegulatoryImpact(severity: string, config: any): string {
    if (severity === 'critical') {
      return 'OSFI reporting required. Potential regulatory scrutiny. Board notification mandatory.';
    }
    return 'Standard reporting required per OSFI E-21 framework.';
  }

  private static generateImpactBasedActions(severity: string, config: any): string[] {
    const actions = [];
    
    if (severity === 'critical') {
      actions.push('Activate crisis management team');
      actions.push('Prepare regulatory notifications');
      actions.push('Implement customer communication plan');
    }
    
    actions.push('Document incident progression');
    actions.push('Monitor recovery metrics continuously');
    
    return actions;
  }

  private static analyzeBreachPatterns(breaches: any[], timeframeDays: number): BreachPrediction[] {
    // Simple pattern analysis - in production, this would use ML
    const predictions = [];
    
    if (breaches.length >= 3) {
      predictions.push({
        likelihood: 'medium' as const,
        timeframe: `${timeframeDays} days`,
        triggerFactors: ['Historical pattern detected', 'System stress indicators'],
        preventiveActions: ['Enhanced monitoring', 'Proactive maintenance', 'Capacity planning review']
      });
    }
    
    return predictions;
  }

  private static getFallbackAnalysis(breachId: string, operationName: string, variance: number): ToleranceBreachAnalysis {
    return {
      breachId,
      severityAssessment: variance > 100 ? 'critical' : variance > 50 ? 'high' : 'medium',
      impactAssessment: {
        currentImpact: `${operationName} disruption tolerance exceeded`,
        estimatedDuration: 120,
        affectedSystems: [operationName],
        customerImpact: 'Service degradation possible'
      },
      escalationRecommendation: {
        required: true,
        level: 2,
        timeline: 'within_1_hour',
        reason: 'Automated analysis fallback'
      },
      recoveryRecommendations: ['Assess situation', 'Implement recovery procedures'],
      osfiPrinciplesCited: ['7'],
      boardEscalationRequired: variance > 100,
      nextActions: ['Complete assessment', 'Implement remediation'],
      riskMitigation: ['Immediate containment', 'Risk assessment'],
      proportionalityNotes: 'Standard OSFI E-21 compliance requirements apply.'
    };
  }

  private static async logAnalysis(breachId: string, analysis: ToleranceBreachAnalysis): Promise<void> {
    try {
      await supabase
        .from('appetite_breach_logs')
        .update({
          business_impact: `${analysis.impactAssessment.currentImpact} | AI Severity: ${analysis.severityAssessment}`,
          remediation_actions: analysis.recoveryRecommendations.slice(0, 3).join('; ')
        })
        .eq('id', breachId);
    } catch (error) {
      logger.error('Failed to log analysis to breach record', {
        component: 'ToleranceAIAnalysisService',
        metadata: { breachId }
      }, error);
    }
  }

  private static async logImpactAssessment(breachId: string, assessment: any): Promise<void> {
    try {
      await supabase
        .from('appetite_breach_logs')
        .update({
          business_impact: `${assessment.businessImpact} | Customer: ${assessment.customerImpact}`
        })
        .eq('id', breachId);
    } catch (error) {
      logger.error('Failed to log impact assessment', {
        component: 'ToleranceAIAnalysisService',
        metadata: { breachId }
      }, error);
    }
  }
}