export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isCorrection?: boolean;
}

export interface DayPlan {
  day: number;
  title: string;
  focus: string;
  phase: number;
}

export interface UserProgress {
  currentDay: number;
  unlockedDays: number;
  nativeLanguage: 'English' | 'Portuguese (Brazil)';
}

export interface ChatSession {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export type ViewMode = 'home' | 'lessons' | 'free-chat-text' | 'free-chat-voice';