
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Lightbulb,
  Zap
} from "lucide-react";
import { useEnhancedAIAssistant } from "./EnhancedAIAssistantContext";
import { EnhancedAIQuickActions } from "./EnhancedAIQuickActions";
import { EnhancedAIInsightsPanel } from "./EnhancedAIInsightsPanel";
import { enhancedAIAssistantService } from "@/services/enhanced-ai-assistant-service";
import { useAuth } from "@/contexts/AuthContext";
import { getUserOrganization } from "@/lib/supabase-utils";

export function EnhancedAIAssistantDialog() {
  const {
    isAssistantOpen,
    setIsAssistantOpen,
    assistantMessages,
    isLoading,
    currentModule,
    orgSector,
    provideFeedback
  } = useEnhancedAIAssistant();

  const { profile } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState(assistantMessages);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && profile?.organization_id) {
      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content: inputMessage,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage("");
      setIsProcessing(true);

      try {
        const org = await getUserOrganization();
        const response = await enhancedAIAssistantService.processEnhancedMessage(
          inputMessage,
          {
            module: currentModule,
            orgId: profile.organization_id,
            orgSector: org?.sector || 'banking'
          }
        );

        const aiMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant" as const,
          content: response,
          timestamp: new Date().toISOString(),
          knowledgeSources: ['enhanced_ai']
        };

        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error processing message:', error);
        const errorMessage = {
          id: `error-${Date.now()}`,
          role: "assistant" as const,
          content: "I apologize, but I encountered an error processing your request. Please try again.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleQuickAction = (command: string) => {
    setInputMessage(command);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    await provideFeedback(messageId, rating);
  };

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
          
          {message.role === "assistant" && message.id && (
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
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Enhanced AI Assistant
            {currentModule && (
              <Badge variant="outline" className="text-xs">
                {currentModule}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">AI Chat</TabsTrigger>
                <TabsTrigger value="actions">Quick Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageCard key={message.id} message={message} />
                    ))}
                    
                    {(isLoading || isProcessing) && (
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
                                Processing your request...
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <Separator />
                
                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about incidents, audits, KRIs, workflows, or any operational resilience topic..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading || isProcessing}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={isLoading || isProcessing || !inputMessage.trim()}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <EnhancedAIQuickActions 
                    onQuickAction={handleQuickAction}
                    currentModule={currentModule}
                    isLoading={isLoading || isProcessing}
                  />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Insights Sidebar */}
          <div className="w-80 border-l">
            <ScrollArea className="h-full p-4">
              <EnhancedAIInsightsPanel currentModule={currentModule} />
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
