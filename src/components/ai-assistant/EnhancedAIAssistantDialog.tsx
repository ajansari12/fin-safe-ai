
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Bot, 
  User, 
  Send, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  FileText,
  Lightbulb
} from "lucide-react";
import { useEnhancedAIAssistant } from "./EnhancedAIAssistantContext";

export function EnhancedAIAssistantDialog() {
  const {
    isAssistantOpen,
    setIsAssistantOpen,
    assistantMessages,
    addUserMessage,
    isLoading,
    isAnalyzing,
    currentModule,
    generateWorkflowReport,
    generateExecutiveReport,
    getSectorGuidance,
    provideFeedback,
    orgSector
  } = useEnhancedAIAssistant();

  const [inputMessage, setInputMessage] = useState("");
  const [feedbackMode, setFeedbackMode] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      addUserMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    await provideFeedback(messageId, rating);
    setFeedbackMode(null);
  };

  const QuickActions = () => (
    <div className="flex flex-wrap gap-2 p-4 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={generateWorkflowReport}
        disabled={isAnalyzing}
        className="text-xs"
      >
        <BarChart3 className="w-3 h-3 mr-1" />
        Workflow Report
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={generateExecutiveReport}
        disabled={isAnalyzing}
        className="text-xs"
      >
        <TrendingUp className="w-3 h-3 mr-1" />
        Risk Summary
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => getSectorGuidance("RTO")}
        disabled={isAnalyzing}
        className="text-xs"
      >
        <Target className="w-3 h-3 mr-1" />
        {orgSector} Guidelines
      </Button>
    </div>
  );

  const MessageCard = ({ message }: { message: any }) => (
    <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      {message.role === "assistant" && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      
      <Card className={`max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        <CardContent className="p-3">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {message.content}
            </pre>
          </div>
          
          {message.knowledgeSources && message.knowledgeSources.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.knowledgeSources.map((source: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          )}
          
          {message.role === "assistant" && message.logId && (
            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(message.id, 5)}
                className="h-6 px-2"
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(message.id, 1)}
                className="h-6 px-2"
              >
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {message.role === "user" && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isAssistantOpen} onOpenChange={setIsAssistantOpen}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Enhanced AI Assistant
            {currentModule && (
              <Badge variant="outline" className="text-xs">
                {currentModule}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {assistantMessages.map((message) => (
                <MessageCard key={message.id} message={message} />
              ))}
              
              {(isLoading || isAnalyzing) && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <Card className="bg-muted">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <span className="text-sm text-muted-foreground ml-2">
                          {isAnalyzing ? "Analyzing data..." : "Thinking..."}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <QuickActions />
          
          <Separator />
          
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about workflows, risks, or sector guidelines..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isAnalyzing}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || isAnalyzing || !inputMessage.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
