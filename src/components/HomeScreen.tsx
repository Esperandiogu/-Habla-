import React from 'react';
import { Map, Mic, MessageSquare, GraduationCap, Keyboard } from 'lucide-react';

interface HomeScreenProps {
  onStartLessons: () => void;
  onStartFreeChatText: () => void;
  onStartFreeChatVoice: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartLessons, onStartFreeChatText, onStartFreeChatVoice }) => {
  return (
    <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block w-20 h-20 mb-4 rounded-full overflow-hidden shadow-md border-4 border-brand-100">
            <img 
              src="https://flagcdn.com/w320/es.png" 
              alt="Bandeira da Espanha" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-brand-900 mb-3">
            ¡Habla!
          </h1>
          <p className="text-base md:text-lg text-brand-700 max-w-2xl mx-auto">
            Sua jornada para falar espanhol com confiança.
          </p>
        </div>

        {/* Main Journey Card */}
        <div className="mb-6">
          <button 
            onClick={onStartLessons}
            className="w-full group relative bg-white p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-100 text-left hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Map size={120} className="text-brand-500" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 flex-shrink-0">
                <GraduationCap size={36} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                  Jornada de 60 Dias
                </h3>
                <p className="text-gray-600">
                  Siga um roteiro estruturado do básico à fluência. Lições diárias focadas em gramática prática e vocabulário.
                </p>
              </div>
              <div className="hidden md:flex items-center text-brand-600 font-semibold group-hover:gap-2 transition-all whitespace-nowrap">
                Continuar <span>→</span>
              </div>
            </div>
          </button>
        </div>

        {/* Practice Modes Grid */}
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Prática Livre</h2>
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Text Chat */}
          <button 
            onClick={onStartFreeChatText}
            className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 border border-brand-100 text-left hover:-translate-y-1"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <Keyboard size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Chat Escrito
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Pratique escrita e gramática sobre tópicos variados.
              </p>
            </div>
          </button>

          {/* Voice Chat */}
          <button 
            onClick={onStartFreeChatVoice}
            className="group relative bg-gradient-to-br from-brand-500 to-brand-600 p-6 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 text-left hover:-translate-y-1 text-white overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Mic size={80} className="text-white" />
            </div>

            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-white backdrop-blur-sm">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Chat por Voz
              </h3>
              <p className="text-brand-100 text-sm mb-4">
                Simule uma conversa real. Foco em velocidade e pronúncia.
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-brand-400">
            Focado em conversação real • Sem traduções mentais
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;