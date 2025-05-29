import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { aiAssistantService, WorkflowAnalysis, RiskSummary, SectorThreshold } from "@/services/ai-assistant-service";
import { getUserOrganization } from "@/lib/supabase-utils";

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
  
  // New methods
  generateWorkflowReport: () => Promise<void>;
  generateExecutiveReport: () => Promise<void>;
  getSectorGuidance: (metric: string) => Promise<void>;
  provideFeedback: (messageId: string, rating: number, comment?: string) => Promise<void>;
  
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
      content: "Hello! I'm your enhanced ResilientFI assistant. I can now analyze workflows, summarize risks, and provide sector-specific guidance. How can I help you today?",
      timestamp: new Date().toISOString()
    }
  ]);

  // Load user context data
  useEffect(() => {
    const loadUserContext = async () => {
      if (profile) {
        setUserRole(profile.role || null);
        
        const org = await getUserOrganization();
        if (org) {
          setOrgSector(org.sector as OrgSector || "banking");
          setOrgSize(org.size as OrgSize || "medium");
        }
      }
    };
    
    loadUserContext();
  }, [profile]);

  // Enhanced methods
  const generateWorkflowReport = async () => {
    if (!profile?.organization_id) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await aiAssistantService.analyzeWorkflowCompleteness(profile.organization_id);
      setWorkflowAnalysis(analysis);
      
      // Generate message with workflow analysis
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
      
      // Generate executive summary message
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

  // Enhanced message handling
  const addUserMessage = async (message: string) => {
    const messageId = `msg-${Date.now()}`;
    const startTime = performance.now();
    
    try {
      // Log user message
      const userLogId = await aiAssistantService.logChatMessage('user', message, currentModule);
      
      // Add user message to conversation
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
      
      // Check for special commands
      if (message.toLowerCase().includes('workflow report') || message.toLowerCase().includes('workflow analysis')) {
        await generateWorkflowReport();
        return;
      }
      
      if (message.toLowerCase().includes('executive report') || message.toLowerCase().includes('risk summary')) {
        await generateExecutiveReport();
        return;
      }
      
      if (message.toLowerCase().includes('sector recommendation') || message.toLowerCase().includes('threshold')) {
        await getSectorGuidance(message);
        return;
      }
      
      // Generate regular AI response (simplified for now)
      const responseTime = performance.now() - startTime;
      const aiResponse = `I understand you're asking about: "${message}". I can help you with workflow analysis, risk summaries, and sector-specific guidance. Try asking for "workflow report" or "executive risk summary" to see my enhanced capabilities!`;
      
      const assistantLogId = await aiAssistantService.logChatMessage(
        'assistant', 
        aiResponse, 
        currentModule, 
        ['general_guidance'], 
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
          knowledgeSources: ['general_guidance']
        }
      ]);
      
    } catch (error) {
      console.error('Error processing message:', error);
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
        provideFeedback
      }}
    >
      {children}
    </EnhancedAIAssistantContext.Provider>
  );
};
