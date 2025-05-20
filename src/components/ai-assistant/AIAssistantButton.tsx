
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIAssistant } from "./AIAssistantContext";

export const AIAssistantButton = () => {
  const { setIsAssistantOpen, currentModule } = useAIAssistant();
  
  return (
    <Button
      onClick={() => setIsAssistantOpen(true)}
      className="fixed right-6 bottom-6 rounded-full h-14 w-14 shadow-lg"
      aria-label="AI Assistant"
    >
      <Bot className="h-6 w-6" />
      <span className="sr-only">Open AI Assistant</span>
    </Button>
  );
};
