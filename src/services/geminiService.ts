import { GoogleGenAI, Chat } from "@google/genai";
import { Message } from '../types';
import { SYSTEM_PROMPT_BASE } from '../constants';

let client: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.error("❌ ERRO CRÍTICO: API Key não encontrada no código.");
      throw new Error("API Key não configurada. Verifique o arquivo .env");
    }

    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const initializeChat = async (
  dayPlan: any, 
  nativeLanguage: string,
  previousHistory: Message[] = []
) => {
  try {
    const ai = getClient();
    
    // Define instruções específicas baseadas no modo
    const isVoiceMode = dayPlan.title === "Chat por Voz";
    
    let specificInstruction = "";
    
    if (isVoiceMode) {
      specificInstruction = `
INSTRUCTION (VOICE CALL MODE):
- You are strictly simulating a voice phone call.
- Your output must be EXTREMELY SHORT (maximum 2 sentences).
- Ask ONLY ONE question at a time. Never ask a list of questions.
- If you ask more than one question, the user will be confused.
- Wait for the user to answer before asking another question.
- Allow the conversation to flow back and forth naturally like a ping-pong match.
`;
    } else {
      specificInstruction = `
INSTRUCTION (LESSON MODE):
- Begin immediately by asking a question in Spanish related to "${dayPlan.title}".
- Guide the session by asking questions one by one.
- Do not overwhelm the user with too many questions at once.
`;
    }

    // Construct the final system prompt
    const sessionInstruction = `
${SYSTEM_PROMPT_BASE} ${nativeLanguage}

CURRENT SESSION CONTEXT:
Day: ${dayPlan.day}
Topic: ${dayPlan.title}
Focus: ${dayPlan.focus}

${specificInstruction}
`;

    // Usando gemini-3-flash-preview conforme documentação
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: sessionInstruction,
        temperature: 0.7, 
      },
      history: previousHistory.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }))
    });
    console.log("✅ Sessão de chat inicializada.");
    return chatSession;
  } catch (err: any) {
    console.error("❌ Erro ao criar sessão:", err);
    if (err.message?.includes('API key')) throw new Error("Chave de API inválida ou ausente.");
    if (err.status === 404) throw new Error("Modelo não encontrado. Verifique se sua chave tem acesso ao Gemini 3.");
    throw err;
  }
};

export const sendMessage = async (text: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Sessão não iniciada. Recarregue a página.");
  }

  const sendWithRetry = async (attempt = 1): Promise<string> => {
    try {
      // Pequeno delay na primeira tentativa para garantir estabilidade
      if (attempt > 1) await new Promise(r => setTimeout(r, 1000 * attempt));
      
      const result = await chatSession!.sendMessage({ message: text });
      return result.text || "";
    } catch (error: any) {
      console.warn(`⚠️ Tentativa ${attempt} falhou (Erro ${error.status}). Retentando...`);
      
      // Retry nos casos de sobrecarga (503) ou rate limit (429)
      // Tenta até 3 vezes com tempo crescente (2s, 4s, 8s)
      if ((error.status === 503 || error.status === 429) && attempt <= 3) {
        const waitTime = 2000 * Math.pow(2, attempt - 1);
        console.log(`🔄 Aguardando ${waitTime}ms para tentar novamente...`);
        await new Promise(r => setTimeout(r, waitTime));
        return sendWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  try {
    return await sendWithRetry();
  } catch (error: any) {
    console.error("❌ Erro ao enviar mensagem (final):", error);
    
    if (error.status === 503) throw new Error("O servidor da IA está sobrecarregado no momento (Erro 503). Tentamos reconectar 3 vezes sem sucesso. Por favor, aguarde alguns minutos.");
    if (error.status === 403) throw new Error("Permissão negada (403). Verifique se sua API Key é válida e tem saldo.");
    if (error.status === 429) throw new Error("Muitas requisições (429). Aguarde um pouco.");
    
    throw new Error(error.message || "Erro de conexão com a IA. Tente novamente.");
  }
};