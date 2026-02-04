import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabaseClient: any = null;

if (supabaseUrl && supabaseKey) {
  supabaseClient = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("⚠️ Credenciais do Supabase não encontradas. O progresso não será salvo na nuvem.");
}

// ID fixo do usuário conforme especificado (1)
// Em um app real, isso viria da autenticação (supabase.auth.user())
const USER_ID = 1;

export const supabase = supabaseClient;

export const getUserProgress = async () => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('id', USER_ID)
    .single();

  if (error) {
    // Se o erro for "Row not found" (PGRST116), não é crítico, apenas retorna null para criar depois
    if (error.code !== 'PGRST116') {
      console.error('Erro ao buscar progresso:', error);
    }
    return null;
  }
  return data;
};

export const updateUserProgress = async (updates: { current_day?: number; unlocked_days?: number }) => {
  if (!supabase) return null;

  // Usamos upsert para garantir que se a linha não existir (primeiro acesso), ela seja criada.
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({ id: USER_ID, ...updates }) 
    .select();

  if (error) {
    console.error('Erro ao salvar progresso no Supabase:', error);
    return null;
  }
  
  console.log("✅ Progresso salvo com sucesso no Supabase:", data ? data[0] : 'OK');
  return data ? data[0] : null;
};