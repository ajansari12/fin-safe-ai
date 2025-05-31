
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile, getUserOrganization } from "@/lib/supabase-utils";

export interface IncidentSummary {
  totalIncidents: number;
  criticalIncidents: number;
  averageResolutionTime: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  summary: string;
  recommendations: string[];
}

export interface AuditSummary {
  totalFindings: number;
  criticalFindings: number;
  openGaps: number;
  complianceScore: number;
  summary: string;
  priorityActions: string[];
}

export interface KRIRecommendation {
  name: string;
  description: string;
  category: string;
  targetValue: string;
  warningThreshold: string;
  criticalThreshold: string;
  measurementFrequency: string;
  rationale: string;
}

export interface ModuleCompletion {
  module: string;
  completionPercentage: number;
  staleEntries: number;
  lastActivity: string;
  flags: string[];
  recommendations: string[];
}

export interface WorkflowTask {
  workflowId: string;
  workflowName: string;
  nextStepName: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

class EnhancedAIAssistantService {
  // Auto-generate incident summaries
  async generateIncidentSummary(orgId: string, period: 'week' | 'month' | 'quarter' = 'month'): Promise<IncidentSummary> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (period === 'week' ? 7 : period === 'month' ? 30 : 90));

      const { data: incidents, error } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', orgId)
        .gte('reported_at', startDate.toISOString());

      if (error) throw error;

      const totalIncidents = incidents?.length || 0;
      const criticalIncidents = incidents?.filter(i => i.severity === 'critical').length || 0;

