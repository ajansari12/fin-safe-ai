import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { logger } from "@/lib/logger";

export interface ProportionalityConfig {
  size: 'small' | 'medium' | 'large' | 'enterprise';
  employee_count: number;
  thresholdSensitivity: 'relaxed' | 'standard' | 'strict' | 'critical';
  alertFrequency: 'hourly' | 'daily' | 'weekly';
  escalationTimeline: 'immediate' | 'standard' | 'extended';
  monitoringDepth: 'basic' | 'standard' | 'comprehensive' | 'enterprise';
}

export interface ProportionalThresholds {
  rtoMultiplier: number;
  rpoMultiplier: number;
  availabilityBuffer: number;
  breachToleranceMinutes: number;
  criticalThresholdPercentage: number;
  alertSuppressionMinutes: number;
  escalationDelayMinutes: number;
}

/**
 * OSFI E-21 Proportionality Service
 * Implements proportional risk management expectations based on institution size
 * Per OSFI E-21: "Expectations are tailored—simpler for small FRFIs, more robust for large banks"
 */
export class ProportionalityService {
  
  static async getOrganizationalConfig(): Promise<ProportionalityConfig | null> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return null;

      const { data: orgData } = await supabase
        .from('organizational_profiles')
        .select('employee_count, sub_sector, size')
        .eq('organization_id', profile.organization_id)
        .maybeSingle();

      if (!orgData) return null;

      const employeeCount = orgData.employee_count || 100;
      const size = this.determineOrganizationSize(employeeCount);

