
import React, { createContext, useContext, useState } from "react";

interface AIAssistantContextType {
  isAssistantOpen: boolean;
  setIsAssistantOpen: (isOpen: boolean) => void;
  currentModule: string | null;
  setCurrentModule: (module: string | null) => void;
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

  return (
    <AIAssistantContext.Provider value={{ isAssistantOpen, setIsAssistantOpen, currentModule, setCurrentModule }}>
      {children}
    </AIAssistantContext.Provider>
  );
};
