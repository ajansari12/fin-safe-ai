import { supabase } from '@/integrations/supabase/client';
import { TestExecutionResult } from './WorkflowTestSuite';

export class EdgeFunctionTester {
  private logExecution(message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    if (data) {
      console.log(logMessage, data);
    }
    return logMessage;
  }

  async testAIAssistantIntegration(): Promise<TestExecutionResult> {
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      logs.push(this.logExecution('Testing AI Assistant edge function integration'));

      // Test with real organizational context
      const testQuery = "Analyze current operational risk indicators for OSFI E-21 compliance review";
      
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: testQuery,
          context: 'risk_management',
          user_role: 'analyst'
        }
      });

      if (error) {
        logs.push(this.logExecution('AI Assistant function call failed', error));
        throw error;
      }

      // Validate response contains real AI-generated content
      const validation = this.validateAIResponse(data);
      logs.push(this.logExecution(`AI response validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`, validation));

      if (!validation.isValid) {
        return {
          success: false,
          outcome: 'AI Assistant returning mock or invalid responses',
          logs,
          warning: true,
          metrics: { duration: Date.now() - startTime, validationIssues: validation.issues }
        };
      }

      // Test response time
      const responseTime = Date.now() - startTime;
      if (responseTime > 5000) {
        logs.push(this.logExecution(`WARNING: Response time ${responseTime}ms exceeds 5s threshold`));
      }

      return {
        success: true,
        outcome: `AI Assistant integration validated - response time: ${responseTime}ms`,
        logs,
        metrics: {
          responseTime,
          hasRealContent: validation.hasRealContent,
          hasOSFIContext: validation.hasOSFIContext,
          duration: responseTime
        }
      };

    } catch (error) {
      return {
        success: false,
        outcome: `AI Assistant test failed: ${error}`,
        logs,
        error: error instanceof Error ? error.message : String(error),
        metrics: { duration: Date.now() - startTime }
      };
    }
  }

  async testVendorRiskAnalysis(): Promise<TestExecutionResult> {
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      logs.push(this.logExecution('Testing vendor risk analysis edge function'));

      // Get real vendor data for testing
      const { data: vendors, error: vendorsError } = await supabase
        .from('third_party_profiles')
        .select('*')
        .limit(3);

      if (vendorsError) throw vendorsError;
      if (!vendors || vendors.length === 0) {
        logs.push(this.logExecution('No real vendor data found - creating test data'));
      }

      const testVendor = vendors?.[0] || {
        vendor_name: 'Test Financial Services Inc',
        service_description: 'Payment processing and settlement services',
        criticality: 'high',
        last_assessment_date: new Date().toISOString()
      };

      const { data, error } = await supabase.functions.invoke('ai-vendor-risk-analysis', {
        body: {
          vendor_data: testVendor,
          analysis_type: 'comprehensive',
          compliance_framework: 'OSFI_E21'
        }
      });

      if (error) {
        logs.push(this.logExecution('Vendor risk analysis function failed', error));
        throw error;
      }

      const validation = this.validateVendorAnalysis(data);
      logs.push(this.logExecution(`Vendor analysis validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`, validation));

      return {
        success: validation.isValid,
        outcome: validation.isValid 
          ? `Vendor risk analysis producing real AI insights with ${validation.confidenceScore}% confidence`
          : 'Vendor risk analysis returning mock or insufficient data',
        logs,
        metrics: {
          confidenceScore: validation.confidenceScore,
          hasRiskMetrics: validation.hasRiskMetrics,
          hasOSFICompliance: validation.hasOSFICompliance,
          duration: Date.now() - startTime
        }
      };

    } catch (error) {
      return {
        success: false,
        outcome: `Vendor risk analysis test failed: ${error}`,
        logs,
        error: error instanceof Error ? error.message : String(error),
        metrics: { duration: Date.now() - startTime }
      };
    }
  }

  async testEmailNotificationService(): Promise<TestExecutionResult> {
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      logs.push(this.logExecution('Testing email notification service'));

      const testNotification = {
        to: 'test@example.com',
        subject: 'OSFI E-21 Compliance Alert - Risk Threshold Breach',
        type: 'risk_breach',
        data: {
          riskType: 'operational_risk',
          threshold: 85,
          actualValue: 92,
          urgency: 'high'
        }
      };

      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: testNotification
      });

      if (error) {
        logs.push(this.logExecution('Email notification function failed', error));
        throw error;
      }

      const validation = this.validateEmailResponse(data);
      logs.push(this.logExecution(`Email service validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`, validation));

      // Check if this is a real email service response vs mock
      if (validation.isMockResponse) {
        return {
          success: false,
          outcome: 'Email service returning mock responses - not connected to real email provider',
          logs,
          warning: true,
          metrics: { duration: Date.now() - startTime }
        };
      }

      return {
        success: true,
        outcome: `Email notification service validated - real delivery attempted`,
        logs,
        metrics: {
          hasMessageId: validation.hasMessageId,
          hasDeliveryStatus: validation.hasDeliveryStatus,
          duration: Date.now() - startTime
        }
      };

    } catch (error) {
      return {
        success: false,
        outcome: `Email notification test failed: ${error}`,
        logs,
        error: error instanceof Error ? error.message : String(error),
        metrics: { duration: Date.now() - startTime }
      };
    }
  }

  async testPredictiveAnalytics(): Promise<TestExecutionResult> {
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      logs.push(this.logExecution('Testing enhanced predictive analytics'));

      // Get real KRI data for prediction
      const { data: kriData, error: kriError } = await supabase
        .from('kri_logs')
        .select('*')
        .order('measurement_date', { ascending: false })
        .limit(50);

      if (kriError) throw kriError;

      const { data, error } = await supabase.functions.invoke('enhanced-predictive-analytics', {
        body: {
          analysis_type: 'risk_forecasting',
          data_source: 'kri_metrics',
          forecast_period: '90_days',
          confidence_threshold: 0.75
        }
      });

      if (error) {
        logs.push(this.logExecution('Predictive analytics function failed', error));
        throw error;
      }

      const validation = this.validatePredictiveAnalysis(data);
      logs.push(this.logExecution(`Predictive analysis validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`, validation));

      return {
        success: validation.isValid,
        outcome: validation.isValid 
          ? `Predictive analytics generating real forecasts with ${validation.confidenceLevel}% confidence`
          : 'Predictive analytics returning static or mock predictions',
        logs,
        metrics: {
          confidenceLevel: validation.confidenceLevel,
          hasForecastData: validation.hasForecastData,
          hasRiskScoring: validation.hasRiskScoring,
          duration: Date.now() - startTime,
          dataPointsAnalyzed: kriData?.length || 0
        }
      };

    } catch (error) {
      return {
        success: false,
        outcome: `Predictive analytics test failed: ${error}`,
        logs,
        error: error instanceof Error ? error.message : String(error),
        metrics: { duration: Date.now() - startTime }
      };
    }
  }

  private validateAIResponse(response: any): { isValid: boolean; hasRealContent: boolean; hasOSFIContext: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!response || !response.response) {
      issues.push('No response content received');
      return { isValid: false, hasRealContent: false, hasOSFIContext: false, issues };
    }

    const content = response.response.toLowerCase();
    
    // Check for mock patterns
    const mockPatterns = ['lorem ipsum', 'placeholder', 'sample', 'mock', 'test response'];
    const hasMockContent = mockPatterns.some(pattern => content.includes(pattern));
    
    if (hasMockContent) {
      issues.push('Response contains mock or placeholder content');
    }

    // Check for OSFI E-21 context
    const osfiKeywords = ['osfi', 'e-21', 'operational risk', 'business continuity', 'third party', 'vendor risk'];
    const hasOSFIContext = osfiKeywords.some(keyword => content.includes(keyword));

    if (!hasOSFIContext) {
      issues.push('Response lacks OSFI E-21 regulatory context');
    }

    // Check for substantive content (> 50 characters)
    const hasRealContent = content.length > 50 && !hasMockContent;

    if (!hasRealContent) {
      issues.push('Response content appears to be insufficient or mock data');
    }

    return {
      isValid: issues.length === 0,
      hasRealContent,
      hasOSFIContext,
      issues
    };
  }

  private validateVendorAnalysis(response: any): { isValid: boolean; confidenceScore: number; hasRiskMetrics: boolean; hasOSFICompliance: boolean } {
    if (!response || !response.analysis) {
      return { isValid: false, confidenceScore: 0, hasRiskMetrics: false, hasOSFICompliance: false };
    }

    const analysis = response.analysis;
    
    // Check for confidence score (should not be static 0.75)
    const confidenceScore = analysis.confidence_score || analysis.confidence || 0;
    const hasVariableConfidence = confidenceScore !== 0.75 && confidenceScore > 0;

    // Check for risk metrics
    const hasRiskMetrics = !!(analysis.risk_score || analysis.risk_level || analysis.risk_rating);

    // Check for OSFI E-21 compliance references
    const content = JSON.stringify(analysis).toLowerCase();
    const hasOSFICompliance = content.includes('osfi') || content.includes('e-21') || content.includes('third party');

    return {
      isValid: hasVariableConfidence && hasRiskMetrics,
      confidenceScore: Math.round(confidenceScore * 100),
      hasRiskMetrics,
      hasOSFICompliance
    };
  }

  private validateEmailResponse(response: any): { isValid: boolean; hasMessageId: boolean; hasDeliveryStatus: boolean; isMockResponse: boolean } {
    if (!response) {
      return { isValid: false, hasMessageId: false, hasDeliveryStatus: false, isMockResponse: true };
    }

    // Check for real email service response patterns
    const hasMessageId = !!(response.id || response.message_id || response.messageId);
    const hasDeliveryStatus = !!(response.status || response.delivery_status);
    
    // Check for mock response patterns
    const mockPatterns = ['mock', 'test', 'fake', 'demo'];
    const responseText = JSON.stringify(response).toLowerCase();
    const isMockResponse = mockPatterns.some(pattern => responseText.includes(pattern)) ||
                          response.success === true && !hasMessageId; // Success without real identifiers

    return {
      isValid: hasMessageId || hasDeliveryStatus,
      hasMessageId,
      hasDeliveryStatus,
      isMockResponse
    };
  }

  private validatePredictiveAnalysis(response: any): { isValid: boolean; confidenceLevel: number; hasForecastData: boolean; hasRiskScoring: boolean } {
    if (!response || !response.predictions) {
      return { isValid: false, confidenceLevel: 0, hasForecastData: false, hasRiskScoring: false };
    }

    const predictions = response.predictions;
    
    // Check for forecast data
    const hasForecastData = Array.isArray(predictions.forecast) && predictions.forecast.length > 0;
    
    // Check for risk scoring
    const hasRiskScoring = !!(predictions.risk_score || predictions.risk_level);
    
    // Check confidence level (should be dynamic, not always 75%)
    const confidenceLevel = predictions.confidence_level || predictions.confidence || 0;
    const hasVariableConfidence = confidenceLevel !== 75 && confidenceLevel > 0;

    return {
      isValid: hasForecastData && hasVariableConfidence,
      confidenceLevel,
      hasForecastData,
      hasRiskScoring
    };
  }
}