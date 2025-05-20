
import React, { createContext, useContext, useState } from "react";

// Define a type for a message
interface AIMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIAssistantContextType {
  isAssistantOpen: boolean;
  setIsAssistantOpen: (isOpen: boolean) => void;
  currentModule: string | null;
  setCurrentModule: (module: string | null) => void;
  // Add the missing properties
  assistantMessages: AIMessage[];
  addUserMessage: (message: string) => void;
  isLoading: boolean;
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
  const [assistantMessages, setAssistantMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your ResilientFI assistant. How can I help you with operational resilience today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

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
    
    // Set loading state to true
    setIsLoading(true);
    
    // Simulate an AI response (in a real app, this would call an API)
    setTimeout(() => {
      let aiResponse = "I understand you're asking about ";
      
      if (currentModule) {
        switch (currentModule) {
          case "governance-framework":
            aiResponse += "governance frameworks. This module helps you establish accountability structures and oversight processes.";
            break;
          default:
            aiResponse += `${currentModule}. I can provide guidance on this topic.`;
        }
      } else {
        aiResponse += "operational resilience. I can help you navigate through our platform features.";
      }
      
      // Add the AI response
      setAssistantMessages(prev => [
        ...prev,
        {
          id: `response-${Date.now()}`,
          role: "assistant",
          content: aiResponse
        }
      ]);
      
      // Set loading state back to false
      setIsLoading(false);
    }, 1000);
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
        isLoading
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
};
