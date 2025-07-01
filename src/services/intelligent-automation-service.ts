import { supabase } from "@/integrations/supabase/client";

export interface WorkflowPrediction {
  id: string;
  workflow_id: string;
  prediction_type: 'failure_risk' | 'completion_time' | 'resource_usage' | 'bottleneck_detection';
  confidence_score: number;
  predicted_value: any;
  reasoning: string;
  created_at: string;
}

export interface AutomationRule {
  id: string;
  org_id: string;
  rule_name: string;
  trigger_conditions: Record<string, any>;
  actions: Array<{
    type: string;
    configuration: Record<string, any>;
  }>;
  is_active: boolean;
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowOptimization {
  workflow_id: string;
  optimization_type: 'performance' | 'cost' | 'reliability' | 'user_experience';
  current_metrics: Record<string, number>;
  recommended_changes: Array<{
    node_id: string;
    change_type: string;
    description: string;
    impact_score: number;
  }>;
  estimated_improvement: Record<string, number>;
  confidence_score: number;
}

class IntelligentAutomationService {
  // AI-Powered Workflow Analysis
  async analyzeWorkflowPerformance(workflowId: string): Promise<WorkflowOptimization> {
    try {
      // Get workflow execution history
      const { data: executions, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching executions:', error);
        throw error;
      }

      // Analyze execution patterns
      const analysisResult = this.performWorkflowAnalysis(executions || []);
      
      return {
        workflow_id: workflowId,
        optimization_type: 'performance',
        current_metrics: analysisResult.metrics,
        recommended_changes: analysisResult.recommendations,
        estimated_improvement: analysisResult.improvements,
        confidence_score: analysisResult.confidence
      };
    } catch (error) {
      console.error('Error in analyzeWorkflowPerformance:', error);
      throw error;
    }
  }

  private performWorkflowAnalysis(executions: any[]): any {
    if (executions.length === 0) {
      return {
        metrics: { avg_duration: 0, success_rate: 0, error_rate: 0 },
        recommendations: [],
        improvements: {},
        confidence: 0
      };
    }

    // Calculate current metrics
    const completedExecutions = executions.filter(e => e.status === 'completed');
    const failedExecutions = executions.filter(e => e.status === 'failed');
    
    const avgDuration = completedExecutions.length > 0
      ? completedExecutions.reduce((sum, exec) => {
          const start = new Date(exec.started_at);
          const end = new Date(exec.completed_at || exec.updated_at);
          return sum + (end.getTime() - start.getTime());
        }, 0) / completedExecutions.length
      : 0;

    const successRate = executions.length > 0 
      ? (completedExecutions.length / executions.length) * 100 
      : 0;

    const errorRate = executions.length > 0 
      ? (failedExecutions.length / executions.length) * 100 
      : 0;

    // Generate recommendations based on analysis
    const recommendations = [];

    if (errorRate > 10) {
      recommendations.push({
        node_id: 'error-prone-nodes',
        change_type: 'add_retry_logic',
        description: 'Add retry logic to reduce failure rate',
        impact_score: 0.7
      });
    }

    if (avgDuration > 300000) { // 5 minutes
      recommendations.push({
        node_id: 'slow-nodes',
        change_type: 'optimize_performance',
        description: 'Optimize slow-running nodes to improve performance',
        impact_score: 0.8
      });
    }

    return {
      metrics: {
        avg_duration: Math.round(avgDuration / 1000), // Convert to seconds
        success_rate: Math.round(successRate),
        error_rate: Math.round(errorRate)
      },
      recommendations,
      improvements: {
        estimated_duration_reduction: recommendations.length > 0 ? 25 : 0,
        estimated_error_reduction: recommendations.length > 0 ? 15 : 0
      },
      confidence: recommendations.length > 0 ? 0.75 : 0.5
    };
  }

  // Predictive Analytics
  async predictWorkflowOutcome(workflowId: string, inputData: Record<string, any>): Promise<WorkflowPrediction[]> {
    try {
      // Get historical data for the workflow
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false })
        .limit(100);

      const predictions: WorkflowPrediction[] = [];

      if (executions && executions.length > 0) {
        // Predict completion time
        const avgCompletionTime = this.calculateAverageCompletionTime(executions);
        predictions.push({
          id: `pred-${Date.now()}-1`,
          workflow_id: workflowId,
          prediction_type: 'completion_time',
          confidence_score: 0.75,
          predicted_value: avgCompletionTime,
          reasoning: 'Based on historical execution times',
          created_at: new Date().toISOString()
        });

        // Predict failure risk
        const failureRate = this.calculateFailureRate(executions);
        predictions.push({
          id: `pred-${Date.now()}-2`,
          workflow_id: workflowId,
          prediction_type: 'failure_risk',
          confidence_score: 0.65,
          predicted_value: failureRate,
          reasoning: 'Based on historical failure patterns',
          created_at: new Date().toISOString()
        });
      }

