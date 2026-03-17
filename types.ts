
export enum InterviewStatus {
  COMPLETED = 'COMPLETED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export interface QAPair {
  question: string;
  answer: string;
  analysis: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  strengthScore: number;
}

export interface DetailedFeedback {
  summary: string;
  score: number;
  persona: string;
  metrics: {
    clarity: number;
    confidence: number;
    conciseness: number;
    vocabulary: number;
    sentiment: number;
  };
  improvements: string[];
  qaPairs: QAPair[];
}

export interface InterviewPersona {
  id: string;
  name: string;
  voice: string;
  tone: string;
  description: string;
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  role: string;
  experienceLevel: string;
  status: InterviewStatus;
  date: string;
  persona?: InterviewPersona;
  feedback?: string;
  score?: number;
  detailedFeedback?: DetailedFeedback;
}

export interface User {
  name: string;
  email: string;
  isLoggedIn: boolean;
}
