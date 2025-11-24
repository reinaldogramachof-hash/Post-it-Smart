export enum NoteType {
  OBSERVATION = 'Observação',
  EPISODE = 'Episódio',
  VICTORY = 'Pequena Vitória',
  QUESTION = 'Dúvida',
}

export enum Intensity {
  LOW = 1,
  MILD = 2,
  MODERATE = 3,
  HIGH = 4,
  SEVERE = 5,
}

export interface Note {
  id: string;
  timestamp: number;
  text: string;
  type: NoteType;
  tags: string[];
  intensity?: Intensity;
  context?: string; // e.g., "Casa", "Escola"
  aiAnalysis?: {
    summary: string;
    suggestion: string;
    patternDetected?: string;
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface UserProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD for age calculation
  diagnosis?: string;
  medications?: string;
  additionalInfo?: string;
  securityPin: string; // Simple 4-digit PIN
}