      return {
        size,
        employee_count: employeeCount,
        thresholdSensitivity: this.getThresholdSensitivity(size),
        alertFrequency: this.getAlertFrequency(size),
        escalationTimeline: this.getEscalationTimeline(size),
        monitoringDepth: this.getMonitoringDepth(size)
      };
    } catch (error) {
      logger.error('Error loading proportionality configuration', {
        component: 'ProportionalityService',
        module: 'tolerance-monitoring'
      }, error);
      return null;
    }
  }

  static determineOrganizationSize(employeeCount: number): 'small' | 'medium' | 'large' | 'enterprise' {
    // OSFI E-21 proportionality tiers
    if (employeeCount < 100) return 'small';      // Small FRFI - simplified requirements
    if (employeeCount < 500) return 'medium';     // Medium FRFI - standard requirements  
    if (employeeCount < 2000) return 'large';     // Large FRFI - enhanced requirements
    return 'enterprise';                          // Systemically important - comprehensive requirements
  }

  static getProportionalThresholds(config: ProportionalityConfig): ProportionalThresholds {
    switch (config.size) {
      case 'small':
        // Small FRFIs - Relaxed thresholds, longer tolerances
        return {
          rtoMultiplier: 1.5,              // 50% more time allowed
          rpoMultiplier: 2.0,              // Double RPO tolerance
          availabilityBuffer: 2.0,         // 2% buffer on availability
          breachToleranceMinutes: 30,      // 30 min before breach declared
          criticalThresholdPercentage: 150, // 50% over threshold = critical
          alertSuppressionMinutes: 60,     // 1 hour between duplicate alerts
          escalationDelayMinutes: 120      // 2 hours before escalation
        };
        
      case 'medium':
        // Medium FRFIs - Standard thresholds
        return {
          rtoMultiplier: 1.2,
          rpoMultiplier: 1.5,
          availabilityBuffer: 1.5,
          breachToleranceMinutes: 20,
          criticalThresholdPercentage: 130,
          alertSuppressionMinutes: 45,
          escalationDelayMinutes: 90
        };
        
      case 'large':
        // Large FRFIs - Strict thresholds
        return {
          rtoMultiplier: 1.0,
          rpoMultiplier: 1.0,
          availabilityBuffer: 1.0,
          breachToleranceMinutes: 10,
          criticalThresholdPercentage: 120,
          alertSuppressionMinutes: 30,
          escalationDelayMinutes: 60
        };
        
      case 'enterprise':
        // Enterprise FRFIs - Critical thresholds, immediate response
        return {
          rtoMultiplier: 0.8,              // Stricter than baseline
          rpoMultiplier: 0.8,
          availabilityBuffer: 0.5,
          breachToleranceMinutes: 5,       // 5 min immediate response
          criticalThresholdPercentage: 110, // 10% over = critical
          alertSuppressionMinutes: 15,     // Frequent alerts
          escalationDelayMinutes: 30       // Rapid escalation
        };
        
      default:
        return this.getProportionalThresholds({ ...config, size: 'medium' });
    }
  }

  static getThresholdSensitivity(size: string): 'relaxed' | 'standard' | 'strict' | 'critical' {
    switch (size) {
      case 'small': return 'relaxed';
      case 'medium': return 'standard';
      case 'large': return 'strict';
      case 'enterprise': return 'critical';
      default: return 'standard';
    }
  }

  static getAlertFrequency(size: string): 'hourly' | 'daily' | 'weekly' {
    switch (size) {
      case 'small': return 'daily';       // Daily summary alerts
      case 'medium': return 'daily';      // Daily alerts with immediate critical
      case 'large': return 'hourly';      // Hourly monitoring updates
      case 'enterprise': return 'hourly'; // Continuous monitoring
      default: return 'daily';
    }
  }

  static getEscalationTimeline(size: string): 'immediate' | 'standard' | 'extended' {
    switch (size) {
      case 'small': return 'extended';     // 2+ hours
      case 'medium': return 'standard';    // 1-2 hours
      case 'large': return 'standard';     // 1 hour
      case 'enterprise': return 'immediate'; // 15-30 minutes
      default: return 'standard';
    }
  }

  static getMonitoringDepth(size: string): 'basic' | 'standard' | 'comprehensive' | 'enterprise' {
    switch (size) {
      case 'small': return 'basic';        // Core operations only
      case 'medium': return 'standard';    // Standard monitoring set
      case 'large': return 'comprehensive';// Full operational monitoring
      case 'enterprise': return 'enterprise'; // Real-time comprehensive + predictive
      default: return 'standard';
    }
  }

  /**
   * Calculate adjusted tolerance values based on proportionality
   */
  static calculateAdjustedTolerances(
    baseTolerances: { rto: number; rpo: number; availability: number },
    config: ProportionalityConfig
  ): { rto: number; rpo: number; availability: number } {
    const thresholds = this.getProportionalThresholds(config);
    
    return {
      rto: Math.round(baseTolerances.rto * thresholds.rtoMultiplier),
      rpo: Math.round(baseTolerances.rpo * thresholds.rpoMultiplier),
      availability: Math.max(
        baseTolerances.availability - thresholds.availabilityBuffer,
        80 // Minimum 80% availability requirement
      )
    };
  }

  /**
   * Determine breach severity based on proportional thresholds
   */
  static calculateBreachSeverity(
    variance: number,
    config: ProportionalityConfig
  ): 'low' | 'medium' | 'high' | 'critical' {
    const thresholds = this.getProportionalThresholds(config);
    const criticalThreshold = thresholds.criticalThresholdPercentage;
    
    if (variance >= criticalThreshold) return 'critical';
    if (variance >= criticalThreshold * 0.8) return 'high';
    if (variance >= criticalThreshold * 0.5) return 'medium';
    return 'low';
  }

  /**
   * Get OSFI E-21 compliance message for organization size
   */
  static getOSFIComplianceMessage(config: ProportionalityConfig): string {
    const sizeLabel = config.size.charAt(0).toUpperCase() + config.size.slice(1);
    
    switch (config.size) {
      case 'small':
        return `Per OSFI E-21 proportionality for Small FRFIs: Simplified operational risk requirements with focus on core banking functions. Tolerance monitoring adapted for ${config.employee_count} employees.`;
        
      case 'medium':
        return `Per OSFI E-21 proportionality for Medium FRFIs: Standard operational risk management with enhanced monitoring for ${config.employee_count} employees.`;
        
      case 'large':
        return `Per OSFI E-21 proportionality for Large FRFIs: Comprehensive operational risk framework with strict tolerance monitoring for ${config.employee_count} employees.`;
        
      case 'enterprise':
        return `Per OSFI E-21 proportionality for Systemically Important FRFIs: Advanced operational resilience with real-time monitoring and immediate escalation for ${config.employee_count} employees.`;
        
      default:
        return `OSFI E-21 operational risk management framework applied with proportional expectations for ${sizeLabel} FRFI.`;
    }
  }

  /**
   * Get regulatory disclaimer for automated analysis
   */
  static getRegulatoryDisclaimer(): string {
    return "This automated analysis is based on OSFI Guideline E-21 requirements. This does not constitute regulatory advice. Consult OSFI or qualified compliance professionals for your institution's specific regulatory obligations.";
  }
}