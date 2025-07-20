import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserProfile } from '@/lib/supabase-utils';
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  BookOpen, 
  AlertTriangle, 
  BarChart3, 
  Shield,
  FileText,
  Brain,
  Sparkles
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  conversationType?: string;
}

interface ConversationType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const conversationTypes: ConversationType[] = [
  {
    id: 'general',
    name: 'General OSFI E-21',
    description: 'General operational risk management guidance',
    icon: Bot,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'risk_appetite',
    name: 'Risk Appetite',
    description: 'Risk appetite framework development',
    icon: BarChart3,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'kri_management',
    name: 'KRI Management',
    description: 'Key Risk Indicator design and implementation',
    icon: AlertTriangle,
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'incident_management',
    name: 'Incident Management',
    description: 'Incident reporting and response processes',
    icon: Shield,
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'compliance_gap',
    name: 'Compliance Assessment',
    description: 'Gap analysis and remediation planning',
    icon: FileText,
    color: 'bg-purple-100 text-purple-800'
  }
];

const suggestedQuestions = {
  general: [
    "What are the key requirements of OSFI E-21?",
    "How should we structure our operational risk framework?",
    "What are the three lines of defense in operational risk management?"
  ],
  risk_appetite: [
    "How do I develop OSFI-compliant risk appetite statements?",
    "What quantitative metrics should I include in my risk appetite?",
    "How often should risk appetite statements be reviewed?"
  ],
  kri_management: [
    "What makes an effective KRI under OSFI E-21?",
    "How do I set appropriate KRI thresholds?",
    "How should KRIs integrate with our risk appetite framework?"
  ],
  incident_management: [
    "What incident data should we collect per OSFI E-21?",
    "How do we perform effective root cause analysis?",
    "What are the OSFI reporting requirements for operational incidents?"
  ],
  compliance_gap: [
    "How can I assess our current compliance with OSFI E-21?",
    "What are common gaps institutions face with OSFI E-21?",
    "How do I prioritize remediation activities?"
  ]
};

export const EnhancedAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationType, setConversationType] = useState('general');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputValue.trim();
    if (!message || isLoading) return;

    setIsLoading(true);
    setShowSuggestions(false);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      conversationType
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) {
        throw new Error('No organization found');
      }

      const response = await supabase.functions.invoke('ai-risk-assistant', {
        body: {
          message,
          conversationType,
          userId: profile.id,
          orgId: profile.organization_id,
          conversationHistory: messages.slice(-10)
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get AI response');
      }

      const { data } = response;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        conversationType
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.contextUsed) {
        toast({
          title: "Contextual Response",
          description: "Response tailored to your organization's current risk profile",
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const getCurrentTypeConfig = () => {
    return conversationTypes.find(type => type.id === conversationType) || conversationTypes[0];
  };

  const currentConfig = getCurrentTypeConfig();
  const Icon = currentConfig.icon;

  return (
    <div className="h-full flex flex-col">
      {/* Conversation Type Selector */}
      <div className="mb-4">
        <Select value={conversationType} onValueChange={setConversationType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select conversation type" />
          </SelectTrigger>
          <SelectContent>
            {conversationTypes.map((type) => {
              const TypeIcon = type.icon;
              return (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Current Context Badge */}
      <div className="mb-4 flex items-center justify-center">
        <Badge className={currentConfig.color}>
          <Icon className="h-3 w-3 mr-1" />
          {currentConfig.name}
        </Badge>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">OSFI E-21 Expert Assistant</h3>
              <p className="text-muted-foreground mb-4">
                Get specialized guidance on operational risk management compliance
              </p>
              <Badge className={currentConfig.color}>
                {currentConfig.description}
              </Badge>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="text-sm text-muted-foreground">
                  Analyzing your organization's context and generating response...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {showSuggestions && messages.length === 0 && (
        <div className="space-y-2 mb-4">
          <div className="text-sm font-medium text-muted-foreground flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            Suggested questions for {currentConfig.name}:
          </div>
          <div className="grid gap-2">
            {suggestedQuestions[conversationType]?.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto p-2 text-wrap"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask about ${currentConfig.name.toLowerCase()}...`}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="pr-10"
            />
          </div>
          <Button 
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Responses are tailored to your organization's current risk profile and OSFI E-21 requirements
        </div>
      </div>
    </div>
  );
};
