
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
  | 'technology_cyber_risk'
  | 'breach-management'
  | 'tolerance-monitoring'
  | 'osfi-compliance'
  | 'organizational-intelligence'
  | 'workflow-orchestration';

interface EnhancedAIAssistantContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentModule: ModuleType;
  setCurrentModule: (module: ModuleType) => void;
  conversationHistory: any[];
  addMessage: (message: any) => void;
  clearHistory: () => void;
  
  // AI Assistant features
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  assistantMessages: any[];
  addUserMessage: (message: string) => void;
  isLoading: boolean;
  isAnalyzing: boolean;
  isAnalyzingBreach: boolean;
  
  // Analysis features
  workflowAnalysis: any[];
  riskSummary: any[];
  sectorRecommendations: any[];
  
  // Cost and testing metrics
  costMetrics: any;
  testResults: any[];
  isTestingQueries: boolean;
  
  // AI Functions
  executeBankLikeQuery: (query: string) => Promise<void>;
  runBankTestSuite: () => Promise<void>;
  resetCostMetrics: () => void;
  getCostReport: () => any;
  generateWorkflowReport: () => Promise<any>;
  generateExecutiveReport: () => Promise<any>;
  getSectorGuidance: (sector: string) => Promise<any>;
  provideFeedback: (feedback: any) => Promise<void>;
  generateOrganizationalAnalysis: () => Promise<any>;
  analyzeToleranceBreach: (breach: any) => Promise<any>;
  assessBreachImpact: (breach: any) => Promise<any>;
  predictPotentialBreaches: () => Promise<any>;
}

const EnhancedAIAssistantContext = createContext<EnhancedAIAssistantContextType | undefined>(undefined);

export const EnhancedAIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  
  // Additional state for AI Assistant features
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingBreach, setIsAnalyzingBreach] = useState(false);
  const [workflowAnalysis, setWorkflowAnalysis] = useState<any[]>([]);
  const [riskSummary, setRiskSummary] = useState<any[]>([]);
  const [sectorRecommendations, setSectorRecommendations] = useState<any[]>([]);
  const [costMetrics, setCostMetrics] = useState<any>({});
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTestingQueries, setIsTestingQueries] = useState(false);

  const addMessage = (message: any) => {
    setConversationHistory(prev => [...prev, message]);
  };

  const clearHistory = () => {
    setConversationHistory([]);
  };

  const addUserMessage = (message: string) => {
    setAssistantMessages(prev => [...prev, { role: 'user', content: message, timestamp: new Date() }]);
  };

  // AI Functions (mock implementations)
  const executeBankLikeQuery = async (query: string) => {
    setIsTestingQueries(true);
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResults(prev => [...prev, { query, result: 'success', timestamp: new Date() }]);
    } finally {
      setIsTestingQueries(false);
    }
  };

  const runBankTestSuite = async () => {
    setIsTestingQueries(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Mock test suite results
    } finally {
      setIsTestingQueries(false);
    }
  };

  const resetCostMetrics = () => {
    setCostMetrics({});
    setTestResults([]);
  };

  const getCostReport = () => {
    return costMetrics;
  };

  const generateWorkflowReport = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { report: 'Generated workflow report' };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateExecutiveReport = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { report: 'Generated executive report' };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSectorGuidance = async (sector: string) => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { guidance: `Sector guidance for ${sector}` };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const provideFeedback = async (feedback: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const generateOrganizationalAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { analysis: 'Organizational analysis complete' };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeToleranceBreach = async (breach: any) => {
    setIsAnalyzingBreach(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { analysis: 'Breach analysis complete' };
    } finally {
      setIsAnalyzingBreach(false);
    }
  };

  const assessBreachImpact = async (breach: any) => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { impact: 'Impact assessment complete' };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const predictPotentialBreaches = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { predictions: 'Potential breaches predicted' };
    } finally {
      setIsAnalyzing(false);
    }
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
    clearHistory,
    
    // AI Assistant features
    isAssistantOpen,
    setIsAssistantOpen,
    assistantMessages,
    addUserMessage,
    isLoading,
    isAnalyzing,
    isAnalyzingBreach,
    
    // Analysis features
    workflowAnalysis,
    riskSummary,
    sectorRecommendations,
    
    // Cost and testing metrics
    costMetrics,
    testResults,
    isTestingQueries,
    
    // AI Functions
    executeBankLikeQuery,
    runBankTestSuite,
    resetCostMetrics,
    getCostReport,
    generateWorkflowReport,
    generateExecutiveReport,
    getSectorGuidance,
    provideFeedback,
    generateOrganizationalAnalysis,
    analyzeToleranceBreach,
    assessBreachImpact,
    predictPotentialBreaches
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
