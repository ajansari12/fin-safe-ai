
import React, { createContext, useContext, useState, useEffect } from 'react';

export type ModuleType = 
  | 'dashboard'
  | 'risk_appetite'
  | 'controls_kris'
  | 'third_party_risk'
  | 'governance_framework'
  | 'business_continuity'
  | 'analytics'
  | 'osfi_compliance'
  | 'operational_resilience'
  | 'framework_management'
  | 'scenario_testing'
  | 'technology_cyber_risk';

interface EnhancedAIAssistantContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentModule: ModuleType;
  setCurrentModule: (module: ModuleType) => void;
  conversationHistory: any[];
  addMessage: (message: any) => void;
  clearHistory: () => void;
}

const EnhancedAIAssistantContext = createContext<EnhancedAIAssistantContextType | undefined>(undefined);

export const EnhancedAIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  const addMessage = (message: any) => {
    setConversationHistory(prev => [...prev, message]);
  };

  const clearHistory = () => {
    setConversationHistory([]);
  };

  // Update conversation context when module changes
  useEffect(() => {
    const moduleContext = {
      module: currentModule,
      timestamp: new Date().toISOString(),
      context: getModuleContext(currentModule)
    };

    setConversationHistory(prev => [
      ...prev,
      {
        type: 'system',
        content: `User navigated to ${currentModule} module`,
        metadata: moduleContext
      }
    ]);
  }, [currentModule]);

  const getModuleContext = (module: ModuleType) => {
    const contextMap = {
      dashboard: "Main dashboard with risk metrics and KRI overview",
      risk_appetite: "Risk appetite statement management and threshold configuration",
      controls_kris: "Control framework and Key Risk Indicator management",
      third_party_risk: "Vendor risk assessment and third-party relationship management",
      governance_framework: "Governance structure, policies, and accountability frameworks",
      business_continuity: "Business continuity planning and disaster recovery",
      analytics: "Advanced analytics, predictive insights, and AI-powered risk analysis",
      osfi_compliance: "OSFI E-21 compliance monitoring and regulatory reporting",
      operational_resilience: "Critical operations mapping, impact tolerances, and scenario testing",
      framework_management: "Risk management framework configuration and methodology management",
      scenario_testing: "Scenario testing library, execution planning, and results analysis",
      technology_cyber_risk: "IT asset management, vulnerability assessment, and cyber risk management"
    };

    return contextMap[module] || "General risk management context";
  };

  const value = {
    isOpen,
    setIsOpen,
    currentModule,
    setCurrentModule,
    conversationHistory,
    addMessage,
    clearHistory
  };

  return (
    <EnhancedAIAssistantContext.Provider value={value}>
      {children}
    </EnhancedAIAssistantContext.Provider>
  );
};

export const useEnhancedAIAssistant = () => {
  const context = useContext(EnhancedAIAssistantContext);
  if (context === undefined) {
    throw new Error('useEnhancedAIAssistant must be used within an EnhancedAIAssistantProvider');
  }
  return context;
};
