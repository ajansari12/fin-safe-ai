
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { supabase } from "@/integrations/supabase/client";

// Define types for a message
interface AIMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
}

// Define organization sector types
export type OrgSector = "banking" | "insurance" | "fintech" | "investment" | "other";

// Define organization size types
export type OrgSize = "small" | "medium" | "large" | "enterprise";

// Define the AI knowledge domains
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

interface AIAssistantContextType {
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
  explainTerm: (term: string) => void;
  suggestKRIs: (category: string) => void;
  guideSetup: (step: string) => void;
  summarizeContent: (content: string) => void;
  knowledgeSources: KnowledgeSource[];
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error("useAIAssistant must be used within an AIAssistantProvider");
  }
  return context;
};

export const AIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [orgSector, setOrgSector] = useState<OrgSector | null>(null);
  const [orgSize, setOrgSize] = useState<OrgSize | null>(null);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const { user, profile } = useAuth();
  
  const [assistantMessages, setAssistantMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your ResilientFI assistant. I can help you understand operational resilience requirements, guide you through setup, and offer suggestions based on your specific needs."
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);

  // Load user context data
  useEffect(() => {
    if (profile) {
      setUserRole(profile.role || null);
      
      // Use default values for organization context since we don't have the organizations table yet
      // This will be replaced once the database schema is updated
      setOrgSector("banking");
      setOrgSize("medium");
    }
  }, [profile]);
  
  // Load knowledge base data
  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  // Function to load knowledge base
  const loadKnowledgeBase = async () => {
    try {
      // Since the knowledge_base table doesn't exist yet, we'll use the mock data instead
      // This would be replaced with a real database query once the schema is updated
      console.log("Using mock knowledge base data");
      setKnowledgeSources(mockKnowledgeSources);
    } catch (error) {
      console.error("Error loading knowledge base:", error);
      // Fallback to mock data
      setKnowledgeSources(mockKnowledgeSources);
    }
  };

  // Mock knowledge sources for development
  const mockKnowledgeSources: KnowledgeSource[] = [
    {
      id: "e-21",
      title: "OSFI E-21 Guideline",
      domain: "E-21",
      sections: [
        {
          title: "Introduction",
          content: "OSFI Guideline E-21 establishes expectations for federally regulated financial institutions (FRFIs) to develop robust approaches to operational risk management."
        },
        {
          title: "Operational Risk Management Framework",
          content: "The ORMF is the set of interrelated tools and processes that a FRFI uses to identify, assess, measure, monitor, and respond to operational risks."
        },
        {
          title: "Key Definitions",
          content: "Operational risk is the risk of loss resulting from people, inadequate or failed internal processes and systems, or from external events. Operational resilience is the ability of a FRFI to deliver critical operations through disruption."
        }
      ]
    },
    {
      id: "iso-22301",
      title: "ISO 22301",
      domain: "ISO-22301",
      sections: [
        {
          title: "Overview",
          content: "ISO 22301 is the international standard for Business Continuity Management Systems (BCMS). It provides a framework to plan, establish, implement, operate, monitor, review, maintain and continually improve a business continuity management system."
        },
        {
          title: "Business Impact Analysis",
          content: "BIA is the process of analyzing the impact over time of a disruption on the organization. It helps identify time-critical functions, their recovery priorities, and resource requirements."
        }
      ]
    }
  ];

  // Search knowledge base for relevant information
  const searchKnowledgeBase = (query: string): string | null => {
    const normalizedQuery = query.toLowerCase();
    
    for (const source of knowledgeSources) {
      for (const section of source.sections) {
        if (
          section.title.toLowerCase().includes(normalizedQuery) ||
          section.content.toLowerCase().includes(normalizedQuery)
        ) {
          return `${section.content}\n\nSource: ${source.title}, ${section.title}`;
        }
      }
    }
    
    return null;
  };

  // Function to generate AI response
  const generateAIResponse = async (message: string, context: any) => {
    setIsLoading(true);
    
    try {
      // Check if we can find relevant information in the knowledge base
      const knowledgeBaseInfo = searchKnowledgeBase(message);
      
      // In a production environment, this would call an edge function
      // that interfaces with an AI service like OpenAI
      // For now, we'll enhance our simulated responses with context and knowledge base
      
      let aiResponse = "";
      const moduleContext = currentModule || "general";
      
      // Simulate AI response based on current module and message
      switch (moduleContext) {
        case "governance-framework":
          aiResponse = simulateGovernanceResponse(message);
          break;
        case "risk-appetite":
          aiResponse = simulateRiskResponse(message);
          break;
        case "impact-tolerances":
          aiResponse = simulateToleranceResponse(message);
          break;
        case "business-functions":
          aiResponse = simulateBusinessFunctionsResponse(message);
          break;
        case "dependencies":
          aiResponse = simulateDependenciesResponse(message);
          break;
        case "scenario-testing":
          aiResponse = simulateScenarioTestingResponse(message);
          break;
        case "business-continuity":
          aiResponse = simulateBusinessContinuityResponse(message);
          break;
        case "third-party-risk":
          aiResponse = simulateThirdPartyRiskResponse(message);
          break;
        case "controls-and-kri":
          aiResponse = simulateControlsResponse(message);
          break;
        case "incident-log":
          aiResponse = simulateIncidentResponse(message);
          break;
        default:
          aiResponse = simulateGeneralResponse(message);
      }
      
      // Add knowledge base information if available
      if (knowledgeBaseInfo) {
        aiResponse = `Based on our knowledge base:\n\n${knowledgeBaseInfo}\n\n${aiResponse}`;
      }
      
      // Add user role context if available
      if (userRole) {
        aiResponse += getContextualAdvice(userRole);
      }
      
      // Add organization context if available
      if (orgSector) {
        aiResponse += getSectorAdvice(orgSector);
      }
      
      // Simulate a delay to make it feel more natural
      setTimeout(() => {
        // Add the AI response
        setAssistantMessages(prev => [
          ...prev,
          {
            id: `response-${Date.now()}`,
            role: "assistant",
            content: aiResponse
          }
        ]);
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error generating AI response:", error);
      
      // Add error message
      setAssistantMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I'm sorry, I encountered an error processing your request. Please try again later."
        }
      ]);
      
      setIsLoading(false);
    }
  };
  
  // Helper functions for simulating different response types
  const simulateGovernanceResponse = (message: string) => {
    if (message.toLowerCase().includes("committee")) {
      return "Governance committees are essential for operational resilience. OSFI E-21 guidelines recommend establishing a dedicated operational resilience committee with representatives from key business functions. This ensures proper oversight and accountability.";
    }
    
    if (message.toLowerCase().includes("roles") || message.toLowerCase().includes("responsibilities")) {
      return "Clear roles and responsibilities are a cornerstone of effective governance. Consider defining roles for: Board of Directors (oversight), CRO (risk integration), CISO (cyber resilience), and Business Line Leaders (operational implementation).";
    }
    
    return "Governance frameworks should establish clear accountability, oversight processes, and reporting lines for operational resilience. They should align with your organization's overall risk management approach.";
  };
  
  const simulateRiskResponse = (message: string) => {
    if (message.toLowerCase().includes("threshold") || message.toLowerCase().includes("limit")) {
      return "Risk thresholds should be set based on your organization's risk appetite. For financial institutions, OSFI recommends defining specific metrics and limits for operational disruptions, with clear escalation triggers.";
    }
    
    if (message.toLowerCase().includes("kri") || message.toLowerCase().includes("indicator")) {
      return "Effective KRIs for operational resilience typically include: system availability percentage, recovery time metrics, incident response times, and third-party service level compliance. These should be regularly monitored and reported.";
    }
    
    return "Your risk appetite statement should clearly articulate the organization's tolerance for operational disruptions across different business functions, considering both quantitative metrics and qualitative assessments.";
  };
  
  const simulateToleranceResponse = (message: string) => {
    return "Impact tolerances define the maximum acceptable level of disruption to a business service. They should be expressed in terms of maximum tolerable downtime, data loss, or other relevant metrics specific to each critical business function.";
  };
  
  const simulateBusinessFunctionsResponse = (message: string) => {
    return "When mapping critical business functions, focus on identifying processes that directly support customer outcomes, financial stability, or regulatory compliance. Consider both front-office and back-office functions that are essential to your operations.";
  };
  
  const simulateDependenciesResponse = (message: string) => {
    return "Mapping dependencies requires identifying all internal and external resources required to deliver critical business services. This includes IT systems, third parties, staff, facilities, and data. Document both upstream and downstream dependencies for a complete view.";
  };
  
  const simulateScenarioTestingResponse = (message: string) => {
    return "Effective scenario testing should include severe but plausible scenarios based on your risk profile. Consider cyber attacks, technology failures, third-party outages, and natural disasters. The scenarios should test your ability to stay within impact tolerances.";
  };
  
  const simulateBusinessContinuityResponse = (message: string) => {
    return "Modern business continuity plans should focus on outcomes rather than just processes. Ensure plans are regularly tested, address dependencies, and include clear communication protocols. ISO 22301 provides a comprehensive framework for business continuity management.";
  };
  
  const simulateThirdPartyRiskResponse = (message: string) => {
    return "OSFI B-10 requires financial institutions to have a comprehensive third-party risk management program. This should include risk assessment, due diligence, contractual protections, and ongoing monitoring for all critical service providers.";
  };
  
  const simulateControlsResponse = (message: string) => {
    return "Controls should be designed based on your specific risks and aligned with your risk appetite. Implement both preventive and detective controls, and ensure they are regularly tested for effectiveness. Document control ownership and testing procedures clearly.";
  };
  
  const simulateIncidentResponse = (message: string) => {
    return "Incident management processes should enable quick detection, classification, and response to operational disruptions. Establish clear escalation paths, communication protocols, and roles for incident response teams. Document lessons learned from each incident.";
  };
  
  const simulateGeneralResponse = (message: string) => {
    if (message.toLowerCase().includes("e-21") || message.toLowerCase().includes("guideline")) {
      return "OSFI Guideline E-21 establishes expectations for federally regulated financial institutions (FRFIs) to develop robust approaches to operational risk management. It emphasizes a principles-based approach focusing on sound operational risk governance, management, and assessment.";
    }
    
    if (message.toLowerCase().includes("iso") || message.toLowerCase().includes("22301")) {
      return "ISO 22301 is the international standard for Business Continuity Management Systems (BCMS). It provides a framework to plan, establish, implement, operate, monitor, review, maintain and continually improve a business continuity management system.";
    }
    
    return "I can help you understand operational resilience requirements, guide you through setup processes, and offer suggestions based on regulatory guidance and industry best practices.";
  };
  
  const getContextualAdvice = (role: string) => {
    switch (role.toLowerCase()) {
      case "cro":
      case "risk officer":
        return "\n\nAs a Risk Officer, you may want to ensure this is properly documented in your risk register and that appropriate controls are implemented.";
      case "ciso":
        return "\n\nFrom a security perspective, you should consider how this relates to your organization's cyber resilience strategy.";
      case "board":
      case "executive":
        return "\n\nAs an executive, you'll want to ensure this is aligned with strategic objectives and that proper reporting mechanisms are in place.";
      case "compliance":
        return "\n\nFrom a compliance perspective, ensure these elements are properly documented and regularly reviewed to meet regulatory expectations.";
      default:
        return "";
    }
  };
  
  const getSectorAdvice = (sector: OrgSector) => {
    switch (sector) {
      case "banking":
        return "\n\nFor banking institutions, this should align with prudential regulatory requirements, particularly OSFI guidelines on operational resilience.";
      case "insurance":
        return "\n\nInsurance providers should consider policyholder protection and claim processing capabilities when implementing this.";
      case "fintech":
        return "\n\nAs a fintech organization, focus on digital service availability and data protection aspects of this requirement.";
      case "investment":
        return "\n\nInvestment firms should consider market access and transaction processing capabilities as key resilience priorities.";
      default:
        return "";
    }
  };

  // Function to add a user message and generate a response
  const addUserMessage = (message: string) => {
    // Create a unique ID for the message
    const messageId = `msg-${Date.now()}`;
    
    // Add the user message to the conversation
    setAssistantMessages(prev => [
      ...prev,
      {
        id: messageId,
        role: "user",
        content: message
      }
    ]);
    
    // Generate AI response with context
    generateAIResponse(message, {
      module: currentModule,
      userRole,
      orgSector,
      orgSize
    });
  };
  
  // Function to explain an E-21 term or requirement
  const explainTerm = (term: string) => {
    addUserMessage(`Can you explain the term "${term}" in the context of operational resilience?`);
  };
  
  // Function to suggest KRIs or impact thresholds
  const suggestKRIs = (category: string) => {
    addUserMessage(`What are some recommended KRIs for ${category}?`);
  };
  
  // Function to guide through setup steps
  const guideSetup = (step: string) => {
    addUserMessage(`How should I approach setting up ${step}?`);
  };
  
  // Function to summarize content
  const summarizeContent = (content: string) => {
    addUserMessage(`Can you summarize this information: ${content.substring(0, 100)}...`);
  };

  return (
    <AIAssistantContext.Provider 
      value={{ 
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
        explainTerm,
        suggestKRIs,
        guideSetup,
        summarizeContent,
        knowledgeSources
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
};
