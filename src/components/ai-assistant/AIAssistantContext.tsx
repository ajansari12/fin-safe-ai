
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

type AssistantContextType = {
  userRole: string | null;
  currentModule: string | null;
  sector: string | null;
  orgSize: string | null;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  assistantMessages: AssistantMessage[];
  addUserMessage: (message: string) => void;
  isLoading: boolean;
};

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
};

// Default context values
const defaultContext: AssistantContextType = {
  userRole: null,
  currentModule: null,
  sector: null,
  orgSize: null,
  isAssistantOpen: false,
  setIsAssistantOpen: () => {},
  assistantMessages: [],
  addUserMessage: () => {},
  isLoading: false,
};

const AIAssistantContext = createContext<AssistantContextType>(defaultContext);

export const useAIAssistant = () => useContext(AIAssistantContext);

// Helper to determine current module from URL path
const getModuleFromPath = (path: string): string | null => {
  const moduleMap: Record<string, string> = {
    "/governance-framework": "Governance",
    "/risk-appetite": "Risk Appetite",
    "/impact-tolerances": "Impact Tolerances",
    "/business-functions": "Business Functions",
    "/dependencies": "Dependencies",
    "/scenario-testing": "Scenario Testing",
    "/business-continuity": "Business Continuity",
    "/third-party-risk": "Third-Party Risk",
    "/controls-and-kri": "Controls & KRIs",
    "/incident-log": "Incident Log",
    "/audit-and-compliance": "Audit & Compliance",
    "/workflow-center": "Workflow Center",
    "/dashboard": "Dashboard",
  };

  return moduleMap[path] || null;
};

// Generate system prompt based on context
const generateSystemPrompt = (
  role: string | null,
  module: string | null,
  sector: string | null,
  orgSize: string | null
): string => {
  return `You are a helpful AI assistant for the ResilientFI platform, an operational resilience management system for financial institutions.

Current context:
${role ? `- User role: ${role}` : ""}
${module ? `- Current module: ${module}` : ""}
${sector ? `- Organization sector: ${sector}` : ""}
${orgSize ? `- Organization size: ${orgSize}` : ""}

You should:
- Provide concise answers about OSFI E-21 Guidelines, ISO 22301, and other operational resilience standards
- Guide users through setting up their operational resilience frameworks
- Offer suggestions appropriate to their context
- Explain any operational resilience terms or concepts
- Help interpret regulatory requirements

Keep responses brief, practical and tailored to the financial sector.`;
};

export const AIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();
  
  // Derive context information
  const userRole = profile?.role || null;
  const currentModule = getModuleFromPath(location.pathname);
  
  // These would typically come from user settings or organization profile
  // For now, we'll use placeholders
  const sector = "Banking"; // This would come from organization settings
  const orgSize = "Medium"; // This would come from organization settings

  // Initialize system message when context changes
  useEffect(() => {
    if (assistantMessages.length === 0) {
      const systemPrompt = generateSystemPrompt(userRole, currentModule, sector, orgSize);
      
      setAssistantMessages([
        {
          id: "system-1",
          role: "system",
          content: systemPrompt,
          timestamp: new Date(),
        },
        {
          id: "assistant-1",
          role: "assistant",
          content: "Hello! I'm your ResilientFI assistant. How can I help you with operational resilience today?",
          timestamp: new Date(),
        }
      ]);
    }
  }, [userRole, currentModule, sector, orgSize]);
  
  // Update system message when context changes
  useEffect(() => {
    if (assistantMessages.length > 0) {
      const systemPrompt = generateSystemPrompt(userRole, currentModule, sector, orgSize);
      
      setAssistantMessages(messages => {
        const updatedMessages = [...messages];
        const systemMessageIndex = updatedMessages.findIndex(m => m.role === "system");
        
        if (systemMessageIndex !== -1) {
          updatedMessages[systemMessageIndex] = {
            ...updatedMessages[systemMessageIndex],
            content: systemPrompt,
          };
        }
        
        return updatedMessages;
      });
    }
  }, [userRole, currentModule, sector, orgSize]);

  const addUserMessage = async (message: string) => {
    // Add user message to the chat
    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    
    setAssistantMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Simulate AI response - in a real app, this would call an API
      setTimeout(() => {
        // Generate context-aware response based on current module
        let response = "";
        
        if (message.toLowerCase().includes("e-21") || message.toLowerCase().includes("osfi")) {
          response = "OSFI Guideline E-21 is a regulatory framework that sets expectations for operational risk management in federally regulated financial institutions (FRFIs) in Canada. It emphasizes the importance of identifying, assessing, and mitigating operational risks to ensure business continuity and resilience.";
        } else if (message.toLowerCase().includes("impact tolerance")) {
          response = "Impact tolerances define the maximum tolerable level of disruption to a critical business service, including the maximum tolerable duration of disruption. They help organizations determine their resilience priorities and measure their ability to recover from operational disruptions.";
        } else if (message.toLowerCase().includes("kri") || message.toLowerCase().includes("key risk indicator")) {
          response = "Key Risk Indicators (KRIs) are metrics that provide early warnings about increasing risk exposures in various areas of your organization. For operational resilience, effective KRIs might include system uptime, incident response times, or third-party service level adherence.";
        } else if (currentModule === "Governance") {
          response = "For governance frameworks, consider establishing clear roles and responsibilities, creating a dedicated operational resilience committee, and ensuring board-level oversight of your resilience program.";
        } else if (currentModule === "Risk Appetite") {
          response = "When defining your risk appetite, consider your organization's strategic objectives, regulatory requirements, and customer expectations. Your risk appetite statement should be specific, measurable, and aligned with your business strategy.";
        } else {
          response = "I understand you're asking about " + message + ". How can I provide more specific guidance related to your operational resilience program?";
        }
        
        const assistantMessage: AssistantMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };
        
        setAssistantMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      setIsLoading(false);
      
      // Add error message
      const errorMessage: AssistantMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      };
      
      setAssistantMessages(prev => [...prev, errorMessage]);
    }
  };

  const value = {
    userRole,
    currentModule,
    sector,
    orgSize,
    isAssistantOpen,
    setIsAssistantOpen,
    assistantMessages,
    addUserMessage,
    isLoading
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
};
