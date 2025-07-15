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

  // Performance thresholds for different operations
  private readonly performanceThresholds = {
    database: {
      queryResponse: 2000,        // Max 2s for database queries
      bulkOperation: 10000,       // Max 10s for bulk operations
      complexJoin: 5000,          // Max 5s for complex joins
      indexedQuery: 500,          // Max 500ms for indexed queries
    },
    ai: {
      simpleQuery: 5000,          // Max 5s for simple AI queries
      complexAnalysis: 15000,     // Max 15s for complex analysis
      rateLimit: 100,             // Min 100ms between requests
      batchProcessing: 30000,     // Max 30s for batch processing
    },
    integration: {
      apiCall: 3000,              // Max 3s for external API calls
      webhook: 2000,              // Max 2s for webhook responses
      fileUpload: 10000,          // Max 10s for file uploads
      emailDelivery: 5000,        // Max 5s for email delivery
    },
    realtime: {
      subscriptionSetup: 1000,    // Max 1s for realtime subscription
      messageDelivery: 100,       // Max 100ms for message delivery
      presenceUpdate: 500,        // Max 500ms for presence updates
    }
  };

  async runTest(testId: string, testName: string): Promise<TestExecutionResult> {
    const logs: string[] = [];
    logs.push(this.logExecution(`Starting performance test: ${testName}`));

    try {
      switch (testId) {
        case 'response-time-benchmark':
          return await this.testResponseTimeBenchmark(logs);
        case 'openai-cost-control':
          return await this.testOpenAICostControl(logs);
        case 'database-performance-suite':
          return await this.testDatabasePerformanceSuite(logs);
        case 'concurrent-user-load':
          return await this.testConcurrentUserLoad(logs);
        case 'memory-usage-analysis':
          return await this.testMemoryUsageAnalysis(logs);
        case 'scalability-validation':
          return await this.testScalabilityValidation(logs);
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

  private async testDatabasePerformanceSuite(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Testing database performance across critical operations'));
      
      const performanceTests = [
        {
          name: 'Indexed Query Performance',
          test: async () => {
            const start = Date.now();
            const { data, error } = await supabase
              .from('profiles')
              .select('id, organization_id, created_at')
              .eq('is_active', true)
              .limit(10);
            return { duration: Date.now() - start, success: !error, recordCount: data?.length || 0 };
          },
          threshold: this.performanceThresholds.database.indexedQuery
        },
        {
          name: 'Complex Join Performance',
          test: async () => {
            const start = Date.now();
            const { data, error } = await supabase
              .from('kri_logs')
              .select(`
                id,
                kri_name,
                actual_value,
                profiles!inner(organization_id)
              `)
              .limit(25);
            return { duration: Date.now() - start, success: !error, recordCount: data?.length || 0 };
          },
          threshold: this.performanceThresholds.database.complexJoin
        },
        {
          name: 'Bulk Data Retrieval',
          test: async () => {
            const start = Date.now();
            const { data, error } = await supabase
              .from('controls')
              .select('id, control_name, control_type, status')
              .limit(100);
            return { duration: Date.now() - start, success: !error, recordCount: data?.length || 0 };
          },
          threshold: this.performanceThresholds.database.bulkOperation
        },
        {
          name: 'Aggregation Query Performance',
          test: async () => {
            const start = Date.now();
            const { data, error } = await supabase
              .from('kri_logs')
              .select('kri_name')
              .limit(50);
            return { duration: Date.now() - start, success: !error, recordCount: data?.length || 0 };
          },
          threshold: this.performanceThresholds.database.queryResponse
        }
      ];

      const results: Array<{
        testName: string;
        duration: number;
        success: boolean;
        recordCount: number;
        threshold: number;
        passed: boolean;
      }> = [];

      logs.push(this.logExecution('Step 2: Executing database performance tests'));

      for (const perfTest of performanceTests) {
        try {
          const result = await perfTest.test();
          const passed = result.success && result.duration <= perfTest.threshold;
          
          logs.push(this.logExecution(`${perfTest.name}: ${result.duration}ms (${passed ? 'PASS' : 'FAIL'})`));
          
          results.push({
            testName: perfTest.name,
            duration: result.duration,
            success: result.success,
            recordCount: result.recordCount,
            threshold: perfTest.threshold,
            passed
          });
        } catch (error) {
          logs.push(this.logExecution(`${perfTest.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
          results.push({
            testName: perfTest.name,
            duration: perfTest.threshold + 1000,
            success: false,
            recordCount: 0,
            threshold: perfTest.threshold,
            passed: false
          });
        }
      }

      logs.push(this.logExecution('Step 3: Analyzing database performance results'));

      const passedTests = results.filter(r => r.passed).length;
      const totalTests = results.length;
      const passRate = (passedTests / totalTests) * 100;
      
      const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      const slowestTest = results.reduce((max, r) => r.duration > max.duration ? r : max);

      const metrics = {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        passRate,
        averageDuration,
        slowestTest: slowestTest.testName,
        slowestDuration: slowestTest.duration,
        results
      };

      logs.push(this.logExecution(`Database performance suite: ${passedTests}/${totalTests} tests passed (${passRate.toFixed(1)}%)`));

      if (passRate < 80) {
        return {
          success: false,
          outcome: `Database performance below threshold - only ${passRate.toFixed(1)}% of tests passed (requires 80%)`,
          logs,
          metrics,
          error: 'Performance threshold not met'
        };
      }

      if (passRate < 100) {
        return {
          success: true,
          warning: true,
          outcome: `Database performance acceptable but not optimal - ${passRate.toFixed(1)}% pass rate`,
          logs,
          metrics
        };
      }

      return {
        success: true,
        outcome: `Database performance excellent - all tests passed with average ${averageDuration.toFixed(0)}ms`,
        logs,
        metrics
      };

    } catch (error) {
      logs.push(this.logExecution(`Database performance suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Database performance suite failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testConcurrentUserLoad(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Simulating concurrent user load scenarios'));
      
      const concurrentUsers = 5; // Simulate 5 concurrent users
      const operationsPerUser = 3;
      
      const userSimulations = Array.from({ length: concurrentUsers }, (_, index) => ({
        userId: `test_user_${index + 1}`,
        operations: [
          async () => {
            const start = Date.now();
            const { data, error } = await supabase.from('controls').select('*').limit(10);
            return { operation: 'Load Controls', duration: Date.now() - start, success: !error };
          },
          async () => {
            const start = Date.now();
            const { data, error } = await supabase.from('kri_logs').select('*').limit(10);
            return { operation: 'Load KRI Logs', duration: Date.now() - start, success: !error };
          },
          async () => {
            const start = Date.now();
            const { data, error } = await supabase.functions.invoke('ai-vendor-risk-analysis', {
              body: { query: 'Quick risk assessment', analysisType: 'general' }
            });
            return { operation: 'AI Analysis', duration: Date.now() - start, success: !error };
          }
        ]
      }));

      logs.push(this.logExecution(`Step 2: Executing ${concurrentUsers} concurrent user simulations`));

      const allOperations = userSimulations.flatMap((user, userIndex) => 
        user.operations.map((operation, opIndex) => ({
          userId: user.userId,
          operationIndex: opIndex,
          execute: operation
        }))
      );

      // Execute all operations concurrently
      const startTime = Date.now();
      const results = await Promise.allSettled(
        allOperations.map(async (op) => {
          try {
            const result = await op.execute();
            return {
              userId: op.userId,
              operationIndex: op.operationIndex,
              ...result
            };
          } catch (error) {
            return {
              userId: op.userId,
              operationIndex: op.operationIndex,
              operation: 'Unknown',
              duration: 0,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      const totalTime = Date.now() - startTime;

      logs.push(this.logExecution('Step 3: Analyzing concurrent load performance'));

      const successfulOps = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const totalOps = results.length;
      const successRate = (successfulOps / totalOps) * 100;

      const durations = results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<any>).value.duration);
      
      const averageDuration = durations.length > 0 
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
        : 0;
      
      const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

      const metrics = {
        concurrentUsers,
        totalOperations: totalOps,
        successfulOperations: successfulOps,
        successRate,
        totalExecutionTime: totalTime,
        averageOperationDuration: averageDuration,
        maxOperationDuration: maxDuration,
        operationsPerSecond: totalOps / (totalTime / 1000),
        results: results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Promise rejected' })
      };

      logs.push(this.logExecution(`Concurrent load test: ${successfulOps}/${totalOps} operations succeeded (${successRate.toFixed(1)}%)`));

      if (successRate < 90) {
        return {
          success: false,
          outcome: `Concurrent load test failed - only ${successRate.toFixed(1)}% success rate (requires 90%)`,
          logs,
          metrics,
          error: 'Concurrent load threshold not met'
        };
      }

      if (averageDuration > 5000) {
        return {
          success: true,
          warning: true,
          outcome: `Concurrent load handled but performance degraded - average ${averageDuration.toFixed(0)}ms`,
          logs,
          metrics
        };
      }

      return {
        success: true,
        outcome: `Concurrent load test passed - ${successRate.toFixed(1)}% success rate, ${averageDuration.toFixed(0)}ms average`,
        logs,
        metrics
      };

    } catch (error) {
      logs.push(this.logExecution(`Concurrent user load test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Concurrent user load test failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testMemoryUsageAnalysis(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Analyzing memory usage patterns'));
      
      // Check if performance.memory is available (Chrome/Edge)
      const memoryAPI = (performance as any).memory;
      
      if (!memoryAPI) {
        logs.push(this.logExecution('Performance.memory API not available - using alternative metrics'));
        return {
          success: true,
          warning: true,
          outcome: 'Memory analysis not available in this browser environment',
          logs,
          metrics: { memoryAPIAvailable: false }
        };
      }

      const initialMemory = {
        usedJSHeapSize: memoryAPI.usedJSHeapSize,
        totalJSHeapSize: memoryAPI.totalJSHeapSize,
        jsHeapSizeLimit: memoryAPI.jsHeapSizeLimit
      };

      logs.push(this.logExecution(`Initial memory: ${(initialMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB used`));

      // Perform memory-intensive operations
      logs.push(this.logExecution('Step 2: Executing memory-intensive operations'));
      
      const memoryTestOperations = [
        {
          name: 'Large Data Query',
          operation: async () => {
            const { data } = await supabase.from('controls').select('*').limit(200);
            return data;
          }
        },
        {
          name: 'Multiple Concurrent Queries',
          operation: async () => {
            const promises = [
              supabase.from('kri_logs').select('*').limit(50),
              supabase.from('controls').select('*').limit(50),
              supabase.from('profiles').select('*').limit(10)
            ];
            return await Promise.all(promises);
          }
        },
        {
          name: 'AI Analysis with Large Context',
          operation: async () => {
            const { data } = await supabase.functions.invoke('ai-vendor-risk-analysis', {
              body: { 
                query: 'Provide detailed analysis of vendor concentration risks across multiple dimensions including geographic, sector, and operational dependencies.',
                analysisType: 'concentration_risk'
              }
            });
            return data;
          }
        }
      ];

      const memorySnapshots: Array<{
        operationName: string;
        beforeMB: number;
        afterMB: number;
        deltaMB: number;
      }> = [];

      for (const test of memoryTestOperations) {
        const beforeMemory = memoryAPI.usedJSHeapSize;
        const beforeMB = beforeMemory / 1024 / 1024;
        
        try {
          await test.operation();
          
          // Force garbage collection if available (development only)
          if ((window as any).gc) {
            (window as any).gc();
          }
          
          const afterMemory = memoryAPI.usedJSHeapSize;
          const afterMB = afterMemory / 1024 / 1024;
          const deltaMB = afterMB - beforeMB;
          
          memorySnapshots.push({
            operationName: test.name,
            beforeMB,
            afterMB,
            deltaMB
          });
          
          logs.push(this.logExecution(`${test.name}: ${deltaMB >= 0 ? '+' : ''}${deltaMB.toFixed(2)}MB`));
        } catch (error) {
          logs.push(this.logExecution(`${test.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }

      logs.push(this.logExecution('Step 3: Analyzing memory usage patterns'));

      const finalMemory = {
        usedJSHeapSize: memoryAPI.usedJSHeapSize,
        totalJSHeapSize: memoryAPI.totalJSHeapSize,
        jsHeapSizeLimit: memoryAPI.jsHeapSizeLimit
      };

      const totalMemoryIncrease = (finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize) / 1024 / 1024;
      const memoryUtilization = (finalMemory.usedJSHeapSize / finalMemory.jsHeapSizeLimit) * 100;
      const largestIncrease = Math.max(...memorySnapshots.map(s => s.deltaMB));

      const metrics = {
        initialMemoryMB: initialMemory.usedJSHeapSize / 1024 / 1024,
        finalMemoryMB: finalMemory.usedJSHeapSize / 1024 / 1024,
        totalIncreaseXMB: totalMemoryIncrease,
        memoryUtilizationPercent: memoryUtilization,
        largestSingleIncreaseMB: largestIncrease,
        memoryLimit: finalMemory.jsHeapSizeLimit / 1024 / 1024,
        snapshots: memorySnapshots
      };

      logs.push(this.logExecution(`Memory analysis: ${totalMemoryIncrease.toFixed(2)}MB increase, ${memoryUtilization.toFixed(1)}% utilization`));

      if (memoryUtilization > 80) {
        return {
          success: false,
          outcome: `High memory utilization detected - ${memoryUtilization.toFixed(1)}% (exceeds 80% threshold)`,
          logs,
          metrics,
          error: 'Memory utilization too high'
        };
      }

      if (totalMemoryIncrease > 50) {
        return {
          success: true,
          warning: true,
          outcome: `Significant memory increase detected - ${totalMemoryIncrease.toFixed(2)}MB (monitor for leaks)`,
          logs,
          metrics
        };
      }

      return {
        success: true,
        outcome: `Memory usage within acceptable limits - ${totalMemoryIncrease.toFixed(2)}MB increase, ${memoryUtilization.toFixed(1)}% utilization`,
        logs,
        metrics
      };

    } catch (error) {
      logs.push(this.logExecution(`Memory usage analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Memory usage analysis failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testScalabilityValidation(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Testing application scalability under increasing load'));
      
      const loadLevels = [
        { name: 'Light Load', concurrent: 2, iterations: 2 },
        { name: 'Medium Load', concurrent: 3, iterations: 3 },
        { name: 'Heavy Load', concurrent: 5, iterations: 3 }
      ];

      const scalabilityResults: Array<{
        loadLevel: string;
        concurrent: number;
        iterations: number;
        averageResponseTime: number;
        successRate: number;
        throughput: number;
        degradationFromPrevious: number;
      }> = [];

      let previousAverageTime = 0;

      logs.push(this.logExecution('Step 2: Executing progressive load testing'));

      for (const level of loadLevels) {
        logs.push(this.logExecution(`Testing ${level.name}: ${level.concurrent} concurrent x ${level.iterations} iterations`));
        
        const operations: Promise<{ duration: number; success: boolean }>[] = [];
        
        // Create concurrent operations
        for (let i = 0; i < level.concurrent; i++) {
          for (let j = 0; j < level.iterations; j++) {
            operations.push(
              (async () => {
                const start = Date.now();
                try {
                  // Mix of different operations to simulate real usage
                  const operationType = (i + j) % 3;
                  let result;
                  
                  switch (operationType) {
                    case 0:
                      result = await supabase.from('controls').select('*').limit(20);
                      break;
                    case 1:
                      result = await supabase.from('kri_logs').select('*').limit(15);
                      break;
                    case 2:
                      result = await supabase.functions.invoke('ai-vendor-risk-analysis', {
                        body: { query: 'Brief risk assessment', analysisType: 'general' }
                      });
                      break;
                  }
                  
                  return {
                    duration: Date.now() - start,
                    success: !result.error
                  };
                } catch (error) {
                  return {
                    duration: Date.now() - start,
                    success: false
                  };
                }
              })()
            );
          }
        }

        const startTime = Date.now();
        const results = await Promise.allSettled(operations);
        const totalTime = Date.now() - startTime;

        const successfulOps = results.filter(r => 
          r.status === 'fulfilled' && r.value.success
        ).length;
        
        const successRate = (successfulOps / results.length) * 100;
        
        const durations = results
          .filter(r => r.status === 'fulfilled')
          .map(r => (r as PromiseFulfilledResult<any>).value.duration);
        
        const averageResponseTime = durations.length > 0 
          ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
          : 0;
        
        const throughput = results.length / (totalTime / 1000); // Operations per second
        
        const degradationFromPrevious = previousAverageTime > 0 
          ? ((averageResponseTime - previousAverageTime) / previousAverageTime) * 100 
          : 0;

        scalabilityResults.push({
          loadLevel: level.name,
          concurrent: level.concurrent,
          iterations: level.iterations,
          averageResponseTime,
          successRate,
          throughput,
          degradationFromPrevious
        });

        logs.push(this.logExecution(
          `${level.name} results: ${averageResponseTime.toFixed(0)}ms avg, ${successRate.toFixed(1)}% success, ${throughput.toFixed(1)} ops/sec`
        ));

        previousAverageTime = averageResponseTime;

        // Brief pause between load levels
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      logs.push(this.logExecution('Step 3: Analyzing scalability patterns'));

      const maxDegradation = Math.max(...scalabilityResults.slice(1).map(r => r.degradationFromPrevious));
      const minSuccessRate = Math.min(...scalabilityResults.map(r => r.successRate));
      const throughputTrend = scalabilityResults[scalabilityResults.length - 1].throughput / scalabilityResults[0].throughput;

      const metrics = {
        loadLevels: scalabilityResults.length,
        maxPerformanceDegradation: maxDegradation,
        minimumSuccessRate: minSuccessRate,
        throughputRatio: throughputTrend,
        scalabilityScore: Math.max(0, 100 - maxDegradation - (100 - minSuccessRate)),
        results: scalabilityResults
      };

      logs.push(this.logExecution(`Scalability analysis: ${maxDegradation.toFixed(1)}% max degradation, ${minSuccessRate.toFixed(1)}% min success rate`));

      if (minSuccessRate < 85) {
        return {
          success: false,
          outcome: `Scalability test failed - minimum success rate ${minSuccessRate.toFixed(1)}% (requires 85%)`,
          logs,
          metrics,
          error: 'Scalability threshold not met'
        };
      }

      if (maxDegradation > 200) {
        return {
          success: false,
          outcome: `Excessive performance degradation - ${maxDegradation.toFixed(1)}% (exceeds 200% threshold)`,
          logs,
          metrics,
          error: 'Performance degradation too high'
        };
      }

      if (maxDegradation > 100 || minSuccessRate < 95) {
        return {
          success: true,
          warning: true,
          outcome: `Scalability acceptable but shows stress - ${maxDegradation.toFixed(1)}% degradation, ${minSuccessRate.toFixed(1)}% success`,
          logs,
          metrics
        };
      }

      return {
        success: true,
        outcome: `Excellent scalability - ${maxDegradation.toFixed(1)}% max degradation, ${minSuccessRate.toFixed(1)}% min success rate`,
        logs,
        metrics
      };

    } catch (error) {
      logs.push(this.logExecution(`Scalability validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Scalability validation failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}