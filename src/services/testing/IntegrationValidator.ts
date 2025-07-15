import { supabase } from '@/integrations/supabase/client';
import { TestExecutionResult } from './WorkflowTestSuite';

export class IntegrationValidator {
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
    logs.push(this.logExecution(`Starting integration test: ${testName}`));

    try {
      switch (testId) {
        case 'openai-integration':
          return await this.testOpenAIIntegration(logs);
        case 'supabase-realtime':
          return await this.testSupabaseRealtime(logs);
        case 'resend-email-delivery':
          return await this.testResendEmailDelivery(logs);
        default:
          throw new Error(`Unknown integration test: ${testId}`);
      }
    } catch (error) {
      logs.push(this.logExecution(`Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Integration test execution failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testOpenAIIntegration(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Step 1: Testing OpenAI API connection via edge function'));
      
      // Test OpenAI integration through our edge function
      const testQuery = {
        query: 'Provide a brief assessment of vendor concentration risk management practices.',
        analysisType: 'concentration_risk'
      };

      const { data, error } = await supabase.functions.invoke('ai-vendor-risk-analysis', {
        body: testQuery
      });

      if (error) {
        throw new Error(`OpenAI edge function failed: ${error.message}`);
      }

      logs.push(this.logExecution('Step 2: Validating OpenAI response quality'));
      
      if (!data) {
        throw new Error('No response data from OpenAI function');
      }

      // Validate response structure
      const responseSize = JSON.stringify(data).length;
      const hasAnalysis = data.analysis && typeof data.analysis === 'string';
      const hasRecommendations = data.recommendations && Array.isArray(data.recommendations);
      const hasConfidenceScore = typeof data.confidence_score === 'number';

      logs.push(this.logExecution('Step 3: Checking response completeness'));
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      const metrics = {
        duration,
        responseSize,
        hasAnalysis,
        hasRecommendations,
        hasConfidenceScore,
        confidenceScore: data.confidence_score || 0,
        recommendationCount: data.recommendations?.length || 0
      };

      logs.push(this.logExecution(`OpenAI integration test completed in ${duration}ms`));

      if (duration > 3000) {
        return {
          success: false,
          outcome: `OpenAI response took ${duration}ms (exceeds 3 second limit)`,
          logs,
          metrics,
          error: 'Response time threshold exceeded'
        };
      }

      if (!hasAnalysis) {
        return {
          success: false,
          outcome: 'OpenAI response missing analysis content',
          logs,
          metrics,
          error: 'Invalid response structure'
        };
      }

      if (hasConfidenceScore && data.confidence_score < 0.6) {
        return {
          success: true,
          warning: true,
          outcome: `OpenAI responded but confidence score ${data.confidence_score} is low`,
          logs,
          metrics
        };
      }

      return {
        success: true,
        outcome: `OpenAI integration working correctly - response in ${duration}ms with ${hasConfidenceScore ? `confidence ${data.confidence_score}` : 'valid content'}`,
        logs,
        metrics
      };

    } catch (error) {
      logs.push(this.logExecution(`OpenAI integration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'OpenAI integration failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testSupabaseRealtime(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Step 1: Testing Supabase realtime connection'));
      
      // Test realtime connection by setting up a subscription
      const channel = supabase.channel('test-realtime-' + Date.now());
      
      return new Promise<TestExecutionResult>((resolve) => {
        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            channel.unsubscribe();
            logs.push(this.logExecution('Realtime connection test timed out'));
            resolve({
              success: false,
              outcome: 'Realtime connection timed out after 10 seconds',
              logs,
              error: 'Connection timeout'
            });
          }
        }, 10000);

        logs.push(this.logExecution('Step 2: Establishing realtime channel'));
        
        channel
          .on('presence', { event: 'sync' }, () => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              const endTime = Date.now();
              const duration = endTime - startTime;
              
              logs.push(this.logExecution(`Realtime connection established in ${duration}ms`));
              channel.unsubscribe();
              
              if (duration > 2000) {
                resolve({
                  success: false,
                  outcome: `Realtime connection took ${duration}ms (exceeds 2 second limit)`,
                  logs,
                  metrics: { duration },
                  error: 'Connection time threshold exceeded'
                });
              } else {
                resolve({
                  success: true,
                  outcome: `Realtime connection established successfully in ${duration}ms`,
                  logs,
                  metrics: { duration }
                });
              }
            }
          })
          .subscribe(async (status) => {
            logs.push(this.logExecution(`Realtime subscription status: ${status}`));
            
            if (status === 'SUBSCRIBED') {
              logs.push(this.logExecution('Step 3: Testing presence tracking'));
              
              // Track presence to test the connection
              await channel.track({
                user: 'test-user',
                online_at: new Date().toISOString(),
              });
            }
          });
      });

    } catch (error) {
      logs.push(this.logExecution(`Supabase realtime test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Supabase realtime test failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testResendEmailDelivery(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Step 1: Testing email delivery through edge function'));
      
      // Test email delivery through tolerance breach alert function
      const testEmailData = {
        operationName: 'Test Email Operation',
        breachType: 'rto',
        actualValue: 150,
        thresholdValue: 120,
        variance: 25,
        severity: 'medium',
        testMode: true // Flag to indicate this is a test
      };

      logs.push(this.logExecution('Step 2: Invoking email delivery function'));
      
      const { data, error } = await supabase.functions.invoke('send-tolerance-breach-alert', {
        body: testEmailData
      });

      if (error) {
        // Check if it's a configuration error vs delivery error
        if (error.message?.includes('RESEND_API_KEY')) {
          logs.push(this.logExecution('Resend API key not configured - this is expected in development'));
          return {
            success: true,
            warning: true,
            outcome: 'Email service not configured (expected in development environment)',
            logs,
            metrics: { configurationRequired: true }
          };
        }
        throw new Error(`Email delivery function failed: ${error.message}`);
      }

      logs.push(this.logExecution('Step 3: Validating email delivery response'));
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      const metrics = {
        duration,
        responseData: data,
        emailServiceConfigured: true
      };

      logs.push(this.logExecution(`Email delivery test completed in ${duration}ms`));

      if (duration > 5000) {
        return {
          success: false,
          outcome: `Email delivery took ${duration}ms (exceeds 5 second limit)`,
          logs,
          metrics,
          error: 'Delivery time threshold exceeded'
        };
      }

      return {
        success: true,
        outcome: `Email delivery service working correctly - processed in ${duration}ms`,
        logs,
        metrics
      };

    } catch (error) {
      logs.push(this.logExecution(`Email delivery test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      
      // Check if it's a configuration issue
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('RESEND_API_KEY') || errorMessage.includes('not configured')) {
        return {
          success: true,
          warning: true,
          outcome: 'Email service not configured (expected in development)',
          logs,
          metrics: { configurationRequired: true }
        };
      }

      return {
        success: false,
        outcome: 'Email delivery test failed',
        logs,
        error: errorMessage
      };
    }
  }
}