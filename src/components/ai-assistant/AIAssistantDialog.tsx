
import React, { useRef, useState, useEffect } from "react";
import { Bot, Send, X, Info, BarChart2, HelpCircle, FileText, Book, Search, CheckCircle2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAIAssistant } from "./AIAssistantContext";
import { Badge } from "@/components/ui/badge";
import DOMPurify from "dompurify";

export const AIAssistantDialog = () => {
  const { 
    isAssistantOpen, 
    setIsAssistantOpen, 
    assistantMessages, 
    addUserMessage,
    isLoading,
    currentModule,
    userRole,
    orgSector,
    explainTerm,
    suggestKRIs,
    guideSetup,
    knowledgeSources
  } = useAIAssistant();
  
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (isAssistantOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isAssistantOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [assistantMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      addUserMessage(inputValue.trim());
      setInputValue("");
    }
  };

  // Common questions based on the current module
  const getQuickQuestions = () => {
    const commonQuestions = [
      { 
        text: "What is operational resilience?",
        action: () => addUserMessage("What is operational resilience?")
      },
      { 
        text: "How does E-21 define operational risk?", 
        action: () => explainTerm("operational risk in E-21")
      }
    ];
    
    const moduleQuestions: Record<string, Array<{text: string, action: () => void}>> = {
      "governance-framework": [
        { 
          text: "What committees should I establish?", 
          action: () => guideSetup("governance committees")
        },
        { 
          text: "Key roles for resilience governance?", 
          action: () => guideSetup("accountability roles")
        }
      ],
      "risk-appetite": [
        { 
          text: "Suggested KRIs for operational resilience", 
          action: () => suggestKRIs("operational resilience")
        },
        { 
          text: "How to set meaningful risk thresholds?", 
          action: () => guideSetup("risk thresholds")
        }
      ],
      "impact-tolerances": [
        { 
          text: "How to determine impact tolerance levels?", 
          action: () => guideSetup("impact tolerance calculation")
        },
        { 
          text: "Example impact tolerances for banking", 
          action: () => addUserMessage("Can you provide examples of impact tolerances for banking services?")
        }
      ],
      "business-functions": [
        { 
          text: "How to identify critical functions?", 
          action: () => guideSetup("identifying critical business functions")
        },
        { 
          text: "Mapping dependencies for functions", 
          action: () => guideSetup("mapping function dependencies")
        }
      ],
      "dependencies": [
        {
          text: "How to identify critical dependencies?",
          action: () => guideSetup("identifying critical dependencies")
        },
        {
          text: "Managing third-party dependencies",
          action: () => guideSetup("managing third-party dependencies")
        }
      ],
      "scenario-testing": [
        {
          text: "Creating effective test scenarios",
          action: () => guideSetup("developing scenario tests")
        },
        {
          text: "How to run a tabletop exercise?",
          action: () => guideSetup("running a tabletop exercise")
        }
      ],
      "third-party-risk": [
        {
          text: "OSFI B-10 requirements summary",
          action: () => explainTerm("OSFI B-10 requirements")
        },
        {
          text: "Third-party risk assessment framework",
          action: () => guideSetup("third-party risk assessment framework")
        }
      ],
      "incident-log": [
        {
          text: "Incident classification guidelines",
          action: () => guideSetup("incident classification")
        },
        {
          text: "Post-incident review best practices",
          action: () => guideSetup("post-incident reviews")
        }
      ]
    };
    
    return currentModule && moduleQuestions[currentModule] 
      ? [...moduleQuestions[currentModule], ...commonQuestions]
      : commonQuestions;
  };

  // Filter knowledge sources based on search term
  const filteredKnowledgeSources = knowledgeSources.filter(source => 
    searchTerm === "" || 
    source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.sections.some(section => 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Only show user and assistant messages (filter out system messages)
  const visibleMessages = assistantMessages.filter(
    msg => msg.role === "user" || msg.role === "assistant"
  );

  // Format message content with proper sanitization
  const formatMessageContent = (content: string) => {
    // Replace URLs with clickable links
    const withLinks = content.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>'
    );
    
    // Add paragraph breaks
    const withParagraphs = withLinks.replace(/\n\n/g, '<br/><br/>');
    
    // Sanitize HTML to prevent XSS attacks
    const sanitizedContent = DOMPurify.sanitize(withParagraphs, {
      ALLOWED_TAGS: ['a', 'br', 'p', 'span', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover']
    });
    
    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
  };

  return (
    <Dialog open={isAssistantOpen} onOpenChange={setIsAssistantOpen}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2 text-primary" />
              <span>
                ResilientFI Assistant
                {currentModule && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    • {currentModule}
                  </span>
                )}
                {userRole && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    ({userRole})
                  </span>
                )}
                {orgSector && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {orgSector}
                  </Badge>
                )}
              </span>
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsAssistantOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="help">Quick Help</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>
        
        {activeTab === "chat" && (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {visibleMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {formatMessageContent(message.content)}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <DialogFooter className="flex p-4 border-t">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question about operational resilience..."
                  className="flex-1 bg-muted px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </DialogFooter>
          </>
        )}
        
        {activeTab === "help" && (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-1" /> 
                  Quick Questions
                </h3>
                <div className="space-y-2">
                  {getQuickQuestions().map((q, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={q.action}
                    >
                      {q.text}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Key Features
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="border rounded-md p-3">
                    <p className="font-medium flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                      Explain Terms
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Ask about any E-21 term or OSFI requirement
                    </p>
                  </div>
                  <div className="border rounded-md p-3">
                    <p className="font-medium flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                      Setup Guidance
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Get step-by-step help for any module
                    </p>
                  </div>
                  <div className="border rounded-md p-3">
                    <p className="font-medium flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                      Recommendations
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Get suggestions for KRIs, thresholds, and policies
                    </p>
                  </div>
                  <div className="border rounded-md p-3">
                    <p className="font-medium flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                      Content Summarization
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Ask for summaries of incidents or risk reports
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Knowledge Domain
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>The assistant draws from:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>OSFI Guideline E-21</li>
                    <li>ISO 22301 Standards</li>
                    <li>OSFI B-10 Guidelines</li>
                    <li>Operational Resilience Best Practices</li>
                    <li>Industry-specific guidance</li>
                  </ul>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
        
        {activeTab === "knowledge" && (
          <div className="flex flex-col flex-1">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search knowledge base..." 
                  className="pl-8 w-full bg-muted px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {filteredKnowledgeSources.map((source) => (
                  <div key={source.id} className="border rounded-md p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium flex items-center">
                        <Book className="h-4 w-4 mr-2" />
                        {source.title}
                      </h3>
                      <Badge>{source.domain}</Badge>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      {source.sections.map((section, idx) => (
                        <div key={idx} className="pl-2 border-l-2 border-muted">
                          <h4 className="text-sm font-medium">{section.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {section.content.substring(0, 100)}
                            {section.content.length > 100 ? '...' : ''}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-7 mt-1"
                            onClick={() => {
                              setActiveTab("chat");
                              addUserMessage(`Tell me about ${section.title} in ${source.title}`);
                            }}
                          >
                            Ask about this topic
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {filteredKnowledgeSources.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <FileText className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-lg font-medium">No results found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try a different search term or check the help section.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
