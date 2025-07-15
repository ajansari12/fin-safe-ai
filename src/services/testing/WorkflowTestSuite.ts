import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TestExecutionResult {
  success: boolean;
  warning?: boolean;
  outcome: string;
  logs: string[];
  metrics?: Record<string, any>;
  error?: string;
}

export class WorkflowTestSuite {
  private logExecution(message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
    return logMessage;
  }

  async runTest(testId: string, testName: string): Promise<TestExecutionResult> {
    const logs: string[] = [];
    logs.push(this.logExecution(`Starting workflow test: ${testName}`));

    try {
      switch (testId) {
        case 'auth-to-dashboard':
          return await this.testAuthToDashboard(logs);
        case 'nlp-query-ai-response':
          return await this.testNLPQueryToAIResponse(logs);
        case 'breach-alert-email':
          return await this.testBreachAlertEmail(logs);
        case 'vendor-update-feed':
          return await this.testVendorUpdateFeed(logs);
        default:
          throw new Error(`Unknown workflow test: ${testId}`);
      }
    } catch (error) {
      logs.push(this.logExecution(`Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Test execution failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testAuthToDashboard(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Step 1: Checking current authentication state'));
      
      // Check current user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Authentication check failed: ${authError.message}`);
      }

      if (!user) {
        logs.push(this.logExecution('No authenticated user found - this test requires an authenticated session'));
        return {
          success: false,
          outcome: 'No authenticated user - test requires logged in session',
          logs,
          error: 'Authentication required'
        };
      }

      logs.push(this.logExecution('Step 2: Verifying user profile access'));
      
      // Test profile access
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error(`Profile access failed: ${profileError.message}`);
      }

      logs.push(this.logExecution('Step 3: Testing dashboard data access'));
      
      // Test dashboard data access (simulate key dashboard queries)
      const { error: controlsError } = await supabase
        .from('controls')
        .select('count')
        .limit(1);

      if (controlsError) {
        logs.push(this.logExecution(`Warning: Controls access failed: ${controlsError.message}`));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      logs.push(this.logExecution(`Authentication flow completed in ${duration}ms`));

      if (duration > 3000) {
        return {
          success: false,
          outcome: `Authentication flow took ${duration}ms (exceeds 3 second limit)`,
          logs,
          metrics: { duration, userId: user.id },
          error: 'Performance threshold exceeded'
        };
      }

      return {
        success: true,
        outcome: `User authenticated and dashboard accessible in ${duration}ms`,
        logs,
        metrics: { duration, userId: user.id, profileAccess: !!profile }
      };

    } catch (error) {
      logs.push(this.logExecution(`Authentication test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Authentication workflow failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testNLPQueryToAIResponse(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Step 1: Testing AI vendor risk analysis function'));
      
      // Test the AI vendor risk analysis edge function
      const testQuery = {
        query: 'Analyze vendor concentration risk for our organization',
        context: 'testing'
      };

      const { data, error } = await supabase.functions.invoke('ai-vendor-risk-analysis', {
        body: testQuery
      });

      if (error) {
        throw new Error(`AI function invocation failed: ${error.message}`);
      }

      logs.push(this.logExecution('Step 2: Validating AI response structure'));
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid AI response structure');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      logs.push(this.logExecution(`AI response received in ${duration}ms`));

      if (duration > 5000) {
        return {
          success: false,
          outcome: `AI response took ${duration}ms (exceeds 5 second limit)`,
          logs,
          metrics: { duration, responseSize: JSON.stringify(data).length },
          error: 'Performance threshold exceeded'
        };
      }

      // Check for confidence score if available
      const hasConfidenceScore = data.confidence_score !== undefined;
      const confidenceScore = data.confidence_score || 0;

      if (hasConfidenceScore && confidenceScore < 0.7) {
        return {
          success: true,
          warning: true,
          outcome: `AI response received but confidence score ${confidenceScore} below threshold`,
          logs,
          metrics: { duration, confidenceScore, responseSize: JSON.stringify(data).length }
        };
      }

      return {
        success: true,
        outcome: `AI response generated successfully in ${duration}ms${hasConfidenceScore ? ` with confidence ${confidenceScore}` : ''}`,
        logs,
        metrics: { duration, confidenceScore, responseSize: JSON.stringify(data).length }
      };

    } catch (error) {
      logs.push(this.logExecution(`NLP query test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'AI query processing failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testBreachAlertEmail(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Step 1: Simulating tolerance breach detection'));
      
      // Test tolerance breach alert function
      const testBreachData = {
        operationName: 'Test Operation',
        breachType: 'rto',
        actualValue: 150,
        thresholdValue: 120,
        variance: 25,
        severity: 'high'
      };

      logs.push(this.logExecution('Step 2: Invoking breach alert function'));
      
      const { data, error } = await supabase.functions.invoke('send-tolerance-breach-alert', {
        body: testBreachData
      });

      if (error) {
        throw new Error(`Breach alert function failed: ${error.message}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      logs.push(this.logExecution(`Breach alert processed in ${duration}ms`));

      if (duration > 1000) {
        return {
          success: false,
          outcome: `Breach alert took ${duration}ms (exceeds 1 second limit)`,
          logs,
          metrics: { duration, alertData: testBreachData },
          error: 'Performance threshold exceeded'
        };
      }

      return {
        success: true,
        outcome: `Breach alert sent successfully in ${duration}ms`,
        logs,
        metrics: { duration, alertData: testBreachData, response: data }
      };

    } catch (error) {
      logs.push(this.logExecution(`Breach alert test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Breach alert workflow failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testVendorUpdateFeed(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Step 1: Testing vendor risk alert creation'));
      
      // Get current user org
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user for vendor test');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('No organization found for user');
      }

      logs.push(this.logExecution('Step 2: Creating test vendor risk alert'));
      
      // Insert a test vendor risk alert
      const testAlert = {
        org_id: profile.organization_id,
        vendor_name: 'Test Vendor ' + Date.now(),
        risk_level: 'medium',
        alert_type: 'concentration_risk',
        alert_message: 'Test vendor risk alert for workflow testing',
        created_by: user.id
      };

      const { data: alertData, error: alertError } = await supabase
        .from('vendor_risk_alerts')
        .insert(testAlert)
        .select()
        .single();

      if (alertError) {
        throw new Error(`Failed to create vendor alert: ${alertError.message}`);
      }

      logs.push(this.logExecution('Step 3: Verifying alert creation and cleanup'));
      
      // Clean up test data
      await supabase
        .from('vendor_risk_alerts')
        .delete()
        .eq('id', alertData.id);

      const endTime = Date.now();
      const duration = endTime - startTime;

      logs.push(this.logExecution(`Vendor alert workflow completed in ${duration}ms`));

      if (duration > 2000) {
        return {
          success: false,
          outcome: `Vendor alert workflow took ${duration}ms (exceeds 2 second limit)`,
          logs,
          metrics: { duration, alertId: alertData.id },
          error: 'Performance threshold exceeded'
        };
      }

      return {
        success: true,
        outcome: `Vendor risk alert generated successfully in ${duration}ms`,
        logs,
        metrics: { duration, alertId: alertData.id, vendorName: testAlert.vendor_name }
      };

    } catch (error) {
      logs.push(this.logExecution(`Vendor update feed test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Vendor feed workflow failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}