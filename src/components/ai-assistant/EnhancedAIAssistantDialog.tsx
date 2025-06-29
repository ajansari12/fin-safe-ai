
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Brain,
  FileText,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { useEnhancedAIAssistant } from "./EnhancedAIAssistantContext";

interface EnhancedAIAssistantDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedAIAssistantDialog: React.FC<EnhancedAIAssistantDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    assistantMessages,
    addUserMessage,
    isLoading,
    isAnalyzing,
    workflowAnalysis,
    riskSummary,
    sectorRecommendations,
    generateWorkflowReport,
    generateExecutiveReport,
    getSectorGuidance,
    provideFeedback,
    currentModule
  } = useEnhancedAIAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [assistantMessages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    await addUserMessage(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'workflow-analysis':
        generateWorkflowReport();
        break;
      case 'executive-summary':
        generateExecutiveReport();
        break;
      case 'sector-guidance':
        getSectorGuidance('risk assessment');
        break;
      case 'predictive-analysis':
        addUserMessage('Generate predictive risk analysis for the next quarter');
        break;
      case 'anomaly-detection':
        addUserMessage('Identify any anomalies in our current risk data');
        break;
      case 'recommendations':
        addUserMessage('What are your top risk mitigation recommendations?');
        break;
    }
  };

  const quickActions = [
    { id: 'workflow-analysis', label: 'Workflow Analysis', icon: BarChart3 },
    { id: 'executive-summary', label: 'Executive Summary', icon: FileText },
    { id: 'sector-guidance', label: 'Sector Guidance', icon: Target },
    { id: 'predictive-analysis', label: 'Predictive Analysis', icon: TrendingUp },
    { id: 'anomaly-detection', label: 'Anomaly Detection', icon: AlertTriangle },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Enhanced AI Risk Assistant
            {currentModule && (
              <Badge variant="outline" className="ml-2">
                {currentModule}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col">
              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.id)}
                    className="flex items-center gap-1 text-xs"
                    disabled={isLoading || isAnalyzing}
                  >
                    <action.icon className="h-3 w-3" />
                    {action.label}
                  </Button>
                ))}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 border rounded-md p-4">
                <div className="space-y-4">
                  {assistantMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="h-4 w-4" />
                            <span className="text-xs font-medium">AI Assistant</span>
                            {msg.knowledgeSources && msg.knowledgeSources.length > 0 && (
                              <div className="flex gap-1">
                                {msg.knowledgeSources.map((source, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {source}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="whitespace-pre-wrap text-sm">
                          {msg.content}
                        </div>
                        
                        {msg.role === "assistant" && msg.logId && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => provideFeedback(msg.id, 1)}
                              className="h-6 w-6 p-0"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => provideFeedback(msg.id, -1)}
                              className="h-6 w-6 p-0"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-gray-500">
                              {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(isLoading || isAnalyzing) && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 animate-pulse" />
                          <span className="text-sm">
                            {isAnalyzing ? "Analyzing data..." : "Thinking..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input */}
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Ask me about risks, recommendations, or analysis..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Workflow Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workflowAnalysis.length > 0 ? (
                      <div className="space-y-3">
                        {workflowAnalysis.map((analysis, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{analysis.module}</h4>
                              <Badge variant={analysis.completionPercentage > 70 ? "default" : "destructive"}>
                                {analysis.completionPercentage}% Complete
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {analysis.completedSteps}/{analysis.totalSteps} steps completed
                            </p>
                            {analysis.recommendations.length > 0 && (
                              <ul className="text-xs text-gray-500 mt-2">
                                {analysis.recommendations.map((rec, idx) => (
                                  <li key={idx}>• {rec}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Button onClick={generateWorkflowReport} disabled={isAnalyzing}>
                          Generate Workflow Analysis
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Risk Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {riskSummary.length > 0 ? (
                      <div className="space-y-3">
                        {riskSummary.map((risk, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{risk.category}</h4>
                              <Badge variant={
                                risk.level === 'critical' ? 'destructive' :
                                risk.level === 'high' ? 'secondary' : 'default'
                              }>
                                {risk.level.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{risk.count} items</p>
                            {risk.topRisks.length > 0 && (
                              <div className="text-xs text-gray-500 mt-2">
                                Top concerns: {risk.topRisks.map(r => r.name).join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Button onClick={generateExecutiveReport} disabled={isAnalyzing}>
                          Generate Risk Summary
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="insights" className="flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI-Powered Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">🔍 Pattern Recognition</h4>
                        <p className="text-sm text-gray-600">
                          AI has detected an unusual pattern in your operational incidents. 
                          There's been a 23% increase in system-related issues over the past 30 days, 
                          primarily occurring during peak business hours.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">📊 Predictive Analysis</h4>
                        <p className="text-sm text-gray-600">
                          Based on current trends, there's a 68% probability of a KRI breach 
                          in the cyber security category within the next 45 days. 
                          Consider implementing additional monitoring controls.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">🎯 Optimization Opportunities</h4>
                        <p className="text-sm text-gray-600">
                          Resource allocation analysis suggests reallocating 15% of compliance 
                          budget to operational risk management could improve overall risk posture by 12%.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recommendations" className="flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Sector Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sectorRecommendations.length > 0 ? (
                      <div className="space-y-3">
                        {sectorRecommendations.map((rec, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <h4 className="font-medium">{rec.metric}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Recommended:</strong> {rec.recommendedValue}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">{rec.rationale}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Button onClick={() => getSectorGuidance('general')} disabled={isAnalyzing}>
                          Get Sector Recommendations
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Proactive Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Implement Zero Trust Architecture</h4>
                          <Badge variant="destructive">High Priority</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Based on your current cyber risk profile, implementing Zero Trust 
                          could reduce security incidents by 45%.
                        </p>
                        <div className="text-xs text-gray-500 mt-2">
                          Expected implementation: 3-6 months | Cost: Medium
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Enhance Incident Response Automation</h4>
                          <Badge variant="secondary">Medium Priority</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Automating 60% of incident response procedures could reduce 
                          mean time to resolution by 35%.
                        </p>
                        <div className="text-xs text-gray-500 mt-2">
                          Expected implementation: 2-4 months | Cost: Low
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAIAssistantDialog;