      // Calculate average resolution time
      const resolvedIncidents = incidents?.filter(i => i.resolved_at) || [];
      const avgResolutionTime = resolvedIncidents.length > 0 
        ? resolvedIncidents.reduce((sum, incident) => {
            const resolution = new Date(incident.resolved_at!).getTime();
            const reported = new Date(incident.reported_at).getTime();
            return sum + (resolution - reported);
          }, 0) / resolvedIncidents.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      // Top categories
      const categoryCount = incidents?.reduce((acc, incident) => {
        const category = incident.category || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Generate AI summary
      const summaryPrompt = `Generate a concise incident summary for ${period} period:
      - Total incidents: ${totalIncidents}
      - Critical incidents: ${criticalIncidents}
      - Average resolution time: ${avgResolutionTime.toFixed(1)} hours
      - Top categories: ${topCategories.map(c => `${c.category} (${c.count})`).join(', ')}`;

      const { data: aiResponse } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: summaryPrompt,
          context: {
            module: 'incident_management',
            orgId,
            dataType: 'incident_summary'
          }
        }
      });

      const recommendations = [
        criticalIncidents > 5 ? 'Review critical incident response procedures' : '',
        avgResolutionTime > 24 ? 'Consider improving incident resolution processes' : '',
        topCategories[0]?.count > totalIncidents * 0.3 ? `Focus on preventing ${topCategories[0]?.category} incidents` : ''
      ].filter(Boolean);

      return {
        totalIncidents,
        criticalIncidents,
        averageResolutionTime: avgResolutionTime,
        topCategories,
        summary: aiResponse?.response || 'Summary generation failed',
        recommendations
      };
    } catch (error) {
      console.error('Error generating incident summary:', error);
      throw error;
    }
  }

  // Auto-generate audit summaries
  async generateAuditSummary(orgId: string): Promise<AuditSummary> {
    try {
      const [findingsResponse, gapsResponse, mappingsResponse] = await Promise.all([
        supabase.from('compliance_findings').select('*').eq('org_id', orgId),
        supabase.from('audit_gap_logs').select('*').eq('org_id', orgId),
        supabase.from('regulatory_mapping').select('*').eq('org_id', orgId)
      ]);

      const findings = findingsResponse.data || [];
      const gaps = gapsResponse.data || [];
      const mappings = mappingsResponse.data || [];

      const totalFindings = findings.length;
      const criticalFindings = findings.filter(f => f.severity === 'critical').length;
      const openGaps = gaps.filter(g => g.current_status === 'open').length;
      
      const compliantMappings = mappings.filter(m => m.compliance_status === 'compliant').length;
      const complianceScore = mappings.length > 0 ? (compliantMappings / mappings.length) * 100 : 0;

      // Generate AI summary
      const summaryPrompt = `Generate an audit summary:
      - Total findings: ${totalFindings}
      - Critical findings: ${criticalFindings}
      - Open gaps: ${openGaps}
      - Compliance score: ${complianceScore.toFixed(1)}%`;

      const { data: aiResponse } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: summaryPrompt,
          context: {
            module: 'audit_compliance',
            orgId,
            dataType: 'audit_summary'
          }
        }
      });

      const priorityActions = [
        criticalFindings > 0 ? `Address ${criticalFindings} critical findings immediately` : '',
        openGaps > 5 ? `Close ${openGaps} open compliance gaps` : '',
        complianceScore < 80 ? 'Improve overall compliance posture' : ''
      ].filter(Boolean);

      return {
        totalFindings,
        criticalFindings,
        openGaps,
        complianceScore,
        summary: aiResponse?.response || 'Summary generation failed',
        priorityActions
      };
    } catch (error) {
      console.error('Error generating audit summary:', error);
      throw error;
    }
  }

  // Recommend KRIs based on organization type
  async recommendKRIs(orgSector: string, module?: string): Promise<KRIRecommendation[]> {
    const kriDatabase: Record<string, KRIRecommendation[]> = {
      banking: [
        {
          name: 'System Availability',
          description: 'Percentage of critical system uptime',
          category: 'operational',
          targetValue: '99.9%',
          warningThreshold: '99.5%',
          criticalThreshold: '99.0%',
          measurementFrequency: 'daily',
          rationale: 'OSFI requires high availability for critical banking systems'
        },
        {
          name: 'Transaction Processing Errors',
          description: 'Number of failed transactions per 10,000',
          category: 'operational',
          targetValue: '<5',
          warningThreshold: '10',
          criticalThreshold: '20',
          measurementFrequency: 'daily',
          rationale: 'Critical for customer trust and regulatory compliance'
        },
        {
          name: 'Cyber Security Incidents',
          description: 'Number of confirmed security breaches',
          category: 'security',
          targetValue: '0',
          warningThreshold: '1',
          criticalThreshold: '2',
          measurementFrequency: 'monthly',
          rationale: 'Essential for protecting customer data and financial assets'
        }
      ],
      insurance: [
        {
          name: 'Claims Processing Time',
          description: 'Average days to process claims',
          category: 'operational',
          targetValue: '<7 days',
          warningThreshold: '10 days',
          criticalThreshold: '14 days',
          measurementFrequency: 'weekly',
          rationale: 'Customer satisfaction and regulatory requirements'
        },
        {
          name: 'Policy Renewal Rate',
          description: 'Percentage of policies renewed',
          category: 'business',
          targetValue: '>85%',
          warningThreshold: '80%',
          criticalThreshold: '75%',
          measurementFrequency: 'monthly',
          rationale: 'Key indicator of customer satisfaction and business sustainability'
        }
      ],
      fintech: [
        {
          name: 'API Response Time',
          description: 'Average API response time in milliseconds',
          category: 'operational',
          targetValue: '<200ms',
          warningThreshold: '500ms',
          criticalThreshold: '1000ms',
          measurementFrequency: 'real-time',
          rationale: 'Critical for user experience in digital financial services'
        },
        {
          name: 'User Onboarding Completion',
          description: 'Percentage of users completing onboarding',
          category: 'business',
          targetValue: '>80%',
          warningThreshold: '70%',
          criticalThreshold: '60%',
          measurementFrequency: 'weekly',
          rationale: 'Key metric for growth and regulatory compliance'
        }
      ]
    };

    return kriDatabase[orgSector] || kriDatabase.banking;
  }

  // Flag modules with low completion or stale entries
  async flagIncompleteModules(orgId: string): Promise<ModuleCompletion[]> {
    try {
      const modules = [
        { name: 'incident_management', table: 'incident_logs', dateField: 'updated_at' },
        { name: 'governance', table: 'governance_policies', dateField: 'updated_at' },
        { name: 'controls_kri', table: 'controls', dateField: 'updated_at' },
        { name: 'business_continuity', table: 'continuity_plans', dateField: 'updated_at' },
        { name: 'third_party_risk', table: 'third_party_profiles', dateField: 'updated_at' },
        { name: 'audit_compliance', table: 'compliance_findings', dateField: 'updated_at' }
      ];

      const moduleCompletions: ModuleCompletion[] = [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (const module of modules) {
        try {
          const { data, error } = await supabase
            .from(module.table)
            .select('*')
            .eq('org_id', orgId);

          if (error && error.code !== 'PGRST116') continue; // Skip if table doesn't exist

          const records = data || [];
          const totalRecords = records.length;
          
          // Calculate stale entries (not updated in 30 days)
          const staleEntries = records.filter(record => {
            const updateDate = new Date(record[module.dateField]);
            return updateDate < thirtyDaysAgo;
          }).length;

          // Calculate completion percentage (simplified logic)
          const completionPercentage = totalRecords > 0 ? Math.max(0, ((totalRecords - staleEntries) / totalRecords) * 100) : 0;

          const lastActivity = records.length > 0 
            ? Math.max(...records.map(r => new Date(r[module.dateField]).getTime()))
            : 0;

          const flags: string[] = [];
          const recommendations: string[] = [];

          if (completionPercentage < 50) {
            flags.push('Low Completion');
            recommendations.push(`Increase activity in ${module.name} module`);
          }

          if (staleEntries > totalRecords * 0.3) {
            flags.push('Stale Entries');
            recommendations.push(`Review and update ${staleEntries} outdated entries`);
          }

          if (totalRecords === 0) {
            flags.push('No Data');
            recommendations.push(`Set up initial data for ${module.name}`);
          }

          moduleCompletions.push({
            module: module.name,
            completionPercentage: Math.round(completionPercentage),
            staleEntries,
            lastActivity: lastActivity ? new Date(lastActivity).toISOString() : 'Never',
            flags,
            recommendations
          });
        } catch (moduleError) {
          console.error(`Error checking module ${module.name}:`, moduleError);
        }
      }

      return moduleCompletions.sort((a, b) => a.completionPercentage - b.completionPercentage);
    } catch (error) {
      console.error('Error flagging incomplete modules:', error);
      return [];
    }
  }

  // Suggest next tasks in workflows
  async suggestWorkflowTasks(orgId: string): Promise<WorkflowTask[]> {
    try {
      const { data: workflows, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          template:workflow_templates(*),
          steps:workflow_steps(*)
        `)
        .eq('org_id', orgId)
        .in('status', ['in_progress', 'pending']);

      if (error) throw error;

      const tasks: WorkflowTask[] = [];

      workflows?.forEach(workflow => {
        const pendingSteps = workflow.steps
          ?.filter(step => step.status === 'pending')
          ?.sort((a, b) => a.step_number - b.step_number) || [];

        const nextStep = pendingSteps[0];
        if (nextStep) {
          const dueDate = nextStep.due_date ? new Date(nextStep.due_date) : null;
          const now = new Date();
          
          let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
          if (dueDate) {
            const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (hoursUntilDue < 0) priority = 'critical';
            else if (hoursUntilDue < 24) priority = 'high';
            else if (hoursUntilDue < 72) priority = 'medium';
            else priority = 'low';
          }

          tasks.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            nextStepName: nextStep.step_name,
            assignedTo: nextStep.assigned_to_name || 'Unassigned',
            dueDate: nextStep.due_date || 'No due date',
            priority,
            description: nextStep.step_description || 'No description available'
          });
        }
      });

      return tasks.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Error suggesting workflow tasks:', error);
      return [];
    }
  }

  // Enhanced chat with new capabilities
  async processEnhancedMessage(
    message: string, 
    context: { module?: string; orgId: string; orgSector?: string }
  ): Promise<string> {
    try {
      // Check for specific command patterns
      if (message.toLowerCase().includes('incident summary')) {
        const summary = await this.generateIncidentSummary(context.orgId);
        return `**Incident Summary:**\n\n${summary.summary}\n\n**Key Metrics:**\n- Total: ${summary.totalIncidents}\n- Critical: ${summary.criticalIncidents}\n- Avg Resolution: ${summary.averageResolutionTime.toFixed(1)} hours\n\n**Recommendations:**\n${summary.recommendations.map(r => `• ${r}`).join('\n')}`;
      }

      if (message.toLowerCase().includes('audit summary')) {
        const summary = await this.generateAuditSummary(context.orgId);
        return `**Audit Summary:**\n\n${summary.summary}\n\n**Key Metrics:**\n- Total Findings: ${summary.totalFindings}\n- Critical: ${summary.criticalFindings}\n- Open Gaps: ${summary.openGaps}\n- Compliance Score: ${summary.complianceScore.toFixed(1)}%\n\n**Priority Actions:**\n${summary.priorityActions.map(a => `• ${a}`).join('\n')}`;
      }

      if (message.toLowerCase().includes('recommend kri') || message.toLowerCase().includes('kri recommendation')) {
        const kris = await this.recommendKRIs(context.orgSector || 'banking', context.module);
        return `**KRI Recommendations for ${context.orgSector}:**\n\n${kris.map(kri => 
          `**${kri.name}**\n- ${kri.description}\n- Target: ${kri.targetValue}\n- Warning: ${kri.warningThreshold}\n- Critical: ${kri.criticalThreshold}\n- Frequency: ${kri.measurementFrequency}\n- Rationale: ${kri.rationale}\n`
        ).join('\n')}`;
      }

      if (message.toLowerCase().includes('module completion') || message.toLowerCase().includes('stale entries')) {
        const modules = await this.flagIncompleteModules(context.orgId);
        return `**Module Completion Status:**\n\n${modules.map(m => 
          `**${m.module}:** ${m.completionPercentage}% complete\n- Stale entries: ${m.staleEntries}\n- Last activity: ${new Date(m.lastActivity).toLocaleDateString()}\n- Flags: ${m.flags.join(', ') || 'None'}\n- Recommendations: ${m.recommendations.join(', ') || 'None'}\n`
        ).join('\n')}`;
      }

      if (message.toLowerCase().includes('workflow task') || message.toLowerCase().includes('next task')) {
        const tasks = await this.suggestWorkflowTasks(context.orgId);
        return `**Suggested Workflow Tasks:**\n\n${tasks.slice(0, 5).map(t => 
          `**${t.workflowName}** (${t.priority.toUpperCase()})\n- Next: ${t.nextStepName}\n- Assigned: ${t.assignedTo}\n- Due: ${new Date(t.dueDate).toLocaleDateString()}\n- ${t.description}\n`
        ).join('\n')}`;
      }

      // Fall back to regular AI assistant
      const { data: aiResponse } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message,
          context
        }
      });

      return aiResponse?.response || 'I apologize, but I encountered an error processing your request.';
    } catch (error) {
      console.error('Error processing enhanced message:', error);
      return 'I encountered an error while processing your request. Please try again.';
    }
  }
}

export const enhancedAIAssistantService = new EnhancedAIAssistantService();
