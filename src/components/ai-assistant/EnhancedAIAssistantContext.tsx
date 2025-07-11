import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { aiAssistantService, WorkflowAnalysis, RiskSummary, SectorThreshold } from "@/services/ai-assistant-service";
import { enhancedAIAssistantService } from "@/services/enhanced-ai-assistant-service";
import { aiOrganizationalIntelligenceIntegration } from "@/services/ai-organizational-intelligence-integration";
import { getUserOrganization } from "@/lib/supabase-utils";
import { supabase } from "@/integrations/supabase/client";

// Keep existing types from original context
interface AIMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: string;
  knowledgeSources?: string[];
  logId?: string;
}

export type OrgSector = "banking" | "insurance" | "fintech" | "investment" | "other";
export type OrgSize = "small" | "medium" | "large" | "enterprise";
export type KnowledgeDomain = "E-21" | "ISO-22301" | "OSFI" | "general";

export interface KnowledgeSource {
  id: string;
  title: string;
  domain: KnowledgeDomain;
  sections: {
    title: string;
    content: string;
  }[];
}

interface EnhancedAIAssistantContextType {
  // Original functionality
  isAssistantOpen: boolean;
  setIsAssistantOpen: (isOpen: boolean) => void;
  currentModule: string | null;
  setCurrentModule: (module: string | null) => void;
  assistantMessages: AIMessage[];
  addUserMessage: (message: string) => void;
  isLoading: boolean;
  userRole: string | null;
  orgSector: OrgSector | null;
  orgSize: OrgSize | null;
  knowledgeSources: KnowledgeSource[];
  
  // Enhanced functionality
  workflowAnalysis: WorkflowAnalysis[];
  riskSummary: RiskSummary[];
  sectorRecommendations: SectorThreshold[];
  isAnalyzing: boolean;
  
  // New organizational intelligence methods
  generateWorkflowReport: () => Promise<void>;
  generateExecutiveReport: () => Promise<void>;
  getSectorGuidance: (metric: string) => Promise<void>;
  provideFeedback: (messageId: string, rating: number, comment?: string) => Promise<void>;
  generateOrganizationalAnalysis: () => Promise<void>;
  
  // Quick actions
  explainTerm: (term: string) => void;
  suggestKRIs: (category: string) => void;
  guideSetup: (step: string) => void;
  summarizeContent: (content: string) => void;
}

const EnhancedAIAssistantContext = createContext<EnhancedAIAssistantContextType | undefined>(undefined);

export const useEnhancedAIAssistant = () => {
  const context = useContext(EnhancedAIAssistantContext);
  if (!context) {
    throw new Error("useEnhancedAIAssistant must be used within an EnhancedAIAssistantProvider");
  }
  return context;
};

