import { supabase } from '@/integrations/supabase/client';
import { TestExecutionResult } from './WorkflowTestSuite';

export class PerformanceMonitor {
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
    logs.push(this.logExecution(`Starting performance test: ${testName}`));

    try {
      switch (testId) {
        case 'response-time-benchmark':
          return await this.testResponseTimeBenchmark(logs);
        case 'openai-cost-control':
          return await this.testOpenAICostControl(logs);
        default:
          throw new Error(`Unknown performance test: ${testId}`);
      }
    } catch (error) {
      logs.push(this.logExecution(`Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Performance test execution failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testResponseTimeBenchmark(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Running database query performance benchmark'));
      
      const testQueries = [
        { name: 'Controls Dashboard Data', table: 'controls', limit: 50 },
        { name: 'KRI Logs Recent', table: 'kri_logs', limit: 100 },
        { name: 'Vendor Risk Alerts', table: 'vendor_risk_alerts', limit: 25 },
        { name: 'User Profile Access', table: 'profiles', limit: 1 }
      ];

      const queryResults: Array<{
        queryName: string;
        duration: number;
        recordCount: number;
        success: boolean;
      }> = [];

      // Get user org for context
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = user ? await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single() : { data: null };

      logs.push(this.logExecution('Step 2: Executing benchmark queries'));
      
      for (const query of testQueries) {
        const startTime = Date.now();
        try {
          let supabaseQuery = supabase.from(query.table).select('*').limit(query.limit);
          
          // Add org filter where applicable
          if (profile?.organization_id && ['controls', 'kri_logs', 'vendor_risk_alerts'].includes(query.table)) {
            supabaseQuery = supabaseQuery.eq('org_id', profile.organization_id);
          } else if (query.table === 'profiles' && user) {
            supabaseQuery = supabaseQuery.eq('id', user.id);
          }

          const { data, error } = await supabaseQuery;
          const endTime = Date.now();
          const duration = endTime - startTime;

          if (error) {
            logs.push(this.logExecution(`Query ${query.name} failed: ${error.message}`));
            queryResults.push({
              queryName: query.name,
              duration,
              recordCount: 0,
              success: false
            });
          } else {
            logs.push(this.logExecution(`Query ${query.name} completed in ${duration}ms with ${data?.length || 0} records`));
            queryResults.push({
              queryName: query.name,
              duration,
              recordCount: data?.length || 0,
              success: true
            });
          }
        } catch (error) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          logs.push(this.logExecution(`Query ${query.name} exception: ${error instanceof Error ? error.message : 'Unknown error'}`));
          queryResults.push({
            queryName: query.name,
            duration,
            recordCount: 0,
            success: false
          });
        }
      }

      logs.push(this.logExecution('Step 3: Analyzing benchmark results'));
      
      // Calculate performance metrics
      const successfulQueries = queryResults.filter(r => r.success);
      const failedQueries = queryResults.filter(r => !r.success);
      const totalQueries = queryResults.length;
      
      const averageResponseTime = successfulQueries.length > 0 
        ? successfulQueries.reduce((sum, r) => sum + r.duration, 0) / successfulQueries.length 
        : 0;
      
      const maxResponseTime = successfulQueries.length > 0 
        ? Math.max(...successfulQueries.map(r => r.duration)) 
        : 0;
      
      const queriesUnder2s = successfulQueries.filter(r => r.duration < 2000).length;
      const performanceScore = totalQueries > 0 ? (queriesUnder2s / totalQueries) * 100 : 0;

      const metrics = {
        totalQueries,
        successfulQueries: successfulQueries.length,
        failedQueries: failedQueries.length,
        averageResponseTime,
        maxResponseTime,
        performanceScore,
        queryResults
      };

      logs.push(this.logExecution(`Performance benchmark complete: ${performanceScore.toFixed(1)}% of queries under 2s`));

      if (failedQueries.length > totalQueries * 0.2) {
        return {
          success: false,
          outcome: `${failedQueries.length}/${totalQueries} queries failed (exceeds 20% failure threshold)`,
          logs,
          metrics,
          error: 'Too many query failures'
        };
      }

      if (performanceScore < 95) {
        return {
          success: false,
          outcome: `Only ${performanceScore.toFixed(1)}% of queries completed under 2 seconds (requires 95%)`,
          logs,
          metrics,
          error: 'Performance threshold not met'
        };
      }

      if (averageResponseTime > 2000) {
        return {
          success: true,
          warning: true,
          outcome: `Average response time ${averageResponseTime.toFixed(0)}ms exceeds 2 second target`,
          logs,
          metrics
        };
      }

      return {
        success: true,
        outcome: `Performance benchmark passed - ${performanceScore.toFixed(1)}% queries under 2s, average ${averageResponseTime.toFixed(0)}ms`,
        logs,
        metrics
      };

    } catch (error) {
      logs.push(this.logExecution(`Response time benchmark failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Response time benchmark failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testOpenAICostControl(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Testing OpenAI cost control mechanisms'));
      
      // Test multiple rapid AI requests to check rate limiting
      const testRequests = 3;
      const requestResults: Array<{
        requestId: number;
        duration: number;
        success: boolean;
        rateLimited: boolean;
      }> = [];

      logs.push(this.logExecution(`Step 2: Sending ${testRequests} rapid AI requests to test rate limiting`));
      
      const testQuery = {
        query: 'Provide a brief risk assessment summary.',
        analysisType: 'general'
      };

      for (let i = 1; i <= testRequests; i++) {
        const startTime = Date.now();
        try {
          const { data, error } = await supabase.functions.invoke('ai-vendor-risk-analysis', {
            body: testQuery
          });

          const endTime = Date.now();
          const duration = endTime - startTime;
          
          if (error) {
            // Check if it's a rate limiting error
            const isRateLimited = error.message?.includes('rate limit') || 
                                error.message?.includes('too many requests') ||
                                error.message?.includes('quota');
            
            logs.push(this.logExecution(`Request ${i} failed: ${error.message}`));
            requestResults.push({
              requestId: i,
              duration,
              success: false,
              rateLimited: isRateLimited
            });
          } else {
            logs.push(this.logExecution(`Request ${i} succeeded in ${duration}ms`));
            requestResults.push({
              requestId: i,
              duration,
              success: true,
              rateLimited: false
            });
          }
        } catch (error) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          logs.push(this.logExecution(`Request ${i} exception: ${error instanceof Error ? error.message : 'Unknown error'}`));
          requestResults.push({
            requestId: i,
            duration,
            success: false,
            rateLimited: false
          });
        }

        // Small delay between requests
        if (i < testRequests) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      logs.push(this.logExecution('Step 3: Analyzing cost control effectiveness'));
      
      const successfulRequests = requestResults.filter(r => r.success);
      const rateLimitedRequests = requestResults.filter(r => r.rateLimited);
      const averageResponseTime = successfulRequests.length > 0 
        ? successfulRequests.reduce((sum, r) => sum + r.duration, 0) / successfulRequests.length 
        : 0;

      const metrics = {
        totalRequests: testRequests,
        successfulRequests: successfulRequests.length,
        rateLimitedRequests: rateLimitedRequests.length,
        averageResponseTime,
        costControlActive: rateLimitedRequests.length > 0 || successfulRequests.length < testRequests,
        requestResults
      };

      logs.push(this.logExecution(`Cost control analysis: ${successfulRequests.length}/${testRequests} succeeded, ${rateLimitedRequests.length} rate limited`));

      // If all requests succeed rapidly, it might indicate insufficient cost controls
      if (successfulRequests.length === testRequests && averageResponseTime < 1000) {
        return {
          success: true,
          warning: true,
          outcome: `All ${testRequests} requests succeeded rapidly - verify cost controls are properly configured`,
          logs,
          metrics
        };
      }

      // If some requests are rate limited, that's actually good for cost control
      if (rateLimitedRequests.length > 0) {
        return {
          success: true,
          outcome: `Cost controls working - ${rateLimitedRequests.length} requests rate limited out of ${testRequests}`,
          logs,
          metrics
        };
      }

      return {
        success: true,
        outcome: `Cost control test completed - ${successfulRequests.length}/${testRequests} requests processed with average ${averageResponseTime.toFixed(0)}ms response time`,
        logs,
        metrics
      };

    } catch (error) {
      logs.push(this.logExecution(`OpenAI cost control test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'OpenAI cost control test failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}