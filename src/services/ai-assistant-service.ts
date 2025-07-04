
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile, getUserOrganization } from "@/lib/supabase-utils";
import { knowledgeBaseService, type VectorSearchResult } from "@/services/knowledge-base-service";

export interface WorkflowAnalysis {
  module: string;
  completedSteps: number;
  totalSteps: number;
  completionPercentage: number;
  blockedSteps: string[];
  recommendations: string[];
}

export interface RiskSummary {
  category: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  topRisks: Array<{
    id: string;
    name: string;
    impact: string;
    likelihood: string;
  }>;
}

export interface SectorThreshold {
  sector: string;
  metric: string;
  recommendedValue: string;
  rationale: string;
}

export interface ChatLog {
  id: string;
  user_id: string | null;
  org_id: string;
  session_id: string;
  message_type: 'user' | 'assistant';
  message_content: string;
  user_context: any;
  module_context?: string | null;
  feedback_rating?: number | null;
  feedback_comment?: string | null;
  knowledge_sources_used: string[];
  response_time_ms?: number | null;
  created_at: string;
}

class AIAssistantService {
  // Detect incomplete workflows per module
  async analyzeWorkflowCompleteness(orgId: string): Promise<WorkflowAnalysis[]> {
    try {
      const { data: workflows, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          template:workflow_templates(*),
          steps:workflow_steps(*)
        `)
        .eq('org_id', orgId)
        .neq('status', 'completed');

      if (error) throw error;

      const moduleAnalysis: Record<string, WorkflowAnalysis> = {};

      workflows?.forEach(workflow => {
        const module = workflow.template?.module || 'unknown';
        const steps = workflow.steps || [];
        const completedSteps = steps.filter(step => step.status === 'completed').length;
        const blockedSteps = steps
          .filter(step => step.status === 'pending' && !step.assigned_to)
          .map(step => step.step_name);

        if (!moduleAnalysis[module]) {
          moduleAnalysis[module] = {
            module,
            completedSteps: 0,
            totalSteps: 0,
            completionPercentage: 0,
            blockedSteps: [],
            recommendations: []
          };
        }

        moduleAnalysis[module].completedSteps += completedSteps;
        moduleAnalysis[module].totalSteps += steps.length;
        moduleAnalysis[module].blockedSteps.push(...blockedSteps);
      });

      // Calculate percentages and generate recommendations
      Object.values(moduleAnalysis).forEach(analysis => {
        analysis.completionPercentage = analysis.totalSteps > 0 
          ? (analysis.completedSteps / analysis.totalSteps) * 100 
          : 0;

        if (analysis.completionPercentage < 50) {
          analysis.recommendations.push(`${analysis.module} module needs immediate attention - less than 50% complete`);
        }
        if (analysis.blockedSteps.length > 0) {
          analysis.recommendations.push(`Assign owners to ${analysis.blockedSteps.length} blocked steps in ${analysis.module}`);
        }
      });

      return Object.values(moduleAnalysis);
    } catch (error) {
      console.error('Error analyzing workflow completeness:', error);
      return [];
    }
  }

  // Summarize top risks in executive report mode
  async generateExecutiveRiskSummary(orgId: string): Promise<RiskSummary[]> {
    try {
      const [incidents, dependencies, kriBreaches] = await Promise.all([
        this.getHighSeverityIncidents(orgId),
        this.getCriticalDependencyRisks(orgId),
        this.getKRIBreaches(orgId)
      ]);

      const riskSummaries: RiskSummary[] = [
        {
          category: 'Operational Incidents',
          level: this.calculateRiskLevel(incidents.length, [1, 3, 7]),
          count: incidents.length,
          topRisks: incidents.slice(0, 3).map(incident => ({
            id: incident.id,
            name: incident.title,
            impact: incident.severity,
            likelihood: 'Current'
          }))
        },
        {
          category: 'Dependency Risks',
          level: this.calculateRiskLevel(dependencies.length, [0, 2, 5]),
          count: dependencies.length,
          topRisks: dependencies.slice(0, 3).map(dep => ({
            id: dep.id,
            name: dep.dependency_name,
            impact: dep.criticality,
            likelihood: dep.status === 'failed' ? 'High' : 'Medium'
          }))
        },
        {
          category: 'KRI Breaches',
          level: this.calculateRiskLevel(kriBreaches.length, [0, 1, 3]),
          count: kriBreaches.length,
          topRisks: kriBreaches.slice(0, 3).map(kri => ({
            id: kri.id,
            name: `KRI Breach - ${kri.measurement_date}`,
            impact: kri.variance_status,
            likelihood: 'High'
          }))
        }
      ];

      return riskSummaries;
    } catch (error) {
      console.error('Error generating executive risk summary:', error);
      return [];
    }
  }

  private async getHighSeverityIncidents(orgId: string) {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .in('severity', ['critical', 'high'])
      .in('status', ['open', 'in_progress'])
      .order('reported_at', { ascending: false });

    return data || [];
  }

  private async getCriticalDependencyRisks(orgId: string) {
    const { data, error } = await supabase
      .from('dependencies')
      .select('*')
      .eq('org_id', orgId)
      .eq('criticality', 'critical')
      .neq('status', 'operational');

    return data || [];
  }

  private async getKRIBreaches(orgId: string) {
    const { data, error } = await supabase
      .from('kri_appetite_variance')
      .select('*')
      .eq('variance_status', 'breach')
      .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    return data || [];
  }

  private calculateRiskLevel(count: number, thresholds: [number, number, number]): 'low' | 'medium' | 'high' | 'critical' {
    if (count <= thresholds[0]) return 'low';
    if (count <= thresholds[1]) return 'medium';
    if (count <= thresholds[2]) return 'high';
    return 'critical';
  }

  // Recommend thresholds based on sector
  async getSectorRecommendations(sector: string): Promise<SectorThreshold[]> {
    const sectorThresholds: Record<string, SectorThreshold[]> = {
      banking: [
        {
          sector: 'Banking',
          metric: 'Core Payment System RTO',
          recommendedValue: '4 hours',
          rationale: 'OSFI guidelines require critical payment systems to recover within 4 hours to maintain financial stability'
        },
        {
          sector: 'Banking',
          metric: 'Customer Data RPO',
          recommendedValue: '15 minutes',
          rationale: 'Banking regulations require minimal data loss for customer transaction records'
        },
        {
          sector: 'Banking',
          metric: 'System Availability',
          recommendedValue: '99.9%',
          rationale: 'Industry standard for critical banking services to ensure customer access'
        }
      ],
      insurance: [
        {
          sector: 'Insurance',
          metric: 'Claims Processing RTO',
          recommendedValue: '8 hours',
          rationale: 'Claims processing systems should recover within business day to maintain customer service'
        },
        {
          sector: 'Insurance',
          metric: 'Policy Data RPO',
          recommendedValue: '1 hour',
          rationale: 'Policy data updates should have minimal loss to prevent coverage gaps'
        }
      ],
      fintech: [
        {
          sector: 'FinTech',
          metric: 'Digital Service RTO',
          recommendedValue: '2 hours',
          rationale: 'Digital-first services require rapid recovery to maintain competitive advantage'
        },
        {
          sector: 'FinTech',
          metric: 'Transaction Data RPO',
          recommendedValue: '5 minutes',
          rationale: 'Real-time transaction processing requires minimal data loss tolerance'
        }
      ]
    };

    return sectorThresholds[sector] || [];
  }

  // Enhanced chat with knowledge base search
  async logChatMessageWithKnowledgeSearch(
    messageType: 'user' | 'assistant',
    content: string,
    moduleContext?: string,
    responseTimeMs?: number
  ): Promise<string> {
    try {
      let knowledgeSources: string[] = [];
      let enhancedContent = content;

      // For user messages, search knowledge base and enhance AI response
      if (messageType === 'user') {
        const searchResults = await knowledgeBaseService.search(content, 3);
        
        if (searchResults.length > 0) {
          knowledgeSources = searchResults.map(result => result.id);
          
          // Generate enhanced AI response using knowledge base context
          const contextualResponse = await this.generateContextualResponse(content, searchResults);
          if (contextualResponse) {
            enhancedContent = contextualResponse;
            messageType = 'assistant'; // Convert to assistant response
          }
        }
      }

      return await this.logChatMessage(messageType, enhancedContent, moduleContext, knowledgeSources, responseTimeMs);
    } catch (error) {
      console.error('Error in enhanced chat logging:', error);
      // Fallback to regular logging
      return await this.logChatMessage(messageType, content, moduleContext, [], responseTimeMs);
    }
  }

  // Generate contextual response using AI assistant
  private async generateContextualResponse(userQuery: string, knowledgeResults: VectorSearchResult[]): Promise<string | null> {
    try {
      // Get organization context
      const profile = await getCurrentUserProfile();
      const org = await getUserOrganization();
      
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: userQuery,
          context: {
            module: null,
            userRole: profile?.role || null,
            orgSector: (org as any)?.sub_sector || null,
            orgSize: (org as any)?.employee_count || null,
            orgType: (org as any)?.org_type || null,
            capitalTier: (org as any)?.capital_tier || null,
            regulatoryClassification: (org as any)?.regulatory_classification || [],
            geographicScope: (org as any)?.geographic_scope || null
          },
          knowledgeBase: knowledgeResults.map(result => ({
            title: result.title,
            content: result.content,
            category: result.category,
            similarity: result.similarity
          }))
        }
      });

      if (error) {
        console.error('AI assistant error:', error);
        return null;
      }

      return data?.response || null;
    } catch (error) {
      console.error('Error generating contextual response:', error);
      return null;
    }
  }

  // Chat history logging
  async logChatMessage(
    messageType: 'user' | 'assistant',
    content: string,
    moduleContext?: string,
    knowledgeSources: string[] = [],
    responseTimeMs?: number
  ): Promise<string> {
    try {
      const profile = await getCurrentUserProfile();
      const org = await getUserOrganization();
      
      if (!profile || !org) {
        throw new Error('User or organization not found');
      }

      // Get or create session ID from localStorage
      let sessionId = localStorage.getItem('ai_chat_session');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('ai_chat_session', sessionId);
      }

      const { data, error } = await supabase
        .from('ai_chat_logs')
        .insert([{
          user_id: profile.id,
          org_id: org.id,
          session_id: sessionId,
          message_type: messageType,
          message_content: content,
        user_context: {
          role: profile.role,
          module: moduleContext,
          timestamp: new Date().toISOString(),
          orgType: (org as any)?.org_type,
          orgSector: (org as any)?.sub_sector,
          capitalTier: (org as any)?.capital_tier,
          regulatoryClassification: (org as any)?.regulatory_classification,
          geographicScope: (org as any)?.geographic_scope
        },
          module_context: moduleContext,
          knowledge_sources_used: knowledgeSources,
          response_time_ms: responseTimeMs
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error logging chat message:', error);
      throw error;
    }
  }

  async updateChatFeedback(logId: string, rating: number, comment?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_chat_logs')
        .update({
          feedback_rating: rating,
          feedback_comment: comment
        })
        .eq('id', logId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating chat feedback:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId?: string, limit: number = 50): Promise<ChatLog[]> {
    try {
      let query = supabase
        .from('ai_chat_logs')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to match our ChatLog interface
      const chatLogs: ChatLog[] = (data || []).map(log => ({
        ...log,
        message_type: log.message_type as 'user' | 'assistant',
        knowledge_sources_used: Array.isArray(log.knowledge_sources_used) 
          ? log.knowledge_sources_used as string[]
          : []
      }));

      return chatLogs;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }
}

export const aiAssistantService = new AIAssistantService();
