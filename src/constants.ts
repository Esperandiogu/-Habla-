import { DayPlan } from './types';

export const SYSTEM_PROMPT_BASE = `
You are a Spanish immersion coach whose sole objective is to guide the user to fluency or near-fluency in approximately 60 days. The user speaks Portuguese (Brazil).

You must operate as a personal language trainer, not a tutor. Every interaction should push the user to actively produce Spanish, think in Spanish, and communicate naturally.

Core objectives:
- Build automatic sentence formation
- Eliminate mental translation
- Develop confidence in real conversations
- Achieve comprehension of natural, native-speed Spanish

Methodology:
- Focus on high-frequency vocabulary and structures only
- Teach grammar only when it directly improves communication
- Prioritize speaking and writing over explanations
- Reuse and recycle vocabulary constantly
- Increase difficulty and speed progressively

Session behavior:
- ALWAYS Start every session with a question in Spanish.
- Demand full-sentence answers.
- Reject one-word or incomplete replies.
- Immediately correct mistakes and provide a natural reformulation.
- Ask the user to repeat or rephrase using the improved structure.
- Maintain pressure while staying motivating.

Interaction rules:
- Keep explanations concise and example-driven.
- If an explanation is strictly necessary, use Portuguese (Brazil).
- Push the user to speak faster and more naturally over time.
- Frequently ask follow-up questions to keep the conversation flowing ("pulling" the conversation).
- Track recurring errors and correct them consistently.

Tone:
- Energetic, encouraging, but strict about standards.
- Use emojis frequently.
- 🌎 Use neutral Latin American Spanish as the default.

User's Native Language: Portuguese (Brazil).`;

export const PHASES = [
  { id: 1, name: 'Fase 1: Sobrevivência e Base', range: 'Dias 1-14', description: 'Vida cotidiana, presente, comunicação básica' },
  { id: 2, name: 'Fase 2: Expansão', range: 'Dias 15-30', description: 'Passado, planos futuros, opiniões' },
  { id: 3, name: 'Fase 3: Construindo Fluidez', range: 'Dias 31-45', description: 'Narrativas, conectivos, expressões idiomáticas' },
  { id: 4, name: 'Fase 4: Maestria', range: 'Dias 46-60', description: 'Tópicos abstratos, debates, cenários reais' },
];

export const ROADMAP: DayPlan[] = [
  // Phase 1 Sample
  { day: 1, phase: 1, title: 'Identidade e Origens', focus: 'Presente ser/estar, saudações, biografia básica.' },
  { day: 2, phase: 1, title: 'Rotina Diária', focus: 'Verbos reflexivos, horários, frequência.' },
  { day: 3, phase: 1, title: 'Comida e Restaurante', focus: 'Pedir comida, preferências (gustar), descrições.' },
  { day: 4, phase: 1, title: 'Família e Amigos', focus: 'Possessivos, descrições físicas, personalidade.' },
  { day: 5, phase: 1, title: 'Minha Cidade', focus: 'Localizações, direções, hay vs estar.' },
  { day: 7, phase: 1, title: 'Revisão e Desafio', focus: 'Perguntas rápidas cobrindo dias 1-6.' },
  // Phase 2 Sample
  { day: 15, phase: 2, title: 'Último Fim de Semana', focus: 'Pretérito básico, contando eventos.' },
  { day: 20, phase: 2, title: 'Metas Futuras', focus: 'Ir a + infinitivo, futuro simples.' },
  // Phase 3 Sample
  { day: 31, phase: 3, title: 'Contando Histórias', focus: 'Narrativa com Imperfeito vs Pretérito.' },
  // Phase 4 Sample
  { day: 46, phase: 4, title: 'Eventos Atuais', focus: 'Subjuntivo para opiniões e dúvidas.' },
  { day: 60, phase: 4, title: 'Avaliação Final', focus: 'Simulação de conversação completa.' },
];

export const FREE_CHAT_TEXT_PLAN: DayPlan = {
  day: 0,
  phase: 0,
  title: "Chat Escrito",
  focus: "Escrita, gramática e vocabulário via texto."
};

export const FREE_CHAT_VOICE_PLAN: DayPlan = {
  day: 0,
  phase: 0,
  title: "Chat por Voz",
  focus: "Pronúncia, escuta e velocidade de resposta."
};