      return predictions;
    } catch (error) {
      console.error('Error in predictWorkflowOutcome:', error);
      throw error;
    }
  }

  private calculateAverageCompletionTime(executions: any[]): number {
    const completed = executions.filter(e => e.status === 'completed' && e.completed_at);
    
    if (completed.length === 0) return 300; // Default 5 minutes

    const totalTime = completed.reduce((sum, exec) => {
      const start = new Date(exec.started_at);
      const end = new Date(exec.completed_at);
      return sum + (end.getTime() - start.getTime());
    }, 0);

    return Math.round(totalTime / (completed.length * 1000)); // Return in seconds
  }

  private calculateFailureRate(executions: any[]): number {
    if (executions.length === 0) return 0;
    
    const failed = executions.filter(e => e.status === 'failed');
    return Math.round((failed.length / executions.length) * 100);
  }

  // Automation Rules Management
  async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at' | 'execution_count' | 'last_executed_at'>): Promise<AutomationRule> {
    try {
      const ruleData = {
        ...rule,
        execution_count: 0
      };

      const { data, error } = await supabase
        .from('automation_rules')
        .insert([ruleData])
        .select()
        .single();

      if (error) {
        console.error('Error creating automation rule:', error);
        throw error;
      }

      return {
        ...data,
        trigger_conditions: data.trigger_conditions as Record<string, any>,
        actions: data.actions as AutomationRule['actions']
      };
    } catch (error) {
      console.error('Error in createAutomationRule:', error);
      throw error;
    }
  }

  async getAutomationRules(orgId: string): Promise<AutomationRule[]> {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching automation rules:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        ...item,
        trigger_conditions: item.trigger_conditions as Record<string, any>,
        actions: item.actions as AutomationRule['actions']
      }));
    } catch (error) {
      console.error('Error in getAutomationRules:', error);
      throw error;
    }
  }

  // Smart Workflow Suggestions
  async generateWorkflowSuggestions(orgId: string, context: Record<string, any>): Promise<Array<{
    type: string;
    title: string;
    description: string;
    template: any;
    confidence: number;
  }>> {
    const suggestions = [];

    // Analyze current workflows and suggest improvements
    if (context.module === 'incident_management') {
      suggestions.push({
        type: 'incident_response',
        title: 'Automated Incident Response',
        description: 'Create automated workflows for incident classification and initial response',
        template: this.getIncidentResponseTemplate(),
        confidence: 0.85
      });
    }

    if (context.module === 'governance') {
      suggestions.push({
        type: 'policy_review',
        title: 'Policy Review Automation',
        description: 'Automate policy review reminders and approval workflows',
        template: this.getPolicyReviewTemplate(),
        confidence: 0.78
      });
    }

    return suggestions;
  }

  private getIncidentResponseTemplate(): any {
    return {
      nodes: [
        {
          id: 'start',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Incident Detected', nodeType: 'start' }
        },
        {
          id: 'classify',
          type: 'decision',
          position: { x: 300, y: 100 },
          data: { 
            label: 'Classify Severity', 
            nodeType: 'decision',
            configuration: { condition: '${severity} === "critical"' }
          }
        },
        {
          id: 'notify',
          type: 'notification',
          position: { x: 500, y: 50 },
          data: { 
            label: 'Notify Team', 
            nodeType: 'notification',
            configuration: { recipients: ['incident-team'] }
          }
        },
        {
          id: 'end',
          type: 'end',
          position: { x: 700, y: 100 },
          data: { label: 'Complete', nodeType: 'end' }
        }
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'classify' },
        { id: 'e2', source: 'classify', target: 'notify' },
        { id: 'e3', source: 'notify', target: 'end' }
      ]
    };
  }

  private getPolicyReviewTemplate(): any {
    return {
      nodes: [
        {
          id: 'start',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Review Due', nodeType: 'start' }
        },
        {
          id: 'notify_reviewer',
          type: 'notification',
          position: { x: 300, y: 100 },
          data: { 
            label: 'Notify Reviewer', 
            nodeType: 'notification',
            configuration: { message: 'Policy review required' }
          }
        },
        {
          id: 'approval',
          type: 'approval',
          position: { x: 500, y: 100 },
          data: { 
            label: 'Await Approval', 
            nodeType: 'approval',
            configuration: { approver: 'policy-owner' }
          }
        },
        {
          id: 'end',
          type: 'end',
          position: { x: 700, y: 100 },
          data: { label: 'Complete', nodeType: 'end' }
        }
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'notify_reviewer' },
        { id: 'e2', source: 'notify_reviewer', target: 'approval' },
        { id: 'e3', source: 'approval', target: 'end' }
      ]
    };
  }

  // Real-time Monitoring and Alerts
  async monitorWorkflowHealth(workflowId: string): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: Record<string, number>;
    alerts: Array<{ type: string; message: string; severity: string }>;
  }> {
    try {
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false });

      if (!executions || executions.length === 0) {
        return {
          status: 'healthy',
          metrics: {},
          alerts: []
        };
      }

      const failureRate = this.calculateFailureRate(executions);
      const avgDuration = this.calculateAverageCompletionTime(executions);
      
      const alerts = [];
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';

      if (failureRate > 20) {
        status = 'critical';
        alerts.push({
          type: 'high_failure_rate',
          message: `High failure rate detected: ${failureRate}%`,
          severity: 'critical'
        });
      } else if (failureRate > 10) {
        status = 'warning';
        alerts.push({
          type: 'elevated_failure_rate',
          message: `Elevated failure rate: ${failureRate}%`,
          severity: 'warning'
        });
      }

      if (avgDuration > 600) { // 10 minutes
        status = status === 'critical' ? 'critical' : 'warning';
        alerts.push({
          type: 'slow_execution',
          message: `Slow execution times detected: ${avgDuration}s average`,
          severity: 'warning'
        });
      }

      return {
        status,
        metrics: {
          failure_rate: failureRate,
          avg_duration: avgDuration,
          total_executions: executions.length
        },
        alerts
      };
    } catch (error) {
      console.error('Error monitoring workflow health:', error);
      return {
        status: 'critical',
        metrics: {},
        alerts: [{ type: 'monitoring_error', message: 'Failed to monitor workflow', severity: 'critical' }]
      };
    }
  }
}

export const intelligentAutomationService = new IntelligentAutomationService();
