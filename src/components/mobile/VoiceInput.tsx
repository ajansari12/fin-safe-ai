
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeviceCapabilitiesContext } from './DeviceCapabilitiesProvider';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  placeholder = "Tap microphone to speak...",
  className = ""
}) => {
  const { capabilities, startVoiceRecognition, stopVoiceRecognition, isListening } = useDeviceCapabilitiesContext();
  const [recognition, setRecognition] = useState<any>(null);
  const [interimText, setInterimText] = useState('');

  const handleStartListening = () => {
    if (!capabilities.hasSpeechRecognition) {
      toast.error('Speech recognition not supported on this device');
      return;
    }

    const newRecognition = startVoiceRecognition(
      (transcript) => {
        setInterimText('');
        onTranscript(transcript);
        toast.success('Voice input captured');
      },
      (error) => {
        console.error('Speech recognition error:', error);
        toast.error('Voice recognition failed. Please try again.');
        setInterimText('');
      }
    );

    if (newRecognition) {
      setRecognition(newRecognition);
      
      // Handle interim results
      newRecognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setInterimText(interimTranscript);
        
        if (finalTranscript) {
          setInterimText('');
          onTranscript(finalTranscript);
          toast.success('Voice input captured');
        }
      };
    }
  };

  const handleStopListening = () => {
    if (recognition) {
      stopVoiceRecognition(recognition);
      setRecognition(null);
      setInterimText('');
    }
  };

  if (!capabilities.hasSpeechRecognition) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          onClick={isListening ? handleStopListening : handleStartListening}
          className="flex-shrink-0"
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Speak
            </>
          )}
        </Button>

        {isListening && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">Listening</span>
            </div>
            <Badge variant="secondary" className="animate-pulse">
              <Volume2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        )}
      </div>

      {interimText && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          <span className="opacity-70">Speaking: </span>
          <span className="italic">{interimText}</span>
        </div>
      )}

      {!isListening && (
        <p className="text-xs text-muted-foreground mt-1">
          {placeholder}
        </p>
      )}
    </div>
  );
};
