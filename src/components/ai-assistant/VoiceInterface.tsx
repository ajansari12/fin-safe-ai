import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useConversation } from '@11labs/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Phone, 
  PhoneOff,
  Settings,
  Loader2
} from 'lucide-react';
import { useEnhancedAIAssistant } from './EnhancedAIAssistantContext';

interface VoiceInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
  onTranscriptChange?: (transcript: string) => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  onSpeakingChange, 
  onTranscriptChange 
}) => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [agentId] = useState("your-agent-id"); // This should be configured
  const { currentModule, addUserMessage } = useEnhancedAIAssistant();

  const conversation = useConversation({
    onConnect: () => {
      setIsConnecting(false);
      toast({
        title: "Voice Connected",
        description: "Voice interface is ready for conversation",
      });
    },
    onDisconnect: () => {
      setIsConnecting(false);
      onSpeakingChange?.(false);
      toast({
        title: "Voice Disconnected",
        description: "Voice conversation ended",
      });
    },
    onMessage: (message) => {
      console.log('Voice message:', message);
      
      // Handle different message types based on ElevenLabs format
      if (message.source === 'user') {
        onTranscriptChange?.(message.message);
        // Also add to chat history
        addUserMessage(message.message);
      } else if (message.source === 'ai') {
        // AI is speaking
        onSpeakingChange?.(true);
      }
    },
    onError: (error) => {
      console.error('Voice error:', error);
      setIsConnecting(false);
      toast({
        title: "Voice Error", 
        description: 'Voice interface error occurred',
        variant: "destructive",
      });
    },
    overrides: {
      agent: {
        prompt: {
          prompt: `You are an advanced AI assistant for ResilientFI, specializing in operational resilience and risk management. 

Current context: User is in the ${currentModule || 'main'} module.

Your expertise includes:
- OSFI guidelines (E-21, B-10, etc.)
- Operational risk management
- Business continuity planning
- KRI and controls management
- Third-party risk assessment
- Regulatory compliance

Provide concise, actionable responses. When discussing technical concepts, explain them clearly. Always consider the user's current module context when providing guidance.

Keep responses conversational and professional, suitable for voice interaction.`
        },
        firstMessage: `Hello! I'm your ResilientFI voice assistant. I can help you with operational resilience questions specific to your current ${currentModule || 'module'}. How can I assist you today?`,
        language: "en",
      },
      tts: {
        voiceId: "alloy" // Professional, clear voice for business context
      },
    },
  });

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // For demo purposes, we'll use a mock URL
      // In production, you'd get this from your ElevenLabs agent configuration
      const mockSignedUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`;
      
      await conversation.startSession({ 
        agentId: agentId 
      });
      
    } catch (error) {
      console.error('Error starting voice conversation:', error);
      setIsConnecting(false);
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice features",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Voice Setup Error", 
          description: "Unable to start voice conversation. This feature requires ElevenLabs API key configuration.",
          variant: "destructive",
        });
      }
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  const adjustVolume = async (newVolume: number) => {
    setVolume(newVolume);
    try {
      await conversation.setVolume({ volume: newVolume });
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversation.status === 'connected') {
        conversation.endSession();
      }
    };
  }, []);

  const isConnected = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className="voice-interface-container">
      {/* Voice Controls */}
      <div className="flex items-center gap-2">
        {!isConnected ? (
          <Button
            onClick={startConversation}
            disabled={isConnecting}
            className="flex items-center gap-2"
            variant="outline"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
            {isConnecting ? 'Connecting...' : 'Start Voice Chat'}
          </Button>
        ) : (
          <Button
            onClick={endConversation}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            End Call
          </Button>
        )}

        {/* Status Indicators */}
        {isConnected && (
          <>
            <Badge variant={isSpeaking ? "default" : "secondary"} className="flex items-center gap-1">
              {isSpeaking ? (
                <>
                  <Volume2 className="w-3 h-3" />
                  AI Speaking
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3" />
                  Listening
                </>
              )}
            </Badge>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => adjustVolume(volume > 0 ? 0 : 0.8)}
              >
                {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </>
        )}
      </div>

      {/* Connection Status */}
      {isConnected && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Voice conversation active • Module: {currentModule || 'General'}
        </div>
      )}
    </div>
  );
};