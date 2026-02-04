import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  isProcessing: boolean;
  language?: string;
  size?: 'sm' | 'lg'; // Adicionado prop de tamanho
  autoStart?: boolean; // Para reativar automaticamente se desejado (futuro)
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onTranscript, 
  isProcessing,
  language = 'es-ES',
  size = 'sm'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language;

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language, onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
  }, [isListening, recognition]);

  if (!recognition) {
    return null; 
  }

  const btnSize = size === 'lg' ? 'w-24 h-24' : 'p-3';
  const iconSize = size === 'lg' ? 48 : 24;

  return (
    <button
      onClick={toggleListening}
      disabled={isProcessing}
      className={`rounded-full transition-all duration-300 flex items-center justify-center shadow-lg
        ${btnSize}
        ${isListening 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white ring-4 ring-red-200' 
          : 'bg-brand-500 hover:bg-brand-600 text-white'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}
      `}
      title="Falar sua resposta"
    >
      {isProcessing ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : isListening ? (
        <MicOff size={iconSize} />
      ) : (
        <Mic size={iconSize} />
      )}
    </button>
  );
};

export default VoiceRecorder;