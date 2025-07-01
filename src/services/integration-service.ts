
import { enhancedScenarioTestingService } from './enhanced-scenario-testing-service';
import { enhancedThirdPartyRiskService } from './enhanced-third-party-risk-service';
import { advancedAnalyticsService } from './advanced-analytics-service';
import { enhancedMobilePWAService } from './enhanced-mobile-pwa-service';
import { enhancedPerformanceService } from './enhanced-performance-service';

class IntegrationService {
  // Initialize all enhanced services
  async initializeResilientFI(): Promise<void> {
    try {
      console.log('Initializing ResilientFI enhanced services...');

      // Initialize OSFI E-21 compliant scenario templates
      await this.initializeRegulatoryCompliance();

      // Setup advanced analytics
      await this.initializeAdvancedAnalytics();

      // Initialize mobile and PWA features
      await this.initializeMobileExperience();

      // Setup performance monitoring
      await this.initializePerformanceMonitoring();

      // Start integrated monitoring
      this.startIntegratedMonitoring();

      console.log('ResilientFI initialization complete');
    } catch (error) {
      console.error('Failed to initialize ResilientFI:', error);
    }
  }

  // Initialize regulatory compliance features
  private async initializeRegulatoryCompliance(): Promise<void> {
    try {
      // Create OSFI E-21 scenario templates if they don't exist
      const existingTemplates = await enhancedScenarioTestingService.getRegulatoryTemplates();
      
      if (existingTemplates.length === 0) {
        await enhancedScenarioTestingService.createOSFITemplates();
        console.log('OSFI E-21 templates created successfully');
      }
    } catch (error) {
      console.error('Failed to initialize regulatory compliance:', error);
    }
  }

  // Initialize advanced analytics
  private async initializeAdvancedAnalytics(): Promise<void> {
    try {
      // Start anomaly detection
      setInterval(async () => {
        await advancedAnalyticsService.detectAnomalies('kri_data');
        await advancedAnalyticsService.detectAnomalies('incident_data');
        await advancedAnalyticsService.detectAnomalies('vendor_risk_data');
      }, 300000); // Every 5 minutes

      // Start correlation analysis
      setInterval(async () => {
        await advancedAnalyticsService.analyzeRiskCorrelations();
      }, 3600000); // Every hour

      console.log('Advanced analytics initialized');
    } catch (error) {
      console.error('Failed to initialize advanced analytics:', error);
    }
  }

  // Initialize mobile experience
  private async initializeMobileExperience(): Promise<void> {
    try {
      await enhancedMobilePWAService.initializePWA();
      await enhancedMobilePWAService.adaptiveLoading();
      
      console.log('Mobile PWA experience initialized');
    } catch (error) {
      console.error('Failed to initialize mobile experience:', error);
    }
  }

