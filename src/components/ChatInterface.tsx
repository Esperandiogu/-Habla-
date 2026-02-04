import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Volume2, User, Bot, AlertTriangle, Radio } from 'lucide-react';
import { Message, ViewMode } from '../types';
import VoiceRecorder from './VoiceRecorder';

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  error: string | null;
  currentTopic: string;
  mode?: ViewMode; // Adicionado para saber se é modo voz
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  input,
  setInput,
  onSend,
  isLoading,
  error,
  currentTopic,
  mode = 'lessons'
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Auto-scroll apenas no modo texto
  useEffect(() => {
    if (mode !== 'free-chat-voice') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mode]);

  // Auto-send quando o input vem do VoiceRecorder no modo de voz
  useEffect(() => {
    if (mode === 'free-chat-voice' && input.trim() && !isLoading) {
      // Pequeno delay para o usuário ver/sentir que o input foi capturado antes de enviar
      const timer = setTimeout(() => {
        onSend();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [input, mode, onSend, isLoading]);

  // TTS Function
  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-play TTS da última mensagem da IA no modo de voz
  useEffect(() => {
    if (mode === 'free-chat-voice' && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'model' && !isLoading) {
        playTTS(lastMsg.text);
      }
    }
  }, [messages, mode, isLoading]);

  // Handle Enter key (Modo Texto)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // --- RENDERIZAÇÃO DO MODO VOZ ---
  if (mode === 'free-chat-voice') {
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model');

    return (
      <div className="flex flex-col h-full bg-slate-900 text-white relative overflow-hidden">
        {/* Ambient Background Animation */}
        <div className="absolute inset-0 z-0 opacity-20">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500 rounded-full blur-[100px] animate-pulse"></div>
        </div>

        {/* Header Minimalista */}
        <div className="relative z-10 p-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full text-sm font-medium backdrop-blur-md border border-white/20">
            <Radio size={16} className="text-red-400 animate-pulse" />
            <span>Chamada de Voz em Andamento</span>
          </div>
        </div>

        {/* Main Focus Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">
           
           {/* Avatar / Status Indicator */}
           <div className="mb-12 relative">
             {/* Anéis de animação */}
             {isSpeaking && (
               <>
                 <div className="absolute inset-0 rounded-full border-2 border-brand-500/50 animate-[ping_2s_linear_infinite]"></div>
                 <div className="absolute inset-0 rounded-full border border-brand-400/30 animate-[ping_3s_linear_infinite]"></div>
               </>
             )}
             
             <div className={`
               w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500
               ${isLoading 
                  ? 'bg-slate-700 animate-pulse border-4 border-slate-600' 
                  : isSpeaking 
                    ? 'bg-brand-600 scale-110 border-4 border-brand-400 shadow-brand-500/50' 
                    : 'bg-slate-800 border-4 border-slate-700'
               }
             `}>
                {isLoading ? (
                  <Loader size={48} className="animate-spin text-slate-400" />
                ) : (
                  <Bot size={64} className={isSpeaking ? 'text-white' : 'text-slate-400'} />
                )}
             </div>
             
             <div className="mt-8 text-center h-8">
               <p className="text-slate-300 font-medium tracking-wide animate-fade-in">
                 {isLoading ? "Pensando..." : isSpeaking ? "Falando..." : "Sua vez"}
               </p>
             </div>
           </div>

           {/* Legenda Opcional (Subtle) */}
           {lastModelMessage && !isLoading && (
             <div className="mb-8 max-w-md text-center">
               <p className="text-slate-400 text-lg font-light leading-relaxed italic opacity-60">
                 "{lastModelMessage.text}"
               </p>
             </div>
           )}

           {/* Large Mic Button - CENTERED */}
           <div className="mt-auto mb-12 flex flex-col items-center w-full">
             <VoiceRecorder 
               onTranscript={(text) => setInput(text)}
               isProcessing={isLoading}
               size="lg"
             />
             <p className="text-center text-slate-500 text-sm mt-4">Toque para responder</p>
           </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DO MODO TEXTO (Padrão) ---
  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="p-4 bg-white border-b shadow-sm flex justify-between items-center z-10">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">Sessão Atual</h2>
          <p className="text-sm text-brand-600 font-medium">{currentTopic}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center opacity-60">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4 text-3xl">
              🇪🇸
            </div>
            <p className="max-w-md">Comece sua jornada de fluência de 60 dias. O coach fará perguntas. Responda com frases completas!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-700'}
            `}>
              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>

            <div className={`
              max-w-[80%] rounded-2xl p-4 shadow-sm relative group
              ${msg.role === 'user' 
                ? 'bg-brand-500 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              }
            `}>
              <div className="prose prose-sm max-w-none break-words">
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <p className={msg.role === 'user' ? 'text-white' : 'text-gray-800'} {...props} />
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>

              {/* TTS Button for Bot messages */}
              {msg.role === 'model' && (
                <button 
                  onClick={() => playTTS(msg.text)}
                  className="absolute -right-8 top-2 p-1.5 rounded-full text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Ouvir"
                >
                  <Volume2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <Bot size={18} className="text-slate-600" />
             </div>
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
             </div>
           </div>
        )}
        {error && (
          <div className="flex justify-center my-4">
             <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm border border-red-100 shadow-sm">
               <AlertTriangle size={16} />
               {error}
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
            <VoiceRecorder 
              isProcessing={isLoading} 
              onTranscript={(text) => setInput(text)}
            />
            
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-400 transition-all flex items-center px-2 py-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Responda em espanhol... (Tente falar!)"
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 px-2 text-gray-700 placeholder-gray-400"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={onSend}
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm mb-0.5"
              >
                <Send size={18} />
              </button>
            </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Pressione Enter para enviar • Use o microfone para praticar
        </p>
      </div>
    </div>
  );
};

// Helper for loader
const Loader = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default ChatInterface;