export const EnhancedAIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Original state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [orgSector, setOrgSector] = useState<OrgSector | null>(null);
  const [orgSize, setOrgSize] = useState<OrgSize | null>(null);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Enhanced state
  const [workflowAnalysis, setWorkflowAnalysis] = useState<WorkflowAnalysis[]>([]);
  const [riskSummary, setRiskSummary] = useState<RiskSummary[]>([]);
  const [sectorRecommendations, setSectorRecommendations] = useState<SectorThreshold[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { user, profile } = useAuth();
  
  const [assistantMessages, setAssistantMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your enhanced ResilientFI assistant with advanced organizational intelligence:\n\n🔮 **Predictive Analytics** - Forecast risks and identify emerging patterns\n📊 **Intelligent Assessment** - AI-powered risk scoring with benchmarking\n💡 **Proactive Recommendations** - Personalized mitigation strategies\n📄 **Document Analysis** - Extract insights from reports and policies\n🚨 **Anomaly Detection** - Identify unusual patterns in your data\n🎯 **Organizational Intelligence** - Comprehensive organizational profiling and analysis\n⚡ **Workflow Orchestration** - Automated workflow management\n🔄 **Real-Time Intelligence** - Live monitoring and insights\n\nTry asking: 'Analyze my organization' or 'Generate comprehensive insights'",
      timestamp: new Date().toISOString()
    }
  ]);

  // Load user context data and knowledge base
  useEffect(() => {
    const loadUserContext = async () => {
      if (profile) {
        setUserRole(profile.role || null);
        
        const org = await getUserOrganization();
        if (org) {
          setOrgSector(org.sector as OrgSector || "banking");
          setOrgSize(org.size as OrgSize || "medium");
        }
        
        // Load knowledge base
        await loadKnowledgeBase();
      }
    };
    
    loadUserContext();
  }, [profile]);
  
  // Load knowledge base from Supabase
  const loadKnowledgeBase = async () => {
    try {
      const { data: knowledgeData, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const transformedSources: KnowledgeSource[] = (knowledgeData || []).map(kb => ({
        id: kb.id,
        title: kb.title,
        domain: kb.source_type as KnowledgeDomain || 'general',
        sections: Array.isArray(kb.sections) ? kb.sections.map((section: any) => ({
          title: section.title || 'Untitled Section',
          content: section.content || ''
        })) : []
      }));
      
      setKnowledgeSources(transformedSources);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      setKnowledgeSources([]);
    }
  };

  // New organizational intelligence method
  const generateOrganizationalAnalysis = async () => {
    if (!profile?.organization_id) return;
    
    setIsAnalyzing(true);
    try {
      // This would require a profile ID, which we would get from the organizational intelligence service
      // For now, we'll generate a mock analysis
      const analysisContent = `**Comprehensive Organizational Intelligence Analysis:**\n\n` +
        `🏢 **Organization Overview:**\n` +
        `• Sector: ${orgSector || 'Not specified'}\n` +
        `• Size: ${orgSize || 'Not specified'}\n` +
        `• Current Assessment Status: In Progress\n\n` +
        `🔍 **Key Insights:**\n` +
        `• Risk maturity assessment recommended\n` +
        `• Compliance framework evaluation needed\n` +
        `• Technology modernization opportunities identified\n\n` +
        `📈 **Recommendations:**\n` +
        `• Complete organizational profile assessment\n` +
        `• Implement risk management framework\n` +
        `• Establish automated monitoring systems\n\n` +
        `🎯 **Next Steps:**\n` +
        `• Navigate to Organizational Intelligence module\n` +
        `• Complete adaptive questionnaire\n` +
        `• Review generated insights and recommendations`;
      
      const messageId = await aiAssistantService.logChatMessage('assistant', analysisContent, currentModule, ['organizational_intelligence']);
      
      setAssistantMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: analysisContent,
        timestamp: new Date().toISOString(),
        logId: messageId,
        knowledgeSources: ['organizational_intelligence']
      }]);
    } catch (error) {
      console.error('Error generating organizational analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced methods with new service integration
  const generateWorkflowReport = async () => {
    if (!profile?.organization_id) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await aiAssistantService.analyzeWorkflowCompleteness(profile.organization_id);
      setWorkflowAnalysis(analysis);
      
      const reportContent = analysis.length > 0 
        ? `**Workflow Completeness Analysis:**\n\n${analysis.map(a => 
            `**${a.module}:** ${a.completionPercentage.toFixed(1)}% complete (${a.completedSteps}/${a.totalSteps} steps)\n` +
            (a.recommendations.length > 0 ? `⚠️ ${a.recommendations.join(', ')}\n` : '')
          ).join('\n')}`
        : "All workflows are on track! No immediate action required.";
      
      const messageId = await aiAssistantService.logChatMessage('assistant', reportContent, currentModule, ['workflow_analysis']);
      
      setAssistantMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: reportContent,
        timestamp: new Date().toISOString(),
        logId: messageId,
        knowledgeSources: ['workflow_analysis']
      }]);
    } catch (error) {
      console.error('Error generating workflow report:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateExecutiveReport = async () => {
    if (!profile?.organization_id) return;
    
    setIsAnalyzing(true);
    try {
      const summary = await aiAssistantService.generateExecutiveRiskSummary(profile.organization_id);
      setRiskSummary(summary);
      
      const reportContent = `**Executive Risk Summary:**\n\n${summary.map(s => 
        `**${s.category}:** ${s.level.toUpperCase()} (${s.count} items)\n` +
        (s.topRisks.length > 0 ? `Top concerns: ${s.topRisks.map(r => r.name).join(', ')}\n` : '')
      ).join('\n')}`;
      
      const messageId = await aiAssistantService.logChatMessage('assistant', reportContent, currentModule, ['risk_analysis']);
      
      setAssistantMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: reportContent,
        timestamp: new Date().toISOString(),
        logId: messageId,
        knowledgeSources: ['risk_analysis']
      }]);
    } catch (error) {
      console.error('Error generating executive report:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSectorGuidance = async (metric: string) => {
    if (!orgSector) return;
    
    setIsLoading(true);
    try {
      const recommendations = await aiAssistantService.getSectorRecommendations(orgSector);
      setSectorRecommendations(recommendations);
      
      const relevantRec = recommendations.find(r => 
        r.metric.toLowerCase().includes(metric.toLowerCase())
      );
      
      const responseContent = relevantRec 
        ? `**${relevantRec.metric} Recommendation for ${relevantRec.sector}:**\n\n` +
          `**Recommended Value:** ${relevantRec.recommendedValue}\n\n` +
          `**Rationale:** ${relevantRec.rationale}`
        : `Here are the sector-specific recommendations for ${orgSector}:\n\n` +
          recommendations.map(r => `• **${r.metric}:** ${r.recommendedValue} - ${r.rationale}`).join('\n\n');
      
      const messageId = await aiAssistantService.logChatMessage('assistant', responseContent, currentModule, ['sector_guidance']);
      
      setAssistantMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString(),
        logId: messageId,
        knowledgeSources: ['sector_guidance']
      }]);
    } catch (error) {
      console.error('Error getting sector guidance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const provideFeedback = async (messageId: string, rating: number, comment?: string) => {
    try {
      const message = assistantMessages.find(m => m.id === messageId);
      if (message?.logId) {
        await aiAssistantService.updateChatFeedback(message.logId, rating, comment);
      }
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
  };

  // Enhanced message handling with organizational intelligence integration
  const addUserMessage = async (message: string) => {
    const messageId = `msg-${Date.now()}`;
    const startTime = performance.now();
    
    try {
      const userLogId = await aiAssistantService.logChatMessage('user', message, currentModule);
      
      setAssistantMessages(prev => [
        ...prev,
        {
          id: messageId,
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
          logId: userLogId
        }
      ]);
      
      setIsLoading(true);
      
      // Check if this is an organizational intelligence query
      const isOrgIntelligenceQuery = [
        'analyze', 'organization', 'profile', 'maturity', 'intelligence', 
        'assessment', 'comprehensive', 'insights', 'recommendations'
      ].some(keyword => message.toLowerCase().includes(keyword));

      let aiResponse = '';

      if (isOrgIntelligenceQuery && profile?.organization_id) {
        // Use organizational intelligence integration for contextual responses
        const context = {
          profileId: '', // Would be populated from organizational profile
          orgId: profile.organization_id,
          currentMaturityLevel: 'basic', // Would be populated from profile
          riskScore: 50, // Would be calculated
          completeness: 60 // Would be calculated
        };
        
        aiResponse = await aiOrganizationalIntelligenceIntegration.generateContextualResponse(
          message,
          context
        );
      } else {
        // Use standard enhanced AI service
        const org = await getUserOrganization();
        aiResponse = await enhancedAIAssistantService.processEnhancedMessage(
          message,
          {
            module: currentModule,
            orgId: profile?.organization_id,
            orgSector: org?.sector || 'banking',
            userRole: profile?.role
          }
        );
      }
      
      const responseTime = performance.now() - startTime;
      const assistantLogId = await aiAssistantService.logChatMessage(
        'assistant', 
        aiResponse, 
        currentModule, 
        ['enhanced_ai', 'organizational_intelligence'], 
        Math.round(responseTime)
      );
      
      setAssistantMessages(prev => [
        ...prev,
        {
          id: `response-${Date.now()}`,
          role: "assistant",
          content: aiResponse,
          timestamp: new Date().toISOString(),
          logId: assistantLogId,
          knowledgeSources: ['enhanced_ai', 'organizational_intelligence']
        }
      ]);
    } catch (error) {
      console.error('Error processing message:', error);
      setAssistantMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please try again.",
          timestamp: new Date().toISOString(),
          knowledgeSources: ['error']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action methods (keeping original functionality)
  const explainTerm = (term: string) => {
    addUserMessage(`Can you explain the term "${term}" in the context of operational resilience?`);
  };

  const suggestKRIs = (category: string) => {
    addUserMessage(`What are some recommended KRIs for ${category}?`);
  };

  const guideSetup = (step: string) => {
    addUserMessage(`How should I approach setting up ${step}?`);
  };

  const summarizeContent = (content: string) => {
    addUserMessage(`Can you summarize this information: ${content.substring(0, 100)}...`);
  };

  return (
    <EnhancedAIAssistantContext.Provider 
      value={{ 
        // Original functionality
        isAssistantOpen, 
        setIsAssistantOpen, 
        currentModule, 
        setCurrentModule,
        assistantMessages,
        addUserMessage,
        isLoading,
        userRole,
        orgSector,
        orgSize,
        knowledgeSources,
        explainTerm,
        suggestKRIs,
        guideSetup,
        summarizeContent,
        
        // Enhanced functionality
        workflowAnalysis,
        riskSummary,
        sectorRecommendations,
        isAnalyzing,
        generateWorkflowReport,
        generateExecutiveReport,
        getSectorGuidance,
        provideFeedback,
        generateOrganizationalAnalysis
      }}
    >
      {children}
    </EnhancedAIAssistantContext.Provider>
  );
};