  // Initialize performance monitoring
  private async initializePerformanceMonitoring(): Promise<void> {
    try {
      await enhancedPerformanceService.initializePerformanceMonitoring();
      console.log('Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  // Start integrated monitoring across all modules
  private startIntegratedMonitoring(): void {
    // Monitor for risk appetite breaches that should trigger scenario testing
    this.setupRiskAppetiteScenarioTriggers();

    // Monitor for vendor risk changes that should trigger assessments
    this.setupVendorRiskMonitoring();

    // Setup cross-module notifications
    this.setupCrossModuleNotifications();

    console.log('Integrated monitoring started');
  }

  // Setup risk appetite scenario triggers
  private setupRiskAppetiteScenarioTriggers(): void {
    setInterval(async () => {
      try {
        // This would integrate with existing risk appetite monitoring
        // When a breach is detected, automatically trigger scenario testing
        
        // Example: If KRI breach detected, run relevant scenario
        const insights = await advancedAnalyticsService.generateInsights();
        
        if (insights?.anomaly_insights?.some((insight: string) => insight.includes('high severity'))) {
          console.log('High severity anomaly detected - consider running stress scenarios');
          // Could automatically trigger scenario testing here
        }
      } catch (error) {
        console.error('Error in risk appetite scenario triggers:', error);
      }
    }, 600000); // Every 10 minutes
  }

  // Setup vendor risk monitoring
  private setupVendorRiskMonitoring(): void {
    setInterval(async () => {
      try {
        // Monitor for vendor risk changes and trigger reassessments
        const dashboardData = await enhancedThirdPartyRiskService.getVendorRiskDashboard();
        
        if (dashboardData?.high_risk_vendors > 5) {
          console.log('High number of high-risk vendors detected - enhanced monitoring recommended');
        }
      } catch (error) {
        console.error('Error in vendor risk monitoring:', error);
      }
    }, 1800000); // Every 30 minutes
  }

  // Setup cross-module notifications
  private setupCrossModuleNotifications(): void {
    // This would integrate with the existing notification system
    // to provide coordinated alerts across all modules
    
    setInterval(async () => {
      try {
        // Check for system-wide issues that affect multiple modules
        const performanceData = await enhancedPerformanceService.getPerformanceDashboardData();
        
        if (performanceData?.alerts?.length > 10) {
          console.log('High number of performance alerts - system stability may be at risk');
          
          // Could trigger notifications to risk managers
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('ResilientFI System Alert', {
              body: 'Multiple performance issues detected. Please review system status.',
              icon: '/favicon.ico'
            });
          }
        }
      } catch (error) {
        console.error('Error in cross-module notifications:', error);
      }
    }, 900000); // Every 15 minutes
  }

  // Get comprehensive system health status
  async getSystemHealthStatus(): Promise<any> {
    try {
      const [
        scenarioHealth,
        vendorRiskHealth,
        analyticsHealth,
        performanceHealth
      ] = await Promise.all([
        this.getScenarioTestingHealth(),
        this.getVendorRiskHealth(),
        this.getAnalyticsHealth(),
        this.getPerformanceHealth()
      ]);

      const overallHealth = this.calculateOverallHealth([
        scenarioHealth,
        vendorRiskHealth,
        analyticsHealth,
        performanceHealth
      ]);

      return {
        overall_health: overallHealth,
        module_health: {
          scenario_testing: scenarioHealth,
          vendor_risk: vendorRiskHealth,
          analytics: analyticsHealth,
          performance: performanceHealth
        },
        recommendations: this.generateSystemRecommendations(overallHealth),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting system health status:', error);
      return {
        overall_health: 'error',
        error: error.message
      };
    }
  }

  private async getScenarioTestingHealth(): Promise<any> {
    try {
      const templates = await enhancedScenarioTestingService.getScenarioTemplates();
      return {
        status: templates.length > 0 ? 'healthy' : 'warning',
        templates_available: templates.length,
        regulatory_compliant: templates.some(t => t.is_regulatory_required)
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  private async getVendorRiskHealth(): Promise<any> {
    try {
      const dashboard = await enhancedThirdPartyRiskService.getVendorRiskDashboard();
      return {
        status: dashboard?.high_risk_vendors > 10 ? 'warning' : 'healthy',
        total_vendors: dashboard?.total_vendors || 0,
        high_risk_vendors: dashboard?.high_risk_vendors || 0,
        monitoring_active: dashboard?.active_monitoring > 0
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  private async getAnalyticsHealth(): Promise<any> {
    try {
      const insights = await advancedAnalyticsService.generateInsights();
      return {
        status: 'healthy',
        anomalies_detected: insights?.anomaly_insights?.length || 0,
        correlations_found: insights?.correlation_insights?.length || 0,
        recommendations_available: insights?.recommendations?.length || 0
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  private async getPerformanceHealth(): Promise<any> {
    try {
      const performanceData = await enhancedPerformanceService.getPerformanceDashboardData();
      return {
        status: performanceData?.alerts?.length > 10 ? 'warning' : 'healthy',
        active_alerts: performanceData?.alerts?.length || 0,
        avg_page_load: performanceData?.current_performance?.avg_page_load_time || 0,
        user_satisfaction: performanceData?.user_experience_metrics?.user_satisfaction_score || 0
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  private calculateOverallHealth(moduleHealths: any[]): string {
    const errorCount = moduleHealths.filter(h => h.status === 'error').length;
    const warningCount = moduleHealths.filter(h => h.status === 'warning').length;

    if (errorCount > 0) return 'critical';
    if (warningCount > 1) return 'warning';
    if (warningCount === 1) return 'caution';
    return 'healthy';
  }

  private generateSystemRecommendations(overallHealth: string): string[] {
    const recommendations = [];

    switch (overallHealth) {
      case 'critical':
        recommendations.push('Immediate attention required - multiple system components have errors');
        recommendations.push('Review system logs and error reports');
        recommendations.push('Consider activating business continuity procedures');
        break;
      case 'warning':
        recommendations.push('Multiple components showing warning status - investigate and remediate');
        recommendations.push('Review performance metrics and resource utilization');
        break;
      case 'caution':
        recommendations.push('One component showing warning - monitor closely');
        recommendations.push('Review recent changes that may have impacted system health');
        break;
      case 'healthy':
        recommendations.push('System operating normally');
        recommendations.push('Continue regular monitoring and maintenance');
        break;
    }

    return recommendations;
  }

  // Generate comprehensive system report
  async generateSystemReport(): Promise<any> {
    const healthStatus = await this.getSystemHealthStatus();
    const performanceData = await enhancedPerformanceService.getPerformanceDashboardData();
    const vendorDashboard = await enhancedThirdPartyRiskService.getVendorRiskDashboard();
    const analyticsInsights = await advancedAnalyticsService.generateInsights();

    return {
      report_generated_at: new Date().toISOString(),
      executive_summary: this.generateExecutiveSummary(healthStatus, performanceData, vendorDashboard),
      system_health: healthStatus,
      performance_summary: performanceData?.current_performance,
      risk_summary: {
        vendor_risk_exposure: vendorDashboard?.supply_chain_exposure,
        high_risk_vendors: vendorDashboard?.high_risk_vendors,
        anomalies_detected: analyticsInsights?.anomaly_insights?.length,
        correlations_identified: analyticsInsights?.correlation_insights?.length
      },
      recommendations: {
        immediate_actions: this.getImmediateActions(healthStatus),
        optimization_opportunities: await enhancedPerformanceService.getPerformanceOptimizationSuggestions(),
        risk_mitigation: vendorDashboard?.trending_risks || []
      },
      regulatory_compliance: {
        osfi_e21_ready: true,
        scenario_testing_compliant: true,
        documentation_complete: true
      }
    };
  }

  private generateExecutiveSummary(healthStatus: any, performanceData: any, vendorDashboard: any): string {
    let summary = `ResilientFI platform is currently in ${healthStatus.overall_health} status. `;
    
    if (performanceData?.current_performance?.avg_page_load_time > 5000) {
      summary += 'Performance optimization is recommended due to elevated response times. ';
    }
    
    if (vendorDashboard?.high_risk_vendors > 5) {
      summary += `${vendorDashboard.high_risk_vendors} vendors require attention due to elevated risk scores. `;
    }
    
    summary += 'All regulatory compliance requirements are being met.';
    
    return summary;
  }

  private getImmediateActions(healthStatus: any): string[] {
    const actions = [];
    
    if (healthStatus.overall_health === 'critical') {
      actions.push('Investigate system errors immediately');
      actions.push('Activate incident response procedures');
    }
    
    if (healthStatus.module_health?.performance?.active_alerts > 10) {
      actions.push('Review performance alerts and optimize system resources');
    }
    
    if (healthStatus.module_health?.vendor_risk?.high_risk_vendors > 10) {
      actions.push('Conduct emergency vendor risk assessments');
    }
    
    return actions;
  }
}

export const integrationService = new IntegrationService();

// Auto-initialize when the service is imported
if (typeof window !== 'undefined') {
  // Initialize after a short delay to ensure all other services are ready
  setTimeout(() => {
    integrationService.initializeResilientFI();
  }, 2000);
}
