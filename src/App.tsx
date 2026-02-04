import React, { useState, useEffect } from 'react';
import { Menu, X, Settings, ChevronLeft, CheckCircle } from 'lucide-react';
import ProgressBar from './components/ProgressBar';
import ChatInterface from './components/ChatInterface';
import HomeScreen from './components/HomeScreen';
import { ROADMAP, FREE_CHAT_TEXT_PLAN, FREE_CHAT_VOICE_PLAN } from './constants';
import { Message, UserProgress, ViewMode } from './types';
import { initializeChat, sendMessage } from './services/geminiService';
import { getUserProgress, updateUserProgress } from './services/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estado inicial padrão
  const [currentDay, setCurrentDay] = useState(1);
  const [userSettings, setUserSettings] = useState<UserProgress>({
    currentDay: 1,
    unlockedDays: 1,
    nativeLanguage: 'Portuguese (Brazil)'
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar progresso do Supabase ao iniciar
  useEffect(() => {
    const loadProgress = async () => {
      const data = await getUserProgress();
      if (data) {
        console.log("📥 Progresso carregado:", data);
        setUserSettings(prev => ({
          ...prev,
          currentDay: data.current_day || 1,
          unlockedDays: data.unlocked_days || 1
        }));
        setCurrentDay(data.current_day || 1);
      }
    };
    loadProgress();
  }, []);

  // Effect to trigger session start when view changes to a chat mode
  useEffect(() => {
    if (view !== 'home') {
      startSession(view);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentDay]); 

  const startSession = async (mode: ViewMode) => {
    setIsLoading(true);
    setMessages([]);
    setError(null);

    try {
      let plan;
      let initialPrompt;

      if (mode === 'free-chat-text') {
        plan = FREE_CHAT_TEXT_PLAN;
        initialPrompt = "Olá coach. Quero praticar conversação escrita hoje. Puxe um assunto interessante aleatório para começarmos (viagens, hobbies, polêmicas leves, etc).";
      
      } else if (mode === 'free-chat-voice') {
        plan = FREE_CHAT_VOICE_PLAN;
        // Prompt EXATO e CURTO para começar
        initialPrompt = "Olá coach. Simule uma ligação telefônica. Para começar, diga EXATAMENTE e SOMENTE esta frase: 'Hola, ¿qué tal? ¿Cómo te llamas y de dónde eres?'.";
      
      } else {
        // Lessons mode
        plan = ROADMAP.find(d => d.day === currentDay) || ROADMAP[0];
        initialPrompt = "Olá coach. Sou brasileiro. Inicie a sessão imediatamente fazendo uma pergunta em espanhol sobre o tópico de hoje. Não apenas me cumprimente, me faça falar!";
      }

      await initializeChat(plan, userSettings.nativeLanguage);
      
      const response = await sendMessage(initialPrompt);
      
      setMessages([{
        id: Date.now().toString(),
        role: 'model',
        text: response,
        timestamp: Date.now()
      }]);
    } catch (err: any) {
      console.error("Erro na inicialização:", err);
      setError(err.message || "Falha ao iniciar sessão. Verifique sua chave API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await sendMessage(userMsg.text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Erro no envio:", err);
      setError(err.message || "Falha ao obter resposta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDaySelect = async (day: number) => {
    setCurrentDay(day);
    setIsSidebarOpen(false);
    // Atualiza o "último dia visitado" no banco
    updateUserProgress({ current_day: day });
  };

  const handleCompleteLesson = async () => {
    setIsSaving(true);
    const nextDay = currentDay + 1;
    
    // Se completarmos o último dia desbloqueado, liberamos o próximo
    let newUnlockedDays = userSettings.unlockedDays;
    if (currentDay === userSettings.unlockedDays) {
      newUnlockedDays = nextDay;
    }

    try {
      await updateUserProgress({ 
        current_day: nextDay, // Move cursor para o próximo
        unlocked_days: newUnlockedDays 
      });

      // Atualiza estado local
      setUserSettings(prev => ({
        ...prev,
        currentDay: nextDay,
        unlockedDays: newUnlockedDays
      }));
      setCurrentDay(nextDay);
      
      alert(`🎉 Parabéns! Dia ${currentDay} concluído. Iniciando Dia ${nextDay}...`);
      
    } catch (e) {
      console.error("Erro ao salvar progresso", e);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // If on Home Screen
  if (view === 'home') {
    return (
      <HomeScreen 
        onStartLessons={() => setView('lessons')}
        onStartFreeChatText={() => setView('free-chat-text')}
        onStartFreeChatVoice={() => setView('free-chat-voice')}
      />
    );
  }

  // Determine current plan for title display
  let currentPlan;
  if (view === 'free-chat-text') currentPlan = FREE_CHAT_TEXT_PLAN;
  else if (view === 'free-chat-voice') currentPlan = FREE_CHAT_VOICE_PLAN;
  else currentPlan = (ROADMAP.find(d => d.day === currentDay) || ROADMAP[0]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay (Only for lessons mode) */}
      {view === 'lessons' && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Only Visible in Lessons Mode */}
      {view === 'lessons' && (
        <div className={`
          fixed inset-y-0 left-0 z-30 w-80 bg-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-gray-200
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-brand-50">
              <h1 className="font-bold text-xl text-brand-700">FluentESP 🇪🇸</h1>
              <button onClick={toggleSidebar} className="md:hidden p-1 text-brand-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ProgressBar 
                currentDay={currentDay}
                unlockedDays={userSettings.unlockedDays} 
                onSelectDay={handleDaySelect} 
              />
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Settings size={16} className="text-gray-400" />
                <label className="text-xs font-semibold text-gray-500 uppercase">Idioma de Suporte</label>
              </div>
              <select 
                className="w-full p-2 text-sm border rounded-lg bg-white"
                value={userSettings.nativeLanguage}
                onChange={(e) => setUserSettings({...userSettings, nativeLanguage: e.target.value as any})}
              >
                <option value="Portuguese (Brazil)">Português (Brasil)</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full relative">
        {/* Header */}
        <header className="h-14 bg-white border-b flex items-center px-4 justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button 
              onClick={() => setView('home')}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium hidden sm:inline">Início</span>
            </button>
            
            {/* Sidebar Toggle (Only for Lessons) */}
            {view === 'lessons' && (
              <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Menu size={24} />
              </button>
            )}
            
            {/* Title */}
            <div className="flex flex-col">
              <span className="font-bold text-brand-700 leading-tight">
                {currentPlan.title}
              </span>
              {view === 'free-chat-voice' && (
                <span className="text-[10px] text-brand-400 uppercase tracking-wide">Modo de Voz</span>
              )}
            </div>
          </div>

          {/* Action Buttons (Complete Lesson) */}
          {view === 'lessons' && (
            <button 
              onClick={handleCompleteLesson}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-full text-xs font-bold transition-colors border border-green-200"
              title="Marcar dia como concluído e avançar"
            >
              <CheckCircle size={14} />
              <span className="hidden sm:inline">Concluir Dia</span>
              {isSaving && <span className="animate-spin ml-1">⏳</span>}
            </button>
          )}
        </header>

        <main className="flex-1 overflow-hidden relative">
          <ChatInterface 
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading}
            error={error}
            currentTopic={currentPlan.title}
            mode={view} // Passando o modo de visualização
          />
        </main>
      </div>
    </div>
  );
};

export default App;