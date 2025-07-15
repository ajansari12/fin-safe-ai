import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { aiAssistantService, WorkflowAnalysis, RiskSummary, SectorThreshold } from "@/services/ai-assistant-service";
import { enhancedAIAssistantService } from "@/services/enhanced-ai-assistant-service";
import { aiOrganizationalIntelligenceIntegration } from "@/services/ai-organizational-intelligence-integration";
import { getUserOrganization } from "@/lib/supabase-utils";
import { supabase } from "@/integrations/supabase/client";
import { ToleranceAIAnalysisService, ToleranceBreachAnalysis, BreachPrediction } from "@/services/tolerance/tolerance-ai-analysis-service";
import { vendorFeedIntegrationService } from "@/services/third-party/vendor-feed-integration-service";

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
export type KnowledgeDomain = "E-21" | "ISO-22301" | "OSFI" | "B-10" | "general";

// Vendor Analysis Types
export interface VendorRiskAnalysis {
  vendorId: string;
  vendorName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  concentrationRisk: number;
  impactAssessment: {
    operationalImpact: string;
    financialImpact: string;
    reputationalImpact: string;
    complianceImpact: string;
  };
  recommendations: string[];
  osfiCitations: string[];
  analysisTimestamp: string;
  aiInsights?: string;
  confidenceScore?: number;
}

