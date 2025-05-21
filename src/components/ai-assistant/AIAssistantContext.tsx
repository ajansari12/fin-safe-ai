
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
      
      // If we have an organization ID, load organization data
      if (profile.organization_id) {
        loadOrganizationData(profile.organization_id);
      }
    }
  }, [profile]);
  
  // Function to load organization data
  const loadOrganizationData = async (orgId: string) => {
    try {
      // In a real implementation, this would fetch the organization details
      // from the database. For now, we'll use placeholder data
      setOrgSector("banking");
      setOrgSize("medium");
    } catch (error) {
      console.error("Error loading organization data:", error);
    }
  };

  // Function to generate context-aware AI responses
  const generateAIResponse = async (message: string, context: any) => {
    setIsLoading(true);
    
    try {
      // In a production environment, this would call an edge function
      // that interfaces with an AI service like OpenAI
      // For now, we'll simulate responses based on context
      
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
        default:
          aiResponse = simulateGeneralResponse(message);
      }
      
      // Add user role context if available
      if (userRole) {
        aiResponse += getContextualAdvice(userRole);
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
        summarizeContent
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
};
