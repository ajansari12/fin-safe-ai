
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIAssistant } from "./AIAssistantContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const AIAssistantButton = () => {
  const { setIsAssistantOpen, currentModule } = useAIAssistant();
  
  // Get tooltip content based on current module
  const getTooltipContent = () => {
    if (!currentModule) return "Ask me about operational resilience";
    
    switch (currentModule) {
      case "governance-framework":
        return "Ask me about governance structures, roles, and policies";
      case "risk-appetite":
        return "Ask me about risk thresholds and KRIs";
      case "impact-tolerances":
        return "Ask me about setting impact tolerance levels";
      case "business-functions":
        return "Ask me about critical business functions";
      default:
        return `Ask me about ${currentModule}`;
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setIsAssistantOpen(true)}
            className="fixed right-6 bottom-6 rounded-full h-14 w-14 shadow-lg"
            aria-label="AI Assistant"
          >
            <Bot className="h-6 w-6" />
            <span className="sr-only">Open AI Assistant</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