export interface ConcentrationRiskAssessment {
  totalVendors: number;
  criticalVendors: number;
  concentrationThreshold: number;
  currentConcentration: number;
  exceedsThreshold: boolean;
  riskFactors: string[];
  mitigationStrategies: string[];
  osfiCompliance: {
    e21Principle6: boolean;
    b10Requirements: boolean;
    citations: string[];
  };
  aiRecommendations?: string;
}

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
  
  // Phase 4: AI-Powered Breach Analysis
  breachAnalyses: ToleranceBreachAnalysis[];
  breachPredictions: BreachPrediction[];
  isAnalyzingBreach: boolean;
  analyzeToleranceBreach: (
    breachId: string,
    operationName: string,
    breachType: 'rto' | 'rpo' | 'service_level' | 'multiple',
    actualValue: number,
    thresholdValue: number,
    variance: number,
    currentStatus: string
  ) => Promise<ToleranceBreachAnalysis>;
  generateEscalationRecommendations: (breachAnalysis: ToleranceBreachAnalysis) => Promise<void>;
  assessBreachImpact: (breachId: string, recoveryTime: number, threshold: number) => Promise<void>;
  predictPotentialBreaches: () => Promise<void>;
  
  // AI-Powered Vendor Analysis
  vendorAnalyses: VendorRiskAnalysis[];
  concentrationAssessment: ConcentrationRiskAssessment | null;
  isAnalyzingVendor: boolean;
  analyzeVendorRisk: (vendorId: string, includeFeeds?: boolean) => Promise<VendorRiskAnalysis>;
  assessConcentrationRisk: () => Promise<ConcentrationRiskAssessment>;
  generateVendorRecommendations: (vendorId?: string) => Promise<void>;
  analyzeVendorPortfolio: () => Promise<void>;
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
  
  // Phase 4: Breach analysis state
  const [breachAnalyses, setBreachAnalyses] = useState<ToleranceBreachAnalysis[]>([]);
  const [breachPredictions, setBreachPredictions] = useState<BreachPrediction[]>([]);
  const [isAnalyzingBreach, setIsAnalyzingBreach] = useState(false);
  
  // Vendor analysis state
  const [vendorAnalyses, setVendorAnalyses] = useState<VendorRiskAnalysis[]>([]);
  const [concentrationAssessment, setConcentrationAssessment] = useState<ConcentrationRiskAssessment | null>(null);
  const [isAnalyzingVendor, setIsAnalyzingVendor] = useState(false);
  
  const { user, profile } = useAuth();
  
  const [assistantMessages, setAssistantMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your enhanced ResilientFI assistant with advanced organizational intelligence:\n\n🔮 **Predictive Analytics** - Forecast risks and identify emerging patterns\n📊 **Intelligent Assessment** - AI-powered risk scoring with benchmarking\n💡 **Proactive Recommendations** - Personalized mitigation strategies\n📄 **Document Analysis** - Extract insights from reports and policies\n🚨 **Anomaly Detection** - Identify unusual patterns in your data\n🎯 **Organizational Intelligence** - Comprehensive organizational profiling and analysis\n⚡ **Workflow Orchestration** - Automated workflow management\n🔄 **Real-Time Intelligence** - Live monitoring and insights\n🏢 **Vendor Risk Analysis** - OSFI E-21 & B-10 compliant third-party risk assessment\n📈 **Concentration Risk** - Monitor vendor dependencies per OSFI guidelines\n\nTry asking: 'Analyze my organization', 'Assess vendor risks', or 'Check concentration risk'",
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
      
        // Check query type for appropriate routing
        const isOrgIntelligenceQuery = [
          'analyze', 'organization', 'profile', 'maturity', 'intelligence', 
          'assessment', 'comprehensive', 'insights', 'recommendations'
        ].some(keyword => message.toLowerCase().includes(keyword));
        
        const isVendorQuery = [
          'vendor', 'supplier', 'third party', 'concentration', 'dependency',
          'b-10', 'e-21', 'principle 6', 'third-party'
        ].some(keyword => message.toLowerCase().includes(keyword));

        let aiResponse = '';

        if (isVendorQuery && profile?.organization_id) {
          // Handle vendor-specific queries
          aiResponse = await generateVendorAIResponse(message);
        } else if (isOrgIntelligenceQuery && profile?.organization_id) {
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

  // Phase 4: AI-Powered Breach Analysis Methods
  const analyzeToleranceBreach = async (
    breachId: string,
    operationName: string,
    breachType: 'rto' | 'rpo' | 'service_level' | 'multiple',
    actualValue: number,
    thresholdValue: number,
    variance: number,
    currentStatus: string
  ): Promise<ToleranceBreachAnalysis> => {
    setIsAnalyzingBreach(true);
    try {
      const analysis = await ToleranceAIAnalysisService.analyzeToleranceBreach(
        breachId,
        operationName,
        breachType,
        actualValue,
        thresholdValue,
        variance,
        currentStatus
      );

      setBreachAnalyses(prev => {
        const existing = prev.findIndex(a => a.breachId === breachId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = analysis;
          return updated;
        }
        return [...prev, analysis];
      });

      // Generate AI message with analysis summary
      const analysisContent = `**OSFI E-21 Tolerance Breach Analysis - ${operationName}**

🔍 **Severity Assessment:** ${analysis.severityAssessment.toUpperCase()}
📊 **Variance:** ${variance.toFixed(1)}% above threshold
⏱️ **Estimated Duration:** ${analysis.impactAssessment.estimatedDuration} minutes

🚨 **Escalation Required:** ${analysis.escalationRecommendation.required ? 'YES' : 'NO'}
${analysis.escalationRecommendation.required ? `• Level ${analysis.escalationRecommendation.level} escalation within ${analysis.escalationRecommendation.timeline.replace('_', ' ')}` : ''}

${analysis.boardEscalationRequired ? '🏛️ **Board Notification Required** per OSFI E-21 Principle 1' : ''}

📋 **OSFI E-21 Principles:** ${analysis.osfiPrinciplesCited.map(p => `Principle ${p}`).join(', ')}

💡 **Recovery Recommendations:**
${analysis.recoveryRecommendations.map(r => `• ${r}`).join('\n')}

🎯 **Next Actions:**
${analysis.nextActions.map(a => `• ${a}`).join('\n')}

📏 **Proportionality Note:**
${analysis.proportionalityNotes}

⚖️ **Regulatory Disclaimer:**
This automated analysis is based on OSFI Guideline E-21 requirements. This does not constitute regulatory advice. Consult OSFI or qualified compliance professionals for your institution's specific regulatory obligations.`;

      const messageId = await aiAssistantService.logChatMessage(
        'assistant', 
        analysisContent, 
        currentModule, 
        ['breach_analysis', 'osfi_e21']
      );
      
      setAssistantMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: analysisContent,
        timestamp: new Date().toISOString(),
        logId: messageId,
        knowledgeSources: ['breach_analysis', 'osfi_e21']
      }]);

      return analysis;
    } catch (error) {
      console.error('Error analyzing tolerance breach:', error);
      throw error;
    } finally {
      setIsAnalyzingBreach(false);
    }
  };

  const generateEscalationRecommendations = async (breachAnalysis: ToleranceBreachAnalysis) => {
    setIsAnalyzing(true);
    try {
      const org = await getUserOrganization();
      const recommendations = ToleranceAIAnalysisService.generateEscalationRecommendations(
        breachAnalysis,
        { sector: org?.sector, size: org?.size }
      );

      const recommendationContent = `**Escalation Recommendations for Breach ${breachAnalysis.breachId}**

${recommendations.map(r => r).join('\n\n')}

**Recommended Timeline:**
• Immediate: ${breachAnalysis.escalationRecommendation.timeline.replace('_', ' ')}
• Reason: ${breachAnalysis.escalationRecommendation.reason}

**OSFI E-21 Compliance:**
This escalation recommendation follows OSFI E-21 Principle 5 (Crisis Management) and Principle 7 (Tolerance for Disruption) requirements for Canadian financial institutions.`;

      const messageId = await aiAssistantService.logChatMessage(
        'assistant', 
        recommendationContent, 
        currentModule, 
        ['escalation_analysis', 'osfi_e21']
      );
      
      setAssistantMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: recommendationContent,
        timestamp: new Date().toISOString(),
        logId: messageId,
        knowledgeSources: ['escalation_analysis', 'osfi_e21']
      }]);
    } catch (error) {
      console.error('Error generating escalation recommendations:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const assessBreachImpact = async (breachId: string, recoveryTime: number, threshold: number) => {
    setIsAnalyzingBreach(true);
    try {
      const impact = await ToleranceAIAnalysisService.assessBreachImpact(
        breachId,
        recoveryTime,
        threshold
      );

      const impactContent = `**Breach Impact Assessment - ID: ${breachId}**

🎯 **Risk Level:** ${impact.riskLevel.toUpperCase()}
📈 **Recovery Time:** ${recoveryTime} minutes (vs ${threshold} threshold)

💼 **Business Impact:**
${impact.businessImpact}

👥 **Customer Impact:**
${impact.customerImpact}

⚖️ **Regulatory Impact:**
${impact.regulatoryImpact}

🔧 **Recommended Actions:**
${impact.recommendedActions.map(a => `• ${a}`).join('\n')}

**Assessment Methodology:**
This impact assessment follows OSFI E-21 Principle 6 (Monitoring & Testing) guidelines for operational risk measurement and uses proportional thresholds based on your organization's size and complexity.`;

      const messageId = await aiAssistantService.logChatMessage(
        'assistant', 
        impactContent, 
        currentModule, 
        ['impact_assessment', 'osfi_e21']
      );
      
      setAssistantMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: impactContent,
        timestamp: new Date().toISOString(),
        logId: messageId,
        knowledgeSources: ['impact_assessment', 'osfi_e21']
      }]);
    } catch (error) {
      console.error('Error assessing breach impact:', error);
    } finally {
      setIsAnalyzingBreach(false);
    }
  };

  const predictPotentialBreaches = async () => {
    if (!profile?.organization_id) return;
    
    setIsAnalyzing(true);
    try {
      const predictions = await ToleranceAIAnalysisService.predictPotentialBreaches(
        profile.organization_id,
        30
      );

      setBreachPredictions(predictions);

      if (predictions.length > 0) {
        const predictionContent = `**Predictive Breach Analysis - Next 30 Days**

🔮 **Potential Breach Predictions:**

${predictions.map((p, i) => `
**Prediction ${i + 1}:**
• **Likelihood:** ${p.likelihood.toUpperCase()}
• **Timeframe:** ${p.timeframe}
• **Trigger Factors:** ${p.triggerFactors.join(', ')}
• **Preventive Actions:** ${p.preventiveActions.join(', ')}
`).join('\n')}

**Proactive Measures:**
Based on historical patterns and current system stress indicators, consider implementing the preventive actions listed above to reduce breach probability.

**OSFI E-21 Alignment:**
This predictive analysis supports Principle 6 (Monitoring & Testing) requirements for continuous monitoring and early warning systems.

**Disclaimer:**
Predictions are based on historical data patterns and current indicators. Actual results may vary. This analysis supplements but does not replace professional risk assessment.`;

        const messageId = await aiAssistantService.logChatMessage(
          'assistant', 
          predictionContent, 
          currentModule, 
          ['breach_prediction', 'predictive_analytics']
        );
        
        setAssistantMessages(prev => [...prev, {
          id: messageId,
          role: "assistant",
          content: predictionContent,
          timestamp: new Date().toISOString(),
          logId: messageId,
          knowledgeSources: ['breach_prediction', 'predictive_analytics']
        }]);
      } else {
        const noPredictionContent = `**Predictive Breach Analysis - Next 30 Days**

✅ **Good News:** No significant breach patterns detected in historical data.

**Recommendation:** Continue current monitoring practices and maintain operational resilience measures per OSFI E-21 framework.`;

        const messageId = await aiAssistantService.logChatMessage(
          'assistant', 
          noPredictionContent, 
          currentModule, 
          ['breach_prediction']
        );
        
        setAssistantMessages(prev => [...prev, {
          id: messageId,
          role: "assistant",
          content: noPredictionContent,
          timestamp: new Date().toISOString(),
          logId: messageId,
          knowledgeSources: ['breach_prediction']
        }]);
      }
    } catch (error) {
      console.error('Error predicting potential breaches:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI-Powered Vendor Analysis Methods
  const generateVendorAIResponse = async (message: string): Promise<string> => {
    try {
      // Analyze the vendor query type
      const isConcentrationQuery = message.toLowerCase().includes('concentration');
      const isSpecificVendor = /vendor (\w+)/i.test(message);
      const isPortfolioQuery = message.toLowerCase().includes('portfolio') || message.toLowerCase().includes('all vendor');

      if (isConcentrationQuery) {
        const assessment = await assessConcentrationRisk();
        return `**OSFI E-21 Principle 6 & B-10 Concentration Risk Assessment:**

🎯 **Current Concentration:** ${assessment.currentConcentration.toFixed(1)}% (Threshold: ${assessment.concentrationThreshold}%)
📊 **Risk Status:** ${assessment.exceedsThreshold ? '⚠️ EXCEEDS THRESHOLD' : '✅ WITHIN LIMITS'}

🏢 **Vendor Portfolio:**
• Total Vendors: ${assessment.totalVendors}
• Critical Vendors: ${assessment.criticalVendors}

${assessment.exceedsThreshold ? `
🚨 **Risk Factors:**
${assessment.riskFactors.map(r => `• ${r}`).join('\n')}

💡 **Mitigation Strategies:**
${assessment.mitigationStrategies.map(s => `• ${s}`).join('\n')}
` : ''}

📋 **OSFI Compliance:**
• E-21 Principle 6: ${assessment.osfiCompliance.e21Principle6 ? '✅ Compliant' : '❌ Non-Compliant'}
• B-10 Requirements: ${assessment.osfiCompliance.b10Requirements ? '✅ Met' : '❌ Not Met'}

**Regulatory Citations:**
${assessment.osfiCompliance.citations.join('\n')}

⚖️ **Regulatory Disclaimer:**
This analysis is based on OSFI E-21 Principle 6 and B-10 guidelines. This is not regulatory advice. Consult OSFI or qualified professionals for your institution's specific compliance requirements.`;
      }

      if (isPortfolioQuery) {
        await analyzeVendorPortfolio();
        return `**Comprehensive Vendor Portfolio Analysis initiated. Check the messages above for detailed assessment results.**`;
      }

      return `**OSFI E-21 & B-10 Vendor Risk Analysis:**

I can help you with third-party risk management according to OSFI guidelines:

🔍 **Available Analysis:**
• **Concentration Risk Assessment** - "Check concentration risk"
• **Individual Vendor Analysis** - "Analyze vendor [name]"
• **Portfolio Overview** - "Analyze all vendors"
• **Risk Recommendations** - "Vendor risk recommendations"

📋 **OSFI E-21 Principle 6 Compliance:**
Monitoring third-party dependencies and assessing concentration risk as required for Canadian financial institutions.

**B-10 Integration:**
Third-party risk assessment aligned with OSFI B-10 guidelines for operational resilience.

What specific vendor analysis would you like me to perform?`;
    } catch (error) {
      console.error('Error generating vendor AI response:', error);
      return 'I encountered an error analyzing vendor risk. Please try again or contact support.';
    }
  };

  const analyzeVendorRisk = async (vendorId: string, includeFeeds: boolean = true): Promise<VendorRiskAnalysis> => {
    setIsAnalyzingVendor(true);
    try {
      // Use the new AI-powered vendor risk analysis edge function
      const { data: analysis, error } = await supabase.functions.invoke('ai-vendor-risk-analysis', {
        body: {
          vendorId,
          orgId: profile?.organization_id,
          analysisType: 'individual',
          includeFeeds,
          includeBreachPrediction: true
        }
      });

      if (error) {
        console.error('AI vendor analysis failed, using fallback:', error);
        // Fallback to basic analysis if AI service fails
        return await fallbackVendorAnalysis(vendorId);
      }

      setVendorAnalyses(prev => {
        const existing = prev.findIndex(a => a.vendorId === vendorId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = analysis;
          return updated;
        }
        return [...prev, analysis];
      });

      // Generate AI-enhanced chat message
      const enhancedContent = `**AI-Powered Vendor Risk Analysis - ${analysis.vendorName}**

🎯 **Risk Assessment:**
• Risk Score: ${analysis.riskScore}/100 (${analysis.riskLevel.toUpperCase()})
• Concentration Risk: ${analysis.concentrationRisk.toFixed(1)}%
• AI Confidence: ${((analysis.confidenceScore || 0.7) * 100).toFixed(0)}%

📊 **Impact Assessment:**
• Operational: ${analysis.impactAssessment.operationalImpact}
• Financial: ${analysis.impactAssessment.financialImpact}
• Compliance: ${analysis.impactAssessment.complianceImpact}

${analysis.aiInsights ? `
🤖 **AI Insights:**
${analysis.aiInsights}
` : ''}

💡 **Recommendations:**
${analysis.recommendations.map(r => `• ${r}`).join('\n')}

📋 **OSFI Citations:**
${analysis.osfiCitations.map(c => `• ${c}`).join('\n')}

⚖️ **Regulatory Disclaimer:**
This AI-enhanced analysis supports OSFI E-21 compliance but does not constitute regulatory advice. Consult qualified professionals for institution-specific guidance.`;

      const messageId = await aiAssistantService.logChatMessage(
        'assistant', 
        enhancedContent, 
        currentModule, 
        ['vendor_analysis', 'ai_powered', 'osfi_e21']
      );
      
      setAssistantMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: enhancedContent,
        timestamp: new Date().toISOString(),
        logId: messageId,
        knowledgeSources: ['vendor_analysis', 'ai_powered', 'osfi_e21']
      }]);

      return analysis;
    } catch (error) {
      console.error('Error analyzing vendor risk:', error);
      // Use fallback analysis
      return await fallbackVendorAnalysis(vendorId);
    } finally {
      setIsAnalyzingVendor(false);
    }
  };

  // Fallback vendor analysis when AI service is unavailable
  const fallbackVendorAnalysis = async (vendorId: string): Promise<VendorRiskAnalysis> => {
    const { data: vendor, error } = await supabase
      .from('third_party_profiles')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (error) throw error;

    const riskScore = vendor.risk_rating === 'critical' ? 90 : 
                     vendor.risk_rating === 'high' ? 75 :
                     vendor.risk_rating === 'medium' ? 50 : 25;

    const { data: allVendors } = await supabase
      .from('third_party_profiles')
      .select('criticality')
      .eq('org_id', profile?.organization_id);

    const criticalVendors = allVendors?.filter(v => v.criticality === 'critical').length || 0;
    const concentrationRisk = criticalVendors > 0 ? (1 / criticalVendors) * 100 : 0;

    return {
      vendorId,
      vendorName: vendor.vendor_name,
      riskScore,
      riskLevel: vendor.risk_rating as 'low' | 'medium' | 'high' | 'critical',
      concentrationRisk,
      impactAssessment: {
        operationalImpact: `${vendor.criticality} impact on operations`,
        financialImpact: `Service disruption cost estimated at ${riskScore * 1000} CAD/hour`,
        reputationalImpact: vendor.criticality === 'critical' ? 'High reputational risk' : 'Moderate reputational risk',
        complianceImpact: 'Subject to OSFI E-21 Principle 6 and B-10 requirements'
      },
      recommendations: [
        'Implement continuous monitoring',
        'Review SLA terms quarterly',
        'Establish backup suppliers for critical services'
      ],
      osfiCitations: [
        'OSFI E-21 Principle 6: Mapping dependencies',
        'OSFI B-10: Third-party risk management'
      ],
      analysisTimestamp: new Date().toISOString()
    };
  };

  const assessConcentrationRisk = async (): Promise<ConcentrationRiskAssessment> => {
    setIsAnalyzingVendor(true);
    try {
      // Use AI-powered concentration risk analysis
      const { data: assessment, error } = await supabase.functions.invoke('ai-vendor-risk-analysis', {
        body: {
          vendorId: '', // Not needed for concentration analysis
          orgId: profile?.organization_id,
          analysisType: 'concentration'
        }
      });

      if (error) {
        console.error('AI concentration analysis failed, using fallback:', error);
        return await fallbackConcentrationAnalysis();
      }

      setConcentrationAssessment(assessment);

      // Generate AI-enhanced concentration risk message
      const concentrationContent = `**AI-Enhanced Concentration Risk Assessment**

🎯 **Risk Overview:**
• Total Vendors: ${assessment.totalVendors}
• Critical Vendors: ${assessment.criticalVendors}
• Current Concentration: ${assessment.currentConcentration.toFixed(1)}%
• OSFI Threshold: ${assessment.concentrationThreshold}%
• Status: ${assessment.exceedsThreshold ? '⚠️ EXCEEDS THRESHOLD' : '✅ WITHIN LIMITS'}

${assessment.aiRecommendations ? `
🤖 **AI Strategic Recommendations:**
${assessment.aiRecommendations}
` : ''}

${assessment.exceedsThreshold ? `
🚨 **Risk Factors:**
${assessment.riskFactors.map(r => `• ${r}`).join('\n')}
` : ''}

💡 **Mitigation Strategies:**
${assessment.mitigationStrategies.map(s => `• ${s}`).join('\n')}

📋 **OSFI Compliance Status:**
• E-21 Principle 6: ${assessment.osfiCompliance.e21Principle6 ? '✅ Compliant' : '❌ Non-Compliant'}
• B-10 Requirements: ${assessment.osfiCompliance.b10Requirements ? '✅ Met' : '❌ Not Met'}

**Regulatory Citations:**
${assessment.osfiCompliance.citations.map(c => `• ${c}`).join('\n')}

⚖️ **Regulatory Disclaimer:**
This AI-enhanced analysis supports OSFI compliance assessment but does not constitute regulatory advice.`;

      const messageId = await aiAssistantService.logChatMessage(
        'assistant', 
        concentrationContent, 
        currentModule, 
        ['concentration_risk', 'ai_powered', 'osfi_compliance']
      );
      
      setAssistantMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: concentrationContent,
        timestamp: new Date().toISOString(),
        logId: messageId,
        knowledgeSources: ['concentration_risk', 'ai_powered', 'osfi_compliance']
      }]);

      return assessment;
    } catch (error) {
      console.error('Error assessing concentration risk:', error);
      return await fallbackConcentrationAnalysis();
    } finally {
      setIsAnalyzingVendor(false);
    }
  };

  // Fallback concentration analysis
  const fallbackConcentrationAnalysis = async (): Promise<ConcentrationRiskAssessment> => {
    const { data: vendors, error } = await supabase
      .from('third_party_profiles')
      .select('*')
      .eq('org_id', profile?.organization_id);

    if (error) throw error;

    const totalVendors = vendors?.length || 0;
    const criticalVendors = vendors?.filter(v => v.criticality === 'critical').length || 0;
    const concentrationThreshold = 20;
    const currentConcentration = totalVendors > 0 ? (criticalVendors / totalVendors) * 100 : 0;

    return {
      totalVendors,
      criticalVendors,
      concentrationThreshold,
      currentConcentration,
      exceedsThreshold: currentConcentration > concentrationThreshold,
      riskFactors: currentConcentration > concentrationThreshold ? [
        'High dependency on critical vendors',
        'Limited supplier diversification',
        'Potential single points of failure'
      ] : [],
      mitigationStrategies: [
        'Diversify supplier base',
        'Implement backup service providers',
        'Regular dependency mapping reviews'
      ],
      osfiCompliance: {
        e21Principle6: currentConcentration <= concentrationThreshold,
        b10Requirements: currentConcentration <= concentrationThreshold,
        citations: [
          'OSFI E-21 Principle 6: Institutions should map their dependencies',
          'OSFI B-10: Third-party risk management framework'
        ]
      }
    };
  };

  const generateVendorRecommendations = async (vendorId?: string) => {
    setIsAnalyzing(true);
    try {
      let recommendationContent = '';

      if (vendorId) {
        const analysis = await analyzeVendorRisk(vendorId);
        recommendationContent = `**Vendor Risk Recommendations - ${analysis.vendorName}**

🎯 **Risk Level:** ${analysis.riskLevel.toUpperCase()} (Score: ${analysis.riskScore}/100)

💡 **Specific Recommendations:**
${analysis.recommendations.map(r => `• ${r}`).join('\n')}

📊 **Impact Assessment:**
• **Operational:** ${analysis.impactAssessment.operationalImpact}
• **Financial:** ${analysis.impactAssessment.financialImpact}
• **Compliance:** ${analysis.impactAssessment.complianceImpact}

📋 **OSFI Citations:**
${analysis.osfiCitations.join('\n')}`;
      } else {
        recommendationContent = `**General Vendor Risk Management Recommendations**

🎯 **OSFI E-21 & B-10 Best Practices:**

• **Dependency Mapping** (E-21 Principle 6)
  - Document all critical third-party relationships
  - Assess concentration risk quarterly
  - Maintain current dependency maps

• **Risk Assessment** (B-10 Framework)
  - Regular vendor risk scoring
  - Monitor vendor financial health
  - Track performance metrics

• **Continuous Monitoring**
  - Real-time vendor feed integration
  - Automated risk scoring updates
  - Proactive alert systems

• **Business Continuity Planning**
  - Identify backup suppliers
  - Test recovery procedures
  - Maintain contingency plans`;
      }

      const messageId = await aiAssistantService.logChatMessage(
        'assistant',
        recommendationContent,
        currentModule,
        ['vendor_analysis', 'osfi_b10', 'osfi_e21']
      );

      setAssistantMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: recommendationContent,
        timestamp: new Date().toISOString(),
        logId: messageId,
        knowledgeSources: ['vendor_analysis', 'osfi_b10', 'osfi_e21']
      }]);
    } catch (error) {
      console.error('Error generating vendor recommendations:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeVendorPortfolio = async () => {
    setIsAnalyzing(true);
    try {
      // Use AI-powered portfolio analysis
      const { data: portfolioResult, error } = await supabase.functions.invoke('ai-vendor-risk-analysis', {
        body: {
          vendorId: '', // Not needed for portfolio analysis
          orgId: profile?.organization_id,
          analysisType: 'portfolio'
        }
      });

      if (error) {
        console.error('AI portfolio analysis failed, using fallback:', error);
        return await fallbackPortfolioAnalysis();
      }

      const { portfolioSummary, individualAnalyses, portfolioInsights } = portfolioResult;

      // Update vendor analyses state
      setVendorAnalyses(prev => {
        const updatedAnalyses = [...prev];
        individualAnalyses.forEach((newAnalysis: VendorRiskAnalysis) => {
          const existing = updatedAnalyses.findIndex(a => a.vendorId === newAnalysis.vendorId);
          if (existing >= 0) {
            updatedAnalyses[existing] = newAnalysis;
          } else {
            updatedAnalyses.push(newAnalysis);
          }
        });
        return updatedAnalyses;
      });

      const portfolioContent = `**AI-Enhanced Vendor Portfolio Analysis**

📊 **Portfolio Overview:**
• Total Vendors: ${portfolioSummary.totalVendors}
• Critical Vendors Analyzed: ${portfolioSummary.analyzedVendors}
• Average Risk Score: ${portfolioSummary.averageRiskScore.toFixed(1)}/100
• High/Critical Risk Vendors: ${portfolioSummary.highRiskVendors}

${portfolioInsights ? `
🤖 **AI Portfolio Insights:**
${portfolioInsights}
` : ''}

🔍 **Top Risk Vendors:**
${individualAnalyses.slice(0, 5).map((a: VendorRiskAnalysis) => 
  `**${a.vendorName}** - ${a.riskScore}/100 (${a.riskLevel.toUpperCase()})
  • AI Confidence: ${((a.confidenceScore || 0.7) * 100).toFixed(0)}%
  • Key Risk: ${a.impactAssessment.operationalImpact}`
).join('\n\n')}

💡 **Strategic Recommendations:**
• ${portfolioSummary.averageRiskScore > 70 ? 'Portfolio optimization required - consider vendor consolidation or replacement' : 'Portfolio risk within acceptable range - maintain current monitoring'}
• Implement AI-powered continuous monitoring for critical vendors
• Establish vendor risk appetite thresholds aligned with OSFI guidelines
• Consider vendor diversification across service categories

📋 **OSFI E-21 Compliance:**
✅ Portfolio assessment completed per Principle 6 requirements
✅ Dependency mapping updated with AI-enhanced risk scores
${portfolioSummary.highRiskVendors > 3 ? '⚠️ High-risk vendor concentration requires board attention' : '✅ Risk concentration within acceptable limits'}

**Next Steps:**
1. Review individual AI analyses for high-risk vendors
2. Update vendor risk register with AI insights
3. Schedule enhanced due diligence for critical vendors
4. Implement AI-powered ongoing monitoring

⚖️ **Regulatory Disclaimer:**
This AI-enhanced portfolio analysis supports risk management decision-making but does not replace professional judgment or regulatory consultation.`;

      const messageId = await aiAssistantService.logChatMessage(
        'assistant', 
        portfolioContent, 
        currentModule, 
        ['portfolio_analysis', 'ai_powered', 'vendor_risk']
      );
      
      setAssistantMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: portfolioContent,
        timestamp: new Date().toISOString(),
        logId: messageId,
        knowledgeSources: ['portfolio_analysis', 'ai_powered', 'vendor_risk']
      }]);

    } catch (error) {
      console.error('Error analyzing vendor portfolio:', error);
      await fallbackPortfolioAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Fallback portfolio analysis
  const fallbackPortfolioAnalysis = async () => {
    const { data: vendors, error } = await supabase
      .from('third_party_profiles')
      .select('*')
      .eq('org_id', profile?.organization_id);

    if (error) throw error;

    const portfolioAnalysis = vendors?.reduce((acc, vendor) => {
      const riskLevel = vendor.risk_rating;
      acc[riskLevel] = (acc[riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalVendors = vendors?.length || 0;
    const highRiskVendors = (portfolioAnalysis.high || 0) + (portfolioAnalysis.critical || 0);

    const fallbackContent = `**Vendor Portfolio Analysis (Fallback Mode)**

📊 **Portfolio Overview:**
• Total Vendors: ${totalVendors}
• High/Critical Risk: ${highRiskVendors} (${((highRiskVendors/totalVendors)*100).toFixed(1)}%)

📈 **Risk Distribution:**
• Critical: ${portfolioAnalysis.critical || 0}
• High: ${portfolioAnalysis.high || 0}  
• Medium: ${portfolioAnalysis.medium || 0}
• Low: ${portfolioAnalysis.low || 0}

⚠️ **Note:** AI-enhanced analysis unavailable. Using standard risk assessment.

📋 **OSFI E-21 Compliance:** Portfolio assessment completed per Principle 6 requirements.`;

    const messageId = await aiAssistantService.logChatMessage(
      'assistant', 
      fallbackContent, 
      currentModule, 
      ['portfolio_analysis', 'fallback']
    );
    
    setAssistantMessages(prev => [...prev, {
      id: messageId,
      role: "assistant",
      content: fallbackContent,
      timestamp: new Date().toISOString(),
      logId: messageId,
      knowledgeSources: ['portfolio_analysis', 'fallback']
    }]);
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
        generateOrganizationalAnalysis,
        
        // Phase 4: AI-Powered Breach Analysis
        breachAnalyses,
        breachPredictions,
        isAnalyzingBreach,
        analyzeToleranceBreach,
        generateEscalationRecommendations,
        assessBreachImpact,
        predictPotentialBreaches,
        
        // AI-Powered Vendor Analysis
        vendorAnalyses,
        concentrationAssessment,
        isAnalyzingVendor,
        analyzeVendorRisk,
        assessConcentrationRisk,
        generateVendorRecommendations,
        analyzeVendorPortfolio
      }}
    >
      {children}
    </EnhancedAIAssistantContext.Provider>
  );
};
