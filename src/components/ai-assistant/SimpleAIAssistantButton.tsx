
import React from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export function SimpleAIAssistantButton() {
  const handleClick = () => {
    console.log("AI Assistant clicked - voice features temporarily disabled");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        size="lg"
        className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group relative"
      >
        <Bot className="w-5 h-5 mr-2 group-hover:animate-pulse" />
        AI Assistant
      </Button>
    </div>
  );
}
