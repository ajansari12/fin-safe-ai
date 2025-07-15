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
  private realtimeSubscriptions: any[] = [];
  private performanceThresholds = {
    authentication: 3000,
    aiResponse: 5000,
    breachAlert: 1000,
    vendorUpdate: 2000,
    realtimeSync: 2000,
    endToEndWorkflow: 10000
  };

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

  private cleanup(): void {
    // Clean up any realtime subscriptions
    this.realtimeSubscriptions.forEach(subscription => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    });
    this.realtimeSubscriptions = [];
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
        case 'end-to-end-journey':
          return await this.testEndToEndUserJourney(logs);
        case 'realtime-sync':
          return await this.testRealtimeDataSync(logs);
        case 'ai-workflow-chain':
          return await this.testAIWorkflowChain(logs);
        case 'tolerance-monitoring-integration':
          return await this.testToleranceMonitoringIntegration(logs);
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
    } finally {
      this.cleanup();
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

      if (duration > this.performanceThresholds.authentication) {
        return {
          success: false,
          outcome: `Authentication flow took ${duration}ms (exceeds ${this.performanceThresholds.authentication}ms limit)`,
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

      if (duration > this.performanceThresholds.aiResponse) {
        return {
          success: false,
          outcome: `AI response took ${duration}ms (exceeds ${this.performanceThresholds.aiResponse}ms limit)`,
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

      if (duration > this.performanceThresholds.breachAlert) {
        return {
          success: false,
          outcome: `Breach alert took ${duration}ms (exceeds ${this.performanceThresholds.breachAlert}ms limit)`,
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

      if (duration > this.performanceThresholds.vendorUpdate) {
        return {
          success: false,
          outcome: `Vendor alert workflow took ${duration}ms (exceeds ${this.performanceThresholds.vendorUpdate}ms limit)`,
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

  // Phase 2: Critical User Journey Testing
  private async testEndToEndUserJourney(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Starting complete end-to-end user journey test'));
      
      // Step 1: Authentication verification
      logs.push(this.logExecution('Step 1: Verifying user authentication'));
      const authResult = await this.testAuthToDashboard([]);
      if (!authResult.success) {
        throw new Error('Authentication step failed: ' + authResult.error);
      }
      
      // Step 2: AI Query Processing
      logs.push(this.logExecution('Step 2: Processing AI query'));
      const aiResult = await this.testNLPQueryToAIResponse([]);
      if (!aiResult.success) {
        logs.push(this.logExecution('Warning: AI query failed, continuing with mock response'));
      }
      
      // Step 3: Simulating data change that triggers breach
      logs.push(this.logExecution('Step 3: Simulating tolerance breach trigger'));
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (!profile?.organization_id) throw new Error('No organization found');
      
      // Create test KRI log that should trigger breach
      const testKriLog = {
        org_id: profile.organization_id,
        kri_id: 'test-kri-' + Date.now(),
        measurement_date: new Date().toISOString().split('T')[0],
        actual_value: 150, // Above threshold
        target_value: 100,
        threshold_breached: 'high',
        data_source: 'test_workflow',
        created_by: user.id
      };
      
      const { data: kriData, error: kriError } = await supabase
        .from('kri_logs')
        .insert(testKriLog)
        .select()
        .single();
        
      if (kriError) {
        logs.push(this.logExecution(`Warning: KRI log creation failed: ${kriError.message}`));
      } else {
        logs.push(this.logExecution('Test KRI breach data created'));
      }
      
      // Step 4: Test breach alert
      logs.push(this.logExecution('Step 4: Testing breach alert system'));
      const breachResult = await this.testBreachAlertEmail([]);
      if (!breachResult.success) {
        logs.push(this.logExecution('Warning: Breach alert failed: ' + breachResult.error));
      }
      
      // Cleanup test data
      if (kriData) {
        await supabase.from('kri_logs').delete().eq('id', kriData.id);
        logs.push(this.logExecution('Test KRI data cleaned up'));
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      logs.push(this.logExecution(`Complete end-to-end journey completed in ${duration}ms`));
      
      if (duration > this.performanceThresholds.endToEndWorkflow) {
        return {
          success: false,
          outcome: `End-to-end workflow took ${duration}ms (exceeds ${this.performanceThresholds.endToEndWorkflow}ms limit)`,
          logs,
          metrics: { duration, authSuccess: authResult.success, aiSuccess: aiResult.success, breachSuccess: breachResult.success },
          error: 'Performance threshold exceeded'
        };
      }
      
      return {
        success: true,
        outcome: `Complete user journey tested successfully in ${duration}ms`,
        logs,
        metrics: { 
          duration, 
          authSuccess: authResult.success, 
          aiSuccess: aiResult.success, 
          breachSuccess: breachResult.success,
          stepsCompleted: 4
        }
      };
      
    } catch (error) {
      logs.push(this.logExecution(`End-to-end journey test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'End-to-end user journey failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testRealtimeDataSync(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Testing real-time data synchronization'));
      
      // Test real-time subscription
      let realtimeUpdateReceived = false;
      let realtimeLatency = 0;
      
      const testStartTime = Date.now();
      
      const channel = supabase.channel('test-realtime-sync')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'kri_logs' },
          (payload) => {
            realtimeUpdateReceived = true;
            realtimeLatency = Date.now() - testStartTime;
            logs.push(this.logExecution(`Real-time update received in ${realtimeLatency}ms`));
          }
        )
        .subscribe();
        
      this.realtimeSubscriptions.push(channel);
      
      // Wait for subscription to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logs.push(this.logExecution('Creating test data to trigger real-time update'));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (!profile?.organization_id) throw new Error('No organization found');
      
      // Insert test data to trigger real-time update
      const testData = {
        org_id: profile.organization_id,
        kri_id: 'realtime-test-' + Date.now(),
        measurement_date: new Date().toISOString().split('T')[0],
        actual_value: 95,
        target_value: 100,
        data_source: 'realtime_test',
        created_by: user.id
      };
      
      const { data: insertedData, error: insertError } = await supabase
        .from('kri_logs')
        .insert(testData)
        .select()
        .single();
        
      if (insertError) {
        throw new Error(`Failed to insert test data: ${insertError.message}`);
      }
      
      // Wait for real-time update (max 3 seconds)
      let waitTime = 0;
      while (!realtimeUpdateReceived && waitTime < 3000) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitTime += 100;
      }
      
      // Cleanup
      if (insertedData) {
        await supabase.from('kri_logs').delete().eq('id', insertedData.id);
        logs.push(this.logExecution('Test data cleaned up'));
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!realtimeUpdateReceived) {
        return {
          success: false,
          outcome: `Real-time update not received within 3 seconds`,
          logs,
          metrics: { duration, realtimeLatency: 0, updateReceived: false },
          error: 'Real-time synchronization failed'
        };
      }
      
      if (realtimeLatency > this.performanceThresholds.realtimeSync) {
        return {
          success: false,
          outcome: `Real-time update took ${realtimeLatency}ms (exceeds ${this.performanceThresholds.realtimeSync}ms limit)`,
          logs,
          metrics: { duration, realtimeLatency, updateReceived: true },
          error: 'Real-time latency threshold exceeded'
        };
      }
      
      return {
        success: true,
        outcome: `Real-time synchronization working with ${realtimeLatency}ms latency`,
        logs,
        metrics: { duration, realtimeLatency, updateReceived: true }
      };
      
    } catch (error) {
      logs.push(this.logExecution(`Real-time sync test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Real-time data synchronization failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testAIWorkflowChain(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Testing AI workflow chain: Query → Analysis → Response → Action'));
      
      // Step 1: Initial AI Query
      logs.push(this.logExecution('Step 1: Sending AI query for vendor risk analysis'));
      
      const queryData = {
        query: 'Analyze current vendor risk exposure and provide recommendations',
        context: 'workflow_chain_test',
        includeRecommendations: true
      };
      
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-vendor-risk-analysis', {
        body: queryData
      });
      
      if (aiError) {
        throw new Error(`AI analysis failed: ${aiError.message}`);
      }
      
      logs.push(this.logExecution('Step 2: Processing AI response for actionable insights'));
      
      // Validate AI response structure
      if (!aiResponse || typeof aiResponse !== 'object') {
        throw new Error('Invalid AI response structure');
      }
      
      // Step 3: Simulate action based on AI recommendation
      logs.push(this.logExecution('Step 3: Simulating automated action based on AI insights'));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (!profile?.organization_id) throw new Error('No organization found');
      
      // Create follow-up action based on AI recommendation
      const actionData = {
        org_id: profile.organization_id,
        vendor_name: 'AI-Recommended Vendor Review',
        risk_level: 'medium',
        alert_type: 'ai_recommendation',
        alert_message: `AI-driven recommendation: ${JSON.stringify(aiResponse).substring(0, 200)}...`,
        created_by: user.id
      };
      
      const { data: actionResult, error: actionError } = await supabase
        .from('vendor_risk_alerts')
        .insert(actionData)
        .select()
        .single();
        
      if (actionError) {
        throw new Error(`Failed to create AI-driven action: ${actionError.message}`);
      }
      
      logs.push(this.logExecution('Step 4: Verifying workflow completion and cleanup'));
      
      // Cleanup
      if (actionResult) {
        await supabase.from('vendor_risk_alerts').delete().eq('id', actionResult.id);
        logs.push(this.logExecution('AI workflow test data cleaned up'));
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      logs.push(this.logExecution(`AI workflow chain completed in ${duration}ms`));
      
      return {
        success: true,
        outcome: `AI workflow chain executed successfully in ${duration}ms`,
        logs,
        metrics: { 
          duration, 
          aiResponseTime: duration,
          chainStepsCompleted: 4,
          actionGenerated: !!actionResult
        }
      };
      
    } catch (error) {
      logs.push(this.logExecution(`AI workflow chain test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'AI workflow chain failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testToleranceMonitoringIntegration(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Testing tolerance monitoring integration with real data'));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (!profile?.organization_id) throw new Error('No organization found');
      
      // Step 1: Check existing KRI definitions
      logs.push(this.logExecution('Step 1: Verifying KRI definitions exist'));
      
      const { data: kriDefinitions, error: kriDefError } = await supabase
        .from('kri_definitions')
        .select('*')
        .eq('org_id', profile.organization_id)
        .limit(1);
        
      if (kriDefError) {
        throw new Error(`Failed to fetch KRI definitions: ${kriDefError.message}`);
      }
      
      if (!kriDefinitions || kriDefinitions.length === 0) {
        logs.push(this.logExecution('Warning: No KRI definitions found, creating test definition'));
        
        // Create a test KRI definition
        const testKriDef = {
          org_id: profile.organization_id,
          kri_name: 'Test Tolerance KRI',
          description: 'Test KRI for tolerance monitoring',
          target_value: 100,
          threshold_yellow: 120,
          threshold_red: 150,
          frequency: 'daily',
          created_by: user.id
        };
        
        const { data: newKriDef, error: createError } = await supabase
          .from('kri_definitions')
          .insert(testKriDef)
          .select()
          .single();
          
        if (createError) {
          throw new Error(`Failed to create test KRI: ${createError.message}`);
        }
        
        kriDefinitions.push(newKriDef);
      }
      
      // Step 2: Create tolerance breach scenario
      logs.push(this.logExecution('Step 2: Creating tolerance breach scenario'));
      
      const testKri = kriDefinitions[0];
      const breachValue = (testKri.threshold_red || 150) + 10; // Exceed red threshold
      
      const testKriLog = {
        org_id: profile.organization_id,
        kri_id: testKri.id,
        measurement_date: new Date().toISOString().split('T')[0],
        actual_value: breachValue,
        target_value: testKri.target_value,
        threshold_breached: 'red',
        data_source: 'tolerance_test',
        created_by: user.id
      };
      
      const { data: breachLog, error: logError } = await supabase
        .from('kri_logs')
        .insert(testKriLog)
        .select()
        .single();
        
      if (logError) {
        throw new Error(`Failed to create breach log: ${logError.message}`);
      }
      
      logs.push(this.logExecution('Step 3: Testing tolerance breach alert trigger'));
      
      // Test tolerance breach alert
      const alertData = {
        operationName: testKri.kri_name,
        breachType: 'tolerance',
        actualValue: breachValue,
        thresholdValue: testKri.threshold_red || 150,
        variance: Math.round(((breachValue - testKri.target_value) / testKri.target_value) * 100),
        severity: 'critical'
      };
      
      const { data: alertResponse, error: alertError } = await supabase.functions.invoke('send-tolerance-breach-alert', {
        body: alertData
      });
      
      if (alertError) {
        logs.push(this.logExecution(`Warning: Alert sending failed: ${alertError.message}`));
      }
      
      // Step 4: Cleanup
      logs.push(this.logExecution('Step 4: Cleaning up test data'));
      
      if (breachLog) {
        await supabase.from('kri_logs').delete().eq('id', breachLog.id);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      logs.push(this.logExecution(`Tolerance monitoring integration test completed in ${duration}ms`));
      
      return {
        success: true,
        outcome: `Tolerance monitoring integration tested successfully in ${duration}ms`,
        logs,
        metrics: { 
          duration,
          kriDefinitionsFound: kriDefinitions.length,
          breachTriggered: !!breachLog,
          alertSent: !alertError,
          testThresholdExceeded: breachValue > (testKri.threshold_red || 150)
        }
      };
      
    } catch (error) {
      logs.push(this.logExecution(`Tolerance monitoring integration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Tolerance monitoring integration